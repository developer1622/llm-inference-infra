import React from 'react';
import { Page, Section, Callout, Term } from '../components/ui.jsx';

// PART 7: 10 High-Density Technical Pages on Stage 2 Deep Dive (LiteLLM Gateway, Routing, Virtual Keys, Rate Limiting, Failover)
// Formatted with Google Design System, Yellow Accent Tone, Side Background Formatting, and Print-Safe Boundaries

export const Stage2Architecture = () => (
  <Page tone="yellow" running="Part 7 · LiteLLM AI API Gateway" part="Part 7">
    <div className="kicker">Gateway Architecture &amp; Ingress Flow</div>
    <h1 className="big">Stage 2 Architecture: The Role of the AI Gateway Layer</h1>
    <p className="lead">
      In enterprise microservices, client applications must never communicate directly with raw model runtimes.
      Direct coupling leaks internal endpoints, prevents centralized telemetry, prohibits budget governance, and prevents failover.
      LiteLLM introduces a unified <strong>AI API Gateway</strong> mediating all LLM interactions.
    </p>

    <Section title="Enterprise Ingress Flow with LiteLLM Gateway" color="yellow" className="mt-s">
      <div className="grid4">
        <div className="card tone-blue">
          <b style={{ color: '#1a73e8' }}>1. Clients</b>
          <div className="fine" style={{ marginTop: '1mm' }}>Go App &bull; Web UI &bull; curl</div>
          <div className="code-box" style={{ fontSize: '6.5pt', margin: '1mm 0', padding: '1mm' }}>
            <code>Bearer sk-stage2-test</code>
          </div>
          <p style={{ margin: 0, fontSize: '6.8pt' }}>OpenAI REST contract over HTTPS.</p>
        </div>

        <div className="card tone-yellow">
          <b style={{ color: '#b06000' }}>2. LiteLLM Proxy</b>
          <div className="fine" style={{ marginTop: '1mm' }}>Port 4000 (FastAPI/uvloop)</div>
          <div className="code-box" style={{ fontSize: '6.5pt', margin: '1mm 0', padding: '1mm' }}>
            <code>Auth &bull; Route &bull; Audit</code>
          </div>
          <p style={{ margin: 0, fontSize: '6.8pt' }}>Normalizes protocols &amp; quotas.</p>
        </div>

        <div className="card tone-green">
          <b style={{ color: '#188038' }}>3. PostgreSQL DB</b>
          <div className="fine" style={{ marginTop: '1mm' }}>Port 54329 (State Store)</div>
          <div className="code-box" style={{ fontSize: '6.5pt', margin: '1mm 0', padding: '1mm' }}>
            <code>Keys &bull; Spend &bull; Logs</code>
          </div>
          <p style={{ margin: 0, fontSize: '6.8pt' }}>Persistent financial audit trail.</p>
        </div>

        <div className="card tone-red">
          <b style={{ color: '#d93025' }}>4. Model Backends</b>
          <div className="fine" style={{ marginTop: '1mm' }}>Ollama (11434) &bull; KServe</div>
          <div className="code-box" style={{ fontSize: '6.5pt', margin: '1mm 0', padding: '1mm' }}>
            <code>Raw Model Execution</code>
          </div>
          <p style={{ margin: 0, fontSize: '6.8pt' }}>Hardware-accelerated token decode.</p>
        </div>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="Gateway Responsibilities" color="yellow">
        <div className="card tone-yellow">
          <b>Enterprise Governance Surface</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.2pt' }}>
            <li><b>Protocol Standardization:</b> Translates 100+ provider formats (OpenAI, Anthropic, Bedrock, Ollama) into a single RFC-compliant SSE interface.</li>
            <li><b>Authentication Isolation:</b> Client workloads hold virtual keys; master cloud provider secrets never leave the private gateway perimeter.</li>
            <li><b>Financial Guardrails:</b> Enforces team budgets, max token spend per call, and auto-disables keys on budget exhaustion.</li>
          </ul>
        </div>
      </Section>

      <Section title="Stage 2 Lab Topology" color="blue">
        <div className="card tone-blue">
          <b>Empirical Verification Environment</b>
          <div style={{ marginTop: '1mm', fontSize: '7.2pt' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.8mm', marginBottom: '0.8mm' }}>
              <span>Container Runtime:</span>
              <b>Docker on WSL2 Ubuntu 24.04</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.8mm', marginBottom: '0.8mm' }}>
              <span>LiteLLM Image:</span>
              <code style={{ fontSize: '6.8pt' }}>ghcr.io/berriai/litellm:main-latest</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '0.2mm solid #e8eaed', paddingBottom: '0.8mm', marginBottom: '0.8mm' }}>
              <span>Networking:</span>
              <b>Host Network (0.0.0.0:4000)</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Database Store:</span>
              <b>PostgreSQL 16 on 127.0.0.1:54329</b>
            </div>
          </div>
        </div>
      </Section>
    </div>

    <Callout tone="yellow">
      <b>Backend Agnosticism:</b> Downstream microservices query the abstract alias <code>fast-chat</code>. The gateway dynamically directs the query to local Ollama, a Kubernetes KServe pod, or AWS Bedrock without requiring a single client code redeployment.
    </Callout>
  </Page>
);

