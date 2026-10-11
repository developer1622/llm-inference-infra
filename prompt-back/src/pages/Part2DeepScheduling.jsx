import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'

export function Part2Page1() {
  return (
    <Page tone="red" running="Part 2 · KV Cache Mathematics" part="Part 2">
      <div className="kicker">Memory Engineering</div>
      <h1 className="big">The KV Cache Memory Mathematics</h1>
      <p className="lead">
        In self-attention, generating each new token requires attending to every previous token in the sequence.
        To avoid recomputing attention from scratch at every step, model engines cache the Key and Value projection vectors.
      </p>

      <Section title="The Exact KV Cache Formula" color="red" className="mt-s">
        <div className="code-box">
          <code>KV_Bytes = 2 × n_layers × n_kv_heads × d_head × n_tokens × precision_bytes</code>
        </div>
        <p style={{ marginTop: '2mm' }}>
          Where:
          <br />• <b>2</b> accounts for storing both Key and Value matrices.
          <br />• <b>n_layers</b> is the total number of Transformer decoder layers.
          <br />• <b>n_kv_heads</b> is the number of key/value attention heads per layer.
          <br />• <b>d_head</b> is the hidden dimension per head (often <code>hidden_dim / n_heads</code>, typically 64 or 128).
          <br />• <b>n_tokens</b> is the current sequence context length.
          <br />• <b>precision_bytes</b> is 2 for FP16/BF16, 1 for INT8, or 0.5 for INT4.
        </p>
      </Section>

      <div className="table-wrap mt-s">
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>Layers</th>
              <th>KV Heads</th>
              <th>Head Dim</th>
              <th>KV Cache per 4k Tokens (FP16)</th>
              <th>KV Cache per 32k Tokens (FP16)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Qwen 2.5 0.5B</b></td>
              <td>24</td>
              <td>2 (GQA)</td>
              <td>64</td>
              <td><b>24.5 MB</b></td>
              <td><b>196.6 MB</b></td>
            </tr>
            <tr>
              <td><b>LLaMA 3.1 8B</b></td>
              <td>32</td>
              <td>8 (GQA)</td>
              <td>128</td>
              <td><b>524.2 MB</b></td>
              <td><b>4.19 GB</b></td>
            </tr>
            <tr>
              <td><b>LLaMA 3.3 70B</b></td>
              <td>80</td>
              <td>8 (GQA)</td>
              <td>128</td>
              <td><b>1.31 GB</b></td>
              <td><b>10.48 GB</b></td>
            </tr>
            <tr>
              <td><b>Mistral Large 123B</b></td>
              <td>88</td>
              <td>8 (GQA)</td>
              <td>128</td>
              <td><b>1.44 GB</b></td>
              <td><b>11.53 GB</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout title="Why Concurrency Multiplies KV Memory" tone="yellow" className="mt-s">
        Notice that at 32k context on LLaMA-3-8B, a <b>single request consumes 4.19 GB of RAM</b> just for its KV cache!
        If your server receives 10 concurrent requests, you need <b>41.9 GB of VRAM</b> purely for KV activations,
        completely dwarfing the 16 GB required for the model weights!
      </Callout>
    </Page>
  )
}

