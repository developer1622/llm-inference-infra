# Stage 1: A prompt becomes a response

Stage 1 is the shortest path in this lab. A Go client, or curl, sends a prompt to Ollama. Ollama tokenizes it, runs `qwen2.5:0.5b` with llama.cpp, and streams tokens back. There is no gateway and no Kubernetes in this path.

```
curl or stage1-client
        │  HTTP
        ▼
Ollama :11434
  /api/generate          NDJSON
  /api/chat              NDJSON
  /v1/chat/completions   Server-Sent Events
        │
        ▼
qwen2.5:0.5b  (GGUF, CPU)
```

The client records time to first token, total latency, prompt tokens, generated tokens, and tokens per second.

---

## Request lifecycle

A streaming chat call looks like this:

```json
{
  "model": "qwen2.5:0.5b",
  "messages": [{"role": "user", "content": "Explain Kubernetes in one sentence."}],
  "stream": true
}
```

1. The Go client posts that JSON to `http://localhost:11434/api/chat`.
2. Ollama applies the model chat template and tokenizes the prompt.
3. Prefill runs the prompt tokens and fills the KV cache. Ollama reports this as `prompt_eval_count` and `prompt_eval_duration`.
4. Decode emits one token at a time. Each token is a line of NDJSON on the open connection. The client marks time to first token on the first content chunk.
5. The final chunk has `done: true` plus the token counts and durations. The client turns those into tokens per second.

`/api/generate` is the same runtime with a raw prompt. `/v1/chat/completions` is the OpenAI-shaped SSE form of the same model. Stage 2 speaks that third shape.

---

## Quick start

Ollama is already published on port 11434. Confirm it, then build the client from this directory:

```bash
curl -s http://localhost:11434/
docker exec ollama ollama list
go build -o stage1-client .
```

`ollama list` should include `qwen2.5:0.5b`.

---

## Usage

### Streaming chat (default)

```bash
./stage1-client -endpoint chat -stream=true \
  -prompt "Explain Kubernetes in one sentence."
```

### Unary chat

```bash
./stage1-client -endpoint chat -stream=false \
  -prompt "Explain neural networks in 10 words."
```

### Raw generate

```bash
./stage1-client -endpoint generate -stream=false \
  -prompt "Explain what an LLM token is in one short sentence."
```

### OpenAI-compatible SSE

```bash
./stage1-client -endpoint openai -stream=true \
  -prompt "List 3 primary colors."
```

### Interactive multi-turn

```bash
./stage1-client -interactive
```

Type `exit` to leave the session.

### curl

```bash
./curl_demo.sh
```

The script runs three calls against `qwen2.5:0.5b`: a unary `/api/generate`, a streaming `/api/chat`, and the first SSE chunks of `/v1/chat/completions`. Pass another pulled model name as the first argument if you want to point it elsewhere.

---

## Flags

| Flag | Default | Meaning |
| --- | --- | --- |
| `-url` | `http://localhost:11434` | Ollama base URL |
| `-model` | `qwen2.5:0.5b` | Model name Ollama already has |
| `-prompt` | a short lifecycle prompt | Single-shot prompt |
| `-stream` | `true` | Stream tokens as they arrive |
| `-endpoint` | `chat` | `chat`, `generate`, or `openai` |
| `-inspect` | `true` | Print the HTTP request and response headers |
| `-interactive` | `false` | Multi-turn session |

Wire inspection is on by default. Pass `-inspect=false` for the answer and the metrics only.

---

## What the metrics mean

| Field | Meaning |
| --- | --- |
| Time to first token | Wait from send until the first content token |
| Total latency | Wait until the response is finished |
| Prompt tokens | Tokens in the formatted prompt |
| Completion tokens | Tokens the model generated |
| Tokens/sec | Completion tokens divided by decode time |

A cold model is slower on the first call. Later calls reuse the loaded weights.
