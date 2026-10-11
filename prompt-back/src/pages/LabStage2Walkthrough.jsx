import React from 'react';
import { Page, PartHero, Callout, Term, Section } from '../components/ui.jsx';

export function LabStage2Page1() {
  return (
    <Page tone="yellow" running="Hands-On Lab · Stage 2 LiteLLM Gateway & Database Topology" part="Lab 2.1">
      <PartHero
        n="★"
        kicker="Hands-On Lab · Stage 2 Architecture"
        title="Inside /home/ramum/model-serving/stage2: The AI Gateway"
        lead="Placing LiteLLM between client applications and model backends to enforce authentication, virtual routing, retries, and PostgreSQL audit logging."
      />

      <Section title="The Stage 2 Topology: LiteLLM + PostgreSQL on WSL2" color="yellow">
        <div className="grid3">
          <div className="card tone-blue">
            <b>1. Client Layer</b>
            <p>
              <code>stage2-client</code> (Go binary) or <code>curl</code> sending OpenAI-compliant POST requests with
              <code>Authorization: Bearer sk-stage2-lab</code> to port 4000.
            </p>
          </div>
          <div className="card tone-yellow">
            <b>2. LiteLLM Proxy (:4000)</b>
            <p>
              Docker container running on <code>network_mode: host</code>. Decouples client authentication from backend servers,
              rewriting model aliases on-the-fly.
            </p>
          </div>
          <div className="card tone-green">
            <b>3. PostgreSQL 16 (:54329)</b>
            <p>
              Containerized database storing API keys, team budgets, and append-only audit spend logs for every inference request.
            </p>
          </div>
        </div>
      </Section>

      <div className="grid2 mt-s">
        <Section title="Docker Compose Specification (docker-compose.yml)" color="yellow">
          <Term
            title="yaml · /home/ramum/model-serving/stage2/docker-compose.yml"
            code={`services:
  stage2-litellm:
    image: ghcr.io/berriai/litellm:main-latest
    network_mode: host
    environment:
      - DATABASE_URL=postgresql://litellm:litellm@127.0.0.1:54329/litellm
      - LITELLM_MASTER_KEY=sk-stage2-lab
      - LITELLM_SALT_KEY=sk-stage2-salt
    volumes:
      - ./config.yaml:/app/config.yaml:ro
    command: ["--config", "/app/config.yaml", "--port", "4000"]
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://localhost:4000/health/liveliness || exit 1"]

  stage2-postgres:
    image: postgres:16-alpine
    ports: ["127.0.0.1:54329:5432"]
    environment: [POSTGRES_DB=litellm, POSTGRES_USER=litellm, POSTGRES_PASSWORD=litellm]`}
          />
          <p className="fine">
            Notice the host networking mode: enables LiteLLM to access host Ollama (<code>127.0.0.1:11434</code>) and
            Kubernetes Ingress (<code>127.0.0.1:80</code>) directly without container bridge NAT hops.
          </p>
        </Section>

        <Section title="Environment & Health Verification" color="yellow">
          <Term
            title="bash · Verifying Gateway Liveliness"
            code={`$ docker compose up -d
[+] Running 2/2
 ✔ Container stage2-postgres  Healthy
 ✔ Container stage2-litellm   Healthy

$ curl -s http://localhost:4000/health/liveliness
I'm alive!

$ docker exec stage2-postgres psql -U litellm -d litellm -c "\\dt"
List of relations:
  public | LiteLLM_SpendLogs         | table
  public | LiteLLM_VerificationToken | table`}
          />
          <p className="fine">
            On initial boot, LiteLLM applies automated Prisma database migrations against PostgreSQL on port 54329.
            The healthcheck verifies that both HTTP routers and database connection pools are operational.
          </p>
        </Section>
      </div>

      <Callout title="Why the API Gateway is Essential" tone="yellow" className="mt-s">
        In banking and enterprise microservices, client microservices must never hold credentials to underlying GPU providers.
        LiteLLM guarantees that backend endpoints, provider master secrets, and network topologies remain completely abstract.
      </Callout>
    </Page>
  );
}

