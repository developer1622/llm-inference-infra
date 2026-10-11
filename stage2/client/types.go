package client

import "time"

// ChatMessage is one turn in an OpenAI-style conversation.
type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// StreamOptions asks the gateway to append token usage to the final SSE chunk.
type StreamOptions struct {
	IncludeUsage bool `json:"include_usage"`
}

// ChatRequest is the body for POST /v1/chat/completions.
type ChatRequest struct {
	Model         string         `json:"model"`
	Messages      []ChatMessage  `json:"messages"`
	Stream        bool           `json:"stream"`
	MaxTokens     int            `json:"max_tokens,omitempty"`
	StreamOptions *StreamOptions `json:"stream_options,omitempty"`
}

// Usage is the OpenAI token accounting block. LiteLLM fills it from the backend.
type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

// ChatResponse is a non-streaming /v1/chat/completions body.
type ChatResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index        int         `json:"index"`
		Message      ChatMessage `json:"message"`
		FinishReason string      `json:"finish_reason"`
	} `json:"choices"`
	Usage Usage `json:"usage"`
}

// ChatChunk is one SSE event from a streaming completion.
type ChatChunk struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index int `json:"index"`
		Delta struct {
			Role    string `json:"role"`
			Content string `json:"content"`
		} `json:"delta"`
		FinishReason *string `json:"finish_reason"`
	} `json:"choices"`
	Usage *Usage `json:"usage,omitempty"`
	Error *struct {
		Message string `json:"message"`
		Type    string `json:"type"`
		Code    string `json:"code"`
	} `json:"error,omitempty"`
}

// ModelCard is one entry from GET /v1/models.
type ModelCard struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	OwnedBy string `json:"owned_by"`
}

// ModelList is the body of GET /v1/models.
type ModelList struct {
	Object string      `json:"object"`
	Data   []ModelCard `json:"data"`
}

// GatewayInfo is what LiteLLM adds on top of the model response.
type GatewayInfo struct {
	CallID           string
	ModelID          string
	APIBase          string
	ResponseCost     string
	Overhead         string
	Retries          string
	ResponseDuration string
	Headers          map[string]string
}

// InferenceMetrics is the client-side view of one request.
// TimeToFirstToken includes gateway auth, routing, and the model's prefill.
type InferenceMetrics struct {
	TimeToFirstToken   time.Duration
	TotalLatency       time.Duration
	PromptTokens       int
	CompletionTokens   int
	TotalTokens        int
	EvalDuration       time.Duration
	TokensPerSecond    float64
	PromptTokensPerSec float64
	ResolvedModel      string
	Gateway            GatewayInfo
}
