import React from 'react';

// PART 9: 8 High-Density Technical Pages on Observability, Distributed Tracing, eBPF & SRE Operations

export const GoldenSignalsAI = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IX · Observability & SRE Operations · Page 1</span>
        <span className="text-xs text-slate-400 font-mono">Telemetry & Monitoring Foundations</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">9.1 The Four Golden Signals of LLM Model Serving</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Traditional microservices monitor Latency, Traffic, Errors, and Saturation.
        In Generative AI, these classic signals fail to capture user experience or engine health.
        We redefine the <strong>Four Golden Signals</strong> for production inference fleets.
      </p>

      {/* 4 Signals Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-3.5 rounded border border-amber-500/40">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-amber-300 font-mono">1. Time to First Token (TTFT)</h4>
            <span className="text-[8px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded font-mono">Responsiveness</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-2 leading-relaxed">
            Measures prompt ingestion, prefill compute, and network ingress latency.
          </p>
          <div className="text-[9px] text-slate-400 space-y-1">
            <p><strong>Target SLA:</strong> p95 &lt; 800ms for short prompts (&lt;500 tokens); p95 &lt; 2.5s for long context (&gt;8k tokens).</p>
            <p className="text-amber-400"><strong>Spike Diagnostic:</strong> Indicates prompt queue saturation, large concurrent prefill batches, or model runner cold restarts.</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded border border-emerald-500/40">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-emerald-300 font-mono">2. Inter-Token Latency (ITL) / Tok/s</h4>
            <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono">Smoothness</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-2 leading-relaxed">
            Measures the duration between successive generated tokens during decode.
          </p>
          <div className="text-[9px] text-slate-400 space-y-1">
            <p><strong>Target SLA:</strong> p95 &lt; 40ms (&gt;25 tokens/sec per user stream).</p>
            <p className="text-emerald-400"><strong>Spike Diagnostic:</strong> Indicates memory bandwidth exhaustion, cross-NUMA bus thrashing, or CFS CPU quota throttling.</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded border border-rose-500/40">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-rose-300 font-mono">3. KV Cache Saturation (%)</h4>
            <span className="text-[8px] bg-rose-950 text-rose-300 px-1.5 py-0.5 rounded font-mono">Saturation</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-2 leading-relaxed">
            Percentage of allocated GPU VRAM or CPU RAM currently occupied by active attention blocks.
          </p>
          <div className="text-[9px] text-slate-400 space-y-1">
            <p><strong>Warning Threshold:</strong> &gt;85% utilization triggers preemptive request queuing.</p>
            <p className="text-rose-400"><strong>Critical Alert:</strong> 100% saturation forces sequence preemption, swapping tokens to host RAM, or crashing pods with OOM!</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded border border-sky-500/40">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-sky-300 font-mono">4. Stream Disconnect Rate</h4>
            <span className="text-[8px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded font-mono">Errors & Waste</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-2 leading-relaxed">
            Ratio of streaming connections aborted by clients before generation finishes.
          </p>
          <div className="text-[9px] text-slate-400 space-y-1">
            <p><strong>Business Impact:</strong> High disconnect rates reveal slow generation prompting users to cancel tabs, wasting expensive GPU prefill compute on discarded tokens!</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>Telemetry Principle:</strong> Never average streaming latency across requests with different token counts. Always normalize by output token length or track TTFT and ITL independently.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 9.1</span>
    </div>
  </div>
);

export const PrometheusMetricsExporters = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IX · Observability & SRE Operations · Page 2</span>
        <span className="text-xs text-slate-400 font-mono">Prometheus Metrics & Exporters</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">9.2 Prometheus Metrics Instrumentation: Predictor & Gateway</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Both our LiteLLM gateway and KServe Go predictor export native <strong>Prometheus metrics</strong>
        scraped every 15 seconds by the Kubernetes Prometheus Operator.
      </p>

      {/* Metrics Code Box */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[8.5px] mb-4">
        <div className="text-emerald-400 font-bold mb-1.5">// stage3/predictor Live Prometheus Exposition (/metrics)</div>
        <div className="text-slate-300 space-y-0.5">
          <span className="text-slate-500"># HELP llm_inference_requests_total Total number of inference requests handled</span><br/>
          <span className="text-slate-500"># TYPE llm_inference_requests_total counter</span><br/>
          llm_inference_requests_total&#123;model="kserve-qwen",status="200",stream="true"&#125; 142<br/>
          llm_inference_requests_total&#123;model="kserve-qwen",status="503",stream="false"&#125; 4<br/><br/>
          <span className="text-slate-500"># HELP llm_time_to_first_token_seconds Histogram of TTFT latency</span><br/>
          <span className="text-slate-500"># TYPE llm_time_to_first_token_seconds histogram</span><br/>
          llm_time_to_first_token_seconds_bucket&#123;le="0.2"&#125; 18<br/>
          llm_time_to_first_token_seconds_bucket&#123;le="0.5"&#125; 112<br/>
          llm_time_to_first_token_seconds_bucket&#123;le="1.0"&#125; 140<br/>
          llm_time_to_first_token_seconds_sum 74.82<br/>
          llm_time_to_first_token_seconds_count 142<br/><br/>
          <span className="text-slate-500"># HELP llm_tokens_generated_total Total tokens generated by model engine</span><br/>
          llm_tokens_generated_total&#123;model="kserve-qwen"&#125; 18920
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">PromQL Queries for SRE Alerts</h4>
          <div className="space-y-2 text-[9.5px] font-mono text-slate-300">
            <div className="bg-slate-950 p-2 rounded">
              <span className="text-sky-300 font-bold block mb-0.5">Average Token Generation Speed:</span>
              <p className="text-emerald-400">rate(llm_tokens_generated_total[5m])</p>
            </div>
            <div className="bg-slate-950 p-2 rounded">
              <span className="text-amber-300 font-bold block mb-0.5">p95 Time to First Token:</span>
              <p className="text-emerald-400">histogram_quantile(0.95, sum(rate(llm_time_to_first_token_seconds_bucket[5m])) by (le))</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">Kubernetes ServiceMonitor Manifest</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Automatically registers scraping targets:
          </p>
          <div className="bg-slate-950 p-2 rounded font-mono text-[8.5px] text-slate-300 space-y-0.5">
            <span className="text-purple-400">apiVersion:</span> monitoring.coreos.com/v1<br/>
            <span className="text-purple-400">kind:</span> ServiceMonitor<br/>
            <span className="text-sky-400">metadata:</span> name: kserve-qwen-monitor<br/>
            <span className="text-sky-400">spec:</span><br/>
            &nbsp;&nbsp;endpoints: [&#123; port: "metrics", interval: "15s" &#125;]
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>Low Overhead Guarantee:</strong> In Go, atomic integers and mutex-free histograms in <code>prometheus/client_golang</code> add &lt;15 nanoseconds of CPU overhead per recorded token.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 9.2</span>
    </div>
  </div>
);

export const OpenTelemetryTracing = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IX · Observability & SRE Operations · Page 3</span>
        <span className="text-xs text-slate-400 font-mono">Distributed Tracing & Context Propagation</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">9.3 OpenTelemetry Distributed Tracing: W3C Context Propagation</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        When an LLM request crosses multiple tiers (Client &rarr; LiteLLM Gateway &rarr; NGINX Ingress &rarr; KServe Predictor &rarr; Ollama),
        pinpointing which exact network hop or scheduler phase caused a latency delay requires <strong>end-to-end distributed tracing</strong>.
      </p>

      {/* Trace Timeline Box */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[9px] mb-4">
        <div className="text-emerald-400 font-bold mb-2">// Distributed Trace Span Hierarchy (Jaeger / Grafana Tempo)</div>
        <div className="space-y-1 text-slate-300">
          <div className="bg-slate-900 p-1.5 rounded border border-sky-500/40 flex justify-between">
            <span className="text-sky-300 font-bold">[Span 1] client.http_request (Total: 3,420 ms)</span>
            <span className="text-slate-400">traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-purple-500/40 ml-4 flex justify-between">
            <span className="text-purple-300 font-bold">[Span 2] litellm.gateway_route (Total: 3,404 ms)</span>
            <span className="text-slate-400">auth_duration: 1.2ms &bull; db_check: 2.1ms</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-emerald-500/40 ml-8 flex justify-between">
            <span className="text-emerald-300 font-bold">[Span 3] nginx.ingress_proxy (Total: 3,398 ms)</span>
            <span className="text-slate-400">upstream_connect_time: 0.8ms</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-amber-500/40 ml-12 flex justify-between">
            <span className="text-amber-300 font-bold">[Span 4] kserve.predict (Total: 3,395 ms)</span>
            <span className="text-slate-400">prefill_span: 182ms &bull; decode_loop_span: 3,210ms</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">W3C Traceparent Header Mechanics</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Standardized header passed across HTTP boundaries:
          </p>
          <div className="bg-slate-950 p-2 rounded font-mono text-[8.5px] text-emerald-400 space-y-0.5 mb-2">
            <div>traceparent: 00-&#123;trace_id&#125;-&#123;parent_id&#125;-&#123;flags&#125;</div>
            <div className="text-slate-400">trace_id: 16 bytes (globally unique request ID)</div>
            <div className="text-slate-400">parent_id: 8 bytes (calling span ID)</div>
          </div>
          <p className="text-[10px] text-slate-400">
            LiteLLM automatically injects <code>traceparent</code> into upstream requests, allowing OpenTelemetry collectors in Kubernetes to stitch spans into a single waterfall graph!
          </p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">LLM Semantic Conventions in OTel</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            OpenTelemetry GenAI Working Group attributes:
          </p>
          <div className="space-y-1 text-[9.5px] font-mono text-slate-300">
            <div><code>gen_ai.system: "ollama"</code></div>
            <div><code>gen_ai.request.model: "qwen2.5:0.5b"</code></div>
            <div><code>gen_ai.usage.prompt_tokens: 14</code></div>
            <div><code>gen_ai.usage.completion_tokens: 52</code></div>
            <div><code>gen_ai.response.finish_reasons: ["stop"]</code></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>Privacy Guardrail:</strong> Never attach raw prompt text or generated completion strings to span attributes in production; log token counts and model IDs only to ensure HIPAA and GDPR compliance.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 9.3</span>
    </div>
  </div>
);

export const EBPFSocketTracing = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IX · Observability & SRE Operations · Page 4</span>
        <span className="text-xs text-slate-400 font-mono">eBPF Kernel Socket Tracing</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">9.4 eBPF Kernel Tracing: Non-Invasive Socket & Latency Diagnostics</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        In banking and mission-critical production (such as our UBS and enterprise platforms),
        modifying application binaries or adding heavy tracing SDKs is often forbidden or performance-prohibitive.
        <strong>eBPF (Extended Berkeley Packet Filter)</strong> allows tracing kernel sockets and memory allocations with zero code modifications.
      </p>

      {/* bpftrace script snippet */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[8.5px] mb-4">
        <div className="text-emerald-400 font-bold mb-1.5">// bpftrace Script: Tracing TCP Socket Latency in KServe Predictor</div>
        <div className="text-slate-300 space-y-0.5">
          kprobe:tcp_sendmsg /comm == "kserve-predict"/ &#123;<br/>
          &nbsp;&nbsp;@start[tid] = nsecs;<br/>
          &#125;<br/>
          kretprobe:tcp_sendmsg /@start[tid]/ &#123;<br/>
          &nbsp;&nbsp;$duration_us = (nsecs - @start[tid]) / 1000;<br/>
          &nbsp;&nbsp;@send_latency_us = hist($duration_us);<br/>
          &nbsp;&nbsp;delete(@start[tid]);<br/>
          &#125;
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">Why eBPF Excels for LLM Streaming</h4>
          <ul className="text-[10px] text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong>Zero Application Overhead:</strong> In-kernel bytecode verified by the kernel JIT engine runs in &lt;50 nanoseconds per probe point.</li>
            <li><strong>Kernel Socket Buffer Visibility:</strong> Measures true wire transmission time, catching socket buffer stalls before user code detects them.</li>
            <li><strong>Universal Visibility:</strong> Simultaneously traces Python, Go, and C++ llama.cpp runtimes using a single unified probe script.</li>
          </ul>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">BCC Tools for Real-Time Incident Triage</h4>
          <div className="space-y-1.5 text-[9.5px] font-mono text-slate-300">
            <div className="bg-slate-950 p-2 rounded">
              <span className="text-sky-300 font-bold block mb-0.5">tcprtt:</span>
              <p className="text-slate-400 text-[8.5px]">Measures TCP round-trip time between Ingress and KServe pods to isolate network jitter from model compute stalls.</p>
            </div>
            <div className="bg-slate-950 p-2 rounded">
              <span className="text-amber-300 font-bold block mb-0.5">runqlat:</span>
              <p className="text-slate-400 text-[8.5px]">Identifies CPU scheduler queue latency, proving whether inference threads are starving for CPU time slices.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>WSL2 Kernel Compatibility:</strong> Our WSL2 kernel (<code>6.6.87.2-microsoft-standard-WSL2</code>) includes full BPF and BTF support enabled, allowing native bpftrace execution without kernel recompilation!
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 9.4</span>
    </div>
  </div>
);

export const GrafanaDashboardArchitecture = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IX · Observability & SRE Operations · Page 5</span>
        <span className="text-xs text-slate-400 font-mono">Grafana Cockpits & Dashboard UX</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">9.5 Grafana Dashboard Architecture: Production LLM Cockpits</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Operating distributed LLM inference fleets requires visual situational awareness.
        We structure the production Grafana dashboard into four hierarchical rows: Executive, Fleet Health, Engine Performance, and Kernel SRE.
      </p>

      {/* Dashboard Wireframe Layout */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[9px] mb-4 space-y-2">
        <div className="p-2 bg-slate-900 rounded border border-sky-500/40">
          <span className="text-sky-300 font-bold block mb-1">ROW 1: Executive & Financial Cockpit (LiteLLM + PostgreSQL)</span>
          <div className="grid grid-cols-4 gap-2 text-center text-[8px] text-slate-400">
            <div className="bg-slate-950 p-1.5 rounded">Total Daily Spend ($)<br/><span className="text-emerald-400 font-bold text-[10px]">$14.82</span></div>
            <div className="bg-slate-950 p-1.5 rounded">Total Tokens Generated<br/><span className="text-white font-bold text-[10px]">1,248,910</span></div>
            <div className="bg-slate-950 p-1.5 rounded">Active Virtual Keys<br/><span className="text-sky-400 font-bold text-[10px]">18</span></div>
            <div className="bg-slate-950 p-1.5 rounded">Spend by Team (Pie)<br/><span className="text-amber-400 font-bold text-[10px]">Fraud: 62%</span></div>
          </div>
        </div>

        <div className="p-2 bg-slate-900 rounded border border-emerald-500/40">
          <span className="text-emerald-300 font-bold block mb-1">ROW 2: Fleet Health & Kubernetes Pod Status (KServe)</span>
          <div className="grid grid-cols-4 gap-2 text-center text-[8px] text-slate-400">
            <div className="bg-slate-950 p-1.5 rounded">Ready Pod Replicas<br/><span className="text-emerald-400 font-bold text-[10px]">2 / 2</span></div>
            <div className="bg-slate-950 p-1.5 rounded">Ingress Request Rate<br/><span className="text-white font-bold text-[10px]">42 req/s</span></div>
            <div className="bg-slate-950 p-1.5 rounded">HTTP 5xx Error Rate<br/><span className="text-emerald-400 font-bold text-[10px]">0.00%</span></div>
            <div className="bg-slate-950 p-1.5 rounded">Pod Restarts (1h)<br/><span className="text-emerald-400 font-bold text-[10px]">0</span></div>
          </div>
        </div>

        <div className="p-2 bg-slate-900 rounded border border-amber-500/40">
          <span className="text-amber-300 font-bold block mb-1">ROW 3: Model Engine Performance (Prometheus Histograms)</span>
          <div className="grid grid-cols-4 gap-2 text-center text-[8px] text-slate-400">
            <div className="bg-slate-950 p-1.5 rounded">p95 TTFT Latency<br/><span className="text-amber-400 font-bold text-[10px]">620 ms</span></div>
            <div className="bg-slate-950 p-1.5 rounded">Median Decode Speed<br/><span className="text-emerald-400 font-bold text-[10px]">34.2 tok/s</span></div>
            <div className="bg-slate-950 p-1.5 rounded">Inter-Token Latency<br/><span className="text-emerald-400 font-bold text-[10px]">29.2 ms</span></div>
            <div className="bg-slate-950 p-1.5 rounded">Active KV Blocks<br/><span className="text-sky-400 font-bold text-[10px]">14%</span></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/80 p-3 rounded border border-slate-700 text-[10px] text-slate-300">
        <h4 className="text-xs font-bold text-white mb-1">Alerting Integration: Slack & PagerDuty</h4>
        <p className="leading-relaxed">
          Grafana alerts route high-priority notifications to on-call engineers when:
          (1) p95 TTFT breaches 3,000ms for 2 consecutive minutes,
          (2) Pod memory consumption exceeds 90% of cgroup limit (preventing sudden OOMKilled events), or
          (3) LiteLLM upstream fallback trigger rate crosses 5% of total request volume.
        </p>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 9.5</span>
    </div>
  </div>
);

export const SLOsAndErrorBudgets = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IX · Observability & SRE Operations · Page 6</span>
        <span className="text-xs text-slate-400 font-mono">SLOs & Error Budget Governance</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">9.6 Service Level Objectives (SLOs) & Error Budgets for LLM Serving</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Setting traditional "99.9% HTTP 200 availability" SLOs fails for LLM serving: a stream can return HTTP 200 OK
        yet generate tokens at an agonizingly slow 0.5 tokens/sec.
        We establish modern <strong>User-Centric LLM SLOs</strong>.
      </p>

      {/* SLO Matrix Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left font-mono text-[9px] border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/80 text-slate-300">
              <th className="p-2">Service Level Indicator (SLI)</th>
              <th className="p-2">Target Objective (SLO)</th>
              <th className="p-2">Evaluation Window</th>
              <th className="p-2">Error Budget Burn Trigger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            <tr>
              <td className="p-2 font-bold text-white">Prefill Responsiveness (TTFT)</td>
              <td className="p-2 text-emerald-400 font-bold">99.0% of requests &lt; 1,000ms</td>
              <td className="p-2 text-slate-400">Rolling 30-day window</td>
              <td className="p-2 text-amber-400">Prefill batch queuing &gt; 1,000ms</td>
            </tr>
            <tr className="bg-slate-950/40">
              <td className="p-2 font-bold text-white">Decode Smoothness (ITL)</td>
              <td className="p-2 text-emerald-400 font-bold">99.5% of tokens emitted in &lt; 50ms</td>
              <td className="p-2 text-slate-400">Rolling 30-day window</td>
              <td className="p-2 text-rose-400">Memory bandwidth stalls or CFS throttle</td>
            </tr>
            <tr>
              <td className="p-2 font-bold text-white">Stream Completion Rate</td>
              <td className="p-2 text-emerald-400 font-bold">99.9% streams complete without RST</td>
              <td className="p-2 text-slate-400">Rolling 30-day window</td>
              <td className="p-2 text-rose-400">Pod crash / socket disconnect midway</td>
            </tr>
            <tr className="bg-slate-950/40">
              <td className="p-2 font-bold text-white">Gateway Availability</td>
              <td className="p-2 text-emerald-400 font-bold">99.95% non-5xx HTTP status</td>
              <td className="p-2 text-slate-400">Rolling 30-day window</td>
              <td className="p-2 text-rose-400">Gateway crash or database connection loss</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 font-mono">Error Budget Burn Rate Alerts</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Following Google SRE multi-window burn rate alerts:
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p><strong>14.4x Burn Rate (1-hour window):</strong> Consumes 2% of monthly budget in 1 hour. Pagers wake on-call engineer immediately!</p>
            <p><strong>6x Burn Rate (6-hour window):</strong> Consumes 5% of monthly budget in 6 hours. Files high-priority ticketing incident.</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">Error Budget Exhaustion Policy</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            When a model's error budget drops to 0%:
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>1. Feature deployments and model weights updates are automatically frozen.</p>
            <p>2. Engineering sprints focus 100% on infrastructure stability, KV cache optimizations, and latency reduction.</p>
            <p>3. Non-critical batch inference jobs are diverted to secondary lower-priority clusters.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>Governance:</strong> Error budgets provide mathematically objective boundaries balancing engineering velocity against production reliability.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 9.6</span>
    </div>
  </div>
);

export const SREIncidentPlaybooks = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IX · Observability & SRE Operations · Page 7</span>
        <span className="text-xs text-slate-400 font-mono">SRE Incident Response & Playbooks</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">9.7 SRE Incident Playbook: The Top 4 Production Outages</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        When an incident fires at 2:00 AM, SREs need structured triage protocols.
        Here are the battle-tested playbooks for the four most frequent generative AI serving failures.
      </p>

      {/* 4 Outages Playbook Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-[9.5px]">
        {/* Outage 1 */}
        <div className="bg-slate-800/80 p-3 rounded border border-rose-500/40">
          <div className="flex justify-between items-center mb-1">
            <strong className="text-rose-300 font-mono">1. The OOMKilled Cascade (Exit 137)</strong>
            <span className="text-[8px] bg-rose-950 text-rose-300 px-1 py-0.5 rounded">SEV-1</span>
          </div>
          <p className="text-slate-300 mb-1">Pod crashes abruptly; dmesg shows kernel OOM-killer invoked.</p>
          <div className="bg-slate-950 p-1.5 rounded font-mono text-[8px] text-slate-400 space-y-0.5 mb-1">
            <div>Symptom: High concurrent requests allocate too many KV pages.</div>
            <div className="text-emerald-400">Triage: kubectl describe pod | grep Last State: Terminated OOMKilled</div>
            <div className="text-sky-300">Fix: Reduce max_num_seqs or increase container memory limits.</div>
          </div>
        </div>

        {/* Outage 2 */}
        <div className="bg-slate-800/80 p-3 rounded border border-amber-500/40">
          <div className="flex justify-between items-center mb-1">
            <strong className="text-amber-300 font-mono">2. The Silent Stream Stall (Hang)</strong>
            <span className="text-[8px] bg-amber-950 text-amber-300 px-1 py-0.5 rounded">SEV-2</span>
          </div>
          <p className="text-slate-300 mb-1">HTTP 200 stream starts, emits 5 tokens, then permanently freezes.</p>
          <div className="bg-slate-950 p-1.5 rounded font-mono text-[8px] text-slate-400 space-y-0.5 mb-1">
            <div>Symptom: Downstream proxy buffering or TCP Zero-Window probe stall.</div>
            <div className="text-emerald-400">Triage: ss -tp | grep 8080 to check Send-Q backlog.</div>
            <div className="text-sky-300">Fix: Disable proxy buffering; set write deadlines in Go net.Conn.</div>
          </div>
        </div>

        {/* Outage 3 */}
        <div className="bg-slate-800/80 p-3 rounded border border-purple-500/40">
          <div className="flex justify-between items-center mb-1">
            <strong className="text-purple-300 font-mono">3. Gateway 504 Gateway Timeout</strong>
            <span className="text-[8px] bg-purple-950 text-purple-300 px-1 py-0.5 rounded">SEV-2</span>
          </div>
          <p className="text-slate-300 mb-1">LiteLLM drops client requests after 30 seconds with 504.</p>
          <div className="bg-slate-950 p-1.5 rounded font-mono text-[8px] text-slate-400 space-y-0.5 mb-1">
            <div>Symptom: Model backend queue depth exceeded; prefill starvation.</div>
            <div className="text-emerald-400">Triage: Check backend TTFT histogram and pending queue length.</div>
            <div className="text-sky-300">Fix: Scale predictor minReplicas via InferenceService CR.</div>
          </div>
        </div>

        {/* Outage 4 */}
        <div className="bg-slate-800/80 p-3 rounded border border-sky-500/40">
          <div className="flex justify-between items-center mb-1">
            <strong className="text-sky-300 font-mono">4. Host Port 80 Ingress Blackhole</strong>
            <span className="text-[8px] bg-sky-950 text-sky-300 px-1 py-0.5 rounded">SEV-1</span>
          </div>
          <p className="text-slate-300 mb-1">Host curl to 127.0.0.1:80 fails with connection refused.</p>
          <div className="bg-slate-950 p-1.5 rounded font-mono text-[8px] text-slate-400 space-y-0.5 mb-1">
            <div>Symptom: Ingress pod rescheduled to worker node without hostPort mapping.</div>
            <div className="text-emerald-400">Triage: kubectl get pods -n ingress-nginx -o wide</div>
            <div className="text-sky-300">Fix: Patch nodeSelector to pin Ingress to ha-cluster-worker!</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>MTTR Reduction:</strong> Standardizing playbooks and equipping teams with exact kubectl commands drops Mean Time To Recovery (MTTR) from 2 hours to under 12 minutes.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 9.7</span>
    </div>
  </div>
);

