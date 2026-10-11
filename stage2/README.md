# Stage 2: LiteLLM API gateway

Stage 1 talks to Ollama directly. Stage 2 puts LiteLLM between the client and that same Ollama server.

The client still sends an OpenAI chat request. The gateway checks the key, picks a model deployment, forwards the call, and streams the tokens back. Ollama is unchanged.

```
curl or stage2-client
        │  POST /v1/chat/completions
        │  Authorization: Bearer sk-stage2-lab
        ▼
LiteLLM :4000                         Postgres 127.0.0.1:54329
  auth, alias lookup, retries,            one row per request
  120 rpm on the live Ollama aliases
        │
        ├─ demo-model, qwen, smollm, backend-down
        │       POST Ollama /api/chat   http://127.0.0.1:11434
        │
        └─ kserve-qwen
                POST http://127.0.0.1:80/v1
                Host: kserve-qwen-kserve-test.127.0.0.1.nip.io
                (Stage 3 InferenceService)
```

`backend-down` points at `127.0.0.1:9` so a backend failure can be shown while Ollama stays up.

---

## What the gateway does to one request

```json
{
  "model": "demo-model",
  "messages": [{"role": "user", "content": "Explain Kubernetes in one sentence."}],
  "stream": true
}
```

1. The Go client posts that JSON to `http://localhost:4000/v1/chat/completions` with the bearer key.
2. LiteLLM rejects the call when the key is missing or wrong.
3. `demo-model` is looked up in `config.yaml` and rewritten to `ollama_chat/qwen2.5:0.5b` at `http://127.0.0.1:11434`. The `ollama_chat/` prefix makes LiteLLM call Ollama `/api/chat`.
4. Ollama tokenizes, prefills, and decodes, the same path as Stage 1.
5. Tokens come back as Server-Sent Events. The Go client records time to first token and tokens per second. Time to first token here includes gateway work plus model prefill.
6. The proxy writes a JSON log line and a Postgres spend row.

Response headers the client prints:

- `x-litellm-call-id`
- `x-litellm-model-id`
- `x-litellm-model-api-base`
- `x-litellm-overhead-duration-ms`
- `x-litellm-response-duration-ms`
- `x-litellm-attempted-retries`
- `x-ratelimit-limit-requests` and `x-ratelimit-remaining-requests`

---

## Quick start

Stage 1 Ollama must already be running, with both models present:

```bash
curl -s http://localhost:11434/
docker exec ollama ollama list
```

`ollama list` should show `qwen2.5:0.5b` and `smollm2:135m`. If the second model is missing:

```bash
docker exec ollama ollama pull smollm2:135m
```

Start the gateway from this directory:

```bash
docker compose up -d
curl -s http://localhost:4000/health/liveliness
```

`/health/liveliness` answers `I'm alive!` when the process is up. The first start applies Prisma migrations, so that check can take a few minutes. Wait until `docker ps` shows `stage2-litellm` as healthy.

The lab key is `sk-stage2-lab` (see `.env`). It only unlocks this local proxy. Postgres listens on `127.0.0.1:54329`. Database, user, and password are `litellm`.

Build the client:

```bash
go build -o stage2-client .
```

---

## Usage

### Streaming chat (default)

```bash
./stage2-client -model demo-model -stream=true \
  -prompt "Explain Kubernetes in one sentence."
```

### Unary

```bash
./stage2-client -model demo-model -stream=false \
  -prompt "Explain neural networks in 10 words."
```

### Second model

```bash
./stage2-client -model smollm -max-tokens 40 \
  -prompt "Say hello in one sentence."
```

### Same prompt, two Ollama routes

```bash
./stage2-client -compare -max-tokens 40 \
  -prompt "What is a token?"
```

### Aliases

```bash
./stage2-client -list-models
```

### Auth, unknown model, dead backend

```bash
./stage2-client -failures
```

The four checks expect HTTP 401 for a missing key, HTTP 401 or 403 for a bad key, HTTP 400 or 404 for an unknown model, and HTTP 408, 500, or 503 for `backend-down`. A short success call to `demo-model` follows.

### Interactive multi-turn

```bash
./stage2-client -interactive -model qwen
```

### Stage 3 route

This alias is served only when the Stage 3 InferenceService is Ready:

```bash
./stage2-client -model kserve-qwen -stream=true \
  -prompt "What is an Ingress controller in Kubernetes?"
```

### curl

```bash
./curl_demo.sh demo-model
```

The script checks liveliness, lists models, sends one unary call, prints the first SSE chunks, and confirms that a call with no key returns HTTP 401.

### Request log

```bash
docker logs stage2-litellm --tail 40
curl -s http://localhost:4000/spend/logs \
  -H "Authorization: Bearer sk-stage2-lab" \
  | jq 'sort_by(.startTime) | reverse | .[0] | {model, status, total_tokens, startTime, endTime, model_group}'
```

The spend list is ordered by insert time. The `sort_by` above selects the newest row.

---

## Flags

| Flag | Default | Meaning |
| --- | --- | --- |
| `-url` | `http://localhost:4000` | LiteLLM base URL |
| `-model` | `demo-model` | Alias from `config.yaml` |
| `-prompt` | a short gateway prompt | Single-shot prompt |
| `-stream` | `true` | Stream tokens as they arrive |
| `-inspect` | `true` | Print the HTTP request and response headers |
| `-interactive` | `false` | Multi-turn session |
| `-api-key` | `sk-stage2-lab`, or `LITELLM_API_KEY` | Bearer key |
| `-max-tokens` | `0` (omit) | Cap on generated tokens |
| `-list-models` | `false` | Print `GET /v1/models` |
| `-failures` | `false` | Auth, unknown-model, and dead-backend checks |
| `-compare` | `false` | Same prompt to `demo-model` and `smollm` |

---

## Routing table

| Client `model` | Backend | Deployment id | Purpose |
| --- | --- | --- | --- |
| `demo-model` | `ollama_chat/qwen2.5:0.5b` at `:11434` | `ollama-qwen-0.5b` | Primary lab model |
| `qwen` | same weights | `ollama-qwen-0.5b-alias` | Second name for the same model |
| `smollm` | `ollama_chat/smollm2:135m` at `:11434` | `ollama-smollm-135m` | Second model |
| `kserve-qwen` | `openai/kserve-qwen` at `http://127.0.0.1:80/v1` | `kserve-kubernetes-qwen` | Stage 3 InferenceService |
| `backend-down` | same Qwen model at `127.0.0.1:9` | `unreachable-backend` | Failure demo, 2s timeout |

Live Ollama aliases are limited to 120 requests per minute. `backend-down` is limited to 60. The router retries once. `disable_cooldowns: true` keeps a failed demo from cooling down the real models. `drop_params: true` drops OpenAI fields Ollama does not accept, including `stream_options`. The client still asks for `stream_options.include_usage` so a usage chunk can arrive when the backend sends one.

`kserve-qwen` sets the `Host` header to `kserve-qwen-kserve-test.127.0.0.1.nip.io` because NGINX on port 80 routes by host. See `stage3/README.md` for the cluster side of that route.

---

## Stop

```bash
docker compose down
```

That stops LiteLLM and Postgres. The Stage 1 Ollama container keeps running. Add `-v` only when you also want to delete the `stage2_stage2-pg` volume.