export const LiteLLMInternals = () => (
  <Page tone="yellow" running="Part 7 · LiteLLM Proxy Internals" part="Part 7">
    <div className="kicker">Proxy Internals &amp; Async Concurrency</div>
    <h1 className="big">LiteLLM Proxy Internals: Asyncio, FastAPI &amp; Worker Pools</h1>
    <p className="lead">
      LiteLLM is engineered on Python's <strong>FastAPI framework</strong> and <strong>uvicorn ASGI server</strong>,
      accelerated by <code>uvloop</code> (a C-based asyncio event loop implementation wrapping libuv).
      Understanding this concurrency architecture is crucial for tuning high-throughput AI gateways.
    </p>

    <div className="grid2 mt-s">
      <Section title="The Non-Blocking Request Pipeline" color="yellow">
        <div className="card tone-yellow">
          <b>Lifecycle of a Proxy Request</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.2pt' }}>
            <li><b>1. Pre-Call Hooks:</b> Verifies Bearer token against in-memory LRU cache backed by PostgreSQL. Enforces rate limits and spend ceiling headroom.</li>
            <li><b>2. Router Resolution:</b> Resolves target backend based on model alias, latency tracking, and active circuit breaker states.</li>
            <li><b>3. Async Dispatch:</b> Executes streaming HTTP/2 request via non-blocking <code>httpx.AsyncClient</code> connection pools.</li>
            <li><b>4. Post-Call Telemetry:</b> Emits token counts, TTFT metrics, and financial spend asynchronously to PostgreSQL without delaying stream completion.</li>
          </ul>
        </div>
      </Section>

      <Section title="Worker Tuning & Concurrency Limits" color="blue">
        <div className="card tone-blue">
          <b>Production Process Supervision</b>
          <div className="code-box" style={{ fontSize: '6.8pt', margin: '1mm 0', padding: '1mm' }}>
            <code>uvicorn litellm.proxy.proxy_server:app \<br/>
            &nbsp;&nbsp;--host 0.0.0.0 --port 4000 \<br/>
            &nbsp;&nbsp;--workers 4 --loop uvloop \<br/>
            &nbsp;&nbsp;--limit-concurrency 1000</code>
          </div>
          <p style={{ margin: '1mm 0 0', fontSize: '7.1pt' }}>
            Because LLM streaming connections are long-lived (seconds to minutes), 4 uvloop worker processes can comfortably multiplex 4,000 concurrent streaming TCP sockets on our 4-core workstation.
          </p>
        </div>
      </Section>
    </div>

    <Section title="Zero-Copy Generator Streaming Pattern" color="green" className="mt-s">
      <div className="card tone-green">
        <b>Low-Footprint SSE Pipeline (<code>async for chunk in upstream_stream</code>)</b>
        <p style={{ margin: '1mm 0', fontSize: '7.2pt' }}>
          LiteLLM streams SSE responses using native Python asynchronous generators. When tokens arrive from the backend engine (Ollama or KServe),
          they are immediately formatted as SSE <code>data:</code> frames and flushed onto the client TCP socket. The gateway avoids accumulating the full completion buffer in memory, keeping resident memory usage under <strong>80 KiB per active connection</strong>.
        </p>
      </div>
    </Section>

    <Callout tone="yellow">
      <b>Thread Pool Offloading:</b> Database write tasks and heavy cryptographic operations run in background <code>asyncio.to_thread()</code> worker pools, preventing long DB operations from stalling the uvloop reactor thread.
    </Callout>
  </Page>
);

