import React from 'react'
import { Page, PartHero, Callout, Term, Section } from '../components/ui.jsx'

export function Part4Truth() {
  return (
    <Page tone="green" running="Part 4 · The classical systems truth" part="Part 4">
      <PartHero
        n="4"
        kicker="Part 4 · The classical systems truth"
        title="Nothing fundamentally changed"
        lead="Strip away the GPUs and an LLM endpoint is a long-running, stateful RPC service. Queues, back-pressure and caches still rule."
      />

      <div className="grid2">
        <Section title="Four properties of an LLM endpoint" color="green">
          <table className="tbl compact">
            <tbody>
              <tr><td><b>Stateful</b></td><td>The KV cache lives on one GPU. Use sticky or cache-aware routing, like session affinity.</td></tr>
              <tr><td><b>High latency</b></td><td>Seconds to minutes, not milliseconds. Stream with SSE and mind load-balancer idle timeouts.</td></tr>
              <tr><td><b>Unknown job size</b></td><td>Output length is unknown, so service times are heavy-tailed and P99 suffers.</td></tr>
              <tr><td><b>Memory-limited</b></td><td>Capacity is KV blocks, not CPU. Memory is the admission-control resource.</td></tr>
            </tbody>
          </table>
        </Section>
        <Section title="Queueing theory you can use" color="green">
          <div className="card tone-green">
            <p className="formula">L = λ × W</p>
            <p className="fine left">Little&rsquo;s law: requests in the system = arrival rate × time each spends there.</p>
            <p className="formula">wait ∝ 1 / (1 − ρ)</p>
            <p className="fine left">
              With utilisation ρ near 100%, waiting time explodes. Keep headroom if you have a latency SLO.
            </p>
          </div>
        </Section>
      </div>

      <Section title="Where the controls live" color="green" className="mt">
        <div className="qline">
          <div className="qbox">Clients</div>
          <div className="qarrow">→</div>
          <div className="qbox">Load balancer<small>timeouts · retries</small></div>
          <div className="qarrow">→</div>
          <div className="qbox q-accent">Waiting queue<small>bounded · 429/503 + Retry-After</small></div>
          <div className="qarrow">→</div>
          <div className="qbox q-accent">Running batch<small>max sequences · KV blocks</small></div>
          <div className="qarrow">→</div>
          <div className="qbox">GPU<small>one step per iteration</small></div>
        </div>
        <div className="grid3 mt-s">
          <div className="card"><b>Back-pressure</b><p>Bounded queues, load shedding, client timeouts. Reject early instead of failing late.</p></div>
          <div className="card"><b>Cache eviction</b><p>LRU on the prefix cache. When KV memory is full, preempt a request and recompute it later.</p></div>
          <div className="card"><b>Admission control</b><p>Cap concurrent sequences and context length so memory never runs out mid-request.</p></div>
        </div>
      </Section>

      <Section title="Prefill / decode disaggregation (DPD)" color="green" className="mt">
        <div className="dpd">
          <div className="dpd-box tone-blue">
            <b>Router</b>
            <span>cache-aware</span>
          </div>
          <div className="dpd-arrow">→</div>
          <div className="dpd-box tone-yellow">
            <b>Prefill pool</b>
            <span>compute-heavy GPUs<br />reads the prompt</span>
          </div>
          <div className="dpd-arrow dpd-kv">
            <em>KV cache<br />over NVLink / RDMA</em>→
          </div>
          <div className="dpd-box tone-green">
            <b>Decode pool</b>
            <span>bandwidth-heavy GPUs<br />streams tokens</span>
          </div>
        </div>
        <div className="grid2 mt-s">
          <div>
            <ul className="tight">
              <li><b>Why:</b> a long prefill steals GPU time from running decodes, so TPOT spikes. The two phases also want different hardware and parallelism.</li>
              <li><b>Gain:</b> scale each pool on its own, and tune TTFT and TPOT separately.</li>
              <li><b>Cost:</b> the KV cache must cross the network, and there is more to operate.</li>
            </ul>
          </div>
          <div className="card tone-green">
            <b>The classic analogy</b>
            <p>
              It mirrors splitting the <b>write path from the read path</b> (CQRS, OLTP vs OLAP): different workloads
              get different tiers. Look at DistServe, Mooncake, NVIDIA Dynamo, llm-d and vLLM&rsquo;s disaggregated mode.
            </p>
          </div>
        </div>
      </Section>

      <Callout title="Takeaway" tone="green">
        Every old lesson still applies: <b>bound your queues, size your caches, separate unlike workloads, and measure
        the tail</b>. The GPU is new. The discipline is not.
      </Callout>
    </Page>
  )
}

