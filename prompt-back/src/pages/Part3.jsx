import React from 'react'
import { Page, PartHero, Callout, Term, Section } from '../components/ui.jsx'

// Rounded, typical figures (GB/s). Check the datasheet for your exact SKU.
const links = [
  { name: 'PCIe 4.0 x16', v: 32, note: 'per direction', tone: 'red' },
  { name: 'PCIe 5.0 x16', v: 64, note: 'per direction', tone: 'red' },
  { name: 'DDR5 dual-channel RAM', v: 90, note: 'host memory', tone: 'yellow' },
  { name: 'NVLink 4 (H100)', v: 900, note: 'GPU ↔ GPU, total per GPU', tone: 'blue' },
  { name: 'HBM3 on the GPU (H100 SXM)', v: 3350, note: 'GPU memory ↔ GPU cores', tone: 'green' },
]
const maxV = 3350

export function Part3Accelerator() {
  return (
    <Page tone="yellow" running="Part 3 · Crossing the PCIe bus to CUDA" part="Part 3">
      <PartHero
        n="3"
        kicker="Part 3 · The accelerator reality"
        title="Crossing the PCIe bus to CUDA"
        lead="The GPU is a separate computer with its own fast memory. Knowing which wire is slow explains almost every performance surprise."
      />

      <Section title="The bandwidth ladder (approximate)" color="yellow">
        <div className="ladder">
          {links.map((l) => (
            <div key={l.name} className="ladder-row">
              <span className="ladder-name">{l.name}</span>
              <span className="ladder-track">
                <span className={`ladder-fill tone-${l.tone}`} style={{ width: `${Math.max((l.v / maxV) * 100, 1.2)}%` }} />
              </span>
              <span className="ladder-val">
                {l.v >= 1000 ? `${(l.v / 1000).toFixed(2)} TB/s` : `${l.v} GB/s`}
              </span>
            </div>
          ))}
        </div>
        <p className="fine">
          Weights cross PCIe <b>once</b>, when the server starts (host RAM → VRAM). After that only tiny token IDs move
          over PCIe. The expensive traffic is <b>HBM → compute cores</b> on every single decode step.
        </p>
      </Section>

      <Section title="One model, two personalities" color="yellow" className="mt">
        <div className="grid2">
          <div className="card tone-blue persona">
            <div className="persona-head">
              <b>Prefill</b>
              <span className="tag">compute-bound</span>
            </div>
            <ul className="tight">
              <li>Reads the <b>whole prompt at once</b>.</li>
              <li>Big matrix × matrix products: <b>GEMM</b> on <b>Tensor Cores</b>.</li>
              <li>Cost grows with prompt length.</li>
              <li>Decides <b>TTFT</b>.</li>
              <li>Happens once per request (less with prefix cache hits).</li>
            </ul>
          </div>
          <div className="card tone-green persona">
            <div className="persona-head">
              <b>Decode</b>
              <span className="tag">memory-bound</span>
            </div>
            <ul className="tight">
              <li>Makes <b>one token per step</b>, then repeats.</li>
              <li>Each step re-reads <b>all weights + KV cache from HBM</b>.</li>
              <li>The maths units mostly wait for memory (<b>bandwidth starvation</b>).</li>
              <li>Decides <b>TPOT</b>.</li>
              <li>Repeats for every output token.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Back-of-the-envelope maths" color="yellow" className="mt">
        <div className="grid3">
          <div className="card">
            <b>Arithmetic intensity</b>
            <p>
              Decode at batch 1 does about <b>1 FLOP per byte</b> read. An H100 can do about 295 FLOPs per byte
              (≈989 TFLOPS BF16 ÷ 3.35 TB/s). The chip is ~99% idle waiting for memory.
            </p>
          </div>
          <div className="card">
            <b>Speed ceiling per request</b>
            <p>
              <code>tokens/s ≤ HBM bandwidth ÷ weight bytes</code>. An 8B model in FP16 (16 GB) on 3.35 TB/s tops out
              near <b>~210 tok/s</b>. In 4-bit (4 GB): ~800.
            </p>
          </div>
          <div className="card">
            <b>Why batching wins</b>
            <p>
              Weights are read <b>once per step for all B requests</b>. Throughput grows almost linearly with batch
              size until compute becomes the limit. That is why Part 2 matters.
            </p>
          </div>
        </div>
      </Section>

      <Callout title="Takeaway" tone="yellow">
        Prefill is limited by <b>math</b>, decode is limited by <b>memory bandwidth</b>. Faster HBM, smaller weights
        (quantization) and bigger batches all speed up decode. More TFLOPS mostly helps prefill.
      </Callout>
    </Page>
  )
}

