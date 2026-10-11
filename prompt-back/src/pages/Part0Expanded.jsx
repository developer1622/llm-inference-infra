import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'

export function Part0Page1() {
  return (
    <Page tone="multi" running="Part 0 · The GenAI Serving Ecosystem" part="Part 0">
      <div className="kicker">Infrastructure Architecture</div>
      <h1 className="big">The 8-Layer GenAI Serving Stack</h1>
      <p className="lead">
        To build, optimize, and operate production-grade model serving, engineers must treat generative AI not as
        magic, but as a layered distributed systems stack from client applications down to physical silicon.
      </p>

      <div className="grid-2 mt-s">
        <Section title="The Application & Routing Layers" color="blue">
          <ul className="meta-list">
            <li>
              <b>Layer 8: Client Application</b><br />
              Go services, Python backends, Web UIs, and CLI tools that initiate prompts and parse streaming tokens.
            </li>
            <li>
              <b>Layer 7: AI Gateway (e.g. LiteLLM)</b><br />
              Enterprise reverse proxy providing authentication, virtual keys, rate limiting (RPM/TPM), token spend budgeting, and multi-model routing.
            </li>
            <li>
              <b>Layer 6: Cluster Orchestrator (e.g. KServe / Kubernetes)</b><br />
              Declarative lifecycle manager reconciling <code>InferenceService</code> CRDs, autoscaling (HPA/KEDA), ingress routing, and multi-node placement.
            </li>
            <li>
              <b>Layer 5: Ingress & Service Mesh (e.g. NGINX / Istio)</b><br />
              L4/L7 load balancer terminating TLS, routing HTTP/2 and SSE streams, and distributing traffic to ready pods.
            </li>
          </ul>
        </Section>

        <Section title="The Execution & Hardware Layers" color="red">
          <ul className="meta-list">
            <li>
              <b>Layer 4: Serving Runtime (e.g. vLLM, Ollama, TGI)</b><br />
              Implements continuous batching, PagedAttention memory tables, prefix caching, and OpenAI-compatible HTTP endpoints.
            </li>
            <li>
              <b>Layer 3: Tensor Execution Engine (e.g. PyTorch, GGML, TensorRT-LLM)</b><br />
              Compiles computational graphs, executes matrix multiplications (GEMM), and manages KV cache tensor allocations.
            </li>
            <li>
              <b>Layer 2: Kernel Drivers & CUDA / AVX2 Runtime</b><br />
              Low-level vector execution libraries (NVIDIA CUDA, cuBLAS, Intel AVX2/AVX-512 SIMD, AMD ROCm).
            </li>
            <li>
              <b>Layer 1: Physical Compute & Memory Silicon</b><br />
              GPU HBM3/HBM3e memory, CPU DDR4/DDR5 system memory, PCIe bus, and NVLink high-speed interconnects.
            </li>
          </ul>
        </Section>
      </div>

      <Callout title="Engineering Rule of Thumb" tone="yellow" className="mt-s">
        Failure at any single layer cascades downward or upward: an unbuffered client socket stalls Layer 4 continuous batching;
        a lack of Layer 7 rate limiting exhausts Layer 1 memory silicon. Production reliability requires end-to-end visibility.
      </Callout>
    </Page>
  )
}

