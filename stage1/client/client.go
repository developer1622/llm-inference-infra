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

// OllamaClient provides idiomatic Go methods to interact with Ollama via standard net/http.
type OllamaClient struct {
	BaseURL     string
	HTTPClient  *http.Client
	InspectWire bool
}

// NewClient creates a new OllamaClient instance.
func NewClient(baseURL string, inspectWire bool) *OllamaClient {
	if baseURL == "" {
		baseURL = "http://localhost:11434"
	}
	return &OllamaClient{
		BaseURL: baseURL,
		HTTPClient: &http.Client{
			// No overall timeout set here because model generation can take arbitrary time.
			// Contexts will be passed to handle cancellation or deadlines.
		},
		InspectWire: inspectWire,
	}
}

func (c *OllamaClient) logRequest(req *http.Request, bodyBytes []byte) {
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

func (c *OllamaClient) logResponse(resp *http.Response) {
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

// StreamGenerate sends a prompt to /api/generate and streams tokens back to the callback.
func (c *OllamaClient) StreamGenerate(ctx context.Context, req GenerateRequest, onToken func(string)) (*InferenceMetrics, error) {
	req.Stream = true
	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal generate request: %w", err)
	}

	url := fmt.Sprintf("%s/api/generate", c.BaseURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/x-ndjson")

	c.logRequest(httpReq, bodyBytes)

	startTime := time.Now()
	var ttft time.Duration
	var firstTokenReceived bool

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute http request: %w", err)
	}
	defer resp.Body.Close()

	c.logResponse(resp)

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("server returned error HTTP %d: %s", resp.StatusCode, string(b))
	}

	scanner := bufio.NewScanner(resp.Body)
	// Allow large tokens if needed
	buf := make([]byte, 64*1024)
	scanner.Buffer(buf, 1024*1024)

	var lastResp GenerateResponse

	for scanner.Scan() {
		line := scanner.Bytes()
		if len(bytes.TrimSpace(line)) == 0 {
			continue
		}

		var chunk GenerateResponse
		if err := json.Unmarshal(line, &chunk); err != nil {
			return nil, fmt.Errorf("failed to unmarshal chunk: %w", err)
		}

		if !firstTokenReceived && chunk.Response != "" {
			ttft = time.Since(startTime)
			firstTokenReceived = true
		}

		if chunk.Response != "" && onToken != nil {
			onToken(chunk.Response)
		}

		if chunk.Done {
			lastResp = chunk
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading response stream: %w", err)
	}

	totalLatency := time.Since(startTime)
	metrics := computeMetrics(startTime, totalLatency, ttft, lastResp.PromptEvalCount, lastResp.EvalCount, lastResp.PromptEvalDuration, lastResp.EvalDuration)
	return metrics, nil
}

// UnaryGenerate sends a prompt to /api/generate with stream=false and returns the complete text.
func (c *OllamaClient) UnaryGenerate(ctx context.Context, req GenerateRequest) (string, *InferenceMetrics, error) {
	req.Stream = false
	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return "", nil, fmt.Errorf("failed to marshal generate request: %w", err)
	}

	url := fmt.Sprintf("%s/api/generate", c.BaseURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return "", nil, fmt.Errorf("failed to create http request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	c.logRequest(httpReq, bodyBytes)

	startTime := time.Now()
	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return "", nil, fmt.Errorf("failed to execute http request: %w", err)
	}
	defer resp.Body.Close()

	c.logResponse(resp)

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", nil, fmt.Errorf("server returned error HTTP %d: %s", resp.StatusCode, string(b))
	}

	var genResp GenerateResponse
	if err := json.NewDecoder(resp.Body).Decode(&genResp); err != nil {
		return "", nil, fmt.Errorf("failed to decode response: %w", err)
	}

	totalLatency := time.Since(startTime)
	metrics := computeMetrics(startTime, totalLatency, totalLatency, genResp.PromptEvalCount, genResp.EvalCount, genResp.PromptEvalDuration, genResp.EvalDuration)
	return genResp.Response, metrics, nil
}

