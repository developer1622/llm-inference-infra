import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'
import { labSystemSpecs } from '../data/author.js'

export default function LabSystemSpecsPage() {
  return (
    <Page tone="blue" running="Hardware & Testbed Environment" part="System Specs">
      <div className="kicker">Real Hardware & Environment Disclosure</div>
      <h1 className="big">The Real Testbed: No Hidden Specs</h1>
      <p className="lead">
        Every benchmark, trace, and command in this field guide was executed directly on my personal laptop running
        WSL2 Ubuntu. We intentionally share the exact machine specifications so any developer can reproduce these
        results without expensive cloud GPUs.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Host & Compute Specs" color="blue">
          <ul className="meta-list">
            <li>
              <b>Host Hardware:</b> Intel(R) Core(TM) i5-10210U @ 1.60GHz (Turbo 4.20GHz)
            </li>
            <li>
              <b>Topology:</b> 4 Physical Cores, 8 Hardware Threads (Hyperthreading)
            </li>
            <li>
              <b>Vector SIMD:</b> Intel AVX2, FMA3, SSE4.2 (256-bit wide registers)
            </li>
            <li>
              <b>Host Operating System:</b> Microsoft Windows 11 Pro 64-bit
            </li>
            <li>
              <b>WSL2 Virtual Environment:</b> Ubuntu 24.04.1 LTS (Noble Numbat)
            </li>
            <li>
              <b>Linux Kernel:</b> <code>6.6.87.2-microsoft-standard-WSL2 #1 SMP PREEMPT_DYNAMIC</code>
            </li>
          </ul>
        </Section>

        <Section title="Memory, Storage & Acceleration" color="red">
          <ul className="meta-list">
            <li>
              <b>Total System RAM:</b> 7.8 GiB DDR4 (~4.1 GiB available during live runs)
            </li>
            <li>
              <b>Linux Swapfile:</b> 4.0 GiB swap allocated on virtual VHDX disk
            </li>
            <li>
              <b>Storage Subsystem:</b> 1007 GB NVMe SSD (ext4 on <code>/dev/sdd</code>, &gt;920 GB free)
            </li>
            <li>
              <b>Discrete GPU:</b> <i>None</i> (No NVIDIA/CUDA hardware present)
            </li>
            <li>
              <b>Inference Runtime:</b> 100% CPU-bound AVX2 SIMD matrix arithmetic
            </li>
            <li>
              <b>Quantization Format:</b> GGUF Q4_K_M 4-bit block quantization
            </li>
          </ul>
        </Section>
      </div>

      <Section title="Container & Kubernetes Infrastructure Stack" color="yellow" className="mt-s">
        <div className="grid-3">
          <div className="card">
            <h4 style={{ margin: '0 0 2mm', color: '#1a73e8' }}>Container Runtime</h4>
            <p style={{ fontSize: '8pt', margin: 0 }}>
              <b>Docker Engine:</b> 27.x with <code>containerd 2.3.4</code>.<br />
              Runs Ollama runtime (port 11434), LiteLLM gateway (port 4000), and PostgreSQL database (port 54329).
            </p>
          </div>
          <div className="card">
            <h4 style={{ margin: '0 0 2mm', color: '#d93025' }}>Kubernetes (KinD)</h4>
            <p style={{ fontSize: '8pt', margin: 0 }}>
              <b>Cluster:</b> 4-node <code>ha-cluster</code> (v1.37.0).<br />
              1 Control-Plane node + 3 Worker nodes (<code>ha-cluster-worker</code>, <code>worker2</code>, <code>worker3</code>).
              HostPorts 80/443 mapped to worker.
            </p>
          </div>
          <div className="card">
            <h4 style={{ margin: '0 0 2mm', color: '#188038' }}>KServe & Ingress</h4>
            <p style={{ fontSize: '8pt', margin: 0 }}>
              <b>KServe v0.14.0:</b> Operating in RawDeployment mode.<br />
              <b>cert-manager v1.16.2:</b> Webhook admission TLS.<br />
              <b>NGINX Ingress Controller:</b> L7 virtual host routing.
            </p>
          </div>
        </div>
      </Section>

      <Callout title="Why CPU-Constrained Systems Teach Better Systems Engineering" tone="green" className="mt-s">
        On an enterprise cluster of 8× NVIDIA H100 80GB SXM5 GPUs, 3.35 Terabytes/sec of HBM3 memory bandwidth can mask
        inefficient software architecture, wasteful memory allocations, and poorly tuned network buffers.
        <br /><br />
        On a <b>7.8 GiB CPU-only laptop</b>, there is nowhere to hide. Memory pressure immediately forces swap,
        cache line misses trigger noticeable latency cliffs, and unthrottled concurrent requests exhaust Linux CFS quotas.
        By understanding how an LLM request navigates this constrained environment, you master the foundational physics of
        generative AI serving that govern systems of any scale.
      </Callout>
    </Page>
  )
}