export const Day2OperationsAndCapacity = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IX · Observability & SRE Operations · Page 8</span>
        <span className="text-xs text-slate-400 font-mono">Capacity Planning & Day-2 Operations</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">9.8 Capacity Planning Math & Production Day-2 Operations</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Scaling an LLM serving cluster requires precise capacity planning mathematics.
        Guessing hardware requirements leads to either millions of dollars in idle GPU waste or catastrophic under-provisioned outages.
      </p>

      {/* Capacity Math Box */}
      <div className="bg-slate-950 p-3.5 rounded border border-slate-800 font-mono text-[9px] mb-4">
        <div className="text-emerald-400 font-bold mb-2">// The Production Capacity Formula for Model Fleets</div>
        <div className="space-y-1.5 text-slate-300">
          <div>Total GPU VRAM Required per Node (M_total):</div>
          <div className="bg-slate-900 p-2 rounded text-emerald-300 font-bold">
            M_total = M_weights + (N_concur &times; L_seq &times; 2 &times; N_layers &times; D_head &times; N_kv_heads &times; B_elem) + M_cuda_overhead
          </div>
          <div className="text-[8px] text-slate-400 space-y-0.5">
            <div>&bull; M_weights = Model parameters &times; bytes per weight (e.g. 7B &times; 0.55 bytes for Q4 = 3.9 GB)</div>
            <div>&bull; N_concur = Target peak concurrent active streams per instance</div>
            <div>&bull; L_seq = Maximum sequence context length (e.g. 4096 tokens)</div>
            <div>&bull; M_cuda_overhead = PyTorch context &amp; scratch buffers (~1.5 GB)</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">Day-2 Operational Checklist</h4>
          <ul className="text-[10px] text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong>Automated GGUF/Model Pruning:</strong> Implement cron jobs to purge unused model blobs from container storage before disk fills.</li>
            <li><strong>Rolling Pod Updates:</strong> Configure <code>maxSurge: 1</code> and <code>maxUnavailable: 0</code> on KServe InferenceServices for zero-downtime weight updates.</li>
            <li><strong>Database Index Optimization:</strong> Add composite indexes on <code>LiteLLM_SpendLogs(api_key, start_time)</code> to keep analytics queries fast.</li>
          </ul>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">Cost Optimization Playbook</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Reducing monthly operational inference spend:
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>1. <strong>Aggressive Prompt Caching:</strong> Radix prefix caching in vLLM eliminates redundant prefill compute, slashing API costs by up to 60% on multi-turn chat.</p>
            <p>2. <strong>Semantic Route Splitting:</strong> LiteLLM routes short classification tasks to 0.5B models, reserving expensive 70B models strictly for complex reasoning.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>Field Guide Summary:</strong> You now possess the comprehensive foundational systems knowledge to design, deploy, route, scale, and debug production LLM inference infrastructure from bare metal to Kubernetes!
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 9.8</span>
    </div>
  </div>
);
