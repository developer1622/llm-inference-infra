import React from 'react'
import { Page, PartHero, Callout, Term, Section } from '../components/ui.jsx'

const COLORS = ['blue', 'red', 'yellow', 'green']
const colorOf = (id) => COLORS['ABCDEFGHIJKL'.indexOf(id) % 4]

// Each lane is a GPU "slot"; every segment is [request id or '-', number of decode steps].
const STEPS = 16
const staticLanes = [
  [['A', 4], ['-', 8], ['E', 4]],
  [['B', 12], ['F', 4]],
  [['C', 7], ['-', 5], ['G', 4]],
  [['D', 5], ['-', 7], ['H', 4]],
]
const contLanes = [
  [['A', 4], ['E', 5], ['I', 7]],
  [['B', 12], ['F', 4]],
  [['C', 7], ['G', 6], ['K', 3]],
  [['D', 5], ['H', 8], ['L', 3]],
]

function Lane({ segs }) {
  return (
    <div className="lane" style={{ gridTemplateColumns: `repeat(${STEPS}, 1fr)` }}>
      {segs.map(([id, len], i) => (
        <span
          key={i}
          className={id === '-' ? 'seg idle' : `seg tone-${colorOf(id)}`}
          style={{ gridColumn: `span ${len}` }}
        >
          {id === '-' ? '' : id}
        </span>
      ))}
    </div>
  )
}

function idleShare(lanes) {
  const total = lanes.length * STEPS
  const idle = lanes.flat().filter(([id]) => id === '-').reduce((s, [, n]) => s + n, 0)
  return Math.round((idle / total) * 100)
}

export function Part2Scheduler() {
  return (
    <Page tone="red" running="Part 2 · The scheduler & memory management" part="Part 2">
      <PartHero
        n="2"
        kicker="Part 2 · The scheduler & memory management"
        title="Continuous batching: one token at a time"
        lead="A GPU is only efficient when it works on many requests at once. How you group them is the whole game."
      />

      <div className="grid2 batch">
        <div>
          <div className="batch-title c-red">Static batching</div>
          <p className="fine">Wait for the whole batch to finish before taking new work.</p>
          <div className="lanes">
            {staticLanes.map((l, i) => (
              <Lane key={i} segs={l} />
            ))}
          </div>
          <div className="axis">time → (one cell = one decode step)</div>
          <div className="batch-stat bad">≈ {idleShare(staticLanes)}% of slot-time sits idle</div>
        </div>
        <div>
          <div className="batch-title c-green">Continuous batching</div>
          <p className="fine">A finished request frees its slot at once, and a waiting one takes it.</p>
          <div className="lanes">
            {contLanes.map((l, i) => (
              <Lane key={i} segs={l} />
            ))}
          </div>
          <div className="axis">time → (same four slots, no idle cells)</div>
          <div className="batch-stat good">≈ {idleShare(contLanes)}% idle · more requests finished</div>
        </div>
      </div>

      <div className="grid2 mt">
        <Section title="The problem: head-of-line blocking" color="red">
          <p>
            Output length is unknown in advance. In a static batch, short answers (A, C, D) must wait for the longest
            one (B). New arrivals (E, F, G, H) wait behind them. It is the classic <b>run-to-completion batch job</b>.
          </p>
        </Section>
        <Section title="The fix: iteration-level scheduling" color="green">
          <p>
            Introduced by the <b>Orca</b> paper (OSDI &rsquo;22). The scheduler runs once per <b>iteration</b> (one new
            token for every running request). Between iterations it can retire and admit requests. Think of a
            preemptive scheduler whose <b>time slice is one token</b>.
          </p>
        </Section>
      </div>

      <Section title="The scheduler loop, in pseudo-code" color="red" className="mt">
        <Term
          title="python-ish pseudo-code"
          code={`while True:
    for r in running:
        if r.finished: free(r.kv_blocks)            # like free() / page reclaim
    while waiting and free_kv_blocks >= need(waiting[0]):
        running.append(waiting.pop(0))              # admit new work right now
    forward_pass(running)                           # ONE token for everyone = one GPU step`}
        />
        <p className="fine">
          Real engines also use <b>chunked prefill</b>: a long prompt is split into slices that share each step with the
          decodes, so it cannot stall everyone else.
        </p>
      </Section>

      <Section title="The KV cache: what limits concurrency" color="red" className="mt">
        <div className="grid2">
          <div className="card tone-red">
            <b>Size per token</b>
            <p className="formula">2 × layers × KV heads × head dim × bytes</p>
            <p>
              Example, an 8B-class model (32 layers, 8 KV heads, 128 head dim, FP16):{' '}
              <code>2×32×8×128×2 = 131,072 B</code> = <b>128 KiB per token</b>.
            </p>
          </div>
          <div className="card tone-yellow">
            <b>What that means</b>
            <p>
              An 8K-token chat holds <b>1 GiB</b> of KV cache. Sixty-four such chats need <b>64 GiB</b>, more than the
              model weights themselves. <b>The KV cache, not the weights, decides how many users fit on a GPU.</b>
            </p>
          </div>
        </div>
      </Section>
    </Page>
  )
}

