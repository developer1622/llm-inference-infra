# Stage 1: LLM Inference Request Lifecycle Explorer

This repository contains the complete implementation of **Stage 1** from the Model Serving Architecture curriculum:
> **"A prompt becomes a response"** — demonstrating the complete lifecycle of an LLM request from a client sending an HTTP prompt to a model generating tokens and returning a response, without Kubernetes or an API Gateway.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client Layer                                             │
│    • curl (CLI)                                             │
│    • Go client (net/http standard library)                  │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP POST /api/chat
                               │ JSON Payload + SSE / NDJSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Serving & Inference Engine (Ollama on Docker / Host)     │
│    • HTTP API Server (Gin routing)                          │
│    • Tokenizer (Text -> Token IDs)                          │
│    • Prompt Template Engine (ChatML formatting)             │
│    • Scheduler & KV Cache Manager                           │
│    • Autoregressive Model Runtime (llama.cpp engine)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Model Weights & Computation Runtime                      │
│    • Model: Qwen 2.5 0.5B Instruct (GGUF Q4_K_M)           │
│    • Hardware: CPU (x86_64, AVX2 SIMD vectorization)        │
│    • Output: Next-token probability distribution            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Request Lifecycle: What Actually Happens Behind the Prompt

When your Go application sends:
```json
{
  "model": "qwen2.5:0.5b",
  "messages": [{"role": "user", "content": "Explain Kubernetes in one sentence."}],
  "stream": true
}
```

1. **Serialization & TCP Handshake**: The Go client serializes the struct into JSON and sends an HTTP POST over TCP to port `11434`.
2. **Chat Template Formatting**: The serving engine wraps the message in the model's template:
   `<|im_start|>user\nExplain Kubernetes in one sentence.<|im_end|>\n<|im_start|>assistant\n`
3. **Tokenization (Prefill Phase)**: The tokenizer maps words/subwords to numerical token IDs (e.g., 36 input tokens).
4. **Prefill Evaluation**: The model processes all 36 tokens in parallel to compute initial key-value attention tensors (recorded as `prompt_eval_duration`).
5. **Autoregressive Decoding**:
   - The model predicts the next token ID from probabilities (sampling).
   - The token ID is detokenized back to text (e.g. `"Kubernetes"`).
   - The token is emitted immediately over the open HTTP connection as a chunk.
   - The KV cache retains the context so previous tokens don't need recomputing.
6. **Streaming Back to Go Client**: The Go client reads the chunk via `bufio.Scanner`, calculates **Time to First Token (TTFT)**, and streams it to stdout.
7. **End of Sequence (EOS)**: The model emits `<|im_end|>`, and the server sends a final JSON chunk containing token counts and duration metrics.

---

## 3. Quick Start & Usage

### 3.1 Verify the Ollama Inference Server
The Ollama container is running on port 11434 with model `qwen2.5:0.5b`:
```bash
curl http://localhost:11434/
# Output: Ollama is running

docker exec ollama ollama list
# Output: qwen2.5:0.5b (491 MB)
```

---

### 3.2 Inspecting with `curl`
Run the provided demo script:
```bash
./curl_demo.sh
```

Or run individual commands:

**Unary Request (/api/generate)**:
```bash
curl -s -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:0.5b",
    "prompt": "Explain what an LLM token is in one short sentence.",
    "stream": false
  }' | jq .
```

**Streaming Request (/api/chat)**:
```bash
curl -N -s -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:0.5b",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

**OpenAI-Compatible SSE Stream (/v1/chat/completions)**:
```bash
curl -N -s -X POST http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:0.5b",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

---

### 3.3 Running the Go Client (`stage1-client`)

The Go client is built with the Go standard library (`net/http`) and supports deep wire-level inspection.

#### 1. Streaming Chat (Default)
```bash
./stage1-client -endpoint chat -stream=true -prompt "Explain Kubernetes in one sentence."
```
*Outputs HTTP request, response headers, real-time token stream, TTFT (~600ms), and token generation speed.*

#### 2. Non-Streaming (Unary)
```bash
./stage1-client -endpoint chat -stream=false -prompt "Explain neural networks in 10 words."
```
*Shows how the client must wait until the full response is generated before reading.*

#### 3. OpenAI-Compatible Mode
```bash
./stage1-client -endpoint openai -stream=true -prompt "List 3 primary colors."
```
*Streams Server-Sent Events (SSE `data: {...}`) formatted for OpenAI clients. This directly prepares for Stage 2 (LiteLLM)!*

#### 4. Interactive Chat REPL (Multi-Turn)
```bash
./stage1-client -interactive
```
*Allows you to chat interactively with the model while tracking token metrics on each turn.*
