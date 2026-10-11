# Stage 3: KServe on Kubernetes

Stage 3 runs the model behind a KServe `InferenceService` on the kind cluster `ha-cluster`. The predictor pod is a small Go server. It exposes the OpenAI chat API and the KServe probe and v2 routes, then proxies chat to the Stage 1 Ollama server.

Clients can call the ingress directly, or send `model: kserve-qwen` through the Stage 2 LiteLLM gateway.

```
stage3-client or curl
        │
        ├─ direct
        │     POST http://127.0.0.1:80/v1/chat/completions
        │     Host: kserve-qwen-kserve-test.127.0.0.1.nip.io
        │
        └─ gateway
              POST http://127.0.0.1:4000/v1/chat/completions
              Authorization: Bearer sk-stage2-lab
              model: kserve-qwen
                    │
                    ▼
              LiteLLM rewrites to http://127.0.0.1:80/v1
              and sets the Host header above
        │
        ▼
NGINX Ingress (host port 80 on the kind node)
        │
        ▼
Service kserve-qwen-predictor.kserve-test  :80 → pod :8080
        │
        ▼
Predictor container  (image kserve-predictor:v1)
  readiness  GET /v1/models
  liveness   GET /healthz
  chat       POST /v1/chat/completions
        │
        ▼
Ollama on the host  http://172.19.0.1:11434
model qwen2.5:0.5b
```

`172.19.0.1` is the gateway of the `kind` Docker network. From a pod, that address is the host where Ollama is published. The value is set in `manifests/01-inferenceservice.yaml` as `OLLAMA_BASE_URL`.

---

## What Kubernetes creates

`manifests/01-inferenceservice.yaml` is one resource:

- name `kserve-qwen`, namespace `kserve-test`
- annotation `serving.kserve.io/deploymentMode: RawDeployment`
- image `kserve-predictor:v1`, container port 8080
- requests `cpu: 100m`, `memory: 64Mi`
- limits `cpu: 500m`, `memory: 256Mi`
- readiness `GET /v1/models`, liveness `GET /healthz`

KServe turns that into a Deployment `kserve-qwen-predictor`, a Service of the same name, and an Ingress whose host is `kserve-qwen-kserve-test.127.0.0.1.nip.io`. The scheduler places the pod on a worker. Node, pod IP, and ClusterIP change across restarts, so read them from the cluster:

```bash
kubectl get isvc kserve-qwen -n kserve-test
kubectl get pods,svc,ingress,endpoints -n kserve-test
```

A Ready InferenceService reports the URL `http://kserve-qwen-kserve-test.127.0.0.1.nip.io`.

---

## Predictor

`predictor/main.go` listens on port 8080.

| Route | Role |
| --- | --- |
| `GET /healthz`, `GET /v2/health/live` | Liveness. Body `{"status":"alive"}`. |
| `GET /v1/models` | Readiness. Lists the model id `kserve-qwen`. |
| `GET /v2/health/ready` | Extra ready probe. |
| `POST /v1/chat/completions` | OpenAI chat. Unary JSON, or SSE when `stream` is true. |
| `POST /v2/models/kserve-qwen/infer` | KServe v2 shape. Returns a fixed JSON payload from this pod. |
| `GET /metrics` | `kserve_requests_total`, `kserve_tokens_total`, `kserve_failed_requests_total`. |
| `GET /info` | Pod name, node name, Ollama URL, and the same counters. |

Chat calls Ollama `POST /api/chat` with `OLLAMA_MODEL` (`qwen2.5:0.5b`). Unary responses include `system_pod` and `node`. Both unary and streaming responses set `X-KServe-Pod` and `X-KServe-Node`.

Two request headers exist for the failure lab:

- `X-Simulate-Failure: 503` returns that status and a JSON error. Any integer code works. A non-integer becomes 503.
- `X-Simulate-Delay: 2s` sleeps before the call. The value is a Go duration.

If the predictor cannot reach Ollama, chat still returns HTTP 200. The body is a fallback sentence that starts with `[KServe Pod` and names the pod and node.

---

## Prerequisites

These are already part of this machine when the stage is up:

- Stage 1 Ollama on `localhost:11434` with `qwen2.5:0.5b`
- Stage 2 LiteLLM on `localhost:4000`, because `config.yaml` contains the `kserve-qwen` alias
- kind cluster `ha-cluster` (`kubectl config current-context` is `kind-ha-cluster`)
- KServe, and the NGINX ingress published on host port 80

Confirm the data plane before running the client:

```bash
curl -sf --max-time 5 http://localhost:11434/
curl -sf --max-time 5 http://localhost:4000/health/liveliness
kubectl get isvc kserve-qwen -n kserve-test
```

---

## Build and load the predictor

The running cluster already has `kserve-predictor:v1`. Rebuild only when `predictor/main.go` changes:

```bash
docker build -t kserve-predictor:v1 /home/ramum/model-serving/stage3/predictor
kind load docker-image kserve-predictor:v1 --name ha-cluster
kubectl apply -f /home/ramum/model-serving/stage3/manifests/01-inferenceservice.yaml
kubectl rollout restart deployment/kserve-qwen-predictor -n kserve-test
kubectl rollout status deployment/kserve-qwen-predictor -n kserve-test
```

`imagePullPolicy: IfNotPresent` uses the image that `kind load` placed on the nodes.

---

## Verification client

`stage3-client` is the Go program in `main.go`. This directory has no `go.mod`. Build it with:

```bash
cd /home/ramum/model-serving/stage3
go build -o stage3-client main.go
./stage3-client
```

`-mode` defaults to `all`, which runs four checks in order:

| Mode | What it does |
| --- | --- |
| `k8s` | Prints InferenceService conditions, pod node, CPU and memory limits, and the predictor endpoints. |
| `direct` | Unary chat and a streaming chat through the ingress. Streaming prints time to first token, total time, token count, and tokens per second. |
| `gateway` | Unary chat to LiteLLM with `model: kserve-qwen`. Prints the LiteLLM model id and API base. |
| `failure` | Ingress call with `X-Simulate-Failure: 503`, then a LiteLLM call to `backend-down`. |
| `all` | The four checks above. |

Run one check on its own:

```bash
./stage3-client -mode k8s
./stage3-client -mode direct
./stage3-client -mode gateway
./stage3-client -mode failure
```

The direct and gateway HTTP clients use a 90 second timeout. The failure client uses 10 seconds. `backend-down` is the Stage 2 alias aimed at `127.0.0.1:9`, so that second failure check needs LiteLLM.

---

## curl

```bash
./curl_demo.sh
```

The script runs six calls:

1. Unary chat through the ingress.
2. The first SSE chunks of a streaming chat.
3. Unary chat through LiteLLM as `kserve-qwen`.
4. `X-Simulate-Failure: 503` on the ingress.
5. `POST /v2/models/kserve-qwen/infer`.
6. `GET /metrics`, filtered to the `kserve_` counters.

Every ingress call sends `Host: kserve-qwen-kserve-test.127.0.0.1.nip.io`. Port 80 on this host is the kind ingress, and NGINX chooses the Service from that host.

---

## How the two fronts differ

The ingress front proves the Kubernetes path: host routing, the Service endpoints, the probes, and the pod resource limits. The gateway front proves the Stage 2 alias. LiteLLM authenticates the caller, looks up `kserve-qwen` in `config.yaml`, and forwards to the same ingress. The deployment id on that route is `kserve-kubernetes-qwen`.