export function Part0Page2() {
  return (
    <Page tone="multi" running="Part 0 · Open Weights vs Proprietary APIs" part="Part 0">
      <div className="kicker">Deployment Economics & Governance</div>
      <h1 className="big">Open Weights vs Proprietary APIs</h1>
      <p className="lead">
        Modern enterprise GenAI architectures balance proprietary hosted endpoints (OpenAI, Anthropic, Google) with
        self-hosted open-weight foundations (Meta LLaMA, Alibaba Qwen, DeepSeek, Mistral).
      </p>

      <div className="grid-2 mt-s">
        <Section title="Proprietary APIs (Hosted Cloud)" color="blue">
          <div className="card mb-xs">
            <b>Key Providers:</b> OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), Google (Gemini 1.5 Pro).
          </div>
          <p>
            <b>Advantages:</b> Zero infrastructure overhead, state-of-the-art frontier reasoning, continuous provider-side updates,
            and managed elastic capacity.
          </p>
          <p>
            <b>Tradeoffs & Risks:</b> High per-token variable cost at enterprise scale, zero control over data egress and privacy,
            unannounced model deprecation / behavior drift, and rigid rate limits that can disrupt critical banking workflows.
          </p>
        </Section>

        <Section title="Self-Hosted Open Weights" color="green">
          <div className="card mb-xs">
            <b>Key Lineages:</b> Qwen 2.5 (Alibaba), LLaMA 3.3 (Meta), DeepSeek V3 / R1, Mistral Large.
          </div>
          <p>
            <b>Advantages:</b> Complete data sovereignty (runs air-gapped on private Kubernetes clusters), deterministic latency SLAs,
            predictable fixed infrastructure spend, and freedom to quantize (GGUF/AWQ) for edge or CPU deployment.
          </p>
          <p>
            <b>Tradeoffs & Challenges:</b> Requires specialized engineering expertise in GPU/CPU memory allocation, PagedAttention scheduling,
            and Kubernetes cluster operations.
          </p>
        </Section>
      </div>

      <Section title="The Hybrid Architecture Pattern" color="yellow" className="mt-s">
        <p>
          In regulated environments like banking and defense, tier-1 architecture uses <b>LiteLLM as an intelligent router</b>:
          routing sensitive financial PII to self-hosted Kubernetes KServe clusters running quantized Qwen or LLaMA, while delegating
          non-sensitive, highly complex creative prompts to hosted proprietary models with automated fallback cascades.
        </p>
      </Section>
    </Page>
  )
}

export function Part0Page3() {
  return (
    <Page tone="multi" running="Part 0 · Transformer Architectures" part="Part 0">
      <div className="kicker">Model Mechanics</div>
      <h1 className="big">Dense Transformers vs Mixture-of-Experts (MoE)</h1>
      <p className="lead">
        The computational and memory footprint of an LLM during inference is directly dictated by whether its weights
        are organized as a dense monolithic network or a sparsely routed Mixture-of-Experts.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Dense Transformers (e.g. LLaMA, Qwen 2.5)" color="blue">
          <p>
            In a dense model, <b>every single parameter</b> participates in computing the next token for every prompt token.
          </p>
          <ul className="meta-list">
            <li><b>Compute Predictability:</b> Consistent FLOPs per token regardless of prompt content.</li>
            <li><b>Memory Footprint:</b> High arithmetic intensity during prefill; small total model weight footprint relative to parameter count.</li>
            <li><b>Example:</b> Qwen 2.5 0.5B (494M params, ~491 MB in Q4_K_M) fits completely in CPU RAM and executes effortlessly on consumer hardware.</li>
          </ul>
        </Section>

        <Section title="Mixture-of-Experts (MoE) (e.g. DeepSeek V3, Mixtral)" color="red">
          <p>
            An MoE model replaces dense feed-forward network (FFN) layers with multiple parallel experts, using a top-k router to activate only a subset per token.
          </p>
          <ul className="meta-list">
            <li><b>Active vs Total Parameters:</b> DeepSeek V3 has 671 Billion total parameters, but only activates 37 Billion parameters per token.</li>
            <li><b>Compute vs Memory Paradox:</b> Computes at the speed of a 37B model, but requires VRAM storage for all 671B parameters.</li>
            <li><b>Serving Constraint:</b> Requires massive memory bandwidth to swap expert weights across high-speed interconnects (NVLink).</li>
          </ul>
        </Section>
      </div>

      <Callout title="Inference Implication for Developers" tone="green" className="mt-s">
        For local CPU labs and small Kubernetes clusters, <b>dense small models (0.5B to 7B parameters)</b> offer superior
        latency predictability and minimal memory footprints compared to sparse MoE models which demand immense RAM.
      </Callout>
    </Page>
  )
}

