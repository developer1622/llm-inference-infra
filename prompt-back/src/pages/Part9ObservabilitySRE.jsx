import React from 'react';
import { Page, Section, Callout, Term } from '../components/ui.jsx';

// PART 9: 8 High-Density Technical Pages on Observability, Distributed Tracing, eBPF & SRE Operations
// Styled with Google Design System, Red Accent Tone, Side Background Formatting, and Print-Safe Boundaries

export const GoldenSignalsAI = () => (
  <Page tone="red" running="Part 9 · LLM Observability &amp; SRE" part="Part 9">
    <div className="kicker">Telemetry &amp; Monitoring Foundations</div>
    <h1 className="big">The Four Golden Signals of LLM Model Serving</h1>
    <p className="lead">
      Traditional microservices monitor Latency, Traffic, Errors, and Saturation.
      In Generative AI, these classic signals fail to capture user experience or engine health.
      We redefine the <strong>Four Golden Signals</strong> for production inference fleets.
    </p>

    <Section title="The Four AI Inference Golden Signals" color="red" className="mt-s">
      <div className="grid2">
        <div className="card tone-yellow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ color: '#b06000' }}>1. Time to First Token (TTFT)</b>
            <span className="badge" style={{ background: '#fef7e0', color: '#b06000' }}>Responsiveness</span>
          </div>
          <p style={{ margin: '1mm 0', fontSize: '7.1pt' }}>
            Measures prompt ingestion, prefill compute, and network ingress latency.
            <b> SLA Target:</b> p95 &lt; 800ms for short prompts; p95 &lt; 2.5s for long context (&gt;8k tokens).
            Spikes indicate prompt queue saturation or cold starts.
          </p>
        </div>

        <div className="card tone-green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ color: '#188038' }}>2. Inter-Token Latency (ITL)</b>
            <span className="badge" style={{ background: '#e6f4ea', color: '#137333' }}>Smoothness</span>
          </div>
          <p style={{ margin: '1mm 0', fontSize: '7.1pt' }}>
            Measures the duration between successive generated tokens during decode.
            <b> SLA Target:</b> p95 &lt; 40ms (&gt;25 tok/s per stream).
            Spikes indicate memory bandwidth starvation or CFS CPU quota throttling.
          </p>
        </div>

        <div className="card tone-red">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ color: '#d93025' }}>3. KV Cache Saturation (%)</b>
            <span className="badge" style={{ background: '#fce8e6', color: '#c5221f' }}>Saturation</span>
          </div>
          <p style={{ margin: '1mm 0', fontSize: '7.1pt' }}>
            Percentage of allocated GPU VRAM or host RAM occupied by active KV blocks.
            &gt;85% utilization triggers request queuing; 100% forces sequence preemption or pod OOM-kills.
          </p>
        </div>

        <div className="card tone-blue">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ color: '#1a73e8' }}>4. Stream Disconnect Rate</b>
            <span className="badge" style={{ background: '#e8f0fe', color: '#1a73e8' }}>Errors &amp; Waste</span>
          </div>
          <p style={{ margin: '1mm 0', fontSize: '7.1pt' }}>
            Ratio of streaming connections aborted by users prior to generation finish.
            High rates reveal slow token speeds prompting client aborts, wasting compute on discarded tokens.
          </p>
        </div>
      </div>
    </Section>

    <Callout tone="red">
      <b>Telemetry Principle:</b> Never average streaming latency across requests with different token counts. Always normalize by output token length or track TTFT and ITL independently.
    </Callout>
  </Page>
);