// StreamChat sends chat messages to /api/chat and streams tokens to onToken.
func (c *OllamaClient) StreamChat(ctx context.Context, req ChatRequest, onToken func(string)) (*InferenceMetrics, error) {
	req.Stream = true
	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal chat request: %w", err)
	}

	url := fmt.Sprintf("%s/api/chat", c.BaseURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/x-ndjson")

	c.logRequest(httpReq, bodyBytes)

	startTime := time.Now()
	var ttft time.Duration
	var firstTokenReceived bool

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute http request: %w", err)
	}
	defer resp.Body.Close()

	c.logResponse(resp)

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("server returned error HTTP %d: %s", resp.StatusCode, string(b))
	}

	scanner := bufio.NewScanner(resp.Body)
	var lastResp ChatResponse

	for scanner.Scan() {
		line := scanner.Bytes()
		if len(bytes.TrimSpace(line)) == 0 {
			continue
		}

		var chunk ChatResponse
		if err := json.Unmarshal(line, &chunk); err != nil {
			return nil, fmt.Errorf("failed to unmarshal chat chunk: %w", err)
		}

		token := chunk.Message.Content
		if !firstTokenReceived && token != "" {
			ttft = time.Since(startTime)
			firstTokenReceived = true
		}

		if token != "" && onToken != nil {
			onToken(token)
		}

		if chunk.Done {
			lastResp = chunk
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading chat stream: %w", err)
	}

	totalLatency := time.Since(startTime)
	metrics := computeMetrics(startTime, totalLatency, ttft, lastResp.PromptEvalCount, lastResp.EvalCount, lastResp.PromptEvalDuration, lastResp.EvalDuration)
	return metrics, nil
}

// UnaryChat sends chat messages to /api/chat with stream=false.
func (c *OllamaClient) UnaryChat(ctx context.Context, req ChatRequest) (string, *InferenceMetrics, error) {
	req.Stream = false
	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return "", nil, fmt.Errorf("failed to marshal chat request: %w", err)
	}

	url := fmt.Sprintf("%s/api/chat", c.BaseURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return "", nil, fmt.Errorf("failed to create http request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	c.logRequest(httpReq, bodyBytes)

	startTime := time.Now()
	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return "", nil, fmt.Errorf("failed to execute http request: %w", err)
	}
	defer resp.Body.Close()

	c.logResponse(resp)

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", nil, fmt.Errorf("server returned error HTTP %d: %s", resp.StatusCode, string(b))
	}

	var chatResp ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", nil, fmt.Errorf("failed to decode response: %w", err)
	}

	totalLatency := time.Since(startTime)
	metrics := computeMetrics(startTime, totalLatency, totalLatency, chatResp.PromptEvalCount, chatResp.EvalCount, chatResp.PromptEvalDuration, chatResp.EvalDuration)
	return chatResp.Message.Content, metrics, nil
}

// StreamOpenAIChat sends requests to /v1/chat/completions using standard SSE streaming.
func (c *OllamaClient) StreamOpenAIChat(ctx context.Context, req OpenAIChatRequest, onToken func(string)) (*InferenceMetrics, error) {
	req.Stream = true
	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal OpenAI request: %w", err)
	}

	url := fmt.Sprintf("%s/v1/chat/completions", c.BaseURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create http request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "text/event-stream")

	c.logRequest(httpReq, bodyBytes)

	startTime := time.Now()
	var ttft time.Duration
	var firstTokenReceived bool
	var tokenCount int

	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to execute http request: %w", err)
	}
	defer resp.Body.Close()

	c.logResponse(resp)

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("server returned error HTTP %d: %s", resp.StatusCode, string(b))
	}

	scanner := bufio.NewScanner(resp.Body)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.TrimSpace(line) == "" {
			continue
		}

		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			if strings.TrimSpace(data) == "[DONE]" {
				break
			}

			var chunk OpenAIChatChunk
			if err := json.Unmarshal([]byte(data), &chunk); err != nil {
				continue
			}

			if len(chunk.Choices) > 0 {
				delta := chunk.Choices[0].Delta.Content
				if delta != "" {
					if !firstTokenReceived {
						ttft = time.Since(startTime)
						firstTokenReceived = true
					}
					tokenCount++
					if onToken != nil {
						onToken(delta)
					}
				}
			}
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading OpenAI SSE stream: %w", err)
	}

	totalLatency := time.Since(startTime)
	evalDuration := totalLatency - ttft
	var tps float64
	if evalDuration.Seconds() > 0 {
		tps = float64(tokenCount) / evalDuration.Seconds()
	}

	return &InferenceMetrics{
		TimeToFirstToken: ttft,
		TotalLatency:     totalLatency,
		CompletionTokens: tokenCount,
		TotalTokens:      tokenCount,
		EvalDuration:     evalDuration,
		TokensPerSecond:  tps,
	}, nil
}

