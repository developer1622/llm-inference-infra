import React from 'react';

export default function ColophonBackCover() {
  return (
    <div className="page flex flex-col justify-between p-12 bg-slate-950 text-slate-100 font-sans border-t-8 border-emerald-500">
      <div>
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-8">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Colophon · Systems Engineering Field Guide</span>
          <span className="text-xs text-slate-500 font-mono">October 2026 Edition</span>
        </div>

        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold text-white mb-4 tracking-tight">
            LLM Inference Field Guide
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            A comprehensive, low-level architectural journey through modern Generative AI model serving infrastructure.
            From POSIX sockets, memory bandwidth, SIMD vector instructions, and paged KV cache schedulers,
            to enterprise API gateways, Kubernetes KServe operators, and eBPF observability.
          </p>

          <div className="grid grid-cols-2 gap-6 my-8 font-mono text-xs">
            <div className="bg-slate-900/80 p-4 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold block mb-2 uppercase tracking-wider text-[11px]">Primary Testbed Specifications</span>
              <ul className="text-slate-400 space-y-1 text-[10px]">
                <li><strong className="text-slate-300">Host OS:</strong> Windows 11 Pro</li>
                <li><strong className="text-slate-300">Kernel:</strong> Linux 6.6.87.2-microsoft-standard-WSL2</li>
                <li><strong className="text-slate-300">Distribution:</strong> Ubuntu 24.04 LTS</li>
                <li><strong className="text-slate-300">Processor:</strong> Intel Core i5-10210U @ 1.60GHz (4C/8T)</li>
                <li><strong className="text-slate-300">Vector Unit:</strong> Intel AVX2 SIMD + FMA3</li>
                <li><strong className="text-slate-300">RAM:</strong> 7.8 GiB DDR4 (No Discrete GPU)</li>
                <li><strong className="text-slate-300">Storage:</strong> 1,007 GB NVMe SSD (/dev/sdd)</li>
              </ul>
            </div>

            <div className="bg-slate-900/80 p-4 rounded border border-slate-800">
              <span className="text-sky-400 font-bold block mb-2 uppercase tracking-wider text-[11px]">Software Ecosystem</span>
              <ul className="text-slate-400 space-y-1 text-[10px]">
                <li><strong className="text-slate-300">Kubernetes:</strong> KinD v0.27 (4 Nodes: 1 CP, 3 Workers)</li>
                <li><strong className="text-slate-300">Model Serving:</strong> KServe v0.14.0 (RawDeployment)</li>
                <li><strong className="text-slate-300">Cert Management:</strong> cert-manager v1.16.2</li>
                <li><strong className="text-slate-300">Ingress:</strong> ingress-nginx v1.12.0</li>
                <li><strong className="text-slate-300">API Gateway:</strong> LiteLLM Proxy on Host Network</li>
                <li><strong className="text-slate-300">Database:</strong> PostgreSQL 16 (Token spend audit)</li>
                <li><strong className="text-slate-300">Client Engine:</strong> Go 1.24.0 (net/http client)</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded border border-slate-800/80 text-xs text-slate-300 leading-relaxed mb-6">
            <h4 className="font-bold text-white mb-1">Author Statement</h4>
            <p>
              This guide was authored and tested directly on physical developer hardware by Ramu Mangalarapu,
              Senior Backend &amp; Distributed Systems Engineer (UBS, RGUKT IIIT Basar, KCNA Certified).
              Every curl request, Go client benchmark, Kubernetes Ingress mapping, and latency figure presented in this document
              reflects real measurements captured live in the lab.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 pt-4 flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <div>
          <a
            href="https://github.com/developer1622/llm-inference-infra"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            github.com/developer1622/llm-inference-infra
          </a>
          <span className="mx-2">&bull;</span>
          <a
            href="https://www.linkedin.com/in/ramu-mangalarapu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            linkedin.com/in/ramu-mangalarapu
          </a>
          <span className="mx-2">&bull;</span>
          <a
            href="https://vishvakosha.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            vishvakosha.com
          </a>
        </div>
        <div>
          <span>Published in Hyderabad, India &bull; CC BY-SA 4.0</span>
        </div>
      </div>
    </div>
  );
}