export function Part0Page4() {
  return (
    <Page tone="multi" running="Part 0 · Parameter Scaling & Economics" part="Part 0">
      <div className="kicker">Capacity Planning</div>
      <h1 className="big">Parameter Scaling & Inference Cost Curves</h1>
      <p className="lead">
        Understanding the relationship between model size, RAM requirements, token throughput, and financial cost is
        the cornerstone of infrastructure capacity planning.
      </p>

      <Section title="Memory Sizing Formula for Model Weights" color="blue" className="mt-s">
        <div className="code-box">
          <code>VRAM / RAM (Bytes) = Parameters × Precision_Bytes × 1.20 (Overhead Buffer)</code>
        </div>
        <p style={{ marginTop: '2mm' }}>
          A 7 Billion parameter model at FP16 (2 bytes/param) requires ~14 GB for weights alone. Quantized to INT4 (0.5 bytes/param),
          that same model shrinks to ~3.5 GB, allowing it to run smoothly within a standard 8 GB laptop RAM budget!
        </p>
      </Section>

      <div className="table-wrap mt-s">
        <table>
          <thead>
            <tr>
              <th>Model Scale</th>
              <th>FP16 Weights</th>
              <th>INT8 Weights</th>
              <th>INT4 (GGUF)</th>
              <th>Target Hardware Archetype</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>0.5B</b> (Qwen 2.5)</td>
              <td>1.0 GB</td>
              <td>0.5 GB</td>
              <td><b>0.35 GB</b></td>
              <td>Consumer CPU (Laptop, Raspberry Pi, WSL2)</td>
            </tr>
            <tr>
              <td><b>3B – 4B</b> (Llama 3.2)</td>
              <td>6.4 GB</td>
              <td>3.2 GB</td>
              <td><b>2.1 GB</b></td>
              <td>Single Workstation CPU or Entry GPU (RTX 4060)</td>
            </tr>
            <tr>
              <td><b>7B – 8B</b> (Llama 3.1)</td>
              <td>16.0 GB</td>
              <td>8.0 GB</td>
              <td><b>4.8 GB</b></td>
              <td>Single Mid-Tier GPU (RTX 4090 24GB or A10G)</td>
            </tr>
            <tr>
              <td><b>70B</b> (Llama 3.3)</td>
              <td>140.0 GB</td>
              <td>70.0 GB</td>
              <td><b>38.0 GB</b></td>
              <td>2× to 4× NVIDIA A100 (80GB) or Mac Studio M2 Ultra</td>
            </tr>
            <tr>
              <td><b>671B MoE</b> (DeepSeek V3)</td>
              <td>1.34 TB</td>
              <td>671 GB</td>
              <td><b>380 GB</b></td>
              <td>Cluster: 8× H100 80GB SXM5 Nodes via NVLink</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout title="Key Sizing Insight" tone="red" className="mt-s">
        Weight memory is only half the equation! The <b>KV Cache</b> dynamically expands with every active concurrent user
        and every token in the context window. Under-provisioning KV cache RAM causes sudden out-of-memory container terminations.
      </Callout>
    </Page>
  )
}

export function Part0Page5() {
  return (
    <Page tone="multi" running="Part 0 · Context Length Economics" part="Part 0">
      <div className="kicker">Memory Scaling</div>
      <h1 className="big">Context Length Economics: The Attention Cliff</h1>
      <p className="lead">
        As context windows scale from 4k tokens to 32k, 128k, and 1M tokens, the computational complexity of self-attention
        and the memory footprint of the Key-Value (KV) cache undergo dramatic non-linear growth.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Computational Complexity: O(N²)" color="red">
          <p>
            Standard multi-head self-attention computes an inner product between every Query token and every Key token:
          </p>
          <div className="code-box">
            <code>Attention(Q, K, V) = softmax(Q · Kᵀ / √d) · V</code>
          </div>
          <p style={{ marginTop: '2mm' }}>
            Doubling the context length from 4,000 to 8,000 tokens quadruples the number of attention dot products.
            At 32,000 tokens, standard unoptimized attention causes prefill latency to explode, saturating compute units.
          </p>
        </Section>

        <Section title="KV Cache Memory Scaling: O(N)" color="yellow">
          <p>
            Unlike compute which is quadratic during prefill, KV Cache storage grows linearly with context length:
          </p>
          <div className="code-box">
            <code>KV_Bytes = 2 × Layers × Heads × Head_Dim × Tokens × Precision</code>
          </div>
          <p style={{ marginTop: '2mm' }}>
            For a single 128k context request on LLaMA-3-8B (FP16), the KV cache alone demands <b>16 Gigabytes of RAM</b>—surpassing
            the size of the model weights themselves!
          </p>
        </Section>
      </div>

      <Section title="Architectural Mitigations in Modern LLMs" color="blue" className="mt-s">
        <div className="grid-3">
          <div className="card">
            <b>Grouped-Query Attention (GQA):</b><br />
            Shares Key and Value heads across multiple Query heads (e.g., 8:1 ratio in LLaMA 3), slashing KV cache memory by 87.5%.
          </div>
          <div className="card">
            <b>FlashAttention 1, 2, 3:</b><br />
            Tiles the softmax computation into fast SRAM, computing exact attention without ever materializing the $N \times N$ matrix in VRAM.
          </div>
          <div className="card">
            <b>Chunked Prefill & Offloading:</b><br />
            Splits long prompts into 512-token chunks, interleaving them with decode cycles to maintain low Time to First Token (TTFT).
          </div>
        </div>
      </Section>
    </Page>
  )
}

