import React from 'react'
import { Page, PartHero, Callout, Section } from '../components/ui.jsx'
import { frontierLabs } from '../data/foundationalModels.js'

const layers = [
  {
    n: 7,
    tone: 'blue',
    name: 'Apps & assistants',
    what: 'Chat apps you talk to every day.',
    ex: 'ChatGPT, Claude, Gemini, Grok, Meta AI, Qwen, DeepSeek chat',
    linux: 'Desktop apps',
  },
  {
    n: 6,
    tone: 'red',
    name: 'Agents & coding tools',
    what: 'An LLM in a loop that can run tools: shell, files, browser, tests.',
    ex: 'Claude Code, Cursor, GitHub Copilot, Antigravity CLI',
    linux: 'A shell that calls itself',
  },
  {
    n: 5,
    tone: 'yellow',
    name: 'Protocols & glue',
    what: 'Tool calling, Model Context Protocol (MCP), OpenAI REST APIs, RAG.',
    ex: 'MCP, function calling, LangChain, LlamaIndex, pgvector',
    linux: 'Pipes, sockets, POSIX',
  },
  {
    n: 4,
    tone: 'green',
    name: 'API gateways & routers',
    what: 'Where requests enter: LiteLLM, provider APIs, cloud platforms and proxies.',
    ex: 'LiteLLM, AWS Bedrock, Vertex AI, Azure OpenAI, OpenRouter',
    linux: 'nginx / Envoy gateway',
    part: 'Part 1',
  },
  {
    n: 3,
    tone: 'blue',
    name: 'Models (weights)',
    what: 'Trained floating-point tensors shared in GGUF, SafeTensors, or FP8.',
    ex: 'Llama 3, Qwen 2.5, DeepSeek-V3, Claude 3.5, Gemini 1.5, GPT-4o',
    linux: 'A huge compiled binary',
  },
  {
    n: 2,
    tone: 'red',
    name: 'Inference engines',
    what: 'The runtime that batches requests, manages memory, and drives the hardware.',
    ex: 'vLLM, SGLang, TensorRT-LLM, llama.cpp, Ollama',
    linux: 'The kernel scheduler + mm',
    part: 'Part 2',
  },
  {
    n: 1,
    tone: 'yellow',
    name: 'Frameworks & drivers',
    what: 'Math libraries, fused kernels, GPU drivers and multi-GPU interconnects.',
    ex: 'PyTorch, CUDA, ROCm, NCCL, FlashAttention, Triton',
    linux: 'libc + device drivers',
    part: 'Part 3',
  },
  {
    n: 0,
    tone: 'green',
    name: 'Silicon & network',
    what: 'The hardware that actually computes next-token probabilities.',
    ex: 'NVIDIA H100/B200 GPUs, Google TPUs, CPUs, NVLink, InfiniBand',
    linux: 'CPU, RAM, NIC, PCIe',
    part: 'Part 3',
  },
]

export function Part0Ecosystem() {
  return (
    <Page tone="multi" running="Part 0 · The GenAI ecosystem" part="Part 0">
      <PartHero
        n="0"
        kicker="Part 0 · Start here"
        title="The GenAI ecosystem in one page"
        lead="You already use layer 7 every day. This guide walks down the stack to layer 0, and every layer has a Linux cousin you know."
      />

      <div className="stack">
        {layers.map((l) => (
          <div key={l.n} className={`layer tone-${l.tone}`}>
            <div className="layer-n">{l.n}</div>
            <div className="layer-main">
              <div className="layer-name">
                {l.name}
                {l.part && <span className="mini-pill">{l.part}</span>}
              </div>
              <div className="layer-what">{l.what}</div>
              <div className="layer-ex">{l.ex}</div>
            </div>
            <div className="layer-linux">
              <small>Linux cousin</small>
              {l.linux}
            </div>
          </div>
        ))}
        <div className="layer-cross">
          <b>Part 4</b> cuts across every layer: queues, back-pressure, caches and the metrics that tell you what is
          going on.
        </div>
      </div>

      <Section title="Three meanings of &ldquo;open&rdquo;" color="accent" className="mt">
        <div className="grid3">
          <div className="card tone-red">
            <b>Proprietary</b>
            <p>You only get an API or an app. Weights stay on the provider&rsquo;s servers (OpenAI, Anthropic).</p>
          </div>
          <div className="card tone-yellow">
            <b>Open weights</b>
            <p>You can download and self-host the model on your own hardware (Llama 3.1, Qwen 2.5, DeepSeek-V3).</p>
          </div>
          <div className="card tone-green">
            <b>Fully open</b>
            <p>Weights, training datasets, code, and training recipes are all public (Ai2&rsquo;s OLMo 2).</p>
          </div>
        </div>
      </Section>

      <Callout title="Why this matters for systems engineers" tone="blue">
        A chat client re-sends the <b>system prompt and the full conversation history</b> with every message. The server must
        process all of it again (a <b>prefill</b>) before writing a single new token. That is why caching (Part 2), GPU memory
        bandwidth (Part 3) and TTFT latency (Part 4) dictate user experience.
      </Callout>
    </Page>
  )
}

const bytesRows = [
  ['0.5B–3B', '1–6 GB', '0.5–3 GB', '0.3–1.8 GB', 'Raw CPUs, Laptops, Edge devices, Mobile'],
  ['7B–14B', '14–28 GB', '7–14 GB', '4–8 GB', '1x Consumer GPU (RTX 3090/4090, 24GB)'],
  ['32B–70B', '64–140 GB', '32–70 GB', '18–38 GB', '2x–4x Enterprise GPUs (A100/H100 80GB)'],
  ['405B–671B', '810 GB+', '405–671 GB', '230–380 GB', '8x–16x H100 Supercluster with Tensor Parallelism'],
]