export const RoutingTableConfig = () => (
  <Page tone="yellow" running="Part 7 · Declarative Model Routing" part="Part 7">
    <div className="kicker">Declarative Routing &amp; Backend Aliases</div>
    <h1 className="big">The Model Routing Table: Mapping Virtual Aliases to Backends</h1>
    <p className="lead">
      LiteLLM utilizes a declarative YAML configuration (<code>stage2/config.yaml</code>) to decouple model names requested by clients
      from physical host targets, enabling transparent model substitution, traffic splitting, and hybrid fallback routing.
    </p>

    <Section title="Production Routing Manifest (stage2/config.yaml)" color="yellow" className="mt-s">
      <div className="code-box" style={{ fontSize: '7pt', padding: '1.5mm' }}>
        <code><span style={{ color: '#8430ce' }}>model_list:</span><br/>
        &nbsp;&nbsp;- <span style={{ color: '#1a73e8' }}>model_name:</span> <span style={{ color: '#188038' }}>qwen-local</span><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>litellm_params:</span><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#b06000' }}>model:</span> ollama/qwen2.5:0.5b<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#b06000' }}>api_base:</span> http://127.0.0.1:11434<br/>
        &nbsp;&nbsp;- <span style={{ color: '#1a73e8' }}>model_name:</span> <span style={{ color: '#188038' }}>smollm-local</span><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>litellm_params:</span><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#b06000' }}>model:</span> ollama/smollm2:135m<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#b06000' }}>api_base:</span> http://127.0.0.1:11434<br/>
        &nbsp;&nbsp;- <span style={{ color: '#1a73e8' }}>model_name:</span> <span style={{ color: '#188038' }}>kserve-qwen</span> <span style={{ color: '#5f6368' }}># Connected in Stage 3!</span><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>litellm_params:</span><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#b06000' }}>model:</span> openai/kserve-qwen<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#b06000' }}>api_base:</span> http://127.0.0.1:80/v1<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#b06000' }}>headers:</span> &#123; <span style={{ color: '#188038' }}>"Host":</span> "kserve-qwen-kserve-test.127.0.0.1.nip.io" &#125;</code>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="The Virtual Model Abstraction" color="yellow">
        <div className="card tone-yellow">
          <b>Client Decoupling</b>
          <p style={{ margin: '1mm 0', fontSize: '7.2pt' }}>
            Applications target <code>model: "qwen-local"</code>.
            The client has zero awareness of whether Qwen is hosted on local Ollama, on a remote Kubernetes cluster via KServe, or in cloud infrastructure.
            In Stage 3, we attached <code>kserve-qwen</code> to LiteLLM without modifying client code.
          </p>
        </div>
      </Section>

      <Section title="Header Rewriting for Ingress" color="blue">
        <div className="card tone-blue">
          <b>Virtual Host Routing</b>
          <p style={{ margin: '1mm 0', fontSize: '7.2pt' }}>
            Routing into Kubernetes Ingress requires exact HTTP Host headers.
            Our KinD cluster maps port 80 to Ingress-NGINX.
            LiteLLM's <code>headers</code> dictionary injects <code>Host: kserve-qwen-kserve-test.127.0.0.1.nip.io</code> into every upstream HTTP packet automatically.
          </p>
        </div>
      </Section>
    </div>

    <Callout tone="yellow">
      <b>Live Inotify Hot Reloading:</b> LiteLLM watches <code>config.yaml</code> for filesystem modifications via Linux <code>inotify</code>. New model aliases, fallback rules, and timeout policies take effect dynamically without restarting the gateway process.
    </Callout>
  </Page>
);

export const VirtualKeysAndRBAC = () => (
  <Page tone="yellow" running="Part 7 · Virtual Keys &amp; Governance" part="Part 7">
    <div className="kicker">Multi-Tenancy &amp; Key Governance</div>
    <h1 className="big">Virtual API Keys &amp; Role-Based Access Control (RBAC)</h1>
    <p className="lead">
      In multi-tenant enterprise architectures, distributing raw backend credentials is an operational vulnerability.
      LiteLLM introduces <strong>Virtual API Keys</strong> stored in PostgreSQL, offering token-level access limits,
      financial quotas, rate limit ceilings, and instant revocation.
    </p>

    <Section title="Virtual Key Provisioning API (POST /key/generate)" color="yellow" className="mt-s">
      <div className="code-box" style={{ fontSize: '7pt', padding: '1.5mm' }}>
        <code>curl -X POST http://localhost:4000/key/generate \<br/>
        &nbsp;&nbsp;-H "Authorization: Bearer $LITELLM_MASTER_KEY" \<br/>
        &nbsp;&nbsp;-d '&#123;<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>"models":</span> ["qwen-local", "kserve-qwen"],<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>"max_budget":</span> 100.00,<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>"duration":</span> "30d",<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>"team_id":</span> "fraud-detection-team",<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>"tpm_limit":</span> 50000,<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>"rpm_limit":</span> 120<br/>
        &nbsp;&nbsp;&#125;'</code>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="Virtual Key Enforcement Pipeline" color="yellow">
        <div className="card tone-yellow">
          <b>Key Validation Lifecycle</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.2pt' }}>
            <li><b>1. Constant-Time Hash Lookup:</b> Incoming Bearer keys are hashed via SHA-256 and matched against in-memory caches to prevent timing attacks.</li>
            <li><b>2. Model Whitelisting:</b> Verifies the key has explicit permission to query the requested model alias.</li>
            <li><b>3. Spend Enforcement:</b> Compares accumulated token expenditure against <code>max_budget</code>. Rejects calls with HTTP 400 once budget is depleted.</li>
          </ul>
        </div>
      </Section>

      <Section title="Multi-Team Isolation & Auditability" color="blue">
        <div className="card tone-blue">
          <b>Enterprise Governance Boundary</b>
          <p style={{ margin: '1mm 0', fontSize: '7.2pt' }}>
            Virtual keys bind requests to logical cost centers. Team A cannot exhaust compute allocations assigned to Team B.
            Compromised credentials can be revoked immediately via <code>POST /key/delete</code> without requiring any changes to underlying model serving pods.
          </p>
        </div>
      </Section>
    </div>

    <Callout tone="yellow">
      <b>Master Key Security:</b> The gateway master key (<code>sk-stage2-master</code>) is strictly restricted to administrative control planes (/key/generate, /health, /spend), while microservices use scoped virtual keys with strictly bounded permissions.
    </Callout>
  </Page>
);

