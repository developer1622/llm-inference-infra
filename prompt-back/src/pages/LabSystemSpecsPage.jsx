import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'

export default function LabSystemSpecsPage() {
  return (
    <Page tone="blue" running="Hardware &amp; Testbed Environment" part="System Specs">
      <div className="kicker">Real Hardware &amp; Environment Disclosure</div>
      <h1 className="big">The Real Testbed: No Hidden Specs</h1>
      <p className="lead">
        Every benchmark, trace, and command in this field guide was executed directly on my personal laptop running
        WSL2 Ubuntu. We intentionally share the exact machine specifications so any developer can reproduce these
        results without expensive cloud GPUs.
      </p>

      <div className="grid2 mt-s">
        <Section title="Host &amp; Compute Specs" color="blue">
          <div className="card tone-blue">
            <ul className="meta-list" style={{ fontSize: '7.2pt' }}>
              <li><b>Host Hardware:</b> Intel(R) Core(TM) i5-10210U @ 1.60GHz (Turbo 4.20GHz)</li>
              <li><b>Topology:</b> 4 Physical Cores, 8 Hardware Threads (Hyperthreading)</li>
              <li><b>Vector SIMD:</b> Intel AVX2, FMA3, SSE4.2 (256-bit wide vector registers)</li>
              <li><b>Host OS:</b> Microsoft Windows 11 Pro 64-bit</li>
              <li><b>WSL2 Virtual Environment:</b> Ubuntu 24.04.1 LTS (Noble Numbat)</li>
              <li><b>Linux Kernel:</b> <code>6.6.87.2-microsoft-standard-WSL2 #1 SMP PREEMPT_DYNAMIC</code></li>
            </ul>
          </div>
        </Section>

        <Section title="Memory, Storage &amp; Acceleration" color="red">
          <div className="card tone-red">
            <ul className="meta-list" style={{ fontSize: '7.2pt' }}>
              <li><b>Total System RAM:</b> 7.8 GiB DDR4 (~4.1 GiB available during live runs)</li>
              <li><b>Linux Swapfile:</b> 4.0 GiB swap allocated on virtual VHDX disk</li>
              <li><b>Storage Subsystem:</b> 1007 GB NVMe SSD (ext4 on <code>/dev/sdd</code>, &gt;920 GB free)</li>
              <li><b>Discrete GPU:</b> <i>None</i> (100% CPU-bound AVX2 matrix arithmetic)</li>
              <li><b>Quantization Format:</b> GGUF Q4_K_M 4-bit block quantization</li>
            </ul>
          </div>
        </Section>
      </div>

      <Section title="Container &amp; Kubernetes Infrastructure Stack" color="yellow" className="mt-s">
        <div className="grid3">
          <div className="card tone-blue">
            <b style={{ color: '#1a73e8', display: 'block', marginBottom: '1mm' }}>Container Runtime</b>
            <p style={{ fontSize: '7.1pt', margin: 0, lineHeight: 1.3 }}>
              <b>Docker Engine:</b> 27.x with <code>containerd 2.3.4</code>.<br />
              Runs Ollama runtime (port 11434), LiteLLM gateway (port 4000), and PostgreSQL database (port 54329).
            </p>
          </div>
          <div className="card tone-red">
            <b style={{ color: '#d93025', display: 'block', marginBottom: '1mm' }}>Kubernetes (KinD)</b>
            <p style={{ fontSize: '7.1pt', margin: 0, lineHeight: 1.3 }}>
              <b>Cluster:</b> 4-node <code>ha-cluster</code> (v1.32.0).<br />
              1 Control-Plane + 3 Workers (<code>worker</code>, <code>worker2</code>, <code>worker3</code>).
              HostPorts 80/443 pinned to worker node.
            </p>
          </div>
          <div className="card tone-green">
            <b style={{ color: '#188038', display: 'block', marginBottom: '1mm' }}>KServe &amp; Ingress</b>
            <p style={{ fontSize: '7.1pt', margin: 0, lineHeight: 1.3 }}>
              <b>KServe v0.14.0:</b> Operating in RawDeployment mode.<br />
              <b>cert-manager v1.16.2:</b> Webhook admission TLS.<br />
              <b>NGINX Ingress Controller:</b> L7 virtual host routing.
            </p>
          </div>
        </div>
      </Section>

      <Callout title="Engineering Humility & Scope Caveats" tone="yellow" className="mt-s">
        <b>What We Know vs. What We Don't Claim:</b> This testbed explores single-host CPU inference mechanics, protocol translations,
        and containerized orchestration. It does <b>not</b> claim to benchmark multi-rack clusters of 8× H100 GPUs with NVLink interconnects,
        InfiniBand RDMA fabrics, or multi-node tensor parallelism. We share these exact specs so any developer can reproduce our findings,
        understanding that what works on a consumer CPU teaches the foundational systems principles that govern every scale.
      </Callout>
    </Page>
  )
}