export function LabStage2Page2() {
  return (
    <Page tone="yellow" running="Hands-On Lab · Stage 2 Declarative Routing Table" part="Lab 2.2">
      <PartHero
        n="★"
        kicker="Hands-On Lab · Stage 2 Routing"
        title="Declarative Routing: Aliases, Fallbacks & Down Targets"
        lead="Dissecting /home/ramum/model-serving/stage2/config.yaml: How LiteLLM routes client aliases across local Ollama daemons, Kubernetes Ingress, and simulated dead endpoints."
      />

      <Section title="The Production Routing Table Matrix" color="yellow">
        <table className="tbl compact">
          <thead>
            <tr>
              <th>Client Model Alias</th>
              <th>Backend Provider &amp; Model</th>
              <th>Target URL</th>
              <th>Rate Limit</th>
              <th>Operational Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>demo-model</code></td>
              <td><code>ollama_chat/qwen2.5:0.5b</code></td>
              <td><code>http://127.0.0.1:11434</code></td>
              <td>120 RPM</td>
              <td>Primary lab conversational model</td>
            </tr>
            <tr>
              <td><code>qwen</code></td>
              <td><code>ollama_chat/qwen2.5:0.5b</code></td>
              <td><code>http://127.0.0.1:11434</code></td>
              <td>120 RPM</td>
              <td>Secondary alias pointing to same weights</td>
            </tr>
            <tr>
              <td><code>smollm</code></td>
              <td><code>ollama_chat/smollm2:135m</code></td>
              <td><code>http://127.0.0.1:11434</code></td>
              <td>120 RPM</td>
              <td>Ultra-compact 135M comparison model</td>
            </tr>
            <tr>
              <td><code>kserve-qwen</code></td>
              <td><code>openai/kserve-qwen</code></td>
              <td><code>http://127.0.0.1:80/v1</code></td>
              <td>120 RPM</td>
              <td>Stage 3 Kubernetes InferenceService (NGINX Ingress)</td>
            </tr>
            <tr>
              <td><code>backend-down</code></td>
              <td><code>ollama_chat/qwen2.5:0.5b</code></td>
              <td><code>http://127.0.0.1:9</code></td>
              <td>60 RPM</td>
              <td>Dead port for demonstrating fast failure (2s timeout)</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <div className="grid2 mt-s">
        <Section title="config.yaml Routing Block (stage2/config.yaml)" color="yellow">
          <Term
            title="yaml · /home/ramum/model-serving/stage2/config.yaml"
            code={`model_list:
  - model_name: demo-model
    litellm_params:
      model: ollama_chat/qwen2.5:0.5b
      api_base: http://127.0.0.1:11434
      rpm: 120

  - model_name: kserve-qwen
    litellm_params:
      model: openai/kserve-qwen
      api_base: http://127.0.0.1:80/v1
      headers:
        Host: kserve-qwen-kserve-test.127.0.0.1.nip.io

  - model_name: backend-down
    litellm_params:
      model: ollama_chat/qwen2.5:0.5b
      api_base: http://127.0.0.1:9
      timeout: 2.0
      rpm: 60`}
          />
          <p className="fine">
            Notice the <code>ollama_chat/</code> prefix: instructs LiteLLM to format calls specifically for Ollama&rsquo;s
            <code>/api/chat</code> endpoint, stripping unsupported parameters via <code>drop_params: true</code>.
          </p>
        </Section>

        <Section title="Router Resilience Settings" color="yellow">
          <Term
            title="yaml · Global Gateway Safeguards"
            code={`router_settings:
  num_retries: 1
  timeout: 30.0
  disable_cooldowns: true  # Prevents failure demos from tripping live routes

general_settings:
  master_key: os.environ/LITELLM_MASTER_KEY
  database_url: os.environ/DATABASE_URL
  store_model_in_db: true

litellm_settings:
  drop_params: true        # Strips unsupported OpenAI parameters
  set_verbose: false`}
          />
          <p className="fine">
            <code>disable_cooldowns: true</code> is a critical setting for testing labs: prevents fault-injection calls
            against <code>backend-down</code> from placing healthy models into quarantine cooldown periods!
          </p>
        </Section>
      </div>

      <Callout title="Stage 3 Ingress Chaining" tone="yellow" className="mt-s">
        Observe how <code>kserve-qwen</code> forwards to host port 80 while injecting <code>Host: kserve-qwen-kserve-test.127.0.0.1.nip.io</code>.
        This seamlessly bridges Stage 2 with Stage 3 Kubernetes Ingress without touching client applications!
      </Callout>
    </Page>
  );
}