// UnaryOpenAIChat sends a non-streaming request to /v1/chat/completions.
func (c *OllamaClient) UnaryOpenAIChat(ctx context.Context, req OpenAIChatRequest) (string, *InferenceMetrics, error) {
	req.Stream = false
	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return "", nil, fmt.Errorf("failed to marshal OpenAI request: %w", err)
	}

	url := fmt.Sprintf("%s/v1/chat/completions", c.BaseURL)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(bodyBytes))
	if err != nil {
		return "", nil, fmt.Errorf("failed to create http request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	c.logRequest(httpReq, bodyBytes)

	startTime := time.Now()
	resp, err := c.HTTPClient.Do(httpReq)
	if err != nil {
		return "", nil, fmt.Errorf("failed to execute http request: %w", err)
	}
	defer resp.Body.Close()

	c.logResponse(resp)

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", nil, fmt.Errorf("server returned error HTTP %d: %s", resp.StatusCode, string(b))
	}

	var chatResp OpenAIChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&chatResp); err != nil {
		return "", nil, fmt.Errorf("failed to decode response: %w", err)
	}

	totalLatency := time.Since(startTime)
	content := ""
	if len(chatResp.Choices) > 0 {
		content = chatResp.Choices[0].Message.Content
	}

	var tps float64
	if totalLatency.Seconds() > 0 && chatResp.Usage.CompletionTokens > 0 {
		tps = float64(chatResp.Usage.CompletionTokens) / totalLatency.Seconds()
	}

	return content, &InferenceMetrics{
		TimeToFirstToken: totalLatency,
		TotalLatency:     totalLatency,
		PromptTokens:     chatResp.Usage.PromptTokens,
		CompletionTokens: chatResp.Usage.CompletionTokens,
		TotalTokens:      chatResp.Usage.TotalTokens,
		TokensPerSecond:  tps,
	}, nil
}

func computeMetrics(start time.Time, totalLatency, ttft time.Duration, promptEvalCount, evalCount int, promptEvalNs, evalNs int64) *InferenceMetrics {
	promptDuration := time.Duration(promptEvalNs)
	evalDuration := time.Duration(evalNs)

	var tps float64
	if evalDuration.Seconds() > 0 {
		tps = float64(evalCount) / evalDuration.Seconds()
	} else if totalLatency.Seconds() > 0 {
		tps = float64(evalCount) / totalLatency.Seconds()
	}

	var promptTps float64
	if promptDuration.Seconds() > 0 {
		promptTps = float64(promptEvalCount) / promptDuration.Seconds()
	}

	return &InferenceMetrics{
		TimeToFirstToken:   ttft,
		TotalLatency:       totalLatency,
		PromptTokens:       promptEvalCount,
		CompletionTokens:   evalCount,
		TotalTokens:        promptEvalCount + evalCount,
		PromptDuration:     promptDuration,
		EvalDuration:       evalDuration,
		TokensPerSecond:    tps,
		PromptTokensPerSec: promptTps,
	}
}
