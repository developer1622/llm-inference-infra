import React from 'react';
import { Page, Section, Callout } from '../components/ui.jsx';

export default function ColophonBackCover() {
  return (
    <Page tone="multi" running="Colophon · Systems Engineering Field Guide" part="Colophon">
      <div className="kicker">Colophon · Systems Engineering Field Guide</div>
      <h1 className="big">LLM Inference Field Guide</h1>
      <p className="lead">
        A comprehensive, low-level architectural journey through modern Generative AI model serving infrastructure.
        From POSIX sockets, memory bandwidth, SIMD vector instructions, and paged KV cache schedulers,
        to enterprise API gateways, Kubernetes KServe operators, and eBPF observability.
      </p>

      <div className="grid2 mt-s">
        <Section title="Primary Testbed Hardware Specifications" color="green">
          <div className="card tone-green">
            <b>Physical Host &amp; Kernel Architecture</b>
            <div style={{ marginTop: '1mm', fontSize: '7.1pt' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">Host OS:</span>
                <b>Windows 11 Pro (WSL2 Architecture)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">Linux Kernel:</span>
                <code>6.6.87.2-microsoft-standard-WSL2</code>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">Distribution:</span>
                <b>Ubuntu 24.04 LTS (Noble Numbat)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">Processor:</span>
                <b>Intel Core i5-10210U @ 1.60GHz (4C/8T)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">Vector SIMD:</span>
                <b>Intel AVX2 SIMD + FMA3 Extensions</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">RAM Capacity:</span>
                <b>7.8 GiB DDR4 (Zero Discrete GPU)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="fine">Storage Engine:</span>
                <b>1,007 GB NVMe SSD (/dev/sdd ext4)</b>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Production Software Ecosystem &amp; Tooling" color="blue">
          <div className="card tone-blue">
            <b>Container, Gateway &amp; Cluster Stack</b>
            <div style={{ marginTop: '1mm', fontSize: '7.1pt' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">Kubernetes:</span>
                <b>KinD v0.27 (4 Nodes: 1 CP, 3 Workers)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">Model Serving:</span>
                <b>KServe v0.14.0 (RawDeployment Mode)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">Cert Management:</span>
                <b>cert-manager v1.16.2 (Webhook mTLS)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">Ingress Routing:</span>
                <b>ingress-nginx v1.12.0 (Host Port 80)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">API Gateway:</span>
                <b>LiteLLM Proxy on Host Network (:4000)</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.6mm', marginBottom: '0.6mm' }}>
                <span className="fine">Audit Database:</span>
                <b>PostgreSQL 16 on 127.0.0.1:54329</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="fine">Client Engine:</span>
                <b>Go 1.24.0 (net/http sub-millisecond)</b>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <div className="grid2 mt-s">
        <Section title="Engineering Humility &amp; Scope Declaration" color="yellow">
          <div className="card tone-yellow">
            <b>What This Testbed Validates vs Multi-GPU Production</b>
            <p style={{ margin: '1mm 0', fontSize: '7.1pt' }}>
              <b>Empirically Verified:</b> Linux TCP socket streaming, HTTP wire chunking, continuous batching principles, gateway proxying, rate limit buckets, virtual key RBAC, Kubernetes Ingress routing, and KServe controller reconciliation.
            </p>
            <p style={{ margin: 0, fontSize: '7.1pt' }}>
              <b>Industrial Scale Caveat:</b> Real enterprise production with 10,000+ QPS demands multi-node clusters with 8x NVIDIA H100 SXM5 GPUs, NVLink 4.0 cross-GPU interconnects (900 GB/s), tensor parallelism across nodes, and disaggregated prefill/decode fleets. We do not claim this single-node workstation replaces a multi-rack supercomputing cluster; rather, it demystifies the foundational software systems operating behind every generative AI token.
            </p>
          </div>
        </Section>

        <Section title="Author Attribution &amp; Verification Note" color="red">
          <div className="card tone-red">
            <b>Empirical Systems Investigation</b>
            <p style={{ margin: '1mm 0', fontSize: '7.1pt' }}>
              This field guide was researched, coded, and benchmarked directly by <b>Ramu Mangalarapu</b> (Senior Backend &amp; Distributed Systems Engineer, UBS Hyderabad, RGUKT IIIT Basar, KCNA Certified).
            </p>
            <p style={{ margin: 0, fontSize: '7.1pt' }}>
              Every curl trace, Go HTTP client benchmark, Docker compose network bridge, and Kubernetes Ingress manifest was executed and verified live on physical hardware. All source code, manifests, and reproducing scripts are published open-source.
            </p>
          </div>
        </Section>
      </div>

      <Callout tone="blue" className="mt-s">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '7.5pt' }}>
          <div>
            <b>Open-Source Repository:</b>{' '}
            <a
              href="https://github.com/developer1622/llm-inference-infra"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1a73e8', fontWeight: 600 }}
            >
              github.com/developer1622/llm-inference-infra
            </a>
            <span style={{ margin: '0 2mm', color: '#9aa0a6' }}>&bull;</span>
            <a
              href="https://www.linkedin.com/in/ramu-mangalarapu"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1a73e8', fontWeight: 600 }}
            >
              linkedin.com/in/ramu-mangalarapu
            </a>
            <span style={{ margin: '0 2mm', color: '#9aa0a6' }}>&bull;</span>
            <a
              href="https://vishvakosha.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1a73e8', fontWeight: 600 }}
            >
              vishvakosha.com
            </a>
          </div>
          <span style={{ color: '#5f6368', fontSize: '6.8pt' }}>Hyderabad, India &bull; CC BY-SA 4.0</span>
        </div>
      </Callout>
    </Page>
  );
}
