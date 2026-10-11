import React from 'react';

// PART 5: 8 High-Density Technical Pages on Low-Level Linux Systems, Networking & OS Mechanics

export const LinuxSocketStack = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part V · Low-Level Systems & Networking · Page 1</span>
        <span className="text-xs text-slate-400 font-mono">Linux Kernel Sockets & sk_buff</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">5.1 The Linux Kernel Network Stack Under LLM Streaming</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        When an LLM generates tokens autoregressively, the network stack behaves fundamentally differently than in traditional REST microservices.
        Instead of a single large response body, the kernel must handle <strong>thousands of tiny packets arriving at high frequency</strong> (e.g. 15-50 tokens/sec per connection).
      </p>

      {/* Kernel Socket Buffer Flow Diagram */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[9px] mb-4">
        <div className="text-emerald-400 font-bold mb-2">// Linux Kernel Socket Pipeline (SSE Stream Path)</div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-slate-900 rounded border border-slate-700">
            <span className="text-sky-300 font-bold block mb-1">1. User Space Write</span>
            <code className="text-slate-400">{'write(fd, "data: {...}\\n\\n")'}</code>
            <p className="text-[8px] text-slate-500 mt-1">Go runtime net.Conn</p>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-700">
            <span className="text-amber-300 font-bold block mb-1">2. Kernel sk_buff</span>
            <code className="text-slate-400">alloc_skb() &rarr; SO_SNDBUF</code>
            <p className="text-[8px] text-slate-500 mt-1">Socket write buffer queue</p>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-700">
            <span className="text-purple-300 font-bold block mb-1">3. TCP Segmentation</span>
            <code className="text-slate-400">tcp_write_xmit() & TCP_NODELAY</code>
            <p className="text-[8px] text-slate-500 mt-1">Bypasses Nagle's algorithm</p>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-700">
            <span className="text-emerald-300 font-bold block mb-1">4. NIC Ring Buffer</span>
            <code className="text-slate-400">qdisc &rarr; DMA transfer</code>
            <p className="text-[8px] text-slate-500 mt-1">Wire packet transmission</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 font-mono">The Nagle's Algorithm Trap (TCP_NODELAY)</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            By default, RFC 896 (Nagle's Algorithm) delays sending small TCP packets until outstanding ACKs are received,
            coalescing bytes into full Maximum Segment Size (MSS) frames.
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p className="text-rose-400"><strong>Catastrophic Latency:</strong> In LLM streaming, each token is 15-30 bytes. If Nagle is enabled, tokens are buffered in the kernel for 40ms (delayed ACK timer), destroying Time-to-First-Token (TTFT) and human typing smoothness!</p>
            <div className="bg-slate-950 p-2 rounded font-mono text-emerald-400 mt-2">
              setsockopt(fd, IPPROTO_TCP, TCP_NODELAY, &amp;1, sizeof(int));
            </div>
            <p className="text-emerald-300 mt-1">Go's <code>net.TCPConn</code> enables <code>SetNoDelay(true)</code> by default, flushing tokens immediately.</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">Kernel Socket Buffers: SO_SNDBUF & Backpressure</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            When a downstream client (browser or mobile app) reads slowly or experiences network jitter:
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>1. The client's TCP Receive Window collapses to zero (Zero-Window probe).</p>
            <p>2. The server's <code>SO_SNDBUF</code> fills up completely.</p>
            <p>3. Further <code>write()</code> syscalls block the model predictor thread, pausing KV cache decoding for that sequence!</p>
            <p className="text-sky-300 mt-2"><strong>Mitigation:</strong> Asynchronous streaming buffers with bounded ring-queues and explicit client disconnect detection via <code>poll()</code> or Go's <code>r.Context().Done()</code>.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px] text-slate-300">
        <h4 className="text-xs font-bold text-slate-200 mb-1 font-mono uppercase tracking-wider">Linux Tuning Parameters for LLM Gateways (/etc/sysctl.conf)</h4>
        <div className="grid grid-cols-2 gap-2 font-mono text-[9px] text-emerald-400">
          <div>net.ipv4.tcp_rmem = 4096 87380 16777216</div>
          <div>net.ipv4.tcp_wmem = 4096 65536 16777216</div>
          <div>net.core.somaxconn = 32768 (Socket listen backlog)</div>
          <div>net.ipv4.tcp_max_syn_backlog = 16384</div>
        </div>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 5.1</span>
    </div>
  </div>
);