export function Part3MultiGpu() {
  return (
    <Page tone="yellow" running="Part 3 · Crossing the PCIe bus to CUDA" part="Part 3">
      <PartHero
        n="3"
        kicker="Part 3 · Continued"
        title="Many GPUs, one model: tensor parallelism"
        lead="A 400B-parameter model does not fit on one GPU, so each layer is cut into slices that run side by side."
      />

      <Section title="How one layer is split across 4 GPUs" color="yellow">
        <div className="tp">
          <div className="tp-in">Input X<br /><small>same on every GPU</small></div>
          <div className="tp-arrow">↓</div>
          <div className="tp-gpus">
            {['GPU 0', 'GPU 1', 'GPU 2', 'GPU 3'].map((g, i) => (
              <div key={g} className={`tp-gpu tone-${['blue', 'red', 'yellow', 'green'][i]}`}>
                <b>{g}</b>
                <span>weight slice W{i}</span>
                <span>partial result Y{i}</span>
              </div>
            ))}
          </div>
          <div className="tp-arrow">↓</div>
          <div className="tp-red">
            <b>All-Reduce (NCCL)</b>
            <span>Y = Y0 + Y1 + Y2 + Y3, then every GPU holds the full Y</span>
          </div>
        </div>
        <p className="fine">
          This happens about <b>twice per transformer layer</b> (after attention and after the MLP), so a single token
          triggers <b>hundreds of collectives</b>. Latency, not just bandwidth, matters.
        </p>
      </Section>

      <div className="grid2 mt-s">
        <Section title="Ring all-reduce in plain words" color="yellow">
          <ol className="tight num-list">
            <li>GPUs form a <b>ring</b>; each cuts tensors into N chunks.</li>
            <li><b>Reduce-scatter</b>: N−1 steps sending &amp; summing chunks to neighbours.</li>
            <li><b>All-gather</b>: N−1 steps circulating the finished sums.</li>
            <li>Each link carries only <code>2(N−1)/N</code> data: bandwidth-optimal.</li>
          </ol>
        </Section>

        <Section title="Which wire carries the traffic?" color="yellow">
          <table className="tbl compact">
            <thead>
              <tr><th>Where</th><th>Fabric</th></tr>
            </thead>
            <tbody>
              <tr><td><b>Inside node</b></td><td>NVLink / NVSwitch (≈900 GB/s on H100)</td></tr>
              <tr><td><b>Across nodes</b></td><td>InfiniBand / RoCE v2 (400 Gb/s ≈ 50 GB/s)</td></tr>
              <tr><td><b>NIC ↔ GPU</b></td><td>GPUDirect RDMA (zero CPU copy)</td></tr>
            </tbody>
          </table>
        </Section>
      </div>

      <Section title="Which kind of parallelism, when?" color="yellow" className="mt-s">
        <table className="tbl compact">
          <thead>
            <tr><th style={{ width: '22%' }}>Kind</th><th>What is split</th><th style={{ width: '32%' }}>Typical home</th></tr>
          </thead>
          <tbody>
            <tr><td><b>Tensor (TP)</b></td><td>Each layer&rsquo;s matrices across GPUs</td><td>Inside one NVLink node</td></tr>
            <tr><td><b>Pipeline (PP)</b></td><td>Groups of layers across GPU stages</td><td>Across nodes</td></tr>
            <tr><td><b>Expert (EP)</b></td><td>MoE experts assigned to different GPUs</td><td>Large MoE clusters</td></tr>
            <tr><td><b>Data (DP)</b></td><td>Full model replicated; batches spread</td><td>High-traffic scale-out</td></tr>
          </tbody>
        </table>
      </Section>

      <Section title="Try it on a GPU host" color="yellow" className="mt-s">
        <Term
          title="bash · NVIDIA host"
          code={`# check topology (NV# = NVLink, PHB/SYS = PCIe)
$ nvidia-smi topo -m && nvidia-smi nvlink -s
# live utilisation & test NCCL transport
$ nvidia-smi dmon -s umt
$ NCCL_DEBUG=INFO python -c "import torch.distributed as d"
# measure all-reduce bandwidth (nccl-tests)
$ ./build/all_reduce_perf -b 8 -e 1G -f 2 -g 8`}
        />
      </Section>

      <Callout title="Takeaway" tone="yellow">
        Keep <b>tensor parallelism inside one NVLink island</b>. Crossing nodes with TP puts a network round trip inside
        every layer of every token.
      </Callout>
    </Page>
  )
}
