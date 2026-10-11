package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync/atomic"
	"time"
)

// Config loaded from environment
var (
	port        = getEnv("PORT", "8080")
	modelName   = getEnv("MODEL_NAME", "kserve-qwen")
	ollamaBase  = getEnv("OLLAMA_BASE_URL", "http://172.19.0.1:11434")
	ollamaModel = getEnv("OLLAMA_MODEL", "qwen2.5:0.5b")
	podName     = getEnv("POD_NAME", "kserve-predictor-local")
	nodeName    = getEnv("NODE_NAME", "kind-worker")

	// Prometheus-style metrics counters
	totalRequests  uint64
	totalTokens    uint64
	failedRequests uint64
)

func getEnv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

// OpenAI Chat Completion structures
type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ChatCompletionRequest struct {
	Model       string        `json:"model"`
	Messages    []ChatMessage `json:"messages"`
	Stream      bool          `json:"stream"`
	Temperature float64       `json:"temperature,omitempty"`
	MaxTokens   int           `json:"max_tokens,omitempty"`
}

type ChatCompletionResponseChoice struct {
	Index        int         `json:"index"`
	Message      ChatMessage `json:"message"`
	FinishReason string      `json:"finish_reason"`
}

type ChatCompletionUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type ChatCompletionResponse struct {
	ID        string                         `json:"id"`
	Object    string                         `json:"object"`
	Created   int64                          `json:"created"`
	Model     string                         `json:"model"`
	Choices   []ChatCompletionResponseChoice `json:"choices"`
	Usage     ChatCompletionUsage            `json:"usage"`
	SystemPod string                         `json:"system_pod,omitempty"`
	Node      string                         `json:"node,omitempty"`
}

type StreamChoiceDelta struct {
	Role    string `json:"role,omitempty"`
	Content string `json:"content,omitempty"`
}

type StreamChoice struct {
	Index        int               `json:"index"`
	Delta        StreamChoiceDelta `json:"delta"`
	FinishReason *string           `json:"finish_reason"`
}

type ChatCompletionStreamResponse struct {
	ID      string         `json:"id"`
	Object  string         `json:"object"`
	Created int64          `json:"created"`
	Model   string         `json:"model"`
	Choices []StreamChoice `json:"choices"`
}

// Ollama API structures
type OllamaChatRequest struct {
	Model    string        `json:"model"`
	Messages []ChatMessage `json:"messages"`
	Stream   bool          `json:"stream"`
}

type OllamaChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OllamaChatResponse struct {
	Model              string            `json:"model"`
	CreatedAt          string            `json:"created_at"`
	Message            OllamaChatMessage `json:"message"`
	Done               bool              `json:"done"`
	TotalDuration      int64             `json:"total_duration"`
	PromptEvalCount    int               `json:"prompt_eval_count"`
	PromptEvalDuration int64             `json:"prompt_eval_duration"`
	EvalCount          int               `json:"eval_count"`
	EvalDuration       int64             `json:"eval_duration"`
}

func main() {
	mux := http.NewServeMux()

	// KServe & Kubernetes Standard Probes
	mux.HandleFunc("/healthz", handleLiveness)
	mux.HandleFunc("/v1/models", handleModels)
	mux.HandleFunc("/v2/health/live", handleLiveness)
	mux.HandleFunc("/v2/health/ready", handleReadiness)
	mux.HandleFunc("/v2/models/", handleKServeV2)

	// OpenAI Compatible API
	mux.HandleFunc("/v1/chat/completions", handleChatCompletions)

	// Diagnostic & SRE endpoints
	mux.HandleFunc("/metrics", handleMetrics)
	mux.HandleFunc("/info", handleInfo)

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      loggingMiddleware(mux),
		ReadTimeout:  120 * time.Second,
		WriteTimeout: 120 * time.Second,
	}

	log.Printf("[KServe Predictor] Initializing on :%s (Model: %s, Pod: %s, Node: %s)", port, modelName, podName, nodeName)
	log.Printf("[KServe Predictor] Ollama backend: %s (serving: %s)", ollamaBase, ollamaModel)

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s [%s]", r.Method, r.URL.Path, r.RemoteAddr, time.Since(start))
	})
}

func handleLiveness(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"alive"}`))
}

func handleReadiness(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"ready":true}`))
}

func handleModels(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	resp := map[string]interface{}{
		"object": "list",
		"data": []map[string]interface{}{
			{
				"id":       modelName,
				"object":   "model",
				"created":  time.Now().Unix(),
				"owned_by": "kserve",
			},
		},
	}
	json.NewEncoder(w).Encode(resp)
}

func handleInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	resp := map[string]interface{}{
		"model":           modelName,
		"pod_name":        podName,
		"node_name":       nodeName,
		"backend":         ollamaBase,
		"total_requests":  atomic.LoadUint64(&totalRequests),
		"total_tokens":    atomic.LoadUint64(&totalTokens),
		"failed_requests": atomic.LoadUint64(&failedRequests),
	}
	json.NewEncoder(w).Encode(resp)
}