export function Part2Page2() {
  return (
    <Page tone="red" running="Part 2 · Attention Architectures" part="Part 2">
      <div className="kicker">Architectural Evolution</div>
      <h1 className="big">MHA vs MQA vs Grouped-Query Attention (GQA)</h1>
      <p className="lead">
        To curb the catastrophic memory growth of the KV cache at scale, modern foundation models transitioned
        from Multi-Head Attention to Multi-Query and Grouped-Query Attention.
      </p>

      <div className="grid-3 mt-s">
        <div className="card">
          <h4 style={{ margin: '0 0 2mm', color: '#d93025' }}>Multi-Head Attention (MHA)</h4>
          <p style={{ fontSize: '8pt', margin: 0 }}>
            <b>Architecture:</b> 1 Query head : 1 Key head : 1 Value head.<br />
            Every query head maintains its own independent KV projections.
            <br /><br />
            <b>Used in:</b> Original Transformer, GPT-3, LLaMA 1.<br />
            <b>Problem:</b> Huge KV memory footprint; severely limits concurrent serving capacity.
          </p>
        </div>

        <div className="card">
          <h4 style={{ margin: '0 0 2mm', color: '#1a73e8' }}>Multi-Query Attention (MQA)</h4>
          <p style={{ fontSize: '8pt', margin: 0 }}>
            <b>Architecture:</b> $N$ Query heads : 1 Key head : 1 Value head.<br />
            All query heads share a single shared Key and Value head.
            <br /><br />
            <b>Used in:</b> Falcon, PaLM, StarCoder.<br />
            <b>Tradeoff:</b> 95%+ KV memory reduction, but can cause minor quality degradation on complex reasoning tasks.
          </p>
        </div>

        <div className="card">
          <h4 style={{ margin: '0 0 2mm', color: '#188038' }}>Grouped-Query Attention (GQA)</h4>
          <p style={{ fontSize: '8pt', margin: 0 }}>
            <b>Architecture:</b> $G$ Query heads share 1 KV head (e.g., 8:1 ratio).<br />
            The modern gold standard balancing quality and efficiency.
            <br /><br />
            <b>Used in:</b> LLaMA 2/3, Qwen 2.5, Mistral, Gemma 2.<br />
            <b>Advantage:</b> Retains 99% of MHA accuracy while cutting KV memory by 75–87.5%!
          </p>
        </div>
      </div>

      <Section title="Comparative Memory Consumption (32k Tokens, 32 Layers, FP16)" color="yellow" className="mt-s">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Attention Type</th>
                <th>Query Heads</th>
                <th>KV Heads</th>
                <th>KV Cache per User</th>
                <th>Max Concurrent Users (on 24GB VRAM)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>MHA (Original)</b></td>
                <td>32</td>
                <td>32</td>
                <td><b>16.7 GB</b></td>
                <td><b>1 user</b> (Near immediate OOM)</td>
              </tr>
              <tr>
                <td><b>GQA (4:1 Group)</b></td>
                <td>32</td>
                <td>8</td>
                <td><b>4.19 GB</b></td>
                <td><b>4 users</b></td>
              </tr>
              <tr>
                <td><b>GQA (8:1 Group)</b></td>
                <td>32</td>
                <td>4</td>
                <td><b>2.09 GB</b></td>
                <td><b>9 users</b></td>
              </tr>
              <tr>
                <td><b>MQA (Shared)</b></td>
                <td>32</td>
                <td>1</td>
                <td><b>0.52 GB</b></td>
                <td><b>38 users</b></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  )
}