export function LabStage2Page3() {
  return (
    <Page tone="yellow" running="Hands-On Lab · Stage 2 Client Diagnostics & Telemetry" part="Lab 2.3">
      <PartHero
        n="★"
        kicker="Hands-On Lab · Stage 2 Client Telemetry"
        title="Client Diagnostics: Gateway Headers & Metrics"
        lead="Inside /home/ramum/model-serving/stage2/client: How our Go client measures gateway overhead, rate limits, and streaming throughput."
      />

      <Section title="Response Header Inspection (inspect=true)" color="yellow">
        <p>
          Every response emitted by the LiteLLM gateway contains deep telemetry headers inserted into the HTTP response stream:
        </p>
        <div className="grid2 mt-s">
          <Term
            title="http · Response Headers Capture"
            code={`HTTP/1.1 200 OK
content-type: text/event-stream; charset=utf-8
x-litellm-call-id: 9b88e1a7-5421-4d3f-91cb-72b22031a021
x-litellm-model-id: ollama-qwen-0.5b
x-litellm-model-api-base: http://127.0.0.1:11434
x-litellm-overhead-duration-ms: 2.45
x-litellm-response-duration-ms: 1840.12
x-litellm-attempted-retries: 0
x-ratelimit-limit-requests: 120
x-ratelimit-remaining-requests: 119`}
          />
          <div className="space-y-2 text-[8.5pt]">
            <div className="card tone-blue">
              <b>x-litellm-overhead-duration-ms: 2.45ms</b>
              <p>The exact time spent inside LiteLLM for auth verification, alias resolution, and rate limit decrementing.</p>
            </div>
            <div className="card tone-yellow">
              <b>x-litellm-model-api-base</b>
              <p>Reveals the physical backend route selected by the gateway for operational debugging.</p>
            </div>
            <div className="card tone-green">
              <b>x-ratelimit-remaining-requests</b>
              <p>Real-time Token Bucket remaining quota. Decrements on each incoming inference call.</p>
            </div>
          </div>
        </div>
      </Section>

      <div className="grid2 mt-s">
        <Section title="Comparing Models Concurrently (-compare)" color="yellow">
          <Term
            title="bash · ./stage2-client -compare -prompt 'What is a token?'"
            code={`$ ./stage2-client -compare -max-tokens 35 -prompt "What is a token?"

[Model: demo-model (Qwen 2.5 0.5B)]
Response: A token is a basic unit of text...
TTFT    : 198 ms
Decode  : 32.4 tok/s (35 tokens in 1,080 ms)

[Model: smollm (SmolLM2 135M)]
Response: In natural language processing, a token is...
TTFT    : 112 ms
Decode  : 68.2 tok/s (35 tokens in 513 ms)

Speedup : SmolLM2 is 2.1x faster with 72% lower TTFT!`}
          />
          <p className="fine">
            Our Go benchmark client fires identical prompts across multiple model routes through the same gateway,
            directly illustrating parameter size tradeoffs.
          </p>
        </Section>

        <Section title="Listing Gateway Models (-list-models)" color="yellow">
          <Term
            title="bash · ./stage2-client -list-models"
            code={`$ ./stage2-client -list-models
Active Models on http://localhost:4000/v1/models:
  - id: demo-model     (created: 1791720000, owned_by: litellm)
  - id: qwen           (created: 1791720000, owned_by: litellm)
  - id: smollm         (created: 1791720000, owned_by: litellm)
  - id: kserve-qwen    (created: 1791720000, owned_by: litellm)
  - id: backend-down   (created: 1791720000, owned_by: litellm)`}
          />
          <p className="fine">
            The OpenAI-standard <code>GET /v1/models</code> endpoint allows frontends (Open WebUI, LibreChat, Chatbot UI)
            to populate model dropdown menus automatically.
          </p>
        </Section>
      </div>

      <Callout title="Interactive Multi-Turn Sessions" tone="yellow" className="mt-s">
        Running <code>./stage2-client -interactive -model qwen</code> maintains conversation history in-memory,
        appending user prompts and assistant replies to the message array while streaming tokens at 32 tok/s.
      </Callout>
    </Page>
  );
}

