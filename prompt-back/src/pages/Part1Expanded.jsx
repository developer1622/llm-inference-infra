import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'

export function Part1Page1() {
  return (
    <Page tone="blue" running="Part 1 · Anatomy of an Inference Request" part="Part 1">
      <div className="kicker">The Systems Journey</div>
      <h1 className="big">Phase 1: Ingress, TCP Sockets & HTTP Parsing</h1>
      <p className="lead">
        Before an LLM can generate a single word, the incoming prompt must navigate the physical network stack,
        operating system kernel, and application server.
      </p>

      <div className="grid-2 mt-s">
        <Section title="1. TCP Handshake & TLS Termination" color="blue">
          <p>
            The client (curl, Go client, or gateway) initiates a 3-way TCP handshake (<code>SYN</code>, <code>SYN-ACK</code>, <code>ACK</code>)
            followed by a TLS 1.3 cryptographic negotiation.
          </p>
          <ul className="meta-list">
            <li><b>Socket Descriptors:</b> The Linux kernel allocates an active socket file descriptor in the process fd table.</li>
            <li><b>TCP Buffer Allocation:</b> The kernel assigns receive (<code>tcp_rmem</code>) and transmit (<code>tcp_wmem</code>) buffers.</li>
            <li><b>Nagle Algorithm:</b> High-performance inference servers disable Nagle’s algorithm via <code>TCP_NODELAY</code> to prevent 40ms delayed ACKs during token streaming.</li>
          </ul>
        </Section>

        <Section title="2. Epoll Event Loops & HTTP Parsing" color="red">
          <p>
            Modern serving engines use non-blocking event loops (Go netpoll, Linux epoll, or Rust tokio) to multiplex thousands of concurrent requests over single worker threads.
          </p>
          <ul className="meta-list">
            <li><b>Epoll Wait:</b> Worker threads block in <code>epoll_wait()</code> until edge-triggered socket read readiness events fire.</li>
            <li><b>HTTP Request Deserialization:</b> The raw byte stream is parsed into an HTTP request struct, extracting headers (Authorization, Host) and the JSON body.</li>
            <li><b>Payload Validation:</b> Verifies prompt presence, temperature, max_tokens, and streaming flag (<code>"stream": true</code>).</li>
          </ul>
        </Section>
      </div>

      <Section title="The Linux Kernel Wire Path" color="yellow" className="mt-s">
        <div className="code-box">
          <code>Client Socket → NIC Ring Buffer → Kernel SoftIRQ → TCP Receive Buffer → epoll_wait() → User-Space Buffer → JSON Unmarshal</code>
        </div>
      </Section>

      <Callout title="Engineering Insight from Production" tone="green" className="mt-s">
        In high-throughput environments, unoptimized JSON parsing can consume 15% of host CPU time. High-performance runtimes
        use SIMD-accelerated parsers (like <code>simdjson</code>) to deserialize prompt payloads without CPU bottlenecks.
      </Callout>
    </Page>
  )
}

