import React from 'react'
import { Page, PartHero, Callout, Term, Section } from '../components/ui.jsx'

export default function LabStage1Profiling() {
  return (
    <Page tone="green" running="Hands-On Lab · Stage 1 Live Profiling & Benchmarks" part="Lab 2">
      <PartHero
        n="★"
        kicker="Hands-On Lab · Stage 1 Profiling"
        title="Live Benchmarks: Prefill vs Decode Cliff"
        lead="Physical proof of the two inference phases measured live on Qwen 2.5 0.5B: prompt evaluation saturated compute, while token generation starved on memory bandwidth."
      />

      <Section title="Live Metrics Captured by the Go Client" color="green">
        <div className="lab-metrics">
          <div className="lm-item tone-blue">
            <span className="lm-label">Time to First Token (TTFT)</span>
            <span className="lm-val">641 ms</span>
            <span className="lm-sub">Prompt Prefill (36 tokens in 603 ms)</span>
          </div>
          <div className="lm-item tone-yellow">
            <span className="lm-label">Prompt Prefill Speed</span>
            <span className="lm-val">59.7 tok/s</span>
            <span className="lm-sub">Parallel GEMM matrix multiplication</span>
          </div>
          <div className="lm-item tone-green">
            <span className="lm-label">Token Generation Speed</span>
            <span className="lm-val">7.5–16.5 tok/s</span>
            <span className="lm-sub">Sequential memory pass per token</span>
          </div>
        </div>
      </Section>

      <div className="grid2 mt-s">
        <Section title="Unary vs Streaming: Latency Perception" color="green">
          <table className="tbl compact">
            <thead>
              <tr>
                <th>Mode</th>
                <th>TTFT</th>
                <th>Total Latency</th>
                <th>User Experience</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Unary (Buffered)</b></td>
                <td><code>2,751 ms</code></td>
                <td><code>2,751 ms</code></td>
                <td>User waits 2.75s in silence before seeing any text.</td>
              </tr>
              <tr>
                <td><b>Streaming (NDJSON)</b></td>
                <td><code>641 ms</code></td>
                <td><code>5,720 ms</code></td>
                <td>User reads first word in 0.64s while remaining tokens stream smoothly.</td>
              </tr>
              <tr>
                <td><b>OpenAI SSE</b></td>
                <td><code>603 ms</code></td>
                <td><code>9,540 ms</code></td>
                <td>Zero perceptible lag; stream flows token-by-token over SSE events.</td>
              </tr>
            </tbody>
          </table>
          <p className="fine" style={{ marginTop: '1.5mm' }}>
            Streaming does not make the overall generation faster—in fact, total wall-clock time can be longer due to
            chunk serialization overhead. However, it cuts <b>perceived latency (TTFT) by over 4x</b>.
          </p>
        </Section>

        <Section title="Commands to Verify on Your Own System" color="green">
          <Term
            title="bash · /home/ramum/model-serving/stage1"
            code={`# 1. Run streaming chat with live metrics
$ ./stage1-client -endpoint chat -stream=true \\
    -prompt "Explain Kubernetes in one sentence."

# 2. Run unary non-streaming to contrast TTFT
$ ./stage1-client -endpoint chat -stream=false \\
    -prompt "What is a neural network in 10 words?"

# 3. Test OpenAI SSE stream (/v1/chat/completions)
$ ./stage1-client -endpoint openai -stream=true \\
    -prompt "Name three planets in our solar system."

# 4. Run curl inspection demo across all endpoints
$ ./curl_demo.sh qwen2.5:0.5b`}
          />
        </Section>
      </div>

      <Section title="The Hardware Reality Behind the Numbers" color="accent" className="mt-s">
        <div className="grid2">
          <div className="card tone-blue">
            <b>1. The Prefill Phase (603 ms · 59.7 tok/s)</b>
            <p>
              The model ingested all 36 tokens of the prompt in parallel. Because all $Q \times K^T$ dot products
              were computed in batch, matrix multiplication (GEMM) achieved high arithmetic intensity, utilizing the
              CPU&rsquo;s vector ALUs (AVX2) with high arithmetic efficiency.
            </p>
          </div>
          <div className="card tone-red">
            <b>2. The Decode Phase (5.08 s · 7.48 tok/s)</b>
            <p>
              To produce each new word, the runtime had to fetch all 491 MB of model weights from main memory across
              the memory bus, perform vector-matrix multiplication for exactly <i>one</i> token, and repeat. The speed
              was strictly throttled by memory bus bandwidth, not compute power.
            </p>
          </div>
        </div>
      </Section>

      <Callout title="Stage 1 Takeaway: Why We Need Stage 2" tone="green" className="mt-s">
        Stage 1 gives us direct access to the model server. But in production, you cannot let hundreds of clients talk
        directly to raw model instances without authentication, rate limiting, token tracking, retry logic, and load
        balancing. That is why <b>Stage 2 introduces LiteLLM</b> as an API gateway.
      </Callout>
    </Page>
  )
}