export const RateLimitingAlgorithms = () => (
  <Page tone="yellow" running="Part 7 · Rate Limiting Mechanics" part="Part 7">
    <div className="kicker">Rate Limiting Algorithms &amp; Traffic Shaping</div>
    <h1 className="big">Rate Limiting Mechanics: RPM, TPM, and Token Buckets</h1>
    <p className="lead">
      Standard HTTP rate limiters govern Requests Per Minute (RPM). In generative AI, RPM alone is completely insufficient:
      a single request with a 32k-token prompt consumes orders of magnitude more compute and KV memory than twenty 10-token queries.
      Gateways must enforce dual <strong>RPM and TPM (Tokens Per Minute)</strong> limiters.
    </p>

    <Section title="Distributed Dual Token Bucket Architecture" color="yellow" className="mt-s">
      <div className="grid2">
        <div className="card tone-blue">
          <b style={{ color: '#1a73e8' }}>1. Requests Per Minute (RPM) Bucket</b>
          <div className="code-box" style={{ fontSize: '6.8pt', margin: '1mm 0', padding: '1mm' }}>
            <code>Capacity = Max RPM &bull; Leak Rate = RPM / 60s</code>
          </div>
          <p style={{ margin: 0, fontSize: '7.1pt' }}>
            Decrements 1 unit per incoming HTTP call. Protects HTTP connection pool limits and network socket descriptors from saturation.
          </p>
        </div>

        <div className="card tone-yellow">
          <b style={{ color: '#b06000' }}>2. Tokens Per Minute (TPM) Bucket</b>
          <div className="code-box" style={{ fontSize: '6.8pt', margin: '1mm 0', padding: '1mm' }}>
            <code>Estimated tokens reserved on ingress &bull; Reconciled</code>
          </div>
          <p style={{ margin: 0, fontSize: '7.1pt' }}>
            Decrements by exact (Prompt + Completion) token counts. Protects GPU/CPU compute execution pipelines and KV cache allocations.
          </p>
        </div>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="The Admission Estimation Challenge" color="yellow">
        <div className="card tone-yellow">
          <b>Pre-Generation Reservation</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.2pt' }}>
            <li><b>Heuristic Tokenizer:</b> Fast offline tokenizers estimate prompt length (<code>len(text)/4</code>) in under 1ms.</li>
            <li><b>Headroom Reservation:</b> Temporarily reserves (Prompt Tokens + max_tokens) against the TPM bucket quota.</li>
            <li><b>Reconciliation:</b> When token decode completes, unused reserved capacity is refunded immediately to the tenant bucket.</li>
          </ul>
        </div>
      </Section>

      <Section title="RFC 6585 HTTP 429 Semantics" color="red">
        <div className="card tone-red">
          <b>Standardized Backpressure Headers</b>
          <div className="code-box" style={{ fontSize: '6.5pt', margin: '1mm 0', padding: '1mm' }}>
            <code>HTTP/1.1 429 Too Many Requests<br/>
            x-ratelimit-limit-rpm: 60<br/>
            x-ratelimit-remaining-rpm: 0<br/>
            x-ratelimit-limit-tpm: 100000<br/>
            retry-after: 12.4s</code>
          </div>
          <p style={{ margin: '1mm 0 0', fontSize: '7.1pt' }}>
            Client SDKs inspect <code>retry-after</code> to apply exponential backoff with full jitter instead of blind retries.
          </p>
        </div>
      </Section>
    </div>

    <Callout tone="yellow">
      <b>Stage 2 Empirical Test:</b> Under a 10 RPM test key limit, dispatching 15 concurrent curl requests triggered clean HTTP 429 responses on requests 11–15, with zero crashes or CPU saturation on the underlying Ollama daemon!
    </Callout>
  </Page>
);