export function Part2Page3() {
  return (
    <Page tone="red" running="Part 2 · Batching Schedulers" part="Part 2">
      <div className="kicker">Scheduler Bottlenecks</div>
      <h1 className="big">Static Batching vs Head-of-Line Blocking</h1>
      <p className="lead">
        Traditional deep learning frameworks (TensorFlow, PyTorch) rely on static batching. In generative LLM serving,
        static batching leads to catastrophic GPU under-utilization due to variable sequence lengths.
      </p>

      <div className="grid-2 mt-s">
        <Section title="The Static Batching Dilemma" color="red">
          <p>
            In static batching, $B$ requests are grouped together at the beginning of inference. The entire batch must
            run until <b>the slowest, longest request finishes</b>:
          </p>
          <ul className="meta-list">
            <li><b>Padding Waste:</b> If Request A generates 10 tokens and Request B generates 500 tokens, Request A must be padded with 490 useless padding tokens.</li>
            <li><b>Head-of-Line Blocking:</b> New incoming requests must wait in a queue until the entire current batch terminates.</li>
            <li><b>GPU Idling:</b> By step 100, 75% of the batch slots are empty, yet memory bandwidth and compute cycles remain locked.</li>
          </ul>
        </Section>

        <Section title="The Consequence: Extreme Latency Spikes" color="yellow">
          <p>
            Under variable enterprise traffic (such as short chat prompts mixed with long code generation), static batching produces:
          </p>
          <ul className="meta-list">
            <li><b>Bimodal Latency:</b> Short prompts experience massive P99 latency spikes because they are stuck behind long generations.</li>
            <li><b>Poor Saturation:</b> Average hardware utilization hovers around 15–25% of theoretical capacity.</li>
            <li><b>SLA Violations:</b> Unpredictable Time to First Token (TTFT) and high queuing delays.</li>
          </ul>
        </Section>
      </div>

      <Section title="Timeline Comparison of Batch Execution" color="blue" className="mt-s">
        <div className="code-box">
          <code>Static Batch: [Req 1: ■■■■□□□□□□]  (□ = wasted compute on padding tokens)<br />
               [Req 2: ■■■■■■■■■■]  (Entire batch locked until Req 2 completes)<br />
               [Req 3: ■■□□□□□□□□]  (Finished at step 2, idling for 8 steps)</code>
        </div>
      </Section>

      <Callout title="The Paradigm Shift" tone="green" className="mt-s">
        To solve this, researchers introduced <b>Continuous Batching (Iteration-Level Scheduling)</b>, shifting scheduling
        decisions from the request level to the individual token generation step.
      </Callout>
    </Page>
  )
}

export function Part2Page4() {
  return (
    <Page tone="red" running="Part 2 · Continuous Batching" part="Part 2">
      <div className="kicker">Iteration-Level Scheduling</div>
      <h1 className="big">Continuous Batching (Orca / vLLM Architecture)</h1>
      <p className="lead">
        Continuous batching disassembles request-level batching. Instead of waiting for an entire batch to finish,
        the scheduler operates at the granularity of a <b>single iteration (token step)</b>.
      </p>

      <div className="grid-2 mt-s">
        <Section title="How Continuous Batching Works" color="blue">
          <ul className="meta-list">
            <li>
              <b>Iteration-Level Eviction:</b> The moment a request emits an <code>&lt;|endoftext|&gt;</code> token or reaches its <code>max_tokens</code> limit, it is evicted immediately.
            </li>
            <li>
              <b>Dynamic Insertion:</b> Newly arrived requests from the queue are immediately inserted into the vacant batch slot at the very next iteration.
            </li>
            <li>
              <b>Zero Padding Waste:</b> Every single active slot in the tensor batch performs productive computation.
            </li>
          </ul>
        </Section>

        <Section title="Throughput & Latency Gains" color="green">
          <ul className="meta-list">
            <li>
              <b>3× to 5× Throughput Increase:</b> Hardware utilization surges because compute units never process dummy padding tokens.
            </li>
            <li>
              <b>Minimized Queuing Delays:</b> New requests do not wait for long generation jobs to finish; they enter at the next token step.
            </li>
            <li>
              <b>Consistent Time Per Output Token:</b> Eliminates head-of-line blocking, maintaining steady token generation velocity.
            </li>
          </ul>
        </Section>
      </div>

      <Section title="Visualizing the Continuous Batch Lifecycle" color="yellow" className="mt-s">
        <div className="code-box">
          <code>Step 1: [Req A (step 1)] [Req B (step 1)] [Req C (step 1)]<br />
Step 2: [Req A (step 2)] [Req B (step 2)] [Req C (DONE → Evicted)]<br />
Step 3: [Req A (step 3)] [Req B (step 3)] [Req D (Prefilled & Inserted!)]<br />
Step 4: [Req A (DONE)]   [Req B (step 4)] [Req D (step 1)]</code>
        </div>
      </Section>

      <Callout title="The New Architectural Problem" tone="red" className="mt-s">
        Continuous batching solved compute under-utilization, but created an acute memory crisis: dynamically inserting
        and evicting requests of unpredictable lengths caused severe <b>memory fragmentation</b>. This required a breakthrough:
        <b>PagedAttention</b>.
      </Callout>
    </Page>
  )
}