export function Part2Memory() {
  // physical pool of 16 blocks; owner letters A/B (sequences), S = shared prefix, '' free
  const pool = ['', 'A', '', 'B', 'S', '', 'A', 'B', '', 'S2', 'A', '', 'B', '', '', 'A']
  return (
    <Page tone="red" running="Part 2 · The scheduler & memory management" part="Part 2">
      <PartHero
        n="2"
        kicker="Part 2 · Continued"
        title="PagedAttention: virtual memory for the KV cache"
        lead="The trick that made high-throughput serving practical is one every OS textbook already contains: paging."
      />

      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: '36%' }}>Operating system</th>
            <th>PagedAttention (vLLM-style)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><b>Virtual address space</b> of a process</td><td>A sequence’s <b>logical token positions</b> (0, 1, 2, …)</td></tr>
          <tr><td><b>Page</b> (4 KiB)</td><td>A <b>KV block</b>, for example 16 tokens</td></tr>
          <tr><td><b>Page table</b></td><td>A <b>block table</b> per sequence: logical block → physical block</td></tr>
          <tr><td><b>Demand paging</b>, allocate on first touch</td><td>Grab a new block only when the last one is full</td></tr>
          <tr><td><b>fork()</b> + copy-on-write</td><td>Parallel samples <b>share</b> prompt blocks; copy only when they diverge</td></tr>
          <tr><td><b>Swap / reclaim</b> under memory pressure</td><td><b>Preemption</b>: evict a request, recompute or swap its blocks later</td></tr>
        </tbody>
      </table>

      <div className="grid2 mt">
        <Section title="Why it fixes fragmentation" color="red">
          <p>
            Older servers reserved one <b>contiguous</b> slab per request, sized for the maximum length, like giving every
            process its whole address space up front. The vLLM paper measured that only about <b>20-38%</b> of reserved
            KV memory held real tokens. With paging, waste is limited to the <b>last, partly filled block</b> of each
            sequence.
          </p>
        </Section>
        <Section title="Block tables in action" color="red">
          <div className="bt">
            <div className="bt-row"><b className="own-A">Seq A</b><span>logical 0-5 → <code>#4 #9</code> (shared) then <code>#1 #6 #10 #15</code></span></div>
            <div className="bt-row"><b className="own-B">Seq B</b><span>logical 0-4 → <code>#4 #9</code> (shared) then <code>#3 #7 #12</code></span></div>
            <div className="bt-row"><b className="own-S">Shared</b><span>blocks <code>#4 #9</code> hold the common prompt (ref-count 2)</span></div>
          </div>
          <div className="pool">
            {pool.map((o, i) => (
              <span key={i} className={`blk ${o ? `own-${o[0]}` : 'free'}`}>{i}</span>
            ))}
          </div>
          <p className="fine">GPU memory pool: scattered blocks, yet every sequence sees a contiguous range.</p>
        </Section>
      </div>

      <Section title="Prefix caching: a radix tree of tokens" color="red" className="mt">
        <div className="grid2 prefix">
          <div className="tree">
            <div className="tn root">root</div>
            <div className="tn l1">System prompt (800 tokens) <em>cached once</em></div>
            <div className="branches">
              <div>
                <div className="tn l2">“Summarize this document: …”</div>
                <div className="tn l3">+ user doc A</div>
                <div className="tn l3">+ user doc B</div>
              </div>
              <div>
                <div className="tn l2">“Translate to French: …”</div>
                <div className="tn l3">+ sentence</div>
              </div>
              <div>
                <div className="tn l2">Chat history (turn 1, 2, 3 …)</div>
                <div className="tn l3 hit">+ new message <em>only this is computed</em></div>
              </div>
            </div>
          </div>
          <div>
            <ul className="tight">
              <li>
                A new request walks the tree token by token and reuses the KV blocks of the <b>longest matching
                prefix</b>, just like longest-prefix match in an IP routing table.
              </li>
              <li>Only the new suffix is prefilled, so <b>TTFT drops</b> and GPU work is saved.</li>
              <li>
                <b>SGLang</b> calls it RadixAttention. <b>vLLM</b> reaches the same goal by hashing blocks.
              </li>
              <li>
                Full cache? Evict least-recently-used <b>leaves</b> that nobody references, like page-cache reclaim.
              </li>
            </ul>
          </div>
        </div>
      </Section>

      <Callout title="Practical tip" tone="red">
        Put <b>stable text first</b> (system prompt, tools, documents) and <b>changing text last</b> (the user question).
        Then every request shares the longest possible prefix and the cache hit rate goes up.
      </Callout>
    </Page>
  )
}