const tiers = [
  {
    tier: 'Tier 1: Edge & SLMs (0.5B – 3B)',
    desc: 'Lightweight models designed for low-latency CPU and mobile edge inference. Perfect for local prototyping.',
    models: 'Qwen 2.5 0.5B (used in our Lab), Llama 3.2 1B/3B, Gemma 2 2B, Phi-3 Mini',
    tone: 'blue',
  },
  {
    tier: 'Tier 2: Single-GPU Workhorses (7B – 14B)',
    desc: 'The sweet spot for private enterprise hosting. High coding and reasoning quality fitting on a single 24GB GPU.',
    models: 'Llama 3.1 8B, Qwen 2.5 7B/14B, Mistral 7B, Phi-4 14B',
    tone: 'green',
  },
  {
    tier: 'Tier 3: Enterprise Mid-Scale (32B – 70B)',
    desc: 'Matches top-tier commercial models on complex reasoning. Deployed with continuous batching across 2–4 GPUs.',
    models: 'Llama 3.3 70B, Qwen 2.5 32B/72B, Mixtral 8x7B (Sparse MoE)',
    tone: 'yellow',
  },
  {
    tier: 'Tier 4: Frontier Superclusters (405B – 671B)',
    desc: 'Frontier foundation models requiring high-speed multi-node NVLink interconnects and distributed serving.',
    models: 'Llama 3.1 405B, DeepSeek-V3 (671B MoE / 37B active), DeepSeek-R1',
    tone: 'red',
  },
]

export function Part0Zoo() {
  return (
    <Page tone="multi" running="Part 0 · Foundation Models & Scale Tiers" part="Part 0">
      <PartHero
        n="0"
        kicker="Part 0 · Continued"
        title="Foundation Models &amp; Scale Tiers"
        lead="Modern inference serving is defined by parameter scales, memory footprints, and compute requirements across four distinct deployment tiers."
      />

      <div className="stats">
        <div className="stat tone-blue">
          <b>4</b>
          <span>Scale Tiers (0.5B → 671B)</span>
        </div>
        <div className="stat tone-green">
          <b>10+</b>
          <span>Frontier AI R&amp;D Labs</span>
        </div>
        <div className="stat tone-yellow">
          <b>3</b>
          <span>Serving Formats (FP16/FP8/INT4)</span>
        </div>
        <div className="stat tone-red">
          <b>100</b>
          <span>Inference Engineering Terms</span>
        </div>
      </div>

      <Section title="The Four Model Deployment Scale Tiers" color="blue">
        <div className="grid2" style={{ gap: '2.5mm' }}>
          {tiers.map((t) => (
            <div key={t.tier} className={`card tone-${t.tone}`} style={{ padding: '2.2mm 3mm' }}>
              <b style={{ fontSize: '8.8pt', marginBottom: '0.6mm' }}>{t.tier}</b>
              <p style={{ fontSize: '7.8pt', lineHeight: 1.35, marginBottom: '1mm' }}>{t.desc}</p>
              <div style={{ fontSize: '7.2pt', color: '#5f6368' }}>
                <b>Key Models:</b> {t.models}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="grid2 mt-s">
        <Section title="Will it fit? Memory for weights only" color="yellow">
          <table className="tbl compact">
            <thead>
              <tr>
                <th>Tier</th>
                <th>FP16</th>
                <th>FP8</th>
                <th>4-bit</th>
                <th>Target Hardware</th>
              </tr>
            </thead>
            <tbody>
              {bytesRows.map((r) => (
                <tr key={r[0]}>
                  <td><b>{r[0]}</b></td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td>{r[3]}</td>
                  <td style={{ fontSize: '7.4pt', color: '#5f6368' }}>{r[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="fine" style={{ marginTop: '1mm' }}>
            Formula: <code>Weights VRAM = Parameters × Bytes per parameter</code>. In production, add the dynamic KV cache
            (Part 2), CUDA runtime context (~1–2 GB), and continuous batch buffers on top.
          </p>
        </Section>

        <Section title="Eras of Foundational Model Evolution" color="green">
          <ol className="eras" style={{ fontSize: '7.8pt' }}>
            <li style={{ padding: '0.8mm 0' }}><b>2018–19</b> The Transformer Dawn: GPT-1, BERT, GPT-2</li>
            <li style={{ padding: '0.8mm 0' }}><b>2020–22</b> Dense Scaling Era: GPT-3 (175B), PaLM (540B), Chinchilla</li>
            <li style={{ padding: '0.8mm 0' }}><b>2023</b> Open-Weights Revolution: Llama, Mistral 7B, Falcon</li>
            <li style={{ padding: '0.8mm 0' }}><b>2024</b> Small Models &amp; Reasoning: Llama 3, Phi-3, Gemma 2, OpenAI o1</li>
            <li style={{ padding: '0.8mm 0' }}><b>2025–26</b> Sparse MoE &amp; Test-Time Reasoning: DeepSeek-V3/R1, Claude 3.7</li>
          </ol>
        </Section>
      </div>

      <Callout title="Foundation vs Derivative Models" tone="green" className="mt-s">
        Thousands of models exist on Hugging Face, but nearly all of them are LoRA adapters or merges of a few true
        foundations: Llama, Qwen, DeepSeek, Mistral, and Gemma. Appendix A breaks down the premier R&amp;D laboratories
        behind these architectures.
      </Callout>
    </Page>
  )
}