export function Part1Page2() {
  return (
    <Page tone="blue" running="Part 1 · Tokenization & Embeddings" part="Part 1">
      <div className="kicker">Discrete to Continuous Space</div>
      <h1 className="big">Phase 2: Tokenization & Embedding Projection</h1>
      <p className="lead">
        Neural networks cannot process raw ASCII or UTF-8 characters directly. Strings must be converted into discrete
        vocabulary indices and projected into continuous high-dimensional vector representations.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Byte-Pair Encoding (BPE)" color="blue">
          <p>
            Modern tokenizers (like HuggingFace Tokenizers or tiktoken) use Byte-Pair Encoding:
          </p>
          <ul className="meta-list">
            <li><b>Vocabulary Size:</b> Fixed dictionaries ranging from 32,000 tokens (LLaMA 1) to 152,064 tokens (Qwen 2.5).</li>
            <li><b>Compression Ratio:</b> In English text, 1 token is roughly equivalent to 0.75 words or ~4 characters.</li>
            <li><b>Subword Merging:</b> Uncommon words are split into subword fragments (e.g., &ldquo;Kubernetes&rdquo; &rarr; <code>["Kuber", "netes"]</code>).</li>
          </ul>
        </Section>

        <Section title="Embedding Lookup & Positional Encodings" color="red">
          <p>
            Once token IDs are generated, they are mapped into dense mathematical tensors:
          </p>
          <ul className="meta-list">
            <li><b>Embedding Table Lookup:</b> Gathers weight rows from the embedding matrix W_e &isin; R^(V &times; d), where V is vocabulary size and d is hidden dimension.</li>
            <li><b>Rotary Position Embeddings (RoPE):</b> Encodes absolute and relative token positions directly into Query and Key vectors via complex rotation matrices.</li>
            <li><b>Memory Boundary:</b> On CPU inference, embedding lookup requires rapid cache-line access to large lookup tables.</li>
          </ul>
        </Section>
      </div>

      <Section title="Visualizing the Transformation" color="yellow" className="mt-s">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Raw User String</th>
                <th>Tokenizer Token IDs</th>
                <th>Embedding Tensor ($d = 896$ for Qwen 0.5B)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>"Explain"</code></td>
                <td><code>[22476]</code></td>
                <td><code>[-0.0421, +0.1192, -0.0034, ... (896 floats)]</code></td>
              </tr>
              <tr>
                <td><code>" Kubernetes"</code></td>
                <td><code>[38291, 1045]</code></td>
                <td><code>[+0.0812, -0.0234, +0.1982, ... (896 floats)]</code></td>
              </tr>
              <tr>
                <td><code>" serving"</code></td>
                <td><code>[6431]</code></td>
                <td><code>[-0.0195, +0.0761, -0.0543, ... (896 floats)]</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Callout title="Why Vocabulary Size Matters to Serving" tone="green" className="mt-s">
        A larger vocabulary (like Qwen\'s 152k tokens) compresses text into fewer tokens, resulting in faster end-to-end decode time.
        However, the embedding matrix alone consumes ~300 MB of RAM, representing a significant fraction of small 0.5B models!
      </Callout>
    </Page>
  )
}

export function Part1Page3() {
  return (
    <Page tone="blue" running="Part 1 · The Prefill Phase" part="Part 1">
      <div className="kicker">Compute-Bound Execution</div>
      <h1 className="big">Phase 3: The Prefill Phase (Prompt Processing)</h1>
      <p className="lead">
        The prefill phase processes the entire prompt simultaneously. It is highly parallel, compute-intensive, and
        responsible for populating the initial Key-Value (KV) cache tensors.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Matrix Multiplications (GEMM)" color="blue">
          <p>
            During prefill, all $N$ tokens of the prompt are known in advance.
          </p>
          <ul className="meta-list">
            <li><b>Batch Matrix Multiplications:</b> Input tensor of shape <code>[Batch, N, d]</code> multiplies layer weights <code>[d, 4d]</code> simultaneously.</li>
            <li><b>High Arithmetic Intensity:</b> Operates near the theoretical peak FLOP/s ceiling of the hardware (Roofline Compute Bound).</li>
            <li><b>Hardware Utilization:</b> On GPUs, Tensor Cores operate at 80%+ efficiency; on CPU, Intel AVX2 Fused Multiply-Add (FMA) instructions maximize SIMD throughput.</li>
          </ul>
        </Section>

        <Section title="Populating the KV Cache" color="red">
          <p>
            As each Transformer attention layer executes, its computed Key and Value projections must be stored:
          </p>
          <ul className="meta-list">
            <li><b>Self-Attention Math:</b> Computes full cross-token attention scores across the entire prompt context.</li>
            <li><b>KV Cache Memory Materialization:</b> Writes $K$ and $V$ activation tensors into allocated memory blocks for every layer.</li>
            <li><b>First Token Logits:</b> Computes the unnormalized log-probability distribution for the very first generated token.</li>
          </ul>
        </Section>
      </div>

      <Section title="Why Time to First Token (TTFT) is Dominated by Prefill" color="yellow" className="mt-s">
        <p>
          <b>Time to First Token (TTFT)</b> measures how long the user waits before the first word streams back.
          Because prefill must compute attention across all input tokens simultaneously, a 2,000-token prompt requires
          substantially more prefill FLOPs than a 50-token prompt.
        </p>
        <div className="code-box">
          <code>TTFT = Ingress_Network_Latency + Tokenization_Time + Prefill_Compute_Time + Sampler_Time</code>
        </div>
      </Section>

      <Callout title="Empirical Observation from Our WSL2 Lab" tone="green" className="mt-s">
        On our Intel i5 CPU with AVX2, prefill on Qwen 2.5 0.5B runs at <b>~62 tokens/second</b> because all 4 CPU cores
        execute parallel FMA SIMD instructions. As you will see next, this contrasts sharply with the decode phase!
      </Callout>
    </Page>
  )
}

export function Part1Page4() {
  return (
    <Page tone="blue" running="Part 1 · The Autoregressive Decode Loop" part="Part 1">
      <div className="kicker">Memory-Bound Execution</div>
      <h1 className="big">Phase 4: The Autoregressive Decode Loop</h1>
      <p className="lead">
        Once the prefill phase completes, the engine enters the autoregressive decode loop: generating tokens one by one,
        re-feeding each newly produced token back into the network as input for the next cycle.
      </p>

      <div className="grid-2 mt-s">
        <Section title="The Single-Token Bottleneck" color="red">
          <p>
            Unlike prefill, decode processes exactly <b>one new token</b> per request per step:
          </p>
          <ul className="meta-list">
            <li><b>Input Shape:</b> Tensor shape is strictly <code>[Batch, 1, d]</code>.</li>
            <li><b>Matrix-Vector (GEMV):</b> Transforms the operation from high-FLOP matrix-matrix multiplication into memory-bound matrix-vector products.</li>
            <li><b>The Memory Bandwidth Wall:</b> Every single forward pass must read <i>all model weights</i> from memory into registers just to generate <i>one token</i>!</li>
          </ul>
        </Section>

        <Section title="Sampling, Detokenization & Streaming" color="green">
          <p>
            The raw output logits are converted into readable user text:
          </p>
          <ul className="meta-list">
            <li><b>Softmax & Temperature:</b> Scales logits by temperature and filters with Top-P (nucleus) or Top-K sampling.</li>
            <li><b>Detokenization:</b> Translates the chosen token ID back into a UTF-8 string chunk.</li>
            <li><b>Flushing to Socket:</b> Formats the chunk into an SSE <code>data: &#123;...&#125;</code> event and calls <code>net/http.Flusher.Flush()</code> to stream it across the wire immediately.</li>
          </ul>
        </Section>
      </div>

      <Section title="The Fundamental GenAI Serving Asymmetry" color="yellow" className="mt-s">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Phase</th>
                <th>Tokens Processed</th>
                <th>Mathematical Nature</th>
                <th>Hardware Bottleneck</th>
                <th>SRE Metric</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Prefill</b></td>
                <td>All prompt tokens ($N$)</td>
                <td>Matrix-Matrix (GEMM)</td>
                <td><b>Compute Bound (FLOP/s)</b></td>
                <td>Time to First Token (TTFT)</td>
              </tr>
              <tr>
                <td><b>Decode</b></td>
                <td>1 token at a time</td>
                <td>Matrix-Vector (GEMV)</td>
                <td><b>Memory Bound (Bandwidth GB/s)</b></td>
                <td>Time Per Output Token (TPOT)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Callout title="The Core Lesson of LLM Serving" tone="blue" className="mt-s">
        Decode speed is bounded not by your processor\'s clock speed or core count, but by <b>how fast your memory bus
        can stream gigabytes of weights into registers</b>. This single physical law explains the design of continuous
        batching, PagedAttention, and quantization.
      </Callout>
    </Page>
  )
}