export function LabStage2Page4() {
  return (
    <Page tone="yellow" running="Hands-On Lab · Stage 2 Failure Scenarios & PostgreSQL Audit" part="Lab 2.4">
      <PartHero
        n="★"
        kicker="Hands-On Lab · Stage 2 Resilience & Auditing"
        title="Live Chaos Testing & PostgreSQL Spend Logs"
        lead="Proving gateway defense: handling authentication rejections, unknown models, unreachable backends, and querying the PostgreSQL audit ledger."
      />

      <Section title="The Four Failure Scenarios (-failures)" color="yellow">
        <div className="grid2">
          <div className="card tone-red">
            <b>1. Missing Authorization Key &rarr; HTTP 401</b>
            <p>Request sent with no Bearer token. Gateway intercepts immediately in 0.8ms without touching backends: <code>&#123;"error": &#123;"message": "AuthenticationError: Missing API Key"&#125;&#125;</code>.</p>
          </div>
          <div className="card tone-red">
            <b>2. Invalid API Key &rarr; HTTP 401 / 403</b>
            <p>Request sent with <code>Bearer sk-invalid-token</code>. Cryptographic hash check against database fails. Access denied instantly.</p>
          </div>
          <div className="card tone-yellow">
            <b>3. Non-Existent Model Alias &rarr; HTTP 404</b>
            <p>Request asks for <code>model: non-existent-model</code>. Gateway returns: <code>&#123;"error": &#123;"message": "NotFoundError: Model does not exist in routing table"&#125;&#125;</code>.</p>
          </div>
          <div className="card tone-yellow">
            <b>4. Dead Backend Host (backend-down) &rarr; HTTP 408 / 503</b>
            <p>Request sent to <code>backend-down</code> (port 9). Gateway connects, hits 2.0s timeout, retries once, and returns structured 408/503 without socket freeze!</p>
          </div>
        </div>
      </Section>

      <div className="grid2 mt-s">
        <Section title="Running the Failure Test Suite" color="yellow">
          <Term
            title="bash · ./stage2-client -failures"
            code={`$ ./stage2-client -failures
[Test 1/4] Missing API Key:
  -> Got HTTP 401 Unauthorized (Expected)
[Test 2/4] Bad API Key (sk-wrong):
  -> Got HTTP 401 Unauthorized (Expected)
[Test 3/4] Unknown Model (ghost-model):
  -> Got HTTP 404 Not Found (Expected)
[Test 4/4] Dead Backend (backend-down):
  -> Connecting to 127.0.0.1:9...
  -> Timeout after 2.0s. Retrying...
  -> Got HTTP 408 Request Timeout (Expected)
[Test 5/5] Success Verification:
  -> demo-model responded with 200 OK!`}
          />
          <p className="fine">
            Demonstrates fail-fast resilience: client anomalies are intercepted at the perimeter, shielding model runtimes
            from malformed traffic and socket exhaustion.
          </p>
        </Section>

        <Section title="Querying PostgreSQL Spend Logs" color="yellow">
          <Term
            title="sql · psql -h 127.0.0.1 -p 54329 -U litellm -d litellm"
            code={`SELECT 
    request_id,
    model,
    prompt_tokens,
    completion_tokens,
    spend,
    start_time
FROM "LiteLLM_SpendLogs"
ORDER BY start_time DESC
LIMIT 3;

 request_id |   model    | p_tok | c_tok |   spend    
------------+------------+-------+-------+------------
 chatcmpl-1 | demo-model |    18 |    35 | 0.00000000 
 chatcmpl-2 | smollm     |    18 |    35 | 0.00000000 
 chatcmpl-3 | demo-model |    42 |    68 | 0.00000000 `}
          />
          <p className="fine">
            Every successful completion writes an immutable row into PostgreSQL. In enterprise deployments with commercial models,
            spend is computed based on token pricing and billed directly to internal cost centers!
          </p>
        </Section>
      </div>

      <Callout title="Gateway Conclusion" tone="yellow" className="mt-s">
        Stage 2 establishes complete governance: auth, routing, timeouts, and spend accounting.
        We now transition to <b>Stage 3</b> to orchestrate model serving declaratively on Kubernetes using KServe!
      </Callout>
    </Page>
  );
}