export const CostTrackingAndPostgres = () => (
  <Page tone="yellow" running="Part 7 · Cost Tracking &amp; PostgreSQL" part="Part 7">
    <div className="kicker">Cost Accounting &amp; Financial Governance</div>
    <h1 className="big">Cost Accounting &amp; Financial Governance: The PostgreSQL Schema</h1>
    <p className="lead">
      Uncontrolled LLM usage can rapidly cause enterprise budget overruns.
      Stage 2 couples LiteLLM with a dedicated <strong>PostgreSQL database</strong> to persist audit logs,
      track spend per team, and record token costs for corporate chargeback accounting.
    </p>

    <Section title="Audit Table Schema: LiteLLM_SpendLogs" color="yellow" className="mt-s">
      <div className="code-box" style={{ fontSize: '7pt', padding: '1.5mm' }}>
        <code><span style={{ color: '#8430ce' }}>CREATE TABLE</span> "LiteLLM_SpendLogs" (<br/>
        &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>request_id</span> VARCHAR(64) PRIMARY KEY,<br/>
        &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>api_key</span> VARCHAR(64) NOT NULL REFERENCES "LiteLLM_VerificationToken"(token),<br/>
        &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>model</span> VARCHAR(64) NOT NULL,<br/>
        &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>prompt_tokens</span> INTEGER NOT NULL,<br/>
        &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>completion_tokens</span> INTEGER NOT NULL,<br/>
        &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>spend</span> NUMERIC(12, 8) NOT NULL,<br/>
        &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>user</span> VARCHAR(64),<br/>
        &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>team_id</span> VARCHAR(64),<br/>
        &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>start_time</span> TIMESTAMP WITH TIME ZONE,<br/>
        &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>end_time</span> TIMESTAMP WITH TIME ZONE<br/>
        );</code>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="Cost Calculation Engine" color="yellow">
        <div className="card tone-yellow">
          <b>Pricing Formula</b>
          <div className="code-box" style={{ fontSize: '6.8pt', margin: '1mm 0', padding: '1mm' }}>
            <code>Cost = (Prompt &times; Price_in) + (Comp &times; Price_out)</code>
          </div>
          <p style={{ margin: '1mm 0 0', fontSize: '7.1pt' }}>
            For cloud engines, pricing syncs automatically with community tables. For local clusters (Ollama/KServe), spend maps to internal amortized hardware costs (e.g. $0.0002 / 1k tokens).
          </p>
        </div>
      </Section>

      <Section title="Lab PostgreSQL Architecture" color="blue">
        <div className="card tone-blue">
          <b>Asynchronous Ingestion on Port 54329</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.2pt' }}>
            <li><b>asyncpg Connection Pool:</b> LiteLLM maintains non-blocking connection pools.</li>
            <li><b>Decoupled Persistence:</b> Database writes happen in background asyncio tasks, adding 0ms delay to the client stream.</li>
            <li><b>Direct Grafana Integration:</b> Connects to Grafana for executive chargeback dashboards.</li>
          </ul>
        </div>
      </Section>
    </div>

    <Callout tone="yellow">
      <b>Spend Alerting:</b> LiteLLM supports webhook callbacks (Slack, PagerDuty). When a business unit crosses 80% of its monthly quota, platform engineering is notified before automated throttling takes effect.
    </Callout>
  </Page>
);