func handleMetrics(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; version=0.0.4")
	fmt.Fprintf(w, "# HELP kserve_requests_total Total number of inference requests\n")
	fmt.Fprintf(w, "# TYPE kserve_requests_total counter\n")
	fmt.Fprintf(w, "kserve_requests_total{model=\"%s\"} %d\n", modelName, atomic.LoadUint64(&totalRequests))
	fmt.Fprintf(w, "# HELP kserve_tokens_total Total tokens generated\n")
	fmt.Fprintf(w, "# TYPE kserve_tokens_total counter\n")
	fmt.Fprintf(w, "kserve_tokens_total{model=\"%s\"} %d\n", modelName, atomic.LoadUint64(&totalTokens))
	fmt.Fprintf(w, "# HELP kserve_failed_requests_total Total requests failed\n")
	fmt.Fprintf(w, "# TYPE kserve_failed_requests_total counter\n")
	fmt.Fprintf(w, "kserve_failed_requests_total{model=\"%s\"} %d\n", modelName, atomic.LoadUint64(&failedRequests))
}

func handleKServeV2(w http.ResponseWriter, r *http.Request) {
	// KServe v2 Data Plane protocol: /v2/models/{model_name}/infer
	if !strings.HasSuffix(r.URL.Path, "/infer") {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"model_name":"%s","model_version":"v1","outputs":[{"name":"output","datatype":"BYTES","shape":[1],"data":["KServe v2 Data Plane inference response from %s on node %s"]}]}`, modelName, podName, nodeName)))
}

func handleChatCompletions(w http.ResponseWriter, r *http.Request) {
	atomic.AddUint64(&totalRequests, 1)

	// Simulate failures for resilience observation
	if failHeader := r.Header.Get("X-Simulate-Failure"); failHeader != "" {
		code, err := strconv.Atoi(failHeader)
		if err != nil {
			code = http.StatusServiceUnavailable
		}
		atomic.AddUint64(&failedRequests, 1)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(code)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"error": map[string]interface{}{
				"message": fmt.Sprintf("Simulated failure injected by header (code %d) on pod %s", code, podName),
				"type":    "kserve_simulated_error",
				"code":    code,
			},
		})
		return
	}

	// Simulate intentional latency for scheduling/timeout observation
	if delayHeader := r.Header.Get("X-Simulate-Delay"); delayHeader != "" {
		if d, err := time.ParseDuration(delayHeader); err == nil {
			time.Sleep(d)
		}
	}

	var req ChatCompletionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		atomic.AddUint64(&failedRequests, 1)
		http.Error(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
		return
	}

	// Try Ollama backend first
	ollamaAvailable := testOllamaBackend()

	if req.Stream {
		handleStreamingChat(w, r, &req, ollamaAvailable)
	} else {
		handleUnaryChat(w, r, &req, ollamaAvailable)
	}
}

func testOllamaBackend() bool {
	client := http.Client{Timeout: 1 * time.Second}
	resp, err := client.Get(ollamaBase + "/api/tags")
	if err != nil {
		return false
	}
	resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

func handleUnaryChat(w http.ResponseWriter, r *http.Request, req *ChatCompletionRequest, useOllama bool) {
	var answerText string
	var promptToks, compToks int

	if useOllama {
		ollamaReq := OllamaChatRequest{
			Model:    ollamaModel,
			Messages: req.Messages,
			Stream:   false,
		}
		bodyBytes, _ := json.Marshal(ollamaReq)
		client := http.Client{Timeout: 60 * time.Second}
		resp, err := client.Post(ollamaBase+"/api/chat", "application/json", bytes.NewReader(bodyBytes))
		if err == nil && resp.StatusCode == http.StatusOK {
			var oResp OllamaChatResponse
			json.NewDecoder(resp.Body).Decode(&oResp)
			resp.Body.Close()
			answerText = oResp.Message.Content
			promptToks = oResp.PromptEvalCount
			compToks = oResp.EvalCount
		} else {
			if resp != nil {
				resp.Body.Close()
			}
			answerText = generateFallbackResponse(req)
			promptToks = 15
			compToks = 20
		}
	} else {
		answerText = generateFallbackResponse(req)
		promptToks = 15
		compToks = 20
	}

	atomic.AddUint64(&totalTokens, uint64(compToks))

	resp := ChatCompletionResponse{
		ID:      fmt.Sprintf("chatcmpl-kserve-%d", time.Now().UnixNano()),
		Object:  "chat.completion",
		Created: time.Now().Unix(),
		Model:   req.Model,
		Choices: []ChatCompletionResponseChoice{
			{
				Index: 0,
				Message: ChatMessage{
					Role:    "assistant",
					Content: answerText,
				},
				FinishReason: "stop",
			},
		},
		Usage: ChatCompletionUsage{
			PromptTokens:     promptToks,
			CompletionTokens: compToks,
			TotalTokens:      promptToks + compToks,
		},
		SystemPod: podName,
		Node:      nodeName,
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("X-KServe-Pod", podName)
	w.Header().Set("X-KServe-Node", nodeName)
	json.NewEncoder(w).Encode(resp)
}

func handleStreamingChat(w http.ResponseWriter, r *http.Request, req *ChatCompletionRequest, useOllama bool) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-KServe-Pod", podName)
	w.Header().Set("X-KServe-Node", nodeName)

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	reqID := fmt.Sprintf("chatcmpl-kserve-stream-%d", time.Now().UnixNano())

	// Send initial delta (role)
	initResp := ChatCompletionStreamResponse{
		ID:      reqID,
		Object:  "chat.completion.chunk",
		Created: time.Now().Unix(),
		Model:   req.Model,
		Choices: []StreamChoice{
			{
				Index: 0,
				Delta: StreamChoiceDelta{
					Role: "assistant",
				},
			},
		},
	}
	sendSSEChunk(w, flusher, initResp)

	if useOllama {
		ollamaReq := OllamaChatRequest{
			Model:    ollamaModel,
			Messages: req.Messages,
			Stream:   true,
		}
		bodyBytes, _ := json.Marshal(ollamaReq)
		client := http.Client{Timeout: 90 * time.Second}
		resp, err := client.Post(ollamaBase+"/api/chat", "application/json", bytes.NewReader(bodyBytes))
		if err == nil && resp.StatusCode == http.StatusOK {
			defer resp.Body.Close()
			scanner := bufio.NewScanner(resp.Body)
			for scanner.Scan() {
				line := scanner.Bytes()
				if len(line) == 0 {
					continue
				}
				var oChunk OllamaChatResponse
				if err := json.Unmarshal(line, &oChunk); err == nil {
					if oChunk.Message.Content != "" {
						atomic.AddUint64(&totalTokens, 1)
						chunkResp := ChatCompletionStreamResponse{
							ID:      reqID,
							Object:  "chat.completion.chunk",
							Created: time.Now().Unix(),
							Model:   req.Model,
							Choices: []StreamChoice{
								{
									Index: 0,
									Delta: StreamChoiceDelta{
										Content: oChunk.Message.Content,
									},
								},
							},
						}
						sendSSEChunk(w, flusher, chunkResp)
					}
					if oChunk.Done {
						stop := "stop"
						doneResp := ChatCompletionStreamResponse{
							ID:      reqID,
							Object:  "chat.completion.chunk",
							Created: time.Now().Unix(),
							Model:   req.Model,
							Choices: []StreamChoice{
								{
									Index:        0,
									Delta:        StreamChoiceDelta{},
									FinishReason: &stop,
								},
							},
						}
						sendSSEChunk(w, flusher, doneResp)
						break
					}
				}
			}
			fmt.Fprintf(w, "data: [DONE]\n\n")
			flusher.Flush()
			return
		}
	}

	// Fallback streaming tokens
	tokens := strings.Split(generateFallbackResponse(req), " ")
	for _, tok := range tokens {
		atomic.AddUint64(&totalTokens, 1)
		time.Sleep(30 * time.Millisecond) // realistic token cadence
		chunkResp := ChatCompletionStreamResponse{
			ID:      reqID,
			Object:  "chat.completion.chunk",
			Created: time.Now().Unix(),
			Model:   req.Model,
			Choices: []StreamChoice{
				{
					Index: 0,
					Delta: StreamChoiceDelta{
						Content: tok + " ",
					},
				},
			},
		}
		sendSSEChunk(w, flusher, chunkResp)
	}

	stop := "stop"
	doneResp := ChatCompletionStreamResponse{
		ID:      reqID,
		Object:  "chat.completion.chunk",
		Created: time.Now().Unix(),
		Model:   req.Model,
		Choices: []StreamChoice{
			{
				Index:        0,
				Delta:        StreamChoiceDelta{},
				FinishReason: &stop,
			},
		},
	}
	sendSSEChunk(w, flusher, doneResp)
	fmt.Fprintf(w, "data: [DONE]\n\n")
	flusher.Flush()
}

func sendSSEChunk(w io.Writer, flusher http.Flusher, chunk ChatCompletionStreamResponse) {
	b, _ := json.Marshal(chunk)
	fmt.Fprintf(w, "data: %s\n\n", string(b))
	flusher.Flush()
}

func generateFallbackResponse(req *ChatCompletionRequest) string {
	lastMsg := "Hello"
	if len(req.Messages) > 0 {
		lastMsg = req.Messages[len(req.Messages)-1].Content
	}
	return fmt.Sprintf("[KServe Pod %s on Node %s] Inference executed successfully for prompt: %q. Model serving runtime is active.", podName, nodeName, lastMsg)
}
