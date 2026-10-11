package client

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// GatewayClient calls the LiteLLM OpenAI-compatible proxy.
type GatewayClient struct {
	BaseURL     string
	APIKey      string
	HTTPClient  *http.Client
	InspectWire bool
}

// NewClient builds a client for the local gateway.
func NewClient(baseURL, apiKey string, inspectWire bool) *GatewayClient {
	if baseURL == "" {
		baseURL = "http://localhost:4000"
	}
	baseURL = strings.TrimRight(baseURL, "/")
	return &GatewayClient{
		BaseURL:    baseURL,
		APIKey:     apiKey,
		HTTPClient: &http.Client{
			// Generation time is unbounded. Callers pass a context for cancellation.
		},
		InspectWire: inspectWire,
	}
}

func (c *GatewayClient) logRequest(req *http.Request, bodyBytes []byte) {
	if !c.InspectWire {
		return
	}
	fmt.Printf("\n\033[36m========== [WIRE: HTTP REQUEST] ==========\033[0m\n")
	fmt.Printf("\033[1m%s %s %s\033[0m\n", req.Method, req.URL.RequestURI(), req.Proto)
	fmt.Printf("Host: %s\n", req.Host)
	for k, v := range req.Header {
		fmt.Printf("%s: %s\n", k, strings.Join(v, ", "))
	}
	fmt.Printf("\n")
	if len(bodyBytes) > 0 {
		var pretty bytes.Buffer
		if err := json.Indent(&pretty, bodyBytes, "", "  "); err == nil {
			fmt.Println(pretty.String())
		} else {
			fmt.Println(string(bodyBytes))
		}
	}
	fmt.Printf("\033[36m===========================================\033[0m\n\n")
}

func (c *GatewayClient) logResponse(resp *http.Response) {
	if !c.InspectWire {
		return
	}
	fmt.Printf("\033[35m========== [WIRE: HTTP RESPONSE] ==========\033[0m\n")
	fmt.Printf("\033[1m%s %s\033[0m\n", resp.Proto, resp.Status)
	for k, v := range resp.Header {
		fmt.Printf("%s: %s\n", k, strings.Join(v, ", "))
	}
	fmt.Printf("\033[35m============================================\033[0m\n\n")
}

func (c *GatewayClient) newRequest(ctx context.Context, method, url string, body []byte, apiKey string) (*http.Request, error) {
	var reader io.Reader
	if body != nil {
		reader = bytes.NewReader(body)
	}
	req, err := http.NewRequestWithContext(ctx, method, url, reader)
	if err != nil {
		return nil, err
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+apiKey)
	}
	return req, nil
}

// Healthy checks that the proxy process is up. It does not call a model.
func (c *GatewayClient) Healthy(ctx context.Context) error {
	req, err := c.newRequest(ctx, http.MethodGet, c.BaseURL+"/health/liveliness", nil, "")
	if err != nil {
		return err
	}
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	io.Copy(io.Discard, resp.Body)
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("health returned HTTP %d", resp.StatusCode)
	}
	return nil
}

// ListModels returns the aliases the gateway is willing to route.
func (c *GatewayClient) ListModels(ctx context.Context) (*ModelList, error) {
	status, body, _, err := c.do(ctx, http.MethodGet, "/v1/models", nil, c.APIKey, false)
	if err != nil {
		return nil, err
	}
	if status != http.StatusOK {
		return nil, fmt.Errorf("list models HTTP %d: %s", status, strings.TrimSpace(string(body)))
	}
	var list ModelList
	if err := json.Unmarshal(body, &list); err != nil {
		return nil, fmt.Errorf("decode model list: %w", err)
	}
	return &list, nil
}

// DoRaw sends one request and returns the status line payload. apiKey overrides the client key.
// Pass apiKey as "" to omit the Authorization header.
func (c *GatewayClient) DoRaw(ctx context.Context, method, path string, payload []byte, apiKey string) (int, []byte, http.Header, error) {
	return c.do(ctx, method, path, payload, apiKey, true)
}

func (c *GatewayClient) do(ctx context.Context, method, path string, payload []byte, apiKey string, log bool) (int, []byte, http.Header, error) {
	url := c.BaseURL + path
	req, err := c.newRequest(ctx, method, url, payload, apiKey)
	if err != nil {
		return 0, nil, nil, err
	}
	if log {
		c.logRequest(req, payload)
	}
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return 0, nil, nil, err
	}
	defer resp.Body.Close()
	if log {
		c.logResponse(resp)
	}
	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return resp.StatusCode, nil, resp.Header, err
	}
	return resp.StatusCode, b, resp.Header, nil
}