export const PrometheusMetricsExporters = () => (
  <Page tone="red" running="Part 9 · Prometheus Metrics Exporters" part="Part 9">
    <div className="kicker">Prometheus Metrics &amp; Exporters</div>
    <h1 className="big">Prometheus Metrics Instrumentation: Predictor &amp; Gateway</h1>
    <p className="lead">
      Both our LiteLLM gateway and KServe Go predictor export native <strong>Prometheus metrics</strong>
      scraped every 15 seconds by the Kubernetes Prometheus Operator.
    </p>

    <Section title="Live Prometheus Exposition (/metrics)" color="red" className="mt-s">
      <div className="code-box" style={{ fontSize: '6.8pt', padding: '1.5mm' }}>
        <code><span style={{ color: '#5f6368' }}># HELP llm_inference_requests_total Total number of inference requests handled</span><br/>
        llm_inference_requests_total&#123;model="kserve-qwen",status="200",stream="true"&#125; 142<br/>
        llm_inference_requests_total&#123;model="kserve-qwen",status="503",stream="false"&#125; 4<br/><br/>
        <span style={{ color: '#5f6368' }}># HELP llm_time_to_first_token_seconds Histogram of TTFT latency</span><br/>
        llm_time_to_first_token_seconds_bucket&#123;le="0.2"&#125; 18<br/>
        llm_time_to_first_token_seconds_bucket&#123;le="0.5"&#125; 112<br/>
        llm_time_to_first_token_seconds_bucket&#123;le="1.0"&#125; 140<br/>
        llm_time_to_first_token_seconds_sum 74.82 &bull; count 142<br/><br/>
        <span style={{ color: '#5f6368' }}># HELP llm_tokens_generated_total Total tokens generated by model engine</span><br/>
        llm_tokens_generated_total&#123;model="kserve-qwen"&#125; 18920</code>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="PromQL Queries for SRE Alerts" color="yellow">
        <div className="card tone-yellow">
          <b>Operational Queries</b>
          <div style={{ fontSize: '7.1pt', marginTop: '1mm' }}>
            <div style={{ marginBottom: '1.5mm' }}>
              <span className="fine">Average Token Generation Speed:</span>
              <div className="code-box" style={{ fontSize: '6.5pt', padding: '0.8mm' }}>
                <code>rate(llm_tokens_generated_total[5m])</code>
              </div>
            </div>
            <div>
              <span className="fine">p95 Time to First Token:</span>
              <div className="code-box" style={{ fontSize: '6.5pt', padding: '0.8mm' }}>
                <code>histogram_quantile(0.95, sum(rate(llm_time_to_first_token_seconds_bucket[5m])) by (le))</code>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Kubernetes ServiceMonitor" color="blue">
        <div className="card tone-blue">
          <b>Operator Scraping Definition</b>
          <div className="code-box" style={{ fontSize: '6.5pt', margin: '1mm 0', padding: '1mm' }}>
            <code>apiVersion: monitoring.coreos.com/v1<br/>
            kind: ServiceMonitor<br/>
            metadata: name: kserve-qwen-monitor<br/>
            spec:<br/>
            &nbsp;&nbsp;endpoints: [&#123; port: "metrics", interval: "15s" &#125;]</code>
          </div>
          <p style={{ margin: '1mm 0 0', fontSize: '7pt' }}>
            Atomic counters in <code>prometheus/client_golang</code> add &lt;15ns CPU overhead per recorded token.
          </p>
        </div>
      </Section>
    </div>

    <Callout tone="red">
      <b>SRE Best Practice:</b> Alert on <code>rate(llm_inference_requests_total&#123;status="5xx"&#125;[5m])</code> breaching 1% of total traffic to catch backend pod crashes immediately.
    </Callout>
  </Page>
);

export const OpenTelemetryTracing = () => (
  <Page tone="red" running="Part 9 · OpenTelemetry Distributed Tracing" part="Part 9">
    <div className="kicker">Distributed Tracing &amp; Context Propagation</div>
    <h1 className="big">OpenTelemetry Distributed Tracing: W3C Context Propagation</h1>
    <p className="lead">
      When an LLM request crosses multiple tiers (Client &rarr; LiteLLM Gateway &rarr; NGINX Ingress &rarr; KServe Predictor &rarr; Ollama),
      pinpointing which exact network hop or scheduler phase caused a latency delay requires <strong>end-to-end distributed tracing</strong>.
    </p>

    <Section title="Distributed Trace Span Hierarchy (Jaeger / Grafana Tempo)" color="red" className="mt-s">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2mm' }}>
        <div className="card tone-blue" style={{ padding: '1.5mm 3mm' }}>
          <b style={{ color: '#1a73e8', fontSize: '7.2pt' }}>[Span 1] client.http_request (Total: 3,420 ms)</b>
          <div className="fine">traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01</div>
        </div>

        <div className="card tone-yellow" style={{ padding: '1.5mm 3mm', marginLeft: '4mm' }}>
          <b style={{ color: '#b06000', fontSize: '7.2pt' }}>[Span 2] litellm.gateway_route (Total: 3,404 ms)</b>
          <div className="fine">auth_duration: 1.2ms &bull; db_check: 2.1ms &bull; route_resolution: 0.8ms</div>
        </div>

        <div className="card tone-green" style={{ padding: '1.5mm 3mm', marginLeft: '8mm' }}>
          <b style={{ color: '#188038', fontSize: '7.2pt' }}>[Span 3] nginx.ingress_proxy (Total: 3,398 ms)</b>
          <div className="fine">upstream_connect_time: 0.8ms &bull; proxy_pass_time: 3,397ms</div>
        </div>

        <div className="card tone-red" style={{ padding: '1.5mm 3mm', marginLeft: '12mm' }}>
          <b style={{ color: '#d93025', fontSize: '7.2pt' }}>[Span 4] kserve.predict (Total: 3,395 ms)</b>
          <div className="fine">prefill_span: 182ms &bull; decode_loop_span: 3,210ms (34.2 tok/s)</div>
        </div>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="W3C Traceparent Header Mechanics" color="yellow">
        <div className="card tone-yellow">
          <b>Standardized Context Header</b>
          <div className="code-box" style={{ fontSize: '6.5pt', margin: '1mm 0', padding: '1mm' }}>
            <code>traceparent: 00-&#123;trace_id&#125;-&#123;parent_id&#125;-&#123;flags&#125;</code>
          </div>
          <p style={{ margin: '1mm 0 0', fontSize: '7.1pt' }}>
            LiteLLM injects <code>traceparent</code> into upstream HTTP calls, allowing OpenTelemetry collectors in Kubernetes to stitch spans into a single waterfall trace graph.
          </p>
        </div>
      </Section>

      <Section title="OTel GenAI Semantic Conventions" color="blue">
        <div className="card tone-blue">
          <b>Standardized Attributes</b>
          <div className="code-box" style={{ fontSize: '6.5pt', margin: '1mm 0', padding: '1mm' }}>
            <code>gen_ai.system: "ollama"<br/>
            gen_ai.request.model: "qwen2.5:0.5b"<br/>
            gen_ai.usage.prompt_tokens: 14<br/>
            gen_ai.usage.completion_tokens: 52</code>
          </div>
        </div>
      </Section>
    </div>

    <Callout tone="red">
      <b>Privacy Guardrail:</b> Never attach raw prompt text or generated completion strings to span attributes in production; log token counts and model IDs only to ensure HIPAA and GDPR compliance.
    </Callout>
  </Page>
);

export const EBPFSocketTracing = () => (
  <Page tone="red" running="Part 9 · eBPF Kernel Socket Tracing" part="Part 9">
    <div className="kicker">eBPF Kernel Socket Tracing</div>
    <h1 className="big">eBPF Kernel Tracing: Non-Invasive Socket &amp; Latency Diagnostics</h1>
    <p className="lead">
      In banking and mission-critical production (such as our UBS and enterprise platforms),
      modifying application binaries or adding heavy tracing SDKs is often forbidden or performance-prohibitive.
      <strong>eBPF (Extended Berkeley Packet Filter)</strong> allows tracing kernel sockets and memory allocations with zero code modifications.
    </p>

    <Section title="bpftrace Script: Tracing TCP Socket Latency in KServe Predictor" color="red" className="mt-s">
      <div className="code-box" style={{ fontSize: '7pt', padding: '1.5mm' }}>
        <code>kprobe:tcp_sendmsg /comm == "kserve-predict"/ &#123;<br/>
        &nbsp;&nbsp;@start[tid] = nsecs;<br/>
        &#125;<br/>
        kretprobe:tcp_sendmsg /@start[tid]/ &#123;<br/>
        &nbsp;&nbsp;$duration_us = (nsecs - @start[tid]) / 1000;<br/>
        &nbsp;&nbsp;@send_latency_us = hist($duration_us);<br/>
        &nbsp;&nbsp;delete(@start[tid]);<br/>
        &#125;</code>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="Why eBPF Excels for LLM Streaming" color="red">
        <div className="card tone-red">
          <b>Kernel-Level Advantages</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.1pt' }}>
            <li><b>Zero Application Overhead:</b> In-kernel bytecode verified by the JIT engine runs in &lt;50 nanoseconds per probe.</li>
            <li><b>Buffer Visibility:</b> Measures true wire transmission time, catching socket buffer stalls before user code detects them.</li>
            <li><b>Universal Observability:</b> Simultaneously traces Python, Go, and C++ llama.cpp runtimes using a single unified script.</li>
          </ul>
        </div>
      </Section>

      <Section title="BCC Tools for Real-Time Triage" color="blue">
        <div className="card tone-blue">
          <b>Production Diagnostic Utilities</b>
          <div style={{ fontSize: '7.1pt', marginTop: '1mm' }}>
            <div style={{ borderBottom: '0.2mm solid #e8eaed', paddingBottom: '1mm', marginBottom: '1mm' }}>
              <b style={{ color: '#1a73e8' }}>tcprtt:</b>
              <p style={{ margin: 0 }}>Measures TCP round-trip time between Ingress and KServe pods to isolate network jitter from compute stalls.</p>
            </div>
            <div>
              <b style={{ color: '#b06000' }}>runqlat:</b>
              <p style={{ margin: 0 }}>Identifies CPU scheduler queue latency, proving whether inference threads are starving for CPU time slices.</p>
            </div>
          </div>
        </div>
      </Section>
    </div>

    <Callout tone="red">
      <b>WSL2 Kernel Compatibility:</b> Our WSL2 kernel (<code>6.6.87.2-microsoft-standard-WSL2</code>) includes full BPF and BTF support enabled, allowing native bpftrace execution without kernel recompilation!
    </Callout>
  </Page>
);

export const GrafanaDashboardArchitecture = () => (
  <Page tone="red" running="Part 9 · Production Grafana Cockpits" part="Part 9">
    <div className="kicker">Grafana Cockpits &amp; Dashboard UX</div>
    <h1 className="big">Grafana Dashboard Architecture: Production LLM Cockpits</h1>
    <p className="lead">
      Operating distributed LLM inference fleets requires visual situational awareness.
      We structure the production Grafana dashboard into four hierarchical rows: Executive, Fleet Health, Engine Performance, and Kernel SRE.
    </p>

    <Section title="Production Grafana Dashboard Layout Architecture" color="red" className="mt-s">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5mm' }}>
        <div className="card tone-blue" style={{ padding: '2mm 3mm' }}>
          <b style={{ color: '#1a73e8', fontSize: '7.5pt' }}>ROW 1: Executive &amp; Financial Cockpit (LiteLLM + PostgreSQL)</b>
          <div className="grid4 text-center mt-s" style={{ fontSize: '7pt' }}>
            <div>Daily Spend: <b style={{ color: '#188038' }}>$14.82</b></div>
            <div>Total Tokens: <b>1,248,910</b></div>
            <div>Active Keys: <b style={{ color: '#1a73e8' }}>18</b></div>
            <div>Top Team: <b style={{ color: '#b06000' }}>Fraud (62%)</b></div>
          </div>
        </div>

        <div className="card tone-green" style={{ padding: '2mm 3mm' }}>
          <b style={{ color: '#188038', fontSize: '7.5pt' }}>ROW 2: Fleet Health &amp; Pod Status (KServe on Kubernetes)</b>
          <div className="grid4 text-center mt-s" style={{ fontSize: '7pt' }}>
            <div>Ready Pods: <b style={{ color: '#188038' }}>2 / 2</b></div>
            <div>Ingress Rate: <b>42 req/s</b></div>
            <div>HTTP 5xx Rate: <b style={{ color: '#188038' }}>0.00%</b></div>
            <div>Restarts: <b style={{ color: '#188038' }}>0</b></div>
          </div>
        </div>

        <div className="card tone-yellow" style={{ padding: '2mm 3mm' }}>
          <b style={{ color: '#b06000', fontSize: '7.5pt' }}>ROW 3: Model Engine Performance (Prometheus Histograms)</b>
          <div className="grid4 text-center mt-s" style={{ fontSize: '7pt' }}>
            <div>p95 TTFT: <b style={{ color: '#b06000' }}>620 ms</b></div>
            <div>Median Speed: <b style={{ color: '#188038' }}>34.2 tok/s</b></div>
            <div>Inter-Token: <b style={{ color: '#188038' }}>29.2 ms</b></div>
            <div>KV Blocks: <b style={{ color: '#1a73e8' }}>14%</b></div>
          </div>
        </div>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="Alerting Integration: Slack &amp; PagerDuty" color="red">
        <div className="card tone-red">
          <b>Actionable Alerts</b>
          <p style={{ margin: '1mm 0', fontSize: '7.1pt' }}>
            Grafana alerts route high-priority notifications to on-call engineers when:
            (1) p95 TTFT breaches 3,000ms for 2 consecutive minutes,
            (2) Pod memory exceeds 90% of cgroup limits, or
            (3) Gateway fallback trigger rate crosses 5% of total volume.
          </p>
        </div>
      </Section>

      <Section title="Incident Dashboard Routing" color="blue">
        <div className="card tone-blue">
          <b>One-Click Drilldown</b>
          <p style={{ margin: '1mm 0', fontSize: '7.1pt' }}>
            Clicking on an elevated TTFT graph deep-links directly into Jaeger distributed traces filtered by <code>trace_id</code>, allowing immediate identification of the slow component.
          </p>
        </div>
      </Section>
    </div>

    <Callout tone="red">
      <b>Cockpit Design Rule:</b> Every dashboard panel must answer a single operational question: "Is the system healthy?", "Which layer is stalling?", or "What is our financial burn rate?"
    </Callout>
  </Page>
);

export const SLOsAndErrorBudgets = () => (
  <Page tone="red" running="Part 9 · SLOs &amp; Error Budgets" part="Part 9">
    <div className="kicker">SLOs &amp; Error Budget Governance</div>
    <h1 className="big">Service Level Objectives (SLOs) &amp; Error Budgets for LLM Serving</h1>
    <p className="lead">
      Setting traditional "99.9% HTTP 200 availability" SLOs fails for LLM serving: a stream can return HTTP 200 OK
      yet generate tokens at an agonizingly slow 0.5 tokens/sec.
      We establish modern <strong>User-Centric LLM SLOs</strong>.
    </p>

    <Section title="User-Centric LLM Service Level Objectives (SLOs)" color="red" className="mt-s">
      <table className="theme-table" style={{ fontSize: '7pt' }}>
        <thead>
          <tr>
            <th>Service Level Indicator (SLI)</th>
            <th>Target Objective (SLO)</th>
            <th>Window</th>
            <th>Error Budget Burn Trigger</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Prefill Responsiveness (TTFT)</b></td>
            <td><b style={{ color: '#188038' }}>99.0% requests &lt; 1,000ms</b></td>
            <td>30 days</td>
            <td>Prefill batch queuing &gt; 1,000ms</td>
          </tr>
          <tr>
            <td><b>Decode Smoothness (ITL)</b></td>
            <td><b style={{ color: '#188038' }}>99.5% tokens &lt; 50ms</b></td>
            <td>30 days</td>
            <td>Memory bandwidth stalls / CFS throttle</td>
          </tr>
          <tr>
            <td><b>Stream Completion Rate</b></td>
            <td><b style={{ color: '#188038' }}>99.9% streams complete</b></td>
            <td>30 days</td>
            <td>Pod crash / socket disconnect midway</td>
          </tr>
          <tr>
            <td><b>Gateway Availability</b></td>
            <td><b style={{ color: '#188038' }}>99.95% non-5xx status</b></td>
            <td>30 days</td>
            <td>Gateway crash / DB loss</td>
          </tr>
        </tbody>
      </table>
    </Section>

    <div className="grid2 mt-s">
      <Section title="Error Budget Burn Rate Alerts" color="red">
        <div className="card tone-red">
          <b>Multi-Window SRE Triggers</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.1pt' }}>
            <li><b>14.4x Burn Rate (1-hour window):</b> Consumes 2% of monthly budget in 1 hour. Pagers wake on-call engineer immediately!</li>
            <li><b>6x Burn Rate (6-hour window):</b> Consumes 5% of monthly budget in 6 hours. Files high-priority ticketing incident.</li>
          </ul>
        </div>
      </Section>

      <Section title="Error Budget Exhaustion Policy" color="yellow">
        <div className="card tone-yellow">
          <b>Enforcing Stability</b>
          <p style={{ margin: '1mm 0', fontSize: '7.1pt' }}>
            When a model's error budget reaches 0%:
            (1) Model weight updates and feature releases are frozen,
            (2) Sprints focus 100% on KV cache and latency tuning,
            (3) Non-critical batch jobs divert to secondary lower-tier clusters.
          </p>
        </div>
      </Section>
    </div>

    <Callout tone="red">
      <b>Objective Governance:</b> Error budgets provide mathematically objective boundaries balancing engineering velocity against production reliability.
    </Callout>
  </Page>
);

export const SREIncidentPlaybooks = () => (
  <Page tone="red" running="Part 9 · SRE Incident Playbooks" part="Part 9">
    <div className="kicker">SRE Incident Response &amp; Playbooks</div>
    <h1 className="big">SRE Incident Playbook: The Top 4 Production Outages</h1>
    <p className="lead">
      When an incident fires at 2:00 AM, SREs need structured triage protocols.
      Here are the battle-tested playbooks for the four most frequent generative AI serving failures.
    </p>

    <Section title="Battle-Tested Incident Triage Matrix" color="red" className="mt-s">
      <div className="grid2">
        <div className="card tone-red">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ color: '#d93025' }}>1. The OOMKilled Cascade (Exit 137)</b>
            <span className="badge" style={{ background: '#fce8e6', color: '#c5221f' }}>SEV-1</span>
          </div>
          <p style={{ margin: '0.8mm 0', fontSize: '7pt' }}>
            Pod crashes abruptly; dmesg shows kernel OOM-killer invoked.
          </p>
          <div className="code-box" style={{ fontSize: '6.2pt', padding: '0.8mm' }}>
            <code>kubectl describe pod | grep OOMKilled</code>
          </div>
          <p style={{ margin: '0.8mm 0 0', fontSize: '6.8pt' }}><b>Fix:</b> Reduce <code>max_num_seqs</code> or increase container memory limits.</p>
        </div>

        <div className="card tone-yellow">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ color: '#b06000' }}>2. The Silent Stream Stall (Hang)</b>
            <span className="badge" style={{ background: '#fef7e0', color: '#b06000' }}>SEV-2</span>
          </div>
          <p style={{ margin: '0.8mm 0', fontSize: '7pt' }}>
            HTTP 200 stream emits 5 tokens, then permanently freezes.
          </p>
          <div className="code-box" style={{ fontSize: '6.2pt', padding: '0.8mm' }}>
            <code>ss -tp | grep 8080 (Send-Q backlog)</code>
          </div>
          <p style={{ margin: '0.8mm 0 0', fontSize: '6.8pt' }}><b>Fix:</b> Disable proxy buffering; set write deadlines in Go net.Conn.</p>
        </div>

        <div className="card tone-blue">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ color: '#1a73e8' }}>3. Gateway 504 Gateway Timeout</b>
            <span className="badge" style={{ background: '#e8f0fe', color: '#1a73e8' }}>SEV-2</span>
          </div>
          <p style={{ margin: '0.8mm 0', fontSize: '7pt' }}>
            LiteLLM drops client requests after 30 seconds with 504.
          </p>
          <div className="code-box" style={{ fontSize: '6.2pt', padding: '0.8mm' }}>
            <code>Check backend TTFT and queue depth</code>
          </div>
          <p style={{ margin: '0.8mm 0 0', fontSize: '6.8pt' }}><b>Fix:</b> Scale predictor minReplicas via InferenceService CR.</p>
        </div>

        <div className="card tone-green">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <b style={{ color: '#188038' }}>4. Host Port 80 Ingress Blackhole</b>
            <span className="badge" style={{ background: '#e6f4ea', color: '#137333' }}>SEV-1</span>
          </div>
          <p style={{ margin: '0.8mm 0', fontSize: '7pt' }}>
            Host curl to 127.0.0.1:80 fails with connection refused.
          </p>
          <div className="code-box" style={{ fontSize: '6.2pt', padding: '0.8mm' }}>
            <code>kubectl get pods -n ingress-nginx -o wide</code>
          </div>
          <p style={{ margin: '0.8mm 0 0', fontSize: '6.8pt' }}><b>Fix:</b> Pin Ingress to ha-cluster-worker via nodeSelector!</p>
        </div>
      </div>
    </Section>

    <Callout tone="red">
      <b>MTTR Reduction:</b> Standardizing playbooks and equipping teams with exact kubectl commands drops Mean Time To Recovery (MTTR) from 2 hours to under 12 minutes.
    </Callout>
  </Page>
);

