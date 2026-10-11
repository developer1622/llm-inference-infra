package client

import "time"

// ChatMessage represents a single message in a chat conversation.
type ChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// GenerateRequest represents the body for /api/generate
type GenerateRequest struct {
	Model   string `json:"model"`
	Prompt  string `json:"prompt"`
	Stream  bool   `json:"stream"`
	Options map[string]interface{} `json:"options,omitempty"`
}

// GenerateResponse represents the streaming or non-streaming response from /api/generate
type GenerateResponse struct {
	Model              string    `json:"model"`
	CreatedAt          time.Time `json:"created_at"`
	Response           string    `json:"response"`
	Done               bool      `json:"done"`
	DoneReason         string    `json:"done_reason,omitempty"`
	Context            []int     `json:"context,omitempty"`
	TotalDuration      int64     `json:"total_duration,omitempty"`       // in nanoseconds
	LoadDuration       int64     `json:"load_duration,omitempty"`        // in nanoseconds
	PromptEvalCount    int       `json:"prompt_eval_count,omitempty"`
	PromptEvalDuration int64     `json:"prompt_eval_duration,omitempty"` // in nanoseconds
	EvalCount          int       `json:"eval_count,omitempty"`
	EvalDuration       int64     `json:"eval_duration,omitempty"`        // in nanoseconds
}

// ChatRequest represents the body for /api/chat
type ChatRequest struct {
	Model    string        `json:"model"`
	Messages []ChatMessage `json:"messages"`
	Stream   bool          `json:"stream"`
	Options  map[string]interface{} `json:"options,omitempty"`
}

// ChatResponse represents the streaming or non-streaming response from /api/chat
type ChatResponse struct {
	Model              string      `json:"model"`
	CreatedAt          time.Time   `json:"created_at"`
	Message            ChatMessage `json:"message"`
	Done               bool        `json:"done"`
	DoneReason         string      `json:"done_reason,omitempty"`
	TotalDuration      int64       `json:"total_duration,omitempty"`       // in nanoseconds
	LoadDuration       int64       `json:"load_duration,omitempty"`        // in nanoseconds
	PromptEvalCount    int         `json:"prompt_eval_count,omitempty"`
	PromptEvalDuration int64     `json:"prompt_eval_duration,omitempty"` // in nanoseconds
	EvalCount          int         `json:"eval_count,omitempty"`
	EvalDuration       int64       `json:"eval_duration,omitempty"`        // in nanoseconds
}

// OpenAIChatRequest represents the OpenAI-compatible request payload for /v1/chat/completions
type OpenAIChatRequest struct {
	Model    string        `json:"model"`
	Messages []ChatMessage `json:"messages"`
	Stream   bool          `json:"stream"`
}

// OpenAIChatResponse represents non-streaming OpenAI-compatible chat response
type OpenAIChatResponse struct {
	ID      string `json:"id"`
	Object  string `json:"object"`
	Created int64  `json:"created"`
	Model   string `json:"model"`
	Choices []struct {
		Index        int         `json:"index"`
		Message      ChatMessage `json:"message"`
		FinishReason string      `json:"finish_reason"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

// OpenAIChatChunk represents streaming SSE chunk from /v1/chat/completions
type OpenAIChatChunk struct {
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
}

// InferenceMetrics captures lifecycle performance measurements for an inference request.
type InferenceMetrics struct {
	TimeToFirstToken time.Duration // Duration until the very first token was received
	TotalLatency     time.Duration // Duration from sending HTTP request until completion
	PromptTokens     int           // Prompt/input token count
	CompletionTokens int           // Generated token count
	TotalTokens      int           // Prompt + completion tokens
	EvalDuration     time.Duration // Time the model spent generating tokens
	PromptDuration   time.Duration // Time the model spent prefilling/evaluating the prompt
	TokensPerSecond  float64       // Completion tokens generated per second
	PromptTokensPerSec float64     // Prompt tokens evaluated per second
}