// StreamChat posts a streaming chat completion and invokes onToken for each text delta.
func (c *GatewayClient) StreamChat(ctx context.Context, req ChatRequest, onToken func(string)) (*InferenceMetrics, error) {
	req.Stream = true
	if req.StreamOptions == nil {
		req.StreamOptions = &StreamOptions{IncludeUsage: true}
	}
	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("marshal chat request: %w", err)
	}

	httpReq, err := c.newRequest(ctx, http.MethodPost, c.BaseURL+"/v1/chat/completions", bodyBytes, c.APIKey)
	if err != nil {
		return nil, fmt.Errorf("create http request: %w", err)
	}
	httpReq.Header.Set("Accept", "text/event-stream")
	c.logRequest(httpReq, bodyBytes)

	start := time.Now()
	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("execute http request: %w", err)
	}
	defer resp.Body.Close()
	c.logResponse(resp)

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("gateway HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}

	var ttft time.Duration
	var firstToken bool
	var usage Usage
	var resolved string

	scanner := bufio.NewScanner(resp.Body)
	buf := make([]byte, 64*1024)
	scanner.Buffer(buf, 1024*1024)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, ":") {
			continue
		}
		if !strings.HasPrefix(line, "data:") {
			continue
		}
		data := strings.TrimSpace(strings.TrimPrefix(line, "data:"))
		if data == "[DONE]" {
			break
		}

		var chunk ChatChunk
		if err := json.Unmarshal([]byte(data), &chunk); err != nil {
			return nil, fmt.Errorf("decode SSE chunk: %w", err)
		}
		if chunk.Error != nil && chunk.Error.Message != "" {
			return nil, fmt.Errorf("stream error: %s", chunk.Error.Message)
		}
		if chunk.Model != "" {
			resolved = chunk.Model
		}
		if chunk.Usage != nil {
			usage = *chunk.Usage
		}
		if len(chunk.Choices) == 0 {
			continue
		}
		delta := chunk.Choices[0].Delta.Content
		if delta == "" {
			continue
		}
		if !firstToken {
			ttft = time.Since(start)
			firstToken = true
		}
		if onToken != nil {
			onToken(delta)
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("read SSE stream: %w", err)
	}

	total := time.Since(start)
	return buildMetrics(total, ttft, usage, resolved, resp.Header), nil
}

// UnaryChat posts a non-streaming chat completion and returns the full message.
func (c *GatewayClient) UnaryChat(ctx context.Context, req ChatRequest) (string, *InferenceMetrics, error) {
	req.Stream = false
	req.StreamOptions = nil
	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return "", nil, fmt.Errorf("marshal chat request: %w", err)
	}

	httpReq, err := c.newRequest(ctx, http.MethodPost, c.BaseURL+"/v1/chat/completions", bodyBytes, c.APIKey)
	if err != nil {
		return "", nil, fmt.Errorf("create http request: %w", err)
	}
	c.logRequest(httpReq, bodyBytes)

	start := time.Now()
	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return "", nil, fmt.Errorf("execute http request: %w", err)
	}
	defer resp.Body.Close()
	c.logResponse(resp)

	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", nil, fmt.Errorf("read response: %w", err)
	}
	if resp.StatusCode != http.StatusOK {
		return "", nil, fmt.Errorf("gateway HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(b)))
	}

	var chatResp ChatResponse
	if err := json.Unmarshal(b, &chatResp); err != nil {
		return "", nil, fmt.Errorf("decode response: %w", err)
	}
	content := ""
	if len(chatResp.Choices) > 0 {
		content = chatResp.Choices[0].Message.Content
	}
	total := time.Since(start)
	// Unary responses have no separate first-token event. TTFT equals total latency.
	return content, buildMetrics(total, total, chatResp.Usage, chatResp.Model, resp.Header), nil
}

func buildMetrics(total, ttft time.Duration, usage Usage, resolved string, header http.Header) *InferenceMetrics {
	eval := total - ttft
	if eval < 0 {
		eval = 0
	}
	var tps float64
	if usage.CompletionTokens > 0 && eval.Seconds() > 0 && ttft != total {
		tps = float64(usage.CompletionTokens) / eval.Seconds()
	} else if usage.CompletionTokens > 0 && total.Seconds() > 0 {
		tps = float64(usage.CompletionTokens) / total.Seconds()
	}
	var promptTPS float64
	if usage.PromptTokens > 0 && ttft.Seconds() > 0 && ttft != total {
		promptTPS = float64(usage.PromptTokens) / ttft.Seconds()
	}

	return &InferenceMetrics{
		TimeToFirstToken:   ttft,
		TotalLatency:       total,
		PromptTokens:       usage.PromptTokens,
		CompletionTokens:   usage.CompletionTokens,
		TotalTokens:        usage.TotalTokens,
		EvalDuration:       eval,
		TokensPerSecond:    tps,
		PromptTokensPerSec: promptTPS,
		ResolvedModel:      resolved,
		Gateway:            gatewayFromHeader(header),
	}
}

func gatewayFromHeader(header http.Header) GatewayInfo {
	info := GatewayInfo{Headers: map[string]string{}}
	if header == nil {
		return info
	}
	for k, v := range header {
		lk := strings.ToLower(k)
		if !strings.HasPrefix(lk, "x-litellm-") && !strings.HasPrefix(lk, "x-ratelimit-") {
			continue
		}
		info.Headers[lk] = strings.Join(v, ", ")
	}
	info.CallID = info.Headers["x-litellm-call-id"]
	info.ModelID = info.Headers["x-litellm-model-id"]
	info.APIBase = info.Headers["x-litellm-model-api-base"]
	info.ResponseCost = info.Headers["x-litellm-response-cost"]
	info.Overhead = firstHeader(info.Headers, "x-litellm-overhead-duration-ms", "x-litellm-overhead_duration_ms")
	info.Retries = info.Headers["x-litellm-attempted-retries"]
	info.ResponseDuration = info.Headers["x-litellm-response-duration-ms"]
	return info
}

func firstHeader(h map[string]string, keys ...string) string {
	for _, k := range keys {
		if v := h[k]; v != "" {
			return v
		}
	}
	return ""
}
