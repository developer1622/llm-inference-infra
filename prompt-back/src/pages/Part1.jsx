import React from 'react'
import { Page, PartHero, Callout, Term, Section } from '../components/ui.jsx'

const journey = [
  {
    where: 'Network',
    what: 'Client opens TCP, then a TLS 1.3 handshake. Often ended at a load balancer or ingress (nginx, Envoy).',
    see: 'ss -tni · openssl s_client',
  },
  {
    where: 'NIC → kernel',
    what: 'The NIC DMAs packets into a ring buffer. The TCP stack reassembles them. Bytes wait in the socket receive buffer.',
    see: 'ss -tm · ethtool -S',
  },
  {
    where: 'Kernel → user',
    what: 'The server’s event loop sleeps in epoll_wait(). The kernel marks the socket readable and wakes it.',
    see: 'strace -e epoll_wait',
  },
  {
    where: 'Syscall',
    what: 'read() / recv() copies the bytes from kernel memory into a user-space buffer.',
    see: 'strace -e read,recvfrom',
  },
  {
    where: 'API process',
    what: 'uvicorn + FastAPI parse HTTP and JSON, validate, apply the chat template, then tokenize text into token IDs.',
    see: 'py-spy dump --pid',
  },
  {
    where: 'Process boundary',
    what: 'The request is serialized and sent over a local IPC socket (e.g. ZeroMQ) to the engine process.',
    see: 'ss -xp · ls -l /proc/PID/fd',
  },
  {
    where: 'Engine process',
    what: 'The request joins the scheduler’s waiting queue and is picked up at the next iteration (Part 2).',
    see: 'py-spy · top -H',
  },
]

export default function Part1() {
  return (
    <Page tone="blue" running="Part 1 · Ingress & the Linux subsystem" part="Part 1">
      <PartHero
        n="1"
        kicker="Part 1 · Ingress & the Linux subsystem"
        title="From a socket read() to user space"
        lead="Before any GPU is involved, a prompt is just bytes arriving on a Linux socket. Here is the exact path they take."
      />

      <table className="tbl journey">
        <thead>
          <tr>
            <th style={{ width: '4%' }}>#</th>
            <th style={{ width: '15%' }}>Where</th>
            <th>What happens</th>
            <th style={{ width: '25%' }}>See it with</th>
          </tr>
        </thead>
        <tbody>
          {journey.map((j, i) => (
            <tr key={j.where}>
              <td>
                <span className="num">{i + 1}</span>
              </td>
              <td>
                <b>{j.where}</b>
              </td>
              <td>{j.what}</td>
              <td>
                <code>{j.see}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Section title="Why split into several OS processes?" color="accent" className="mt-s">
        <div className="procs">
          <div className="proc">
            <b>API server process</b>
            <span>uvicorn · FastAPI · tokenizer · detokenizer · streams SSE</span>
          </div>
          <div className="proc-link">
            <em>ZeroMQ over IPC</em>
          </div>
          <div className="proc">
            <b>Engine core process</b>
            <span>scheduler loop · KV-cache manager</span>
          </div>
          <div className="proc-link">
            <em>RPC / NCCL</em>
          </div>
          <div className="proc">
            <b>GPU worker(s)</b>
            <span>one per GPU · CUDA kernels</span>
          </div>
        </div>
        <p className="fine center">Every box is its own PID with its own Python interpreter, so each has its own GIL.</p>

        <div className="grid2 mt-s">
          <div className="card">
            <b>The GIL in one sentence</b>
            <p>
              In one Python process only <b>one thread runs Python bytecode at a time</b>. Tokenizing a 100k-token
              prompt is pure CPU work that would freeze every other stream if it shared a process with the scheduler.
            </p>
          </div>
          <div className="card">
            <b>Side benefits you will like</b>
            <ul className="tight">
              <li>The scheduler loop stays steady: it must tick every few milliseconds.</li>
              <li>Crash isolation: a bad request cannot kill the GPU worker.</li>
              <li>Pin work with <code>taskset</code> / NUMA, and run several API servers.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Try it on your own box" color="accent" className="mt-s">
        <Term
          title="bash · any Linux host running an inference server"
          code={`# who is listening, and on which port?
$ ss -ltnp | grep -E ':8000|python'
# how many processes make up the server?
$ ps -eo pid,ppid,pcpu,rss,cmd | grep -i vllm
# watch the event loop: epoll_wait, read, write
$ sudo strace -f -tt -e trace=epoll_wait,recvfrom,read,sendto -p <API_PID>
# the local IPC sockets that connect the processes
$ sudo ss -xp | grep -i python`}
        />
      </Section>

      <Callout title="Takeaway" tone="blue" className="mt-s">
        An LLM server is an ordinary multi-process Linux daemon. <b>Back-pressure starts here</b>: if the engine is busy,
        the API process still accepts connections, so an unbounded queue turns into memory use and long waits.
      </Callout>
    </Page>
  )
}