export const Day2OperationsAndCapacity = () => (
  <Page tone="red" running="Part 9 · Capacity Planning &amp; Day-2" part="Part 9">
    <div className="kicker">Capacity Planning &amp; Day-2 Operations</div>
    <h1 className="big">Capacity Planning Math &amp; Production Day-2 Operations</h1>
    <p className="lead">
      Scaling an LLM serving cluster requires precise capacity planning mathematics.
      Guessing hardware requirements leads to either millions of dollars in idle GPU waste or catastrophic under-provisioned outages.
    </p>

    <Section title="The Production Capacity Formula for Model Fleets" color="red" className="mt-s">
      <div className="card tone-red">
        <b style={{ color: '#d93025' }}>Total GPU VRAM Required per Node (M_total):</b>
        <div className="code-box" style={{ fontSize: '6.8pt', margin: '1mm 0', padding: '1mm' }}>
          <code>M_total = M_weights + (N_concur &times; L_seq &times; 2 &times; N_layers &times; D_head &times; N_kv_heads &times; B_elem) + M_cuda_overhead</code>
        </div>
        <div className="fine" style={{ marginTop: '1mm' }}>
          &bull; <b>M_weights:</b> Model params &times; bytes/weight (e.g. 7B &times; 0.55B for Q4 = 3.9 GB) &bull; <b>N_concur:</b> Peak concurrent streams &bull; <b>L_seq:</b> Context length (4096 tokens) &bull; <b>M_cuda_overhead:</b> PyTorch context (~1.5 GB).
        </div>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="Day-2 Operational Checklist" color="yellow">
        <div className="card tone-yellow">
          <b>Routine SRE Tasks</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.1pt' }}>
            <li><b>Automated GGUF Model Pruning:</b> Run cron jobs to purge unused model blobs before node disks fill.</li>
            <li><b>Zero-Downtime Rolling Updates:</b> Set <code>maxSurge: 1</code> and <code>maxUnavailable: 0</code> on KServe InferenceServices.</li>
            <li><b>Database Index Optimization:</b> Add composite indexes on <code>LiteLLM_SpendLogs(api_key, start_time)</code>.</li>
          </ul>
        </div>
      </Section>

      <Section title="Cost Optimization Playbook" color="green">
        <div className="card tone-green">
          <b>Financial Engineering</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.1pt' }}>
            <li><b>Radix Prefix Caching:</b> Prompt caching in vLLM eliminates redundant prefill compute, slashing API costs by 60%.</li>
            <li><b>Semantic Route Splitting:</b> LiteLLM routes short classification tasks to 0.5B models, reserving 70B models for deep reasoning.</li>
          </ul>
        </div>
      </Section>
    </div>

    <Callout tone="green">
      <b>Field Guide Summary:</b> You now possess the comprehensive foundational systems knowledge to design, deploy, route, scale, and debug production LLM inference infrastructure from bare metal to Kubernetes!
    </Callout>
  </Page>
);