export function Part2Page5() {
  return (
    <Page tone="red" running="Part 2 · PagedAttention Deep Dive" part="Part 2">
      <div className="kicker">Virtual Memory Architecture</div>
      <h1 className="big">PagedAttention: The Virtual Memory Model for LLMs</h1>
      <p className="lead">
        Introduced by Kwon et al. (UC Berkeley / vLLM), PagedAttention adapts the classic operating system concept
        of <b>virtual memory paging</b> to manage Key-Value caches in neural network serving.
      </p>

      <div className="grid-2 mt-s">
        <Section title="The Pre-PagedAttention Nightmare" color="red">
          <p>
            Before PagedAttention, serving systems pre-allocated contiguous memory blocks based on the <i>maximum possible sequence length</i> (e.g., 2048 or 4096 tokens):
          </p>
          <ul className="meta-list">
            <li><b>Internal Fragmentation:</b> A request generating only 50 tokens reserved memory for 4096 tokens—wasting 98% of allocated RAM!</li>
            <li><b>External Fragmentation:</b> Requests starting and finishing at irregular intervals left unusable gaps between memory allocations.</li>
            <li><b>Overall Waste:</b> Typically <b>60% to 80% of GPU VRAM</b> sat completely idle, artificially capping server concurrency.</li>
          </ul>
        </Section>

        <Section title="The PagedAttention Innovation" color="blue">
          <p>
            PagedAttention splits the KV cache of a request into <b>fixed-size physical blocks</b> (e.g., 16 tokens per block):
          </p>
          <ul className="meta-list">
            <li><b>Non-Contiguous Storage:</b> Blocks do not need to be stored consecutively in physical memory.</li>
            <li><b>Block Table Mapping:</b> A software memory management table maps logical sequence token indices to physical block addresses.</li>
            <li><b>On-Demand Allocation:</b> A new physical block is allocated only when the current 16-token block fills up.</li>
          </ul>
        </Section>
      </div>

      <Section title="The Operating System Parallel" color="yellow" className="mt-s">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Operating System Concept</th>
                <th>PagedAttention LLM Serving Concept</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Virtual Memory Address Space</td>
                <td>Logical Token Position in Prompt/Generation Sequence</td>
              </tr>
              <tr>
                <td>Physical Memory Page Frames (4 KB)</td>
                <td>Physical KV Cache Blocks (e.g. 16 tokens × layers × heads × dim)</td>
              </tr>
              <tr>
                <td>Page Table (MMU Translation)</td>
                <td>Block Table (Logical Block Index &rarr; Physical Memory Block Pointer)</td>
              </tr>
              <tr>
                <td>Demand Paging (Page Fault)</td>
                <td>Dynamic Block Allocation when 16th token is generated</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  )
}

