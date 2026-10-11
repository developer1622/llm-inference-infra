import React from 'react'
import { Page, Section, DownArrow } from '../components/ui.jsx'

const boxes = [
  {
    n: 1,
    tone: 'blue',
    title: 'Ingress & OS boundary',
    items: [
      'Client TLS handshake → Linux socket (epoll) → API gateway',
      'Process boundaries: FastAPI → IPC → inference scheduler (AsyncLLM)',
    ],
  },
  {
    n: 2,
    tone: 'red',
    title: 'The scheduling engine',
    items: [
      'Continuous batching and iteration-level scheduling (fixing head-of-line blocking)',
      'Memory management: PagedAttention as classic virtual-memory paging',
      'Prefix caching with radix trees',
    ],
  },
  {
    n: 3,
    tone: 'yellow',
    title: 'The accelerator reality',
    items: [
      'Host RAM → device VRAM over PCIe / NVLink',
      'Compute-bound prefill (GEMM, Tensor Cores) vs memory-bound decode (HBM bandwidth)',
      'Inter-GPU scaling: tensor parallelism (NCCL all-reduce over NVLink / RoCE)',
    ],
  },
  {
    n: 4,
    tone: 'green',
    title: 'The distributed-systems truth',
    items: [
      'Why AI apps are still just Linux processes and network queues',
      'Prefill/decode disaggregation as the classic OLTP vs OLAP split',
      'Observability: TTFT, TPOT, and tracing with eBPF and Prometheus',
    ],
  },
]

const rosetta = [
  ['A prompt arriving', 'A request on a TCP socket, woken by epoll'],
  ['API server + engine split', 'nginx + app workers: separate PIDs, separate GILs'],
  ['Scheduler iteration (1 token)', 'Preemptive time slice, with a quantum of one token'],
  ['KV cache blocks', 'Memory pages, a page table, copy-on-write'],
  ['Prefix cache (radix tree)', 'Page cache, plus longest-prefix-match like a routing table'],
  ['GPU HBM / PCIe / NVLink', 'RAM / the I/O bus / a fast NUMA-style interconnect'],
  ['NCCL all-reduce', 'MPI_Allreduce, the reduce step of MapReduce'],
  ['Prefill / decode split', 'Write path vs read path (OLTP vs OLAP, CQRS)'],
  ['TTFT / TPOT', 'Time to first byte / inter-packet gap'],
]

export default function MapPage() {
  return (
    <Page tone="multi" running="The map" part="Overview">
      <div className="kicker">The map</div>
      <h1 className="big">Four stops from socket to silicon</h1>
      <p className="lead">
        Follow one prompt on its journey. Each part of this guide zooms into one stop, and the colours stay the same on
        every page.
      </p>

      <div className="map">
        {boxes.map((b, i) => (
          <React.Fragment key={b.n}>
            <div className={`map-box tone-${b.tone}`}>
              <div className="map-n">Part {b.n}</div>
              <div>
                <div className="map-title">{b.title}</div>
                <ul>
                  {b.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            {i < boxes.length - 1 && <DownArrow />}
          </React.Fragment>
        ))}
      </div>

      <Section title="Rosetta stone: LLM serving ↔ Linux & systems" color="accent" className="mt">
        <table className="tbl">
          <thead>
            <tr>
              <th>In LLM serving</th>
              <th>The Linux / systems cousin</th>
            </tr>
          </thead>
          <tbody>
            {rosetta.map(([a, b]) => (
              <tr key={a}>
                <td>
                  <b>{a}</b>
                </td>
                <td>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </Page>
  )
}