export const FailoverAndRouting = () => (
  <Page tone="yellow" running="Part 7 · Fallback &amp; Failover Mechanics" part="Part 7">
    <div className="kicker">High Availability &amp; Automatic Failover</div>
    <h1 className="big">Fallback Routing &amp; Automatic Failover Mechanics</h1>
    <p className="lead">
      Model outages are common in production: upstream hosts return HTTP 503, provider quotas are exhausted, or an inference worker crashes under OOM.
      An enterprise AI gateway must provide <strong>seamless automatic failover</strong> across alternative targets.
    </p>

    <Section title="Automatic Failover State Machine" color="yellow" className="mt-s">
      <div className="grid3">
        <div className="card tone-red">
          <b style={{ color: '#d93025' }}>Primary Target: Local Ollama</b>
          <div className="fine" style={{ marginTop: '1mm' }}>qwen2.5:0.5b (127.0.0.1:11434)</div>
          <div className="badge" style={{ background: '#fce8e6', color: '#c5221f', marginTop: '1mm' }}>
            FAILS (503 / Timeout)
          </div>
          <p style={{ margin: '1mm 0 0', fontSize: '6.8pt' }}>Gateway catches error before first token.</p>
        </div>

        <div className="card tone-green">
          <b style={{ color: '#188038' }}>Fallback Target: KServe Pod</b>
          <div className="fine" style={{ marginTop: '1mm' }}>kserve-qwen (ha-cluster)</div>
          <div className="badge" style={{ background: '#e6f4ea', color: '#137333', marginTop: '1mm' }}>
            SUCCEEDS (200 OK Stream)
          </div>
          <p style={{ margin: '1mm 0 0', fontSize: '6.8pt' }}>Rerouted in under 120ms latency delta.</p>
        </div>

        <div className="card tone-blue">
          <b style={{ color: '#1a73e8' }}>Secondary Target: Cloud Provider</b>
          <div className="fine" style={{ marginTop: '1mm' }}>AWS Bedrock / Azure OpenAI</div>
          <div className="badge" style={{ background: '#e8f0fe', color: '#1a73e8', marginTop: '1mm' }}>
            STANDBY RESERVOIR
          </div>
          <p style={{ margin: '1mm 0 0', fontSize: '6.8pt' }}>Ultimate fallback safety net.</p>
        </div>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="Declarative Fallback Configuration" color="yellow">
        <div className="card tone-yellow">
          <b>Router Policy (config.yaml)</b>
          <div className="code-box" style={{ fontSize: '6.8pt', margin: '1mm 0', padding: '1mm' }}>
            <code><span style={{ color: '#8430ce' }}>router_settings:</span><br/>
            &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>fallbacks:</span><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;- &#123; <span style={{ color: '#b06000' }}>"qwen-local":</span> ["kserve-qwen", "smollm-local"] &#125;<br/>
            &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>context_window_fallbacks:</span><br/>
            &nbsp;&nbsp;&nbsp;&nbsp;- &#123; <span style={{ color: '#b06000' }}>"qwen-local":</span> ["qwen-32k"] &#125;<br/>
            &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>allowed_fails:</span> 3<br/>
            &nbsp;&nbsp;<span style={{ color: '#1a73e8' }}>cooldown_time:</span> 30</code>
          </div>
        </div>
      </Section>

      <Section title="Client-Transparent Error Recovery" color="blue">
        <div className="card tone-blue">
          <b>Zero Downstream Disruption</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.2pt' }}>
            <li><b>Pre-Stream Interception:</b> If the primary target fails prior to emitting the first HTTP byte, LiteLLM catches the failure cleanly.</li>
            <li><b>Payload Replay:</b> It dispatches the original prompt payload to the secondary target instantly.</li>
            <li><b>Transparent 200 OK:</b> The downstream client receives a valid SSE stream, experiencing only a minor TTFT delay instead of a connection abort.</li>
          </ul>
        </div>
      </Section>
    </div>

    <Callout tone="yellow">
      <b>Context Window Fallback:</b> When an incoming request exceeds the 2,048 token limit of <code>qwen-local</code>, LiteLLM automatically diverts the prompt to a large-window alias instead of throwing an unrecoverable input size error!
    </Callout>
  </Page>
);

