# End-to-End LLM Inference & Serving Infrastructure: From Socket to Silicon

[![Go Version](https://img.shields.io/badge/Go-1.24-00ADD8?style=flat&logo=go)](https://go.dev/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-KinD_v1.37-326CE5?style=flat&logo=kubernetes)](https://kubernetes.io/)
[![KServe](https://img.shields.io/badge/KServe-v0.14.0-FF6F00?style=flat)](https://kserve.github.io/)
[![LiteLLM](https://img.shields.io/badge/Gateway-LiteLLM_Proxy-4B32C3?style=flat)](https://litellm.ai/)
[![Runtime](https://img.shields.io/badge/Runtime-Ollama_CPU_AVX2-black?style=flat)](https://ollama.ai/)
[![Certification](https://img.shields.io/badge/CNCF-KCNA_Certified-0086FF?style=flat)](https://www.credly.com/)
[![Guide](https://img.shields.io/badge/PDF_Field_Guide-111_Pages-green?style=flat)](./LLM_Inference_Field_Guide.pdf)

> **Author**: [Ramu Mangalarapu](https://www.linkedin.com/in/ramu-mangalarapu) &bull; Senior Backend &amp; Distributed Systems Engineer (UBS, RGUKT IIIT Basar, KCNA Certified)  
> **Repository**: [https://github.com/developer1622/llm-inference-infra](https://github.com/developer1622/llm-inference-infra)  
> **Accompanying Publication**: [LLM_Inference_Field_Guide.pdf (111 Pages, 2.8 MB)](./LLM_Inference_Field_Guide.pdf)

---

## 1. Executive Architecture & Overview

Large Language Model (LLM) inference is frequently treated as an opaque machine learning problem. In production, however, serving generative models is strictly governed by classical distributed systems physics: TCP socket buffer exhaustion, Linux kernel `epoll` scheduling loops, memory bus bandwidth ceilings, cgroups CPU quota throttling, and L7 ingress routing.

This repository provides an enterprise-grade, three-stage reference architecture demonstrating the entire lifecycle of an LLM request:

```
[ Client Application ] (Go 1.24 net/http / curl)
        │
        │ HTTP/1.1 POST /v1/chat/completions (OpenAI Wire Spec)
        ▼
[ Stage 2: LiteLLM API Gateway (:4000) ]
        │  ├── Virtual Key Authentication (sk-stage2-lab)
        │  ├── Team Quotas & Token Spend Logging (PostgreSQL 16 :54329)
        │  ├── Upstream Retries, Fallbacks & Model Aliasing
        │  └── Latency & Overhead Injection Headers
        │
        ├─────────────────────────────────────────────────┐
        │ Direct Host Route                               │ K8s Ingress Route
        ▼                                                 ▼
[ Stage 1: Engine Runtime ]               [ Stage 3: KServe v0.14.0 on KinD ]
  Ollama Daemon (:11434)                    NGINX Ingress Controller (:80 / :443)
  llama.cpp GGUF Q4_K_M Engine                            │
  (Prefill & Decode Loops)                  KServe RawDeployment Service
        │                                                 │
        ▼                                   kserve-qwen-predictor Pod (:8080)
[ Intel AVX2 SIMD Compute ]                               │ (Sidecar / Reverse Proxy)
  4 Physical Cores / 8 Threads                            ▼
  Vector Arithmetic on Host CPU             Ollama Daemon on Host Bridge (172.19.0.1:11434)
```

---

## 2. Testbed Hardware & Environment Disclosure

All benchmarks, kernel traces, and container workloads in this project were tested on physical developer hardware without discrete cloud GPUs to guarantee 100% reproducibility.

| Subsystem | Hardware / Software Specification | Operational Context |
| :--- | :--- | :--- |
| **Host Machine** | Intel&reg; Core&trade; i5-10210U @ 1.60GHz (Turbo 4.20GHz) | 4 physical cores, 8 threads, Intel Hyper-Threading |
| **Vector Engine** | AVX2, FMA3, SSE4.2 (256-bit SIMD) | Pure CPU matrix multiplication without CUDA |
| **System Memory** | 7.8 GiB DDR4 RAM (~4.1 GiB available during runs) | Monitored to prevent swapping during KV cache allocations |
| **Storage** | 1007 GB NVMe SSD (`ext4` on `/dev/sdd`, &gt;920 GB free) | High throughput GGUF model weight weight-loading |
| **Operating System** | Ubuntu 24.04.1 LTS (Noble Numbat) on WSL2 | Linux Kernel `6.6.87.2-microsoft-standard-WSL2` |
| **Container Engine** | Docker Engine 27.x &bull; `containerd 2.3.4` | Host networking for gateway; bridge for KinD cluster |
| **Kubernetes** | KinD v1.37.0 HA Cluster (`ha-cluster`) | 1 Control Plane + 3 Worker Nodes (`ha-cluster-worker[1-3]`) |
| **Model Weights** | `qwen2.5:0.5b` (398 MB) &bull; `smollm2:135m` (271 MB) | 4-bit block quantization (GGUF `Q4_K_M`) |

---

## 3. Companion Field Guide Publication

This repository includes the complete, publication-grade manual:  
📄 **[`LLM_Inference_Field_Guide.pdf`](./LLM_Inference_Field_Guide.pdf)** (111 Pages &bull; 2.8 MB &bull; Print-Ready A4).

The guide details the low-level systems mechanics across 9 parts and dedicated lab modules:
- **Part 0: The Modern GenAI Serving Ecosystem**: The 8-layer stack, open vs closed weights, transformer parameter economics.
- **Part 1: Anatomy of an Inference Request**: Tokenization, embeddings, prefill computation, autoregressive decode loop, detokenization.
- **Part 2: Core Engine Scheduling & Memory Architecture**: KV cache math, PagedAttention, continuous batching, prefix caching, speculative decoding.
- **Part 3: Hardware Accelerators & Compute Bounds**: CPU AVX2 vs GPU Tensor Cores, memory bus bandwidth walls (DDR4 vs HBM3), FlashAttention.
- **Part 4: Quantization Mechanics & Tensor Formats**: FP32 to INT4, GGUF file architecture, GGML runtime execution, AWQ, GPTQ.
- **Part 5: Low-Level Systems, Linux Kernel & Network Sockets**: Socket buffers, `epoll` loops, non-blocking I/O, HTTP/1.1 vs HTTP/2 vs gRPC, SSE vs NDJSON.
- **Part 6 & Lab 1: Stage 1 Deep Dive**: Raw runtime serving with Ollama, Go `net/http` client, wire dissection, TTFT profiling.
- **Part 7 & Lab 2: Stage 2 Deep Dive**: LiteLLM gateway topology, virtual keys, RBAC, token spend auditing with PostgreSQL 16.
- **Part 8 & Lab 3: Stage 3 Deep Dive**: KServe v0.14.0 on Kubernetes, KinD topology, RawDeployment mode, NGINX Ingress, resilience.
- **Part 9: Observability, Distributed Tracing & SRE**: The 4 Golden Signals of AI, Prometheus scrapers, OpenTelemetry, eBPF socket tracing.
- **Appendices**: Frontier AI labs index and a comprehensive 100-term GenAI inference glossary.

---

## 4. How to Run: Stage-by-Stage Instructions

### Prerequisites

Ensure the following tools are installed on your Linux / WSL2 system:
- **Go**: 1.24+ (`go version`)
- **Docker**: 27.x+ (`docker version`)
- **KinD**: v0.20+ (`kind version`)
- **kubectl**: v1.30+ (`kubectl version --client`)
- **Ollama**: Installed and published on host port `11434`

---

### Stage 1: Direct Engine Runtime Serving (Ollama & Pure Go Client)

Stage 1 validates direct, unmediated communication between a client application and the inference engine.

```bash
cd /home/ramum/model-serving/stage1
```

#### 1. Confirm Ollama Daemon and Models
```bash
# Verify Ollama is reachable
curl -s http://localhost:11434/

# Verify required models are downloaded
ollama list
# Should include:
# qwen2.5:0.5b (398 MB)
# smollm2:135m (271 MB)

# If missing, pull them:
ollama pull qwen2.5:0.5b
ollama pull smollm2:135m
```

#### 2. Build and Execute the Go Client
```bash
# Build the standalone Go client
go build -o stage1-client .

# Run 1: Streaming NDJSON over /api/chat (Default)
./stage1-client -model qwen2.5:0.5b -prompt "Explain Kubernetes in one sentence."

# Run 2: Unary Buffered Call over /api/generate
./stage1-client -endpoint /api/generate -stream=false -prompt "Define an API gateway."

# Run 3: OpenAI-Compatible Server-Sent Events (SSE) over /v1/chat/completions
./stage1-client -endpoint /v1/chat/completions -stream=true -prompt "What is AVX2?"
```

#### 3. Run the Automated curl Test Suite
```bash
bash curl_demo.sh
```

**Key Systems Insights**:
- **Streaming NDJSON (`/api/chat`)**: Time to First Token (TTFT) is achieved in ~600 ms, streaming deltas via `Transfer-Encoding: chunked`.
- **Unary Buffered (`/api/generate`)**: Blocks until the entire generation finishes (~2,750 ms), buffering the entire output before transmitting.

---

### Stage 2: Enterprise API Gateway Layer (LiteLLM + PostgreSQL 16)

Stage 2 places the LiteLLM proxy in front of Ollama to enforce authentication, routing rules, and audit logging.

```bash
cd /home/ramum/model-serving/stage2
```

#### 1. Start the Gateway and Database Stack
```bash
docker compose up -d

# Verify both containers are healthy
docker compose ps
# litellm-proxy (Host port 4000)
# litellm-postgres (Port 54329)
```

#### 2. Build and Execute the Stage 2 Go Client
```bash
# Build the gateway client
go build -o stage2-client .

# Run standard inference through the gateway
./stage2-client -model demo-model -prompt "Explain the role of an API gateway in LLM serving."

# Test fast routing alias
./stage2-client -model smollm-fast -prompt "What is a token?"

# Test simulated upstream backend failure
./stage2-client -model backend-down -prompt "Hello"
```

#### 3. Run the Automated Gateway curl Suite
```bash
bash curl_demo.sh
```

#### 4. Audit Spend and Requests in PostgreSQL
LiteLLM writes spend tracking and request metadata asynchronously into PostgreSQL:

```bash
psql -h 127.0.0.1 -p 54329 -U postgres -d litellm -c \
  "SELECT id, model, total_tokens, spend, user, status FROM \"LiteLLM_SpendLogs\" ORDER BY start_time DESC LIMIT 5;"
```

**Gateway Headers Extracted**:
- `x-litellm-call-id`: Unique distributed trace ID.
- `x-litellm-overhead-duration-ms`: Gateway processing overhead (typically 1.2–2.5 ms).
- `x-litellm-response-duration-ms`: Total end-to-end execution latency.

---

### Stage 3: Cloud-Native Declarative Serving (KServe on KinD Kubernetes)

Stage 3 runs model inference under the Kubernetes control plane using KServe v0.14.0 in RawDeployment mode on a 4-node KinD cluster.

```bash
cd /home/ramum/model-serving/stage3
```

#### 1. Inspect Cluster Topology & KServe CRDs
```bash
# Verify the 4-node cluster
kubectl get nodes -o wide

# Verify KServe controller and admission webhooks
kubectl get pods -n kserve
kubectl get pods -n ingress-nginx
```

#### 2. Build and Sideload the Predictor Image
The predictor is written in Go (`stage3/predictor/main.go`), exposing the KServe v2 data plane, OpenAI chat API, and Prometheus `/metrics`.

```bash
# Build predictor container image
docker build -t kserve-predictor:v1 ./predictor

# Load image into KinD worker nodes
kind load docker-image kserve-predictor:v1 --name ha-cluster
```

#### 3. Deploy the InferenceService
```bash
# Apply the KServe manifest
kubectl apply -f manifests/01-inferenceservice.yaml

# Monitor deployment progress
kubectl get isvc kserve-qwen -n kserve-test
kubectl get pods,svc,ingress -n kserve-test -o wide
```

#### 4. Build and Run the Complete Verification Suite
The `stage3-client` tests all 4 architectural verification modules:

```bash
# Build the client
go build -o stage3-client .

# Run all 4 test modules:
./stage3-client -mode all
```

Output highlights:
```
=== [MODULE 1: K8s Control Plane & Scheduling] ===
[+] InferenceService: kserve-qwen (Ready: True)
[+] Pod Name        : kserve-qwen-predictor-586445b4d5-vpm52
[+] Scheduled Node  : ha-cluster-worker3 (10.244.3.14)
[+] Limits Enforced : cpu: 500m, memory: 256Mi

=== [MODULE 2: Direct Ingress Inference] ===
[+] Unary Chat Completion: 66 tokens in 3.35s (19.7 tok/s)
[+] Streaming SSE Stream : TTFT = 606ms | Speed = 9.71 tok/s

=== [MODULE 3: LiteLLM Gateway Routing] ===
[+] Routed via : http://127.0.0.1:4000 (Host injected)
[+] Generated  : 332 tokens in 22.0s (15.1 tok/s)

=== [MODULE 4: Fault Injection & Resilience] ===
[+] Injecting X-Simulate-Failure: 503 directly...
    -> Got HTTP 503 Service Unavailable (1.4ms)
[+] Injecting X-Simulate-Failure: 503 via LiteLLM...
    -> Gateway caught upstream 503!
```

#### 5. Run the Automated Ingress curl Suite
```bash
bash curl_demo.sh
```

---

## 5. Cross-Stage Empirical Benchmark Comparison

| Architectural Metric | Stage 1: Raw Ollama Engine | Stage 2: LiteLLM Gateway | Stage 3: KServe on Kubernetes |
| :--- | :--- | :--- | :--- |
| **Ingress Protocol** | Raw TCP / HTTP/1.1 | HTTP/1.1 + Proxy Headers | NGINX Ingress + DNS VirtualHost (`nip.io`) |
| **Upstream Routing** | Direct Host Port `11434` | L7 Virtual Model Alias Map | Ingress &rarr; Service &rarr; Predictor Pod |
| **Authentication** | None (Open Socket) | Virtual API Key (`sk-stage2-lab`) | Gateway RBAC + Ingress TLS Termination |
| **Gateway Overhead** | 0.0 ms | 1.8 – 2.6 ms | 2.5 – 3.8 ms (Ingress + Predictor Proxy) |
| **Time to First Token (TTFT)** | **641 ms** | **649 ms** | **606 ms** |
| **Decode Throughput** | ~24.0 tok/sec | ~23.5 tok/sec | ~19.7 tok/sec |
| **Memory Isolation** | Host Process Memory | Docker Container Namespaces | K8s Pod cgroups Limits (`256Mi`) |
| **CPU Enforcement** | Linux CFS Host Default | Docker Daemon Defaults | K8s CFS Quota (`500m` Limit) |
| **Audit & Spend Tracking** | Local Daemon Log | PostgreSQL 16 Spend Database | Prometheus Exporter (`/metrics`) + Postgres |
| **Self-Healing / HA** | Manual Process Restart | Docker Container Restart Policy | K8s Liveness &amp; Readiness Probes |

---

## 6. Repository Layout

```
model-serving/
├── README.md                           # Main architectural documentation and reproduction guide
├── LLM_Inference_Field_Guide.pdf       # 111-page publication field guide (2.8 MB, Print-Ready A4)
├── stage1/                             # STAGE 1: Engine Runtime (Ollama + Go Client)
│   ├── README.md                       # Stage 1 technical documentation
│   ├── main.go                         # Pure Go net/http client (Unary, NDJSON, SSE)
│   ├── stage1-client                   # Pre-compiled Go binary
│   └── curl_demo.sh                    # Automated shell test suite
├── stage2/                             # STAGE 2: API Gateway Layer (LiteLLM + PostgreSQL)
│   ├── README.md                       # Stage 2 technical documentation
│   ├── config.yaml                     # LiteLLM routing rules, model aliases & limits
│   ├── docker-compose.yml              # LiteLLM proxy + PostgreSQL 16 specification
│   ├── main.go                         # Go client with header parsing & virtual keys
│   ├── stage2-client                   # Pre-compiled Go binary
│   └── curl_demo.sh                    # Automated gateway test suite
├── stage3/                             # STAGE 3: Cloud-Native KServe on Kubernetes
│   ├── README.md                       # Stage 3 technical documentation
│   ├── manifests/                      # Kubernetes manifests
│   │   └── 01-inferenceservice.yaml    # KServe RawDeployment InferenceService
│   ├── predictor/                      # Custom Go Predictor Container
│   │   ├── Dockerfile                  # Multi-stage container build
│   │   ├── main.go                     # Go predictor (OpenAI API, KServe v2, metrics)
│   │   └── go.mod                      # Module definition
│   ├── main.go                         # Multi-module verification client (all 4 modules)
│   ├── stage3-client                   # Pre-compiled Go binary
│   └── curl_demo.sh                    # Ingress & data plane verification script
└── prompt-back/                        # FIELD GUIDE GENERATOR (React + Vite + Puppeteer)
    ├── package.json                    # Dependencies (React, Tailwind, Puppeteer-Core, pdf-lib)
    ├── generate_pdf.js                 # Edge/Chromium headless PDF exporter & validator
    ├── LLM_Inference_Field_Guide.pdf   # Companion copy of the publication
    └── src/                            # 111-page React manuscript source
```

---

## 7. Author & Engineering Attribution

**Ramu Mangalarapu**  
*Senior Backend Engineer &bull; Golang &bull; Distributed Systems &bull; Cloud Native &bull; Observability*  
UBS (Core Banking Platforms) &bull; Ex-OpsRamp/HPE, NCR Voyix  
B.Tech in Computer Science &amp; Engineering &bull; RGUKT IIIT Basar (2014–2018)  
Certified Kubernetes &amp; Cloud Native Associate (KCNA) &bull; CNCF, 2024  

- **GitHub Repository**: [https://github.com/developer1622/llm-inference-infra](https://github.com/developer1622/llm-inference-infra)
- **LinkedIn**: [https://www.linkedin.com/in/ramu-mangalarapu](https://www.linkedin.com/in/ramu-mangalarapu)
- **Medium**: [https://medium.com/@ramu.mangalarapu1622](https://medium.com/@ramu.mangalarapu1622)
- **Personal Engineering Blog**: [https://vishvakosha.com](https://vishvakosha.com)

---

## 8. License

This project is licensed under the Apache 2.0 License.  
The accompanying field guide publication is released under Creative Commons [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
