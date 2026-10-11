import React from 'react'
import { Page, PartHero, Callout, Term, Section } from '../components/ui.jsx'

export default function LabPage() {
  return (
    <Page tone="green" running="Hands-On Lab · Real-World Engineering" part="Lab">
      <PartHero
        n="★"
        kicker="Hands-On Lab · Real-World Systems"
        title="Inside /home/ramum/model-serving"
        lead="A live engineering lab built in Go and Linux to measure the exact wire protocols and latency boundaries explained in this guide."
      />

      <Section title="The Three Wire Protocols in Stage 1" color="green">
        <div className="grid3">
          <div className="card tone-blue">
            <b>1. Unary /api/generate</b>
            <p>
              Buffered HTTP request &amp; response. The client blocks until all tokens finish. Returns cumulative
              <code>prompt_eval_duration</code> and <code>eval_duration</code> in nanoseconds.
            </p>
          </div>
          <div className="card tone-yellow">
            <b>2. Streaming NDJSON /api/chat</b>
            <p>
              Uses <code>Transfer-Encoding: chunked</code>. Each newline carries a parsed JSON delta with
              <code>message.content</code>. Yields instant interactivity before the model completes.
            </p>
          </div>
          <div className="card tone-green">
            <b>3. OpenAI SSE /v1/chat/completions</b>
            <p>
              Standard Server-Sent Events stream: <code>data: &#123;...&#125;</code> chunks terminated by{' '}
              <code>data: [DONE]</code>. Enables drop-in compatibility across OpenAI, vLLM and Ollama.
            </p>
          </div>
        </div>
      </Section>

      <div className="grid2 mt">
        <Section title="Dissecting Latency in Go (types.go)" color="green">
          <Term
            title="go · /home/ramum/model-serving/stage1/client/types.go"
            code={`type InferenceMetrics struct {
    TimeToFirstToken   time.Duration // Wire to first chunk (Prefill + Queue)
    TotalLatency       time.Duration // Total HTTP request lifespan
    PromptTokens       int           // Prompt input tokens
    CompletionTokens   int           // Generated output tokens
    PromptTokensPerSec float64       // Prefill speed (GEMM compute-bound)
    TokensPerSecond    float64       // Decode speed (HBM memory-bound)
}`}
          />
          <p className="fine">
            Notice how Go&rsquo;s <code>net/http</code> client directly isolates the two hardware phases: prefill speed
            measures Tensor Core GEMM throughput, while generation speed benchmarks memory bandwidth.
          </p>
        </Section>

        <Section title="Running the Lab & Tracing the Wire" color="green">
          <Term
            title="bash · /home/ramum/model-serving/stage1"
            code={`# 1. Run the Go client with wire inspection
$ go run main.go -model qwen2.5:0.5b -endpoint chat -inspect=true

# 2. Inspect raw HTTP chunking with curl & jq
$ ./curl_demo.sh qwen2.5:0.5b

# 3. Trace socket syscalls on the model daemon
$ sudo strace -f -tt -e trace=recvfrom,write -p $(pgrep ollama)

# 4. Watch TCP socket buffers and congestion window
$ ss -tni 'sport = :11434'`}
          />
        </Section>
      </div>

      <Section title="Lab Output: Capturing the Hardware Transition" color="green" className="mt">
        <div className="lab-metrics">
          <div className="lm-item tone-blue">
            <span className="lm-label">Time to First Token (TTFT)</span>
            <span className="lm-val">42 ms</span>
            <span className="lm-sub">Queue wait + prompt prefill (38 tok)</span>
          </div>
          <div className="lm-item tone-yellow">
            <span className="lm-label">Prompt Evaluation Speed</span>
            <span className="lm-val">904.7 tok/s</span>
            <span className="lm-sub">Tensor Core GEMM matrix math</span>
          </div>
          <div className="lm-item tone-green">
            <span className="lm-label">Token Generation Speed</span>
            <span className="lm-val">86.4 tok/s</span>
            <span className="lm-sub">HBM bandwidth loading weights per token</span>
          </div>
        </div>
      </Section>

      <Callout title="Engineering Takeaway" tone="green">
        In this exercise at <code>/home/ramum/model-serving</code>, the 10x ratio between prompt evaluation (904 tok/s)
        and token generation (86 tok/s) is physical proof of the arithmetic intensity cliff: prefill saturated the ALUs,
        while decode starved on memory bandwidth.
      </Callout>
    </Page>
  )
}