export function Part0Page6() {
  return (
    <Page tone="multi" running="Part 0 · Model Serving Archetypes" part="Part 0">
      <div className="kicker">Platform Comparison</div>
      <h1 className="big">Model Serving Archetypes: Choosing the Right Tool</h1>
      <p className="lead">
        The open-source GenAI serving ecosystem has matured into specialized runtimes. Choosing the right tool depends
        on your hardware constraints, concurrency requirements, and deployment targets.
      </p>

      <div className="table-wrap mt-s">
        <table>
          <thead>
            <tr>
              <th>Serving Platform</th>
              <th>Core Focus</th>
              <th>Ideal Hardware</th>
              <th>Key Strengths & Limitations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Ollama</b></td>
              <td>Developer ease & local development</td>
              <td>CPU, Apple Silicon, single consumer GPU</td>
              <td>
                <b>Pros:</b> Single binary, zero-config model pulls, GGUF CPU optimization.<br />
                <b>Cons:</b> Limited continuous batching, lacks multi-GPU tensor parallelism.
              </td>
            </tr>
            <tr>
              <td><b>vLLM</b></td>
              <td>High-throughput production serving</td>
              <td>NVIDIA GPUs (A100, H100, L40S)</td>
              <td>
                <b>Pros:</b> Pioneer of PagedAttention, chunked prefill, speculative decoding.<br />
                <b>Cons:</b> High GPU VRAM baseline; heavy Python dependency stack.
              </td>
            </tr>
            <tr>
              <td><b>TGI (Hugging Face)</b></td>
              <td>Production enterprise LLM serving</td>
              <td>NVIDIA GPUs, AWS Inferentia</td>
              <td>
                <b>Pros:</b> Rust webserver with Python engine, FlashAttention native, token streaming.<br />
                <b>Cons:</b> Custom license restrictions on recent releases.
              </td>
            </tr>
            <tr>
              <td><b>KServe</b></td>
              <td>Cloud-native Kubernetes serving operator</td>
              <td>Any Kubernetes cluster (CPU, GPU, KinD)</td>
              <td>
                <b>Pros:</b> Declarative CRDs, autoscaling (HPA/KEDA), multi-model pipelines, canary rollout.<br />
                <b>Cons:</b> Kubernetes control plane complexity.
              </td>
            </tr>
            <tr>
              <td><b>LiteLLM Proxy</b></td>
              <td>API Gateway & reverse proxy</td>
              <td>Lightweight container (Docker/K8s)</td>
              <td>
                <b>Pros:</b> OpenAI contract translation, rate limiting, virtual keys, spend analytics.<br />
                <b>Cons:</b> Does not execute models; requires backend inference engines.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout title="The Three-Stage Journey of this Guide" tone="green" className="mt-s">
        We progress logically through these archetypes: <b>Stage 1</b> masters the raw runtime with Ollama; <b>Stage 2</b> layers
        enterprise governance with LiteLLM; <b>Stage 3</b> scales the entire stack declaratively on Kubernetes with KServe.
      </Callout>
    </Page>
  )
}