export function Part2Page6() {
  return (
    <Page tone="red" running="Part 2 · Memory Defragmentation" part="Part 2">
      <div className="kicker">Memory Efficiency</div>
      <h1 className="big">PagedAttention: Eliminating 80% Memory Waste</h1>
      <p className="lead">
        By partitioning KV cache tensors into discrete, non-contiguous block units, PagedAttention reduces memory waste
        to strictly below 4%, enabling servers to handle <b>2× to 4× higher concurrency</b> on identical hardware.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Waste Reduction Mechanics" color="green">
          <ul className="meta-list">
            <li>
              <b>Near-Zero Internal Fragmentation:</b> Memory waste is bounded by the final block of a sequence (at most 15 tokens out of a 16-token block). For a 1000-token sequence, waste is &lt;1.5%!
            </li>
            <li>
              <b>Zero External Fragmentation:</b> All physical blocks share identical dimensions. Any freed block can be instantly re-assigned to any other sequence without compaction.
            </li>
            <li>
              <b>Copy-on-Write (CoW) Forking:</b> When multiple output sequences share a common prompt (parallel sampling, beam search), they share physical prompt blocks until one sequence diverges.
            </li>
          </ul>
        </Section>

        <Section title="Custom Attention Kernel Execution" color="blue">
          <p>
            Standard matrix multiplication requires contiguous memory. PagedAttention implements a specialized GPU/CPU attention kernel:
          </p>
          <ul className="meta-list">
            <li><b>Pointer Chasing Avoidance:</b> The kernel reads the Block Table into fast shared memory / cache.</li>
            <li><b>Block-by-Block Attention:</b> Computes attention scores block-by-block, accumulating partial sums directly in registers.</li>
            <li><b>Zero Latency Penalty:</b> Paged attention kernel executes at identical or superior speed to unpaged attention while saving gigabytes of memory.</li>
          </ul>
        </Section>
      </div>

      <Section title="Memory Utilization Comparison" color="yellow" className="mt-s">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2mm' }}>
            <span><b>Traditional Contiguous Allocation:</b></span>
            <span style={{ color: '#d93025', fontWeight: 700 }}>20% Active Data / 80% Wasted Padding</span>
          </div>
          <div style={{ height: '6mm', background: '#fad2cf', borderRadius: '3mm', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '20%', background: '#d93025' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3mm 0 2mm' }}>
            <span><b>PagedAttention Virtual Allocation:</b></span>
            <span style={{ color: '#188038', fontWeight: 700 }}>96% Active Data / 4% Marginal Waste</span>
          </div>
          <div style={{ height: '6mm', background: '#ceead6', borderRadius: '3mm', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '96%', background: '#188038' }} />
          </div>
        </div>
      </Section>
    </Page>
  )
}

export function Part2Page7() {
  return (
    <Page tone="red" running="Part 2 · Radix Prefix Caching" part="Part 2">
      <div className="kicker">Cache Optimization</div>
      <h1 className="big">Radix Prefix Caching: Reusing KV Tensors</h1>
      <p className="lead">
        In real-world applications, large portions of prompts are identical across requests: system instructions,
        few-shot examples, document attachments, and conversational history. Radix prefix caching eliminates redundant computation.
      </p>

      <div className="grid-2 mt-s">
        <Section title="The Multi-Turn Conversation Problem" color="red">
          <p>
            Consider a user chatting with an assistant over 10 turns:
          </p>
          <ul className="meta-list">
            <li><b>Turn 1:</b> User prompt (100 tokens) &rarr; Prefill computes 100 tokens.</li>
            <li><b>Turn 2:</b> Context has 250 tokens &rarr; Without prefix cache, prefill re-evaluates all 250 tokens from scratch!</li>
            <li><b>Turn 10:</b> Context has 2,000 tokens &rarr; Prefill computes 2,000 tokens just to answer a short 10-word question!</li>
            <li><b>Result:</b> Time to First Token (TTFT) degrades linearly with conversational depth.</li>
          </ul>
        </Section>

        <Section title="Radix Tree Data Structure" color="green">
          <p>
            Engines maintain a <b>Radix Tree (trie)</b> of previously computed KV cache blocks in RAM:
          </p>
          <ul className="meta-list">
            <li><b>Prefix Matching:</b> When a new request arrives, the engine matches its token sequence against nodes in the Radix tree.</li>
            <li><b>Zero-Compute Prefill:</b> Any matched prefix skips the prefill compute phase entirely; its physical blocks are linked into the new request\'s block table.</li>
            <li><b>Eviction Policy:</b> Least-Recently Used (LRU) eviction discards old prefixes when memory pressure rises.</li>
          </ul>
        </Section>
      </div>

      <Section title="Performance Impact on System Prompts" color="yellow" className="mt-s">
        <p>
          In enterprise customer service agents with a <b>2,000-token system prompt</b> (rules, company policy, API schemas):
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Execution Strategy</th>
                <th>Prefill Tokens Computed</th>
                <th>Time to First Token (TTFT)</th>
                <th>Compute Energy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Standard Serving (No Cache)</b></td>
                <td>2,050 tokens</td>
                <td><b>850 ms</b></td>
                <td>100% (High GPU/CPU Burn)</td>
              </tr>
              <tr>
                <td><b>With Radix Prefix Caching</b></td>
                <td><b>50 tokens</b></td>
                <td><b>35 ms (95% drop!)</b></td>
                <td><b>2.4%</b> (Near zero compute)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  )
}

export function Part2Page8() {
  return (
    <Page tone="red" running="Part 2 · Chunked Prefill" part="Part 2">
      <div className="kicker">Latency Stabilization</div>
      <h1 className="big">Chunked Prefill: Eliminating TTFT Spikes</h1>
      <p className="lead">
        When an engine serves concurrent users, a sudden massive prompt (e.g. a 16k-token PDF) can monopolize compute
        units for seconds, starving all active decode streams and causing severe Time Per Output Token (TPOT) jitter.
      </p>

      <div className="grid-2 mt-s">
        <Section title="The Prefill Starvation Anomaly" color="red">
          <p>
            Because prefill is compute-bound, processing a large prompt blocks the engine from executing decode iterations for other users:
          </p>
          <ul className="meta-list">
            <li><b>Decode Jitter:</b> User A, whose stream was generating at a smooth 30 tokens/sec, suddenly pauses for 1.8 seconds.</li>
            <li><b>UI Freezing:</b> End users perceive the application as lagging or disconnected.</li>
            <li><b>Root Cause:</b> Compute units are 100% occupied multiplying the massive prompt matrix.</li>
          </ul>
        </Section>

        <Section title="Chunked Prefill Mechanics" color="blue">
          <p>
            Chunked prefill (pioneered in Sarathi-Serve and vLLM) enforces an iteration token budget (e.g., 512 tokens):
          </p>
          <ul className="meta-list">
            <li><b>Prompt Slicing:</b> A 2,048-token prompt is broken into four 512-token chunks.</li>
            <li><b>Interleaved Execution:</b> At step 1, the engine prefills chunk 1 alongside the active decode batch. At step 2, chunk 2 is prefilled with decode step 2.</li>
            <li><b>Smooth Pacing:</b> Decode streams continue uninterrupted while the large prompt progresses in background slices.</li>
          </ul>
        </Section>
      </div>

      <Section title="Timeline: With vs Without Chunked Prefill" color="yellow" className="mt-s">
        <div className="code-box">
          <code>Without Chunked Prefill:<br />
[Step 1: 16k Token Prompt Prefill (blocks entire GPU for 1500ms!)] &rarr; Decode streams paused!<br />
[Step 2: Decode Step resumed]<br /><br />
With Chunked Prefill (512-token slices):<br />
[Step 1: 512 Prompt Tokens + All Active Decodes (40ms)]<br />
[Step 2: 512 Prompt Tokens + All Active Decodes (40ms)]  &larr; Smooth token velocity!</code>
        </div>
      </Section>

      <Callout title="Production Recommendation" tone="green" className="mt-s">
        Always configure <code>--enable-chunked-prefill</code> in high-concurrency production deployments to decouple
        prompt ingestion latency from streaming decode responsiveness.
      </Callout>
    </Page>
  )
}

export function Part2Page9() {
  return (
    <Page tone="red" running="Part 2 · Speculative Decoding" part="Part 2">
      <div className="kicker">Latency Acceleration</div>
      <h1 className="big">Speculative Decoding: Breaking the Single-Token Barrier</h1>
      <p className="lead">
        Autoregressive generation is bottlenecked by reading model weights from memory for every single token.
        Speculative decoding circumvents this by using a tiny draft model to propose candidates, verified in parallel by the target model.
      </p>

      <div className="grid-2 mt-s">
        <Section title="The Two-Model Workflow" color="blue">
          <ul className="meta-list">
            <li>
              <b>Phase 1 (Drafting):</b> A small, ultra-fast draft model (e.g. Qwen 0.5B draft for Qwen 72B target) rapidly generates $K$ candidate tokens (e.g. 4 tokens) autoregressively.
            </li>
            <li>
              <b>Phase 2 (Verification):</b> The large target model executes a <b>single parallel forward pass</b> evaluating all $K$ tokens at once.
            </li>
            <li>
              <b>Phase 3 (Acceptance):</b> A modified rejection sampling scheme accepts the first $M \le K$ tokens that match the target model\'s probability distribution.
            </li>
          </ul>
        </Section>

        <Section title="Mathematical Speedup Derivation" color="green">
          <p>
            Let $\alpha$ be the acceptance rate (typically 0.65 to 0.85), and $K$ be the speculation length:
          </p>
          <div className="code-box">
            <code>Expected Tokens per Step = 1 + α × K</code>
          </div>
          <p style={{ marginTop: '2mm' }}>
            If the draft model costs 5% of the target model\'s latency and achieves an acceptance rate of 75% with $K=4$,
            the engine generates <b>3.0 tokens per target forward pass</b>—achieving a <b>2.2× to 2.8× end-to-end wall-clock speedup</b>!
          </p>
        </Section>
      </div>

      <Section title="Why Speculative Decoding is Mathematically Lossless" color="yellow" className="mt-s">
        <p>
          Crucially, speculative decoding is <b>strictly mathematically lossless</b>: the output distribution is identical
          to sampling directly from the large target model. If the target model rejects token 3, it resamples a valid token
          from its own adjusted residual distribution and discards the remaining speculated tokens.
        </p>
      </Section>
    </Page>
  )
}

export function Part2Page10() {
  return (
    <Page tone="red" running="Part 2 · Medusa & Multi-Token Heads" part="Part 2">
      <div className="kicker">Draftless Speculation</div>
      <h1 className="big">Medusa & Multi-Token Prediction Heads</h1>
      <p className="lead">
        While classical speculative decoding requires managing two separate models, modern techniques like <b>Medusa</b>
        and <b>Multi-Token Prediction (MTP)</b> integrate speculative heads directly into the main model architecture.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Medusa Architecture (Multiple Heads)" color="blue">
          <p>
            Medusa attaches multiple lightweight feed-forward heads on top of the final Transformer backbone layer:
          </p>
          <ul className="meta-list">
            <li><b>Head 1:</b> Predicts token $t+1$ (the standard next token).</li>
            <li><b>Head 2:</b> Speculates token $t+2$ directly from current hidden states.</li>
            <li><b>Head 3 & 4:</b> Speculate tokens $t+3$ and $t+4$.</li>
            <li><b>Tree Attention Verification:</b> Uses a customized tree-attention mask to verify all permutations in a single forward pass.</li>
          </ul>
        </Section>

        <Section title="Multi-Token Prediction in Frontier Models" color="green">
          <p>
            Frontier architectures like <b>DeepSeek V3</b> integrate Multi-Token Prediction (MTP) directly during pre-training:
          </p>
          <ul className="meta-list">
            <li><b>Native Speculative Modules:</b> Trained alongside the primary model weights, yielding higher acceptance rates (&gt;85%).</li>
            <li><b>No Dual Model Orchestration:</b> Eliminates the complexity of hosting and coordinating separate draft model instances.</li>
            <li><b>1.8× Speedup in Production:</b> Slashes Time Per Output Token without requiring separate draft model VRAM allocations.</li>
          </ul>
        </Section>
      </div>

      <Callout title="Summary of Part 2: The Core Serving Engine" tone="red" className="mt-s">
        Mastering the core engine requires understanding the interplay between:
        <br /><b>KV Cache math &rarr; GQA reduction &rarr; Continuous batching &rarr; PagedAttention virtual memory &rarr; Radix caching &rarr; Speculative decode.</b>
        <br />Together, these techniques transform an unworkable memory bottleneck into a scalable, sub-second inference pipeline.
      </Callout>
    </Page>
  )
}