const metrics = [
  ['TTFT', 'Time to first token: request arrival → first token out', 'Queue wait + prefill', 'Prefix cache, chunked prefill, more prefill capacity'],
  ['TPOT', 'Time per output token (a.k.a. inter-token latency)', 'Decode: HBM bandwidth, batch size', 'Quantization, smaller batch, TP, disaggregation'],
  ['Queue wait', 'Time spent waiting before the first scheduling', 'Load vs capacity (ρ)', 'Scale out, admission control, shed load'],
  ['E2E latency', 'TTFT + TPOT × (output tokens − 1)', 'All of the above', 'Cap output length, stream results'],
]

const symptoms = [
  ['TTFT high, TPOT fine', 'Queueing or long prompts', 'waiting requests, prompt length, prefix-hit rate'],
  ['TPOT high', 'Memory-bound decode, big batches, prefill interference', 'batch size, chunked prefill, GPU memory BW'],
  ['Low GPU use, low throughput', 'CPU-bound frontend (GIL, tokenizer)', 'top -H, py-spy, more API servers'],
  ['OOM or many preemptions', 'KV cache is full', 'cache usage %, max context, TP / quantize KV'],
  ['Random stalls on multi-GPU', 'NCCL or network trouble', 'NCCL_DEBUG, NVLink errors, IB counters'],
  ['5xx / timeouts at the LB', 'Long streams vs idle timeouts', 'LB timeouts, SSE keep-alive'],
]

export function Part4Observability() {
  return (
    <Page tone="green" running="Part 4 · The classical systems truth" part="Part 4">
      <PartHero
        n="4"
        kicker="Part 4 · Continued"
        title="Observability: the metrics that matter"
        lead="You cannot tune what you cannot see. Four numbers tell you almost everything about an LLM service."
      />

      <Section title="Anatomy of one request" color="green">
        <div className="timeline">
          <div className="tl-seg tl-wait"><b>Queue wait</b></div>
          <div className="tl-seg tl-prefill"><b>Prefill</b></div>
          <div className="tl-seg tl-tok"><b>token</b></div>
          <div className="tl-seg tl-tok"><b>token</b></div>
          <div className="tl-seg tl-tok"><b>token</b></div>
          <div className="tl-seg tl-tok"><b>…</b></div>
        </div>
        <div className="tl-marks">
          <span className="m-arrive">request arrives</span>
          <span className="m-ttft">first token = <b>TTFT</b></span>
          <span className="m-tpot">gap between tokens = <b>TPOT</b></span>
        </div>
      </Section>

      <table className="tbl mt">
        <thead>
          <tr><th style={{ width: '11%' }}>Metric</th><th>Meaning</th><th style={{ width: '22%' }}>Dominated by</th><th style={{ width: '27%' }}>Levers</th></tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m[0]}>
              <td><b>{m[0]}</b></td><td>{m[1]}</td><td>{m[2]}</td><td>{m[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid2 mt">
        <Section title="Prometheus: scrape the engine" color="green">
          <Term
            title="bash + PromQL"
            code={`# vLLM-style servers expose /metrics (names vary by version)
$ curl -s localhost:8000/metrics | grep -E 'ttft|first_token|waiting|cache'
# P99 time to first token over 5 minutes
histogram_quantile(0.99,
  sum by (le) (rate(vllm:time_to_first_token_seconds_bucket[5m])))`}
          />
        </Section>
        <Section title="eBPF: see the host side" color="green">
          <Term
            title="bash · needs root"
            code={`# syscalls by name for one process
$ sudo bpftrace -e 'tracepoint:raw_syscalls:sys_enter
    /pid == 1234/ { @[comm] = count(); }'
# CPU run-queue delay (bcc; -bpfcc on Debian/Ubuntu)
$ sudo runqlat-bpfcc 5 1
$ sudo tcpretrans-bpfcc`}
          />
        </Section>
      </div>
      <p className="fine">eBPF shows sockets, syscalls and CPU scheduling. For GPU internals use DCGM exporter and Nsight Systems.</p>

      <Section title="Cheat sheet: symptom → likely cause → where to look" color="green" className="mt">
        <table className="tbl compact">
          <thead>
            <tr><th style={{ width: '27%' }}>Symptom</th><th style={{ width: '36%' }}>Likely cause</th><th>Look at</th></tr>
          </thead>
          <tbody>
            {symptoms.map((s) => (
              <tr key={s[0]}><td><b>{s[0]}</b></td><td>{s[1]}</td><td>{s[2]}</td></tr>
            ))}
          </tbody>
        </table>
      </Section>
    </Page>
  )
}