export const CircuitBreaking = () => (
  <Page tone="yellow" running="Part 7 · Circuit Breaking &amp; Timeouts" part="Part 7">
    <div className="kicker">Circuit Breaking &amp; Resilient Timeouts</div>
    <h1 className="big">Circuit Breaking, Backpressure &amp; Timeout Engineering</h1>
    <p className="lead">
      When an inference node stalls due to swap thrashing or worker deadlocks, failing to fast-fail triggers
      a <strong>cascading collapse</strong>: hundreds of pending requests pile up in gateway buffers, exhausting socket descriptors and host RAM.
    </p>

    <div className="grid2 mt-s">
      <Section title="Circuit Breaker State Machine" color="yellow">
        <div className="card tone-yellow">
          <b>Health Transition Model</b>
          <div style={{ fontSize: '7.1pt', marginTop: '1mm' }}>
            <div style={{ marginBottom: '1.5mm', padding: '1mm', background: '#e6f4ea', borderRadius: '1mm' }}>
              <b style={{ color: '#137333' }}>CLOSED (Healthy):</b>
              <p style={{ margin: 0 }}>All traffic forwarded normally. Failure counter resets on success.</p>
            </div>
            <div style={{ marginBottom: '1.5mm', padding: '1mm', background: '#fce8e6', borderRadius: '1mm' }}>
              <b style={{ color: '#c5221f' }}>OPEN (Tripped):</b>
              <p style={{ margin: 0 }}>Triggered after 3 consecutive errors. Endpoint isolated for 30s cooldown; requests fast-fail or divert immediately.</p>
            </div>
            <div style={{ padding: '1mm', background: '#fef7e0', borderRadius: '1mm' }}>
              <b style={{ color: '#b06000' }}>HALF-OPEN (Canary Probe):</b>
              <p style={{ margin: 0 }}>Passes a single test request through. Success transitions breaker back to CLOSED.</p>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Multi-Tiered Timeout Architecture" color="blue">
        <div className="card tone-blue">
          <b>Defensive Latency Budgets</b>
          <div style={{ fontSize: '7.1pt', marginTop: '1mm' }}>
            <div style={{ borderBottom: '0.2mm solid #e8eaed', paddingBottom: '1mm', marginBottom: '1mm' }}>
              <b style={{ color: '#1a73e8' }}>1. Connect Timeout (1.5s):</b>
              <p style={{ margin: 0 }}>Aborts if TCP handshake to the inference backend does not complete.</p>
            </div>
            <div style={{ borderBottom: '0.2mm solid #e8eaed', paddingBottom: '1mm', marginBottom: '1mm' }}>
              <b style={{ color: '#b06000' }}>2. TTFT Header Timeout (10s):</b>
              <p style={{ margin: 0 }}>Aborts if prefill execution fails to emit the first byte within 10 seconds.</p>
            </div>
            <div>
              <b style={{ color: '#d93025' }}>3. Total Stream Timeout (60s):</b>
              <p style={{ margin: 0 }}>Hard ceiling preventing infinite runaway autoregressive decoding loops.</p>
            </div>
          </div>
        </div>
      </Section>
    </div>

    <Section title="Stage 3 Fault Injection Verification" color="red" className="mt-s">
      <div className="card tone-red">
        <b>Empirical Failure Injection: <code>X-Simulate-Failure: 503</code></b>
        <p style={{ margin: '1mm 0', fontSize: '7.2pt' }}>
          In our Stage 3 verification test suite, passing simulated fault headers caused the KServe pod to emit HTTP 503.
          LiteLLM caught the upstream error immediately, incremented the circuit breaker failure counter, and returned a standardized JSON error envelope without hanging client sockets or leaking socket descriptors.
        </p>
      </div>
    </Section>

    <Callout tone="yellow">
      <b>Backpressure Preservation:</b> Setting strict timeouts at the gateway layer ensures that under heavy load, backpressure is pushed to client callers rather than overwhelming the inference cluster.
    </Callout>
  </Page>
);