export const EpollEventLoops = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part V · Low-Level Systems & Networking · Page 2</span>
        <span className="text-xs text-slate-400 font-mono">I/O Multiplexing & epoll Mechanics</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">5.2 High-Concurrency I/O Multiplexing: epoll and the Go Netpoller</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        LLM gateway connections are long-lived (lasting anywhere from 5 to 60 seconds per response).
        Spawning an OS thread per connection collapses kernel schedulers under thousands of concurrent users.
        Modern gateways rely on <strong>edge-triggered I/O multiplexing</strong>.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 font-mono">Traditional select() vs poll() vs epoll()</h4>
          <div className="space-y-2 text-[10px] text-slate-300">
            <div className="bg-slate-950 p-2 rounded">
              <strong className="text-rose-400">select() & poll() [O(N) Complexity]</strong>
              <p className="text-slate-400 mt-1">Passes an array of N file descriptors from userspace to kernel space on every call. Kernel scans all N descriptors linearly. Unusable past 1,024 connections.</p>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-emerald-500/40">
              <strong className="text-emerald-400">epoll() [O(1) Event Complexity]</strong>
              <p className="text-slate-400 mt-1">Maintains an in-kernel Red-Black Tree of watched descriptors and a Ready List of ready events. Returns only active file descriptors via zero-copy event lists!</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">The Go Runtime Netpoller Architecture</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Go provides asynchronous epoll performance with synchronous, readable programming models:
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>1. When a goroutine performs <code>conn.Read()</code> or <code>conn.Write()</code> on a non-ready socket, the Go runtime intercepts the syscall (EAGAIN).</p>
            <p>2. The runtime registers the fd with the kernel via <code>epoll_ctl(EPOLLIN/EPOLLOUT)</code> and parks the goroutine into <code>_Gwaiting</code> state.</p>
            <p>3. The dedicated netpoller thread monitors <code>epoll_wait()</code> and wakes the parked goroutine back onto an available M (OS thread) immediately when data arrives.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 mb-2">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">Edge-Triggered (EPOLLET) vs Level-Triggered (EPOLLIN)</h4>
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          <div className="p-2 bg-slate-900 rounded border border-slate-800">
            <strong className="text-amber-300">Level-Triggered (Default)</strong>
            <p className="text-slate-400 mt-1">Kernel notifies every time the buffer has readable data. Safer, but generates redundant wakeup notifications when reading large streaming chunks.</p>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">
            <strong className="text-emerald-300">Edge-Triggered (EPOLLET)</strong>
            <p className="text-slate-400 mt-1">Kernel notifies ONLY when the state changes from unreadable to readable. Code must loop <code>read()</code> until <code>EAGAIN</code>. Delivers absolute maximum throughput in C++ (vLLM/Envoy).</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-850 p-2.5 rounded border border-slate-700 text-[10px] text-slate-300">
        <strong>Gateway Scale Impact:</strong> A single LiteLLM or Envoy process can sustain 50,000 idle/streaming client connections using only 4 OS worker threads and ~150 MB of memory thanks to epoll event loops.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 5.2</span>
    </div>
  </div>
);

