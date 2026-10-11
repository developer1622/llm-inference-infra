import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'

export function TOCPage1() {
  const partsGroup1 = [
    {
      num: 'Front Matter',
      pages: '1 – 4',
      tone: 'multi',
      title: 'Title, Author Bio, Real WSL2 System Specs & Guide Roadmap',
      desc: 'Disclosure of Ramu Mangalarapu\'s background (UBS, RGUKT IIIT Basar, KCNA) and the exact Intel i5-10210U / Ubuntu 24.04 testbed.',
    },
    {
      num: 'Part 0',
      pages: '5 – 10',
      tone: 'multi',
      title: 'The Modern GenAI Serving Ecosystem & Model Zoo',
      desc: 'The 8-layer LLM infrastructure stack, Open vs Closed weights, Transformer parameter scaling, and inference cost economics.',
    },
    {
      num: 'Part 1',
      pages: '11 – 14',
      tone: 'blue',
      title: 'Anatomy of an Inference Request: From Socket to Silicon',
      desc: 'End-to-end journey of an HTTP prompt: Tokenization, Embeddings, Prefill phase, Autoregressive Decode loop, and Detokenization.',
    },
    {
      num: 'Part 2',
      pages: '15 – 24',
      tone: 'red',
      title: 'Core Engine Scheduling & Memory Architecture',
      desc: 'KV Cache mathematical scaling, PagedAttention block allocation, Continuous Batching, Radix Prefix Caching, Chunked Prefill, and Speculative Decoding.',
    },
    {
      num: 'Part 3',
      pages: '25 – 34',
      tone: 'yellow',
      title: 'Hardware Accelerators, Compute Bounds & Sharding',
      desc: 'CPU AVX2 SIMD vs GPU Tensor Cores, Memory Bus Bandwidth Wall (DDR4 vs HBM3), FlashAttention 1/2/3, and Distributed Sharding (TP, PP, DP).',
    },
    {
      num: 'Part 4',
      pages: '35 – 42',
      tone: 'green',
      title: 'Quantization, Numerical Precision & Tensor Formats',
      desc: 'FP32 down to INT4, GGUF file architecture, GGML runtime execution, AWQ, GPTQ, activation outliers, and zero-point scaling.',
    },
  ]

  return (
    <Page tone="multi" running="Table of Contents · Volume I" part="Contents">
      <div className="kicker">Field Guide Structure</div>
      <h1 className="big">Table of Contents · Part I</h1>
      <p className="lead">
        A comprehensive, hands-on infrastructure guide designed for backend engineers, distributed systems developers,
        and cloud-native practitioners.
      </p>

      <div className="mt-s">
        {partsGroup1.map((p) => (
          <div key={p.num} className="card mb-xs" style={{ borderLeft: `3mm solid var(--${p.tone === 'multi' ? 'ink' : p.tone})` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2mm' }}>
              <span style={{ font: '700 9pt var(--head-font)', color: 'var(--ink)' }}>
                {p.num}: {p.title}
              </span>
              <span className="badge" style={{ font: '700 8pt var(--mono-font)' }}>
                pp. {p.pages}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '8pt', color: 'var(--ink2)' }}>{p.desc}</p>
          </div>
        ))}
      </div>

      <Callout title="Author's Guarantee" tone="blue" className="mt-s">
        Every configuration file, terminal command, and metric presented in these pages has been empirically tested and
        verified on the real testbed documented on Page 3.
      </Callout>
    </Page>
  )
}

export function TOCPage2() {
  const partsGroup2 = [
    {
      num: 'Part 5',
      pages: '43 – 50',
      tone: 'blue',
      title: 'Low-Level Systems, Linux Kernel & Network Sockets',
      desc: 'Linux Sockets, epoll event loops, non-blocking I/O, TCP sliding window, HTTP/1.1 vs HTTP/2 vs gRPC, SSE vs NDJSON, and cgroups v2.',
    },
    {
      num: 'Part 6',
      pages: '51 – 58',
      tone: 'green',
      title: 'Stage 1 In-Depth Lab: Raw Runtime Serving (Ollama + Go Client)',
      desc: 'Deploying Ollama locally, writing pure Go net/http client, wire capture inspection (NDJSON vs SSE), AVX2 CPU profiling, and TTFT metrics.',
    },
    {
      num: 'Part 7',
      pages: '59 – 68',
      tone: 'yellow',
      title: 'Stage 2 In-Depth Lab: LiteLLM API Gateway & Reverse Proxy',
      desc: 'Gateway routing, model aliasing, token budgeting, PostgreSQL spend tracking, virtual keys, rate limiting algorithms, and circuit breaker failovers.',
    },
    {
      num: 'Part 8',
      pages: '69 – 80',
      tone: 'red',
      title: 'Stage 3 In-Depth Lab: KServe on Kubernetes (4-Node KinD Cluster)',
      desc: 'Control plane reconciliation, InferenceService CRD, RawDeployment mode, Go Predictor container, NGINX Ingress, HPA scaling, CFS limits, and 503 failures.',
    },
    {
      num: 'Part 9',
      pages: '81 – 88',
      tone: 'green',
      title: 'Production Observability, Telemetry & SRE Incident Playbook',
      desc: 'The 4 Golden Signals of LLM Serving, Prometheus metrics schema, OpenTelemetry distributed tracing, eBPF socket tracing, and incident triage.',
    },
    {
      num: 'Part 10',
      pages: '89 – 96',
      tone: 'multi',
      title: 'Frontier AI Labs & Foundational Model Lineage Catalog',
      desc: 'Architectural breakdown of 12 frontier research labs: OpenAI, Anthropic, DeepSeek, Meta AI, Google DeepMind, Mistral, xAI, Qwen, and more.',
    },
    {
      num: 'Part 11',
      pages: '97 – 102+',
      tone: 'multi',
      title: 'The 100-Term Comprehensive GenAI Engineering Glossary',
      desc: 'Encyclopedic reference covering Architecture, Hardware, Inference Runtime, Serving Platforms, Quantization, and Enterprise SRE.',
    },
  ]

  return (
    <Page tone="multi" running="Table of Contents · Volume II" part="Contents">
      <div className="kicker">Field Guide Structure</div>
      <h1 className="big">Table of Contents · Part II</h1>
      <p className="lead">
        From containerized API gateways to Kubernetes operators, production observability, and the encyclopedic 100-term glossary.
      </p>

      <div className="mt-s">
        {partsGroup2.map((p) => (
          <div key={p.num} className="card mb-xs" style={{ borderLeft: `3mm solid var(--${p.tone === 'multi' ? 'ink' : p.tone})` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2mm' }}>
              <span style={{ font: '700 9pt var(--head-font)', color: 'var(--ink)' }}>
                {p.num}: {p.title}
              </span>
              <span className="badge" style={{ font: '700 8pt var(--mono-font)' }}>
                pp. {p.pages}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '8pt', color: 'var(--ink2)' }}>{p.desc}</p>
          </div>
        ))}
      </div>

      <Callout title="How to Read This Guide" tone="green" className="mt-s">
        <b>Beginners:</b> Start with Part 1 and proceed sequentially through Stages 1, 2, and 3.<br />
        <b>Backend Engineers:</b> Jump straight to Part 2 (Scheduling & Memory) and Part 5 (Linux Kernel Sockets).<br />
        <b>Cloud & SRE Engineers:</b> Focus on Part 8 (KServe Kubernetes) and Part 9 (Observability & SRE).
      </Callout>
    </Page>
  )
}

export default function TOCPage() {
  return (
    <>
      <TOCPage1 />
      <TOCPage2 />
    </>
  )
}