export const WireCaptureProtocolNormalization = () => (
  <Page tone="yellow" running="Part 7 · Protocol Normalization" part="Part 7">
    <div className="kicker">Protocol Normalization &amp; Wire Captures</div>
    <h1 className="big">Wire Capture: How LiteLLM Normalizes Upstream Streams</h1>
    <p className="lead">
      Different model runtimes emit wildly different streaming schemas.
      LiteLLM ingests vendor-specific streaming packets (such as Ollama NDJSON or Triton binary buffers)
      and normalizes them into standard OpenAI Server-Sent Events (SSE).
    </p>

    <Section title="Wire Packet Transformation: Upstream vs Downstream" color="yellow" className="mt-s">
      <div className="grid2">
        <div className="card tone-yellow">
          <b style={{ color: '#b06000' }}>Upstream Ollama Packet (Inbound NDJSON)</b>
          <div className="code-box" style={{ fontSize: '6.5pt', margin: '1mm 0', padding: '1mm' }}>
            <code>HTTP/1.1 200 OK<br/>
            Content-Type: application/x-ndjson<br/>
            Transfer-Encoding: chunked<br/><br/>
            &#123;"model":"qwen2.5:0.5b",<br/>
            &nbsp;"created_at":"2026-10-11T12:00:00Z",<br/>
            &nbsp;"message":&#123;"role":"assistant", "content":" distributed"&#125;,<br/>
            &nbsp;"done":false&#125;</code>
          </div>
        </div>

        <div className="card tone-green">
          <b style={{ color: '#188038' }}>Downstream LiteLLM Packet (Outbound SSE)</b>
          <div className="code-box" style={{ fontSize: '6.5pt', margin: '1mm 0', padding: '1mm' }}>
            <code>HTTP/1.1 200 OK<br/>
            Content-Type: text/event-stream<br/>
            Cache-Control: no-cache<br/><br/>
            data: &#123;"id":"chatcmpl-9b88e1a7",<br/>
            &nbsp;"model":"qwen-local",<br/>
            &nbsp;"choices":[&#123;"index":0,<br/>
            &nbsp;&nbsp;"delta":&#123;"content":" distributed"&#125;&#125;]&#125;\n\n</code>
          </div>
        </div>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="Field Normalization Mechanics" color="yellow">
        <div className="card tone-yellow">
          <b>Schema Mapping</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.2pt' }}>
            <li><b>Model Renaming:</b> Upstream <code>qwen2.5:0.5b</code> is remapped to the requested virtual alias <code>qwen-local</code>.</li>
            <li><b>Delta Wrapping:</b> Translates flat <code>message.content</code> into standard OpenAI <code>choices[0].delta.content</code>.</li>
            <li><b>UUID Ingestion:</b> Injects a uniform <code>chatcmpl-</code> identifier for end-to-end distributed tracing across logs.</li>
          </ul>
        </div>
      </Section>

      <Section title="Stream Termination Protocol" color="blue">
        <div className="card tone-blue">
          <b>Completion Handling</b>
          <ul className="meta-list" style={{ marginTop: '1mm', fontSize: '7.2pt' }}>
            <li><b>Metric Harvesting:</b> When Ollama sends <code>done: true</code>, LiteLLM intercepts <code>eval_duration</code> and commits it to PostgreSQL.</li>
            <li><b>Standard Termination:</b> Emits the standard OpenAI sentinel frame: <code>data: [DONE]\n\n</code>.</li>
            <li><b>Clean Socket Closure:</b> Terminates chunked HTTP transport smoothly.</li>
          </ul>
        </div>
      </Section>
    </div>

    <Callout tone="yellow">
      <b>Normalization Overhead:</b> In our profiling, protocol parsing and JSON serialization in LiteLLM adds merely <strong>1.2ms to 2.8ms</strong> of gateway latency—virtually unnoticeable compared to token decode intervals.
    </Callout>
  </Page>
);

export const Stage2HardeningPlaybook = () => (
  <Page tone="yellow" running="Part 7 · Production Gateway Hardening" part="Part 7">
    <div className="kicker">Production Hardening &amp; Gateway SRE</div>
    <h1 className="big">Production Gateway Hardening: Security, SRE &amp; Checklists</h1>
    <p className="lead">
      Deploying LiteLLM in high-stakes enterprise environments requires rigorous operational hardening.
      Below is the production deployment checklist derived from core banking and distributed systems operations.
    </p>

    <Section title="Production Gateway Checklist" color="yellow" className="mt-s">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5mm' }}>
        <div className="card tone-green" style={{ padding: '2mm 3mm' }}>
          <b style={{ color: '#188038', fontSize: '7.5pt' }}>SECURITY: Disable Admin UI &amp; Rotate Secrets</b>
          <p style={{ margin: '0.5mm 0 0', fontSize: '7pt' }}>
            Set <code>DISABLE_ADMIN_UI=true</code>. Never deploy with default master keys. Store master keys in Kubernetes Secrets or HashiCorp Vault, mounted as runtime environment variables.
          </p>
        </div>

        <div className="card tone-blue" style={{ padding: '2mm 3mm' }}>
          <b style={{ color: '#1a73e8', fontSize: '7.5pt' }}>NETWORKING: Persistent Keep-Alive Connection Pooling</b>
          <p style={{ margin: '0.5mm 0 0', fontSize: '7pt' }}>
            Avoid opening fresh TCP sockets per query. Configure <code>HTTPX_MAX_CONNECTIONS=1000</code> and <code>HTTPX_MAX_KEEPALIVE_CONNECTIONS=500</code> to prevent local ephemeral port starvation.
          </p>
        </div>

        <div className="card tone-yellow" style={{ padding: '2mm 3mm' }}>
          <b style={{ color: '#b06000', fontSize: '7.5pt' }}>DATABASE: PgBouncer Connection Pooling</b>
          <p style={{ margin: '0.5mm 0 0', fontSize: '7pt' }}>
            Multiple gateway pods opening 50 DB connections each will rapidly exhaust PostgreSQL limits during autoscaling spikes. Interpose PgBouncer in transaction pooling mode between gateway and database.
          </p>
        </div>

        <div className="card tone-red" style={{ padding: '2mm 3mm' }}>
          <b style={{ color: '#d93025', fontSize: '7.5pt' }}>RELIABILITY: Enforce Global Prompt Truncation</b>
          <p style={{ margin: '0.5mm 0 0', fontSize: '7pt' }}>
            Protect downstream GPU nodes from malicious 100k-token payloads by enforcing <code>max_input_tokens: 4096</code> globally in <code>general_settings</code>.
          </p>
        </div>
      </div>
    </Section>

    <Callout tone="green">
      <b>Transition to Stage 3:</b> Stage 2 establishes centralized security, routing, and cost control.
      However, backends were still hosted statically. To achieve <strong>declarative scaling, automated health probes, dynamic traffic splitting, and containerized orchestration</strong>,
      we advance to Stage 3: deploying model workloads on Kubernetes with <strong>KServe</strong>.
    </Callout>
  </Page>
);