export const StreamingProtocols = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part V · Low-Level Systems & Networking · Page 3</span>
        <span className="text-xs text-slate-400 font-mono">Streaming Protocols & Data Planes</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">5.3 Streaming Protocols: Server-Sent Events (SSE) vs NDJSON vs gRPC</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Autoregressive generation generates tokens one by one over hundreds of milliseconds.
        Buffering the entire response causes massive latency penalties for human users. We examine the wire protocols that bridge model engines to frontends.
      </p>

      {/* Wire Comparison Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left font-mono text-[9px] border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/80 text-slate-300">
              <th className="p-2">Protocol</th>
              <th className="p-2">Transport</th>
              <th className="p-2">Framing & Delimiter</th>
              <th className="p-2">Browser Native Support</th>
              <th className="p-2">Serialization Overhead</th>
              <th className="p-2">Industry Adoption</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            <tr>
              <td className="p-2 font-bold text-emerald-300">Server-Sent Events (SSE)</td>
              <td className="p-2">HTTP/1.1 or HTTP/2</td>
              <td className="p-2 text-emerald-400"><code>data: &#123;...&#125;\n\n</code></td>
              <td className="p-2 text-emerald-400 font-bold">Native (EventSource API)</td>
              <td className="p-2 text-slate-400">Moderate (JSON payload)</td>
              <td className="p-2 font-bold text-white">OpenAI Standard / LiteLLM / KServe</td>
            </tr>
            <tr className="bg-slate-950/40">
              <td className="p-2 font-bold text-sky-300">NDJSON (Newline JSON)</td>
              <td className="p-2">HTTP/1.1 Chunked</td>
              <td className="p-2 text-sky-400"><code>&#123;...&#125;\n</code></td>
              <td className="p-2 text-amber-400">Requires ReadableStream fetch</td>
              <td className="p-2 text-slate-400">Moderate (JSON payload)</td>
              <td className="p-2 text-sky-200">Ollama Native (/api/chat, /api/generate)</td>
            </tr>
            <tr>
              <td className="p-2 font-bold text-purple-300">gRPC Streams</td>
              <td className="p-2">HTTP/2 Framing</td>
              <td className="p-2 text-purple-400">Binary Protobuf frames (5b header)</td>
              <td className="p-2 text-rose-400">Requires gRPC-Web proxy</td>
              <td className="p-2 text-emerald-400 font-bold">Ultra-Low (Binary Protobuf)</td>
              <td className="p-2 text-purple-200">Triton Inference Server / KServe v2 Data Plane</td>
            </tr>
            <tr className="bg-slate-950/40">
              <td className="p-2 font-bold text-amber-300">WebSockets</td>
              <td className="p-2">TCP Upgrade</td>
              <td className="p-2 text-amber-400">WebSocket Opcode Frames</td>
              <td className="p-2 text-emerald-400">Native (WebSocket API)</td>
              <td className="p-2 text-slate-400">Low (Bi-directional framing)</td>
              <td className="p-2 text-slate-400">Full-duplex audio / multimodal agents</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">The OpenAI SSE Contract Dissected</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            In Stage 2 and Stage 3, every streaming token must adhere to RFC 8895 SSE standards:
          </p>
          <div className="bg-slate-950 p-2.5 rounded font-mono text-[9px] text-slate-300 space-y-1 mb-2">
            <div className="text-sky-300">HTTP/1.1 200 OK</div>
            <div className="text-sky-300">Content-Type: text/event-stream</div>
            <div className="text-sky-300">Cache-Control: no-cache</div>
            <div className="text-sky-300">Transfer-Encoding: chunked</div>
            <div className="mt-1 text-emerald-400">{'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'}</div>
            <div className="text-slate-500">\n\n</div>
            <div className="text-rose-400">data: [DONE]\n\n</div>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">NDJSON in Ollama Native API</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Ollama's internal daemon emits raw NDJSON chunks without <code>data: </code> prefixes:
          </p>
          <div className="bg-slate-950 p-2.5 rounded font-mono text-[9px] text-slate-300 space-y-1 mb-2">
            <div className="text-amber-400">&#123;"message":&#123;"role":"assistant","content":"Hello"&#125;,"done":false&#125;\n</div>
            <div className="text-amber-400">&#123;"message":&#123;"role":"assistant","content":" world"&#125;,"done":false&#125;\n</div>
            <div className="text-emerald-400">&#123;"message":&#123;"content":""&#125;,"done":true,"eval_count":25,"eval_duration":1240000000&#125;\n</div>
          </div>
          <p className="text-[10px] text-slate-400">
            Our Go predictor in Stage 3 acts as a protocol bridge, translating Ollama NDJSON streams into compliant OpenAI SSE format on-the-fly!
          </p>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>Ingress Buffering Caveat:</strong> Reverse proxies (NGINX, Envoy) buffer responses by default. You MUST set <code>proxy_buffering off;</code> or send <code>X-Accel-Buffering: no</code> to prevent reverse proxies from swallowing stream tokens.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 5.3</span>
    </div>
  </div>
);

export const HTTPProtocols = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part V · Low-Level Systems & Networking · Page 4</span>
        <span className="text-xs text-slate-400 font-mono">HTTP Transport Protocols & Multiplexing</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">5.4 HTTP/1.1 vs HTTP/2 vs HTTP/3 for LLM Gateway Ingress</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        The choice of transport protocol directly dictates head-of-line blocking, connection churn, and connection reuse
        across distributed model serving layers.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 font-mono">HTTP/1.1 + Keep-Alive</h4>
          <p className="text-[10px] text-slate-300 leading-relaxed mb-2">
            One request/response per TCP connection at any given time.
          </p>
          <ul className="text-[9px] text-slate-400 space-y-1 list-disc list-inside">
            <li><strong>Head-of-Line Blocking:</strong> A slow 30-second LLM streaming query ties up the entire TCP socket.</li>
            <li>Browsers enforce a strict limit of 6 concurrent TCP connections per origin.</li>
            <li>Requires connection pools of hundreds of sockets between gateway and backends.</li>
          </ul>
        </div>

        <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">HTTP/2 (Binary Framing)</h4>
          <p className="text-[10px] text-slate-300 leading-relaxed mb-2">
            Multiplexes hundreds of concurrent logical streams over a single TCP socket.
          </p>
          <ul className="text-[9px] text-slate-400 space-y-1 list-disc list-inside">
            <li><strong>Zero Application HOL:</strong> 100 concurrent LLM streams share one socket without blocking each other.</li>
            <li>HPACK header compression slashes repetitive Authorization token overhead by 85%.</li>
            <li className="text-amber-400">TCP Packet Loss HOL: If a single TCP packet drops, all multiplexed streams stall until retransmission.</li>
          </ul>
        </div>

        <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">HTTP/3 (QUIC / UDP)</h4>
          <p className="text-[10px] text-slate-300 leading-relaxed mb-2">
            Multiplexed streams implemented directly over encrypted UDP datagrams.
          </p>
          <ul className="text-[9px] text-slate-400 space-y-1 list-disc list-inside">
            <li><strong>True Zero HOL:</strong> Packet loss on stream #1 has zero impact on stream #2.</li>
            <li>0-RTT connection resumption across roaming mobile networks.</li>
            <li>Ideal for edge mobile apps streaming completions over cellular links.</li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded border border-slate-800 mb-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">Production Gateway Topology: Protocol Termination</h4>
        <div className="font-mono text-[9px] text-slate-300 space-y-2">
          <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
            <span>Client &rarr; Kubernetes Ingress (NGINX / Envoy)</span>
            <span className="text-emerald-400">HTTP/2 with TLS 1.3 Termination</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
            <span>Ingress &rarr; LiteLLM Gateway Pod</span>
            <span className="text-sky-400">HTTP/1.1 Persistent Keep-Alive (500 idle pool)</span>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center">
            <span>LiteLLM &rarr; KServe Predictor Pod</span>
            <span className="text-purple-400">HTTP/2 Cleartext (h2c) or gRPC v2 Data Plane</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/80 p-3 rounded border border-slate-700 text-[10px] text-slate-300">
        <h4 className="text-xs font-bold text-white mb-1">Why HTTP/1.1 Remains Dominant in Internal Mesh Layers</h4>
        <p className="leading-relaxed">
          While HTTP/2 is ideal for edge ingress, many internal microservice meshes retain HTTP/1.1 with persistent connection pooling
          because HTTP/2 connection-level flow control (<code>SETTINGS_INITIAL_WINDOW_SIZE</code>) can create subtle throughput stalls
          when passing gigabyte-scale KV-cache snapshots or multi-megabyte prompt batches between internal nodes.
        </p>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 5.4</span>
    </div>
  </div>
);

export const MemorySubsystem = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part V · Low-Level Systems & Networking · Page 5</span>
        <span className="text-xs text-slate-400 font-mono">Virtual Memory & Kernel Paging</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">5.5 Linux Memory Subsystem: Page Tables, mmap, and HugePages</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Serving LLMs pushes the operating system virtual memory subsystem to its absolute limits.
        When loading models between 500MB and 70GB, operating system page fault handling and Translation Lookaside Buffer (TLB) misses
        can degrade inference speeds by up to 25%.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">POSIX mmap() & Demand Paging</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            When Ollama loads <code>qwen2.5:0.5b</code>, it calls <code>mmap()</code> with <code>MAP_SHARED</code>:
          </p>
          <div className="bg-slate-950 p-2 rounded font-mono text-[9px] text-emerald-400 mb-2">
            void* ptr = mmap(NULL, file_size, PROT_READ, MAP_SHARED, fd, 0);<br/>
            madvise(ptr, file_size, MADV_WILLNEED);
          </div>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>1. The OS maps file blocks to virtual memory addresses without copying them to RAM immediately.</p>
            <p>2. <code>MADV_WILLNEED</code> instructs the kernel readahead engine to begin asynchronous disk streaming immediately.</p>
            <p>3. If system RAM runs low, clean weight pages are discarded by the kernel without swap writes, and reloaded from SSD on demand!</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">The TLB Miss Crisis & Transparent HugePages</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            CPUs translate virtual to physical addresses using the hardware Translation Lookaside Buffer (TLB):
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>Standard Linux pages are <strong>4 KiB</strong>. A 16 GB model requires 4,194,304 page table entries!</p>
            <p className="text-rose-400">The CPU L1/L2 TLB only holds ~1,500 entries. Random weight lookups trigger constant multi-level page table walks in RAM (adding 50-100 CPU cycles per miss).</p>
            <div className="bg-slate-950 p-2 rounded font-mono text-emerald-400 mt-2">
              echo always &gt; /sys/kernel/mm/transparent_hugepage/enabled
            </div>
            <p className="text-emerald-300 mt-1">HugePages increase page size to <strong>2 MiB</strong> or <strong>1 GiB</strong>, reducing TLB entries by 512x and eliminating TLB walk stalls.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 mb-2">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">Memory Locking (mlock) in Production</h4>
        <p className="text-[10px] text-slate-300 leading-relaxed mb-2">
          In latency-critical production environments, allowing the Linux kernel to swap model weights or KV cache memory to disk causes catastrophic latency spikes (p99 latency jumping from 50ms to 3,000ms).
        </p>
        <div className="bg-slate-900 p-2 rounded font-mono text-[9px] text-amber-300 flex justify-between items-center">
          <span>mlock(model_weights_ptr, model_size);</span>
          <span className="text-slate-400">Requires CAP_IPC_LOCK or unlimited ulimit -l</span>
        </div>
        <p className="text-[9px] text-slate-400 mt-1">Guarantees that model weights remain permanently pinned in physical RAM, completely immune to kernel swapping.</p>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 5.5</span>
    </div>
  </div>
);

export const CPUSchedulingAndNUMA = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part V · Low-Level Systems & Networking · Page 6</span>
        <span className="text-xs text-slate-400 font-mono">Process Scheduling & NUMA Affinity</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">5.6 CPU Scheduling, Core Pinning, and NUMA Topologies</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        When running CPU-based inference (such as llama.cpp or Ollama on our Intel i5-10210U testbed),
        how the Linux Completely Fair Scheduler (CFS) assigns threads to hardware cores dictates whether inference runs at 15 tok/s or 3 tok/s.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">Physical Cores vs SMT / Hyperthreading</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Our test machine has 4 physical cores and 8 logical threads (Intel Hyper-Threading):
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>Hyper-threading duplicates CPU architectural registers, but shares execution units (ALUs, AVX2 vector units, and L1/L2 caches).</p>
            <p className="text-rose-400"><strong>The AVX2 Contention Penalty:</strong> If two threads run AVX2 vector matrix multiplications on the same physical core, they saturate the vector execution ports, creating 40% pipeline stalls!</p>
            <p className="text-emerald-300 font-bold">Rule of Thumb: Set inference thread count (OLLAMA_NUM_PARALLEL / num_threads) strictly equal to PHYSICAL core count (4), NOT logical thread count (8)!</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">NUMA Node Cross-Socket Latency</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            On dual-socket server CPUs (AMD EPYC or Intel Xeon):
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>Each CPU socket possesses its own local memory controller and local DDR5 channels (NUMA Node 0 vs Node 1).</p>
            <p className="text-rose-400">Accessing remote memory across the UPI/Infinity Fabric interconnect suffers 3x higher latency and 50% lower bandwidth than local memory access.</p>
            <div className="bg-slate-950 p-2 rounded font-mono text-emerald-400 mt-2">
              numactl --cpunodebind=0 --membind=0 ./inference_engine
            </div>
            <p className="text-emerald-300 mt-1">Pins both execution threads and weight allocations to a single NUMA node, preventing catastrophic cross-bus thrashing.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 mb-2 font-mono text-[9px]">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">CPU Affinity Command in Linux (taskset)</h4>
        <div className="space-y-1 text-slate-300">
          <p className="text-sky-300">// Pin predictor process to physical cores 0, 1, 2, 3</p>
          <div className="bg-slate-900 p-2 rounded text-emerald-400">
            taskset -c 0,1,2,3 ./kserve-predictor
          </div>
          <p className="text-slate-400 text-[8px] mt-1">Prevents CFS from migrating inference worker threads across cores, keeping L1/L2 cache lines hot!</p>
        </div>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 5.6</span>
    </div>
  </div>
);

export const CgroupsAndThrottling = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part V · Low-Level Systems & Networking · Page 7</span>
        <span className="text-xs text-slate-400 font-mono">cgroups v2 & Container Isolation</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">5.7 Linux cgroups v2: Quotas, CFS Throttling, and OOM Killers</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        In Kubernetes, resource limits defined in pod manifests (e.g. <code>limits.cpu: 500m</code> and <code>limits.memory: 256Mi</code>)
        are translated directly into Linux <strong>Control Groups (cgroups v2)</strong> by the container runtime (containerd/CRI-O).
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 font-mono">The CPU Quota & CFS Throttling Cycle</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            CPU limits are NOT physical frequency caps; they are time-slice quotas enforced over a period (typically 100ms):
          </p>
          <div className="bg-slate-950 p-2.5 rounded font-mono text-[9px] text-slate-300 space-y-1 mb-2">
            <div>cpu.cfs_period_us = 100,000 &mu;s (100ms)</div>
            <div>cpu.cfs_quota_us  = 50,000 &mu;s (500m limit)</div>
          </div>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>If an LLM predictor spins 4 threads at 100% CPU, it consumes 50,000 &mu;s in just <strong>12.5 milliseconds</strong>.</p>
            <p className="text-rose-400 font-bold">The kernel CFS scheduler forcibly suspends the entire container for the remaining 87.5ms of the period!</p>
            <p className="text-amber-300">Result: Token generation stutters violently with periodic 80ms latency spikes.</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">The Memory Limit & Kernel OOM Killer</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Memory limits are hard walls enforced by <code>memory.max</code>:
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>1. In Stage 3, we set <code>limits.memory: 256Mi</code> on the <code>kserve-qwen</code> predictor.</p>
            <p>2. If the container attempts to allocate 257 MiB (e.g. allocating too many KV cache pages or loading model weights directly inside the container without bridge):</p>
            <div className="bg-slate-950 p-2 rounded font-mono text-rose-400">
              dmesg | grep oom-kill<br/>
              kserve-predictor invoked oom-killer: gfp_mask=0x...
            </div>
            <p className="text-rose-300 mt-1 font-bold">Kubernetes immediately kills the pod with Exit Code 137 (OOMKilled) and resets the deployment.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 mb-2 font-mono text-[9px]">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">Inspecting cgroups v2 Metrics Live on Linux</h4>
        <div className="grid grid-cols-2 gap-2 text-slate-300">
          <div className="bg-slate-900 p-2 rounded">
            <span className="text-sky-300 font-bold block mb-1">Check Throttling Count:</span>
            <code>cat /sys/fs/cgroup/cpu.stat</code>
            <p className="text-[8px] text-slate-500 mt-1">Look for nr_throttled and throttled_usec</p>
          </div>
          <div className="bg-slate-900 p-2 rounded">
            <span className="text-emerald-300 font-bold block mb-1">Check Memory High Watermark:</span>
            <code>cat /sys/fs/cgroup/memory.current</code>
            <p className="text-[8px] text-slate-500 mt-1">Current RSS and PageCache bytes in container</p>
          </div>
        </div>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 5.7</span>
    </div>
  </div>
);

export const HighPerformanceIPC = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part V · Low-Level Systems & Networking · Page 8</span>
        <span className="text-xs text-slate-400 font-mono">Inter-Process Communication & Zero-Copy</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">5.8 High-Performance IPC: Unix Domain Sockets vs Shared Memory</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Modern inference architectures often split work across multiple co-located processes:
        an HTTP API frontend, a request scheduler, and one or more GPU engine worker processes (e.g. vLLM ray workers).
        The IPC mechanism between these processes determines inter-engine overhead.
      </p>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left font-mono text-[9px] border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/80 text-slate-300">
              <th className="p-2">IPC Mechanism</th>
              <th className="p-2">Transfer Latency</th>
              <th className="p-2">Memory Copies</th>
              <th className="p-2">Kernel Involvement</th>
              <th className="p-2">Best Serving Use Case</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            <tr>
              <td className="p-2 font-bold text-rose-300">TCP Loopback (127.0.0.1)</td>
              <td className="p-2">~15-25 &mu;s</td>
              <td className="p-2 text-rose-400">2 copies (user &rarr; sk_buff &rarr; user)</td>
              <td className="p-2">Full TCP stack traversal (IP routing, checksum)</td>
              <td className="p-2 text-slate-400">Default fallback when processes are isolated in separate containers</td>
            </tr>
            <tr className="bg-slate-950/40">
              <td className="p-2 font-bold text-sky-300">Unix Domain Sockets (UDS)</td>
              <td className="p-2">~3-5 &mu;s</td>
              <td className="p-2 text-sky-400">1 copy (kernel buffer)</td>
              <td className="p-2">VFS filesystem path, no IP headers or checksums</td>
              <td className="p-2 text-sky-200">Sidecar communication (e.g. Envoy to KServe predictor)</td>
            </tr>
            <tr>
              <td className="p-2 font-bold text-emerald-300">POSIX Shared Memory (/dev/shm)</td>
              <td className="p-2 font-bold text-emerald-400">&lt;0.2 &mu;s</td>
              <td className="p-2 text-emerald-400 font-bold">0 copies (Zero-Copy pointer pass)</td>
              <td className="p-2 text-emerald-300">Zero (Direct RAM access after setup)</td>
              <td className="p-2 text-emerald-200 font-bold">Tensor sharing between Ray workers & vLLM engine</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">Zero-Copy Shared Memory in vLLM</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            When tensor parallel workers exchange intermediate activation tensors across processes:
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>1. Master process creates a shared memory segment via <code>shm_open()</code>.</p>
            <p>2. Worker processes map the identical physical memory pages into their own virtual address spaces.</p>
            <p>3. Sending a 50MB activation tensor takes <strong>0 microseconds</strong>: only a 64-bit memory pointer is passed over a lightweight ring buffer!</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">UDS in Kubernetes Pod Sidecars</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            In Kubernetes multi-container pods (e.g. Envoy proxy sidecar + Model predictor):
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>Containers share an <code>emptyDir</code> volume containing a socket file: <code>/var/run/predictor.sock</code>.</p>
            <p>Replaces TCP loopback with UDS, cutting inter-container serialization latency by 75% and reducing CPU overhead on high-frequency SSE token streams.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>WSL2 Lab Bridge Implementation:</strong> In our Stage 3 KServe deployment, container isolation prevented host UDS access, so we bridged from the pod across the KinD bridge gateway (<code>172.19.0.1:11434</code>) with HTTP keep-alive connection reuse.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 5.8</span>
    </div>
  </div>
);
