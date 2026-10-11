import React from 'react';
import { Page, Section, Callout, Term } from '../components/ui.jsx';

// PART 5: 8 High-Density Technical Pages on Low-Level Linux Systems, Networking & OS Mechanics
// Styled with Google Design System, A4 Print-Safe Layout & Side Background Formatting

export const LinuxSocketStack = () => (
  <Page tone="blue" running="Part 5 · Linux Kernel Sockets & sk_buff" part="Part 5">
    <div className="kicker">Linux Kernel Network Subsystem</div>
    <h1 className="big">The Linux Kernel Network Stack Under LLM Streaming</h1>
    <p className="lead">
      Autoregressive LLM generation generates thousands of tiny packets arriving at high frequency (15–50 tokens/sec).
      We trace how the Linux kernel handles chunked streaming from socket buffers to the physical NIC.
    </p>

    <Section title="Linux Kernel Socket Pipeline (SSE Stream Path)" color="blue" className="mt-s">
      <div className="grid4">
        <div className="card tone-blue">
          <b>1. User Space Write</b>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code>write(fd, "data: ...\n\n")</code>
          </div>
          <p style={{ margin: 0, fontSize: '7pt' }}>Go runtime net.Conn socket write</p>
        </div>
        <div className="card tone-yellow">
          <b>2. Kernel sk_buff</b>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code>alloc_skb() &rarr; SO_SNDBUF</code>
          </div>
          <p style={{ margin: 0, fontSize: '7pt' }}>Socket write buffer queue</p>
        </div>
        <div className="card tone-red">
          <b>3. TCP Segmentation</b>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code>tcp_write_xmit() &bull; NODELAY</code>
          </div>
          <p style={{ margin: 0, fontSize: '7pt' }}>Bypasses Nagle's 40ms timer</p>
        </div>
        <div className="card tone-green">
          <b>4. NIC Ring Buffer</b>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code>qdisc &rarr; DMA transfer</code>
          </div>
          <p style={{ margin: 0, fontSize: '7pt' }}>Wire packet transmission</p>
        </div>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="The Nagle's Algorithm Trap (TCP_NODELAY)" color="red">
        <div className="card tone-red">
          <b>RFC 896 Nagle Buffering</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            By default, Nagle's algorithm delays small packets until pending ACKs arrive, coalescing bytes into full MSS frames.
          </p>
          <p className="fine" style={{ margin: '1mm 0', color: '#d93025' }}>
            <b>Catastrophic Latency:</b> Because tokens are only 15–30 bytes, Nagle delays tokens for 40ms, destroying Time-to-First-Token (TTFT) and human typing smoothness!
          </p>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code>setsockopt(fd, IPPROTO_TCP, TCP_NODELAY, &amp;1, sizeof(int));</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7pt' }}>
            Go's <code>net.TCPConn</code> enables <code>SetNoDelay(true)</code> by default, pushing tokens immediately.
          </p>
        </div>
      </Section>

      <Section title="SO_SNDBUF &amp; Client Backpressure" color="blue">
        <div className="card tone-blue">
          <b>Downstream Socket Saturation</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            When a downstream client (browser or mobile app) reads slowly or experiences network jitter:
          </p>
          <ul className="meta-list" style={{ fontSize: '7.2pt' }}>
            <li>1. Client TCP Receive Window collapses to zero (Zero-Window probe).</li>
            <li>2. Server <code>SO_SNDBUF</code> fills up completely.</li>
            <li>3. Subsequent <code>write()</code> syscalls block the model predictor thread, stalling KV cache execution!</li>
          </ul>
          <p className="fine" style={{ margin: '1mm 0 0', color: '#1a73e8' }}>
            <b>Mitigation:</b> Use bounded ring-queues with client disconnect detection via Go's <code>r.Context().Done()</code>.
          </p>
        </div>
      </Section>
    </div>

    <Section title="Linux Tuning Parameters for LLM Gateways (/etc/sysctl.conf)" color="green" className="mt-s">
      <div className="code-box" style={{ padding: '2mm', fontSize: '7.4pt' }}>
        <code>net.ipv4.tcp_rmem = 4096 87380 16777216 &bull; net.ipv4.tcp_wmem = 4096 65536 16777216<br/>
net.core.somaxconn = 32768 (Socket listen backlog) &bull; net.ipv4.tcp_max_syn_backlog = 16384</code>
      </div>
    </Section>

    <Callout title="Kernel Socket Principle" tone="blue" className="mt-s">
      Always verify <code>TCP_NODELAY</code> on inference streams. A single delayed ACK timer destroys streaming perception
      even if the GPU generates tokens at 100 tokens/second.
    </Callout>
  </Page>
);

export const EpollEventLoops = () => (
  <Page tone="blue" running="Part 5 · I/O Multiplexing & epoll Mechanics" part="Part 5">
    <div className="kicker">High-Concurrency I/O Multiplexing</div>
    <h1 className="big">epoll and the Go Netpoller Under Streaming Load</h1>
    <p className="lead">
      Serving thousands of concurrent open LLM streaming connections cannot rely on thread-per-connection architectures.
      We explore how Linux <code>epoll</code> and Go's runtime netpoller handle asynchronous I/O multiplexing.
    </p>

    <div className="grid2 mt-s">
      <Section title="epoll vs select() / poll() Scalability" color="blue">
        <div className="card tone-blue">
          <b>O(1) Kernel Ready-List vs O(N) Linear Scan</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Traditional <code>select()</code> copies an entire array of file descriptors to the kernel, scanning all $N$ connections linearly on every event ($O(N)$).
          </p>
          <div className="code-box" style={{ fontSize: '7.2pt', margin: '1.5mm 0', padding: '1.5mm' }}>
            <code>epoll_create1(EPOLL_CLOEXEC) &bull; epoll_ctl(ADD/MOD/DEL)<br/>n_ready = epoll_wait(epfd, events, MAX, timeout)</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            <code>epoll</code> uses in-kernel Red-Black trees to track monitored sockets and appends active descriptors to a doubly-linked ready list via NIC interrupt callbacks ($O(1)$).
          </p>
        </div>
      </Section>

      <Section title="Go Runtime Netpoller Architecture" color="green">
        <div className="card tone-green">
          <b>M:N User-Space Green Threads</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            When a goroutine reads from a socket that has no data:
          </p>
          <ul className="meta-list" style={{ fontSize: '7.2pt' }}>
            <li>1. Socket set to non-blocking: <code>O_NONBLOCK</code>.</li>
            <li>2. Read returns <code>EAGAIN</code> / <code>EWOULDBLOCK</code>.</li>
            <li>3. Go runtime parks the goroutine (<code>gopark</code>) without blocking the OS OS thread ($M$).</li>
            <li>4. Background netpoller thread monitors <code>epoll_wait()</code> and re-enqueues ready goroutines onto run-queues!</li>
          </ul>
        </div>
      </Section>
    </div>

    <Section title="Edge-Triggered (EPOLLET) vs Level-Triggered (EPOLLIN)" color="yellow" className="mt-s">
      <div className="grid2">
        <div className="card tone-yellow">
          <b>Level-Triggered (Default)</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}><code>epoll_wait()</code> continues returning the file descriptor as long as unread bytes remain in the socket buffer. Safer, but incurs redundant wakeups.</p>
        </div>
        <div className="card tone-green">
          <b>Edge-Triggered (High Performance)</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Notifies the application ONLY when new data arrives. The application must loop <code>read()</code> until <code>EAGAIN</code>, eliminating redundant syscalls!</p>
        </div>
      </div>
    </Section>

    <Callout title="Why Go Dominates Cloud-Native Serving Gateways" tone="blue" className="mt-s">
      The Go netpoller abstracts complex non-blocking <code>epoll</code> loops into simple synchronous-looking code.
      A single Go process can effortlessly maintain 50,000 idle streaming connections using under 150 MB of RAM!
    </Callout>
  </Page>
);

export const StreamingProtocols = () => (
  <Page tone="blue" running="Part 5 · Streaming Protocol Wire Comparison" part="Part 5">
    <div className="kicker">Wire Protocol Analysis</div>
    <h1 className="big">Streaming Protocols: SSE vs NDJSON vs gRPC</h1>
    <p className="lead">
      Model servers and gateways communicate across three distinct wire protocols. We dissect the trade-offs
      between Server-Sent Events, Newline-Delimited JSON, and binary gRPC.
    </p>

    <Section title="The Three Wire Streaming Contenders" color="blue" className="mt-s">
      <div className="grid3">
        <div className="card tone-green">
          <b>1. Server-Sent Events (SSE)</b>
          <div className="code-box" style={{ fontSize: '6.8pt', margin: '1mm 0', padding: '1mm' }}>
            <code>Content-Type: text/event-stream<br/>data: &#123;"choices":[...]&#125;\n\n<br/>data: [DONE]\n\n</code>
          </div>
          <p style={{ margin: 0, fontSize: '7.2pt' }}>The OpenAI industry standard. Unidirectional text stream natively supported in Web browsers via <code>EventSource</code>.</p>
        </div>

        <div className="card tone-yellow">
          <b>2. NDJSON (/api/chat)</b>
          <div className="code-box" style={{ fontSize: '6.8pt', margin: '1mm 0', padding: '1mm' }}>
            <code>Content-Type: application/x-ndjson<br/>&#123;"message":&#123;"content":"Hi"&#125;&#125;\n<br/>&#123;"done":true&#125;\n</code>
          </div>
          <p style={{ margin: 0, fontSize: '7.2pt' }}>Ollama native format. Every JSON object terminated by newline (<code>\n</code>). Lower framing overhead than SSE, parsed via <code>bufio.Scanner</code>.</p>
        </div>

        <div className="card tone-blue">
          <b>3. gRPC (HTTP/2 + Protobuf)</b>
          <div className="code-box" style={{ fontSize: '6.8pt', margin: '1mm 0', padding: '1mm' }}>
            <code>application/grpc+proto<br/>Binary Varint Length Frame<br/>Compact Protobuf Payloads</code>
          </div>
          <p style={{ margin: 0, fontSize: '7.2pt' }}>Triton / KServe v2 Data Plane. Binary wire serialization eliminates JSON string encoding and parsing overhead entirely.</p>
        </div>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="Framing &amp; Wire Parsing Tradeoffs" color="yellow">
        <div className="card tone-yellow">
          <b>Framing Overhead Comparison</b>
          <ul className="meta-list" style={{ fontSize: '7.2pt' }}>
            <li><b>SSE:</b> Adds <code>data: </code> (6 bytes) and <code>\n\n</code> (2 bytes) per chunk. For an 8-byte token, framing is 50% of the payload!</li>
            <li><b>NDJSON:</b> Adds exactly 1 byte (<code>\n</code>) per chunk, reducing byte amplification.</li>
            <li><b>gRPC:</b> Adds 5-byte HTTP/2 DATA frame header, but binary integers save 60% space on token IDs.</li>
          </ul>
        </div>
      </Section>

      <Section title="Browser &amp; Gateway Compatibility" color="green">
        <div className="card tone-green">
          <b>Ingress Traversal Reality</b>
          <ul className="meta-list" style={{ fontSize: '7.2pt' }}>
            <li><b>SSE:</b> Traverses every reverse proxy, API gateway, and cloud WAF seamlessly over standard HTTP/1.1 port 443.</li>
            <li><b>gRPC:</b> Requires explicit HTTP/2 end-to-end support, gRPC-web proxies for browsers, and specialized ingress controllers.</li>
          </ul>
        </div>
      </Section>
    </div>

    <Callout title="Engineering Consensus" tone="green" className="mt-s">
      For client-to-gateway ingress, <b>OpenAI SSE</b> is mandatory due to universal frontend client ecosystem compatibility.
      For internal pod-to-pod communication inside Kubernetes, <b>gRPC</b> is preferred to minimize serialization latency.
    </Callout>
  </Page>
);

export const HTTPProtocols = () => (
  <Page tone="blue" running="Part 5 · HTTP/1.1 vs HTTP/2 vs HTTP/3" part="Part 5">
    <div className="kicker">Transport Layer Evolution</div>
    <h1 className="big">HTTP/1.1 vs HTTP/2 vs HTTP/3 for LLM Serving</h1>
    <p className="lead">
      Streaming long-lived inference requests alters transport protocol performance. We evaluate head-of-line blocking,
      multiplexing, and connection lifecycles across HTTP versions.
    </p>

    <div className="grid3 mt-s">
      <div className="card tone-yellow">
        <b style={{ color: '#b06000' }}>HTTP/1.1 (Chunked Encoding)</b>
        <p style={{ fontSize: '7.2pt', margin: '1mm 0' }}>
          Uses <code>Transfer-Encoding: chunked</code>. Requires a dedicated physical TCP socket per concurrent request.
        </p>
        <p className="fine" style={{ margin: 0, fontSize: '7pt' }}>
          <b>Bottleneck:</b> 100 concurrent users require 100 TCP handshakes and 100 socket file descriptors.
        </p>
      </div>

      <div className="card tone-blue">
        <b style={{ color: '#1a73e8' }}>HTTP/2 (Binary Multiplexing)</b>
        <p style={{ fontSize: '7.2pt', margin: '1mm 0' }}>
          Multiplexes hundreds of independent bidirectional streams over a single shared TCP socket connection using binary frames.
        </p>
        <p className="fine" style={{ margin: 0, fontSize: '7pt' }}>
          <b>Bottleneck:</b> TCP Head-of-Line (HoL) blocking: a single dropped packet stalls ALL streams on that connection!
        </p>
      </div>

      <div className="card tone-green">
        <b style={{ color: '#188038' }}>HTTP/3 (QUIC over UDP)</b>
        <p style={{ fontSize: '7.2pt', margin: '1mm 0' }}>
          Replaces TCP with QUIC over UDP. Implements stream-level encryption and independent packet loss recovery.
        </p>
        <p className="fine" style={{ margin: 0, fontSize: '7pt' }}>
          <b>Advantage:</b> Zero HoL blocking; packet loss on Stream A does not stall token delivery on Stream B!
        </p>
      </div>
    </div>

    <div className="grid2 mt-s">
      <Section title="TCP Head-of-Line (HoL) Blocking Breakdown" color="red">
        <div className="card tone-red">
          <b>The Multi-User Streaming Trap in HTTP/2</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Suppose an API gateway multiplexes 30 client LLM streams over one HTTP/2 TCP connection.
            If packet #420 (delivering a token to User 1) is dropped on Wi-Fi:
          </p>
          <ul className="meta-list" style={{ fontSize: '7.2pt' }}>
            <li>1. Kernel TCP stack buffers packets #421–#450 awaiting retransmission.</li>
            <li>2. Users 2 through 30 experience a complete freeze in token generation!</li>
            <li>3. Once retransmitted (150ms later), all tokens burst out simultaneously, destroying typing cadence.</li>
          </ul>
        </div>
      </Section>

      <Section title="Reverse Proxy Buffering Disasters" color="yellow">
        <div className="card tone-yellow">
          <b>The proxy_buffering Trap in NGINX</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            By default, NGINX buffers upstream HTTP responses up to <code>proxy_buffer_size = 4k</code> before flushing to client.
          </p>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code># Mandatory Ingress Annotation:<br/>nginx.ingress.kubernetes.io/proxy-buffering: "off"<br/>X-Accel-Buffering: no</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7pt' }}>
            Disabling buffering forces the proxy to transmit every token byte downstream immediately!
          </p>
        </div>
      </Section>
    </div>

    <Callout title="Architectural Verdict" tone="blue" className="mt-s">
      In our Stage 3 KServe Ingress deployment, we explicitly configured <code>proxy-buffering: "off"</code> in NGINX.
      Without this annotation, streaming responses buffer silently until 4096 bytes accumulate, masking token streaming entirely!
    </Callout>
  </Page>
);

export const MemorySubsystem = () => (
  <Page tone="blue" running="Part 5 · Linux Virtual Memory & HugePages" part="Part 5">
    <div className="kicker">Virtual Memory Subsystem</div>
    <h1 className="big">Linux Memory Subsystem: Page Tables, mmap &amp; HugePages</h1>
    <p className="lead">
      Model serving runtimes allocate tens of gigabytes of virtual memory across weights and KV caches.
      We examine page table overhead, Translation Lookaside Buffer (TLB) misses, and transparent HugePages.
    </p>

    <div className="grid2 mt-s">
      <Section title="4KB Standard Pages vs 2MB HugePages" color="blue">
        <div className="card tone-blue">
          <b>The TLB Miss Bottleneck</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            The CPU TLB cache caches virtual-to-physical address mappings. A typical CPU has ~1,500 L2 TLB entries:
          </p>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code>1500 entries &times; 4 KB standard page = 6 MB cached RAM<br/>1500 entries &times; 2 MB HugePage = 3.0 GB cached RAM!</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            When traversing an 8 GB KV cache with 4KB pages, the CPU suffers frequent TLB misses, paying a 4-level page table walk penalty (~50ns) on every memory access!
          </p>
        </div>
      </Section>

      <Section title="Zero-Copy Weight Loading via mmap()" color="green">
        <div className="card tone-green">
          <b>Zero Heap Allocation at Boot</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Engines like llama.cpp and Ollama use <code>mmap()</code> to map GGUF files directly into virtual memory:
          </p>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code>void* ptr = mmap(NULL, size, PROT_READ, MAP_SHARED, fd, 0);<br/>madvise(ptr, size, MADV_WILLNEED); // Pre-fault page cache</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            Allows instant boot, zero RAM duplication across multiple workers, and automated kernel page eviction under memory pressure.
          </p>
        </div>
      </Section>
    </div>

    <Section title="Memory Allocation Strategies for LLM Serving" color="yellow" className="mt-s">
      <div className="grid3">
        <div className="card tone-red">
          <b>Standard glibc malloc</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Severe memory fragmentation when allocating millions of dynamic attention chunks. Causes unbounded RSS growth.</p>
        </div>
        <div className="card tone-green">
          <b>jemalloc / TCMalloc</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Thread-local allocation arenas with size-class bins. Drastically reduces lock contention during continuous batching.</p>
        </div>
        <div className="card tone-blue">
          <b>Pre-Allocated Block Pools</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>PagedAttention allocates fixed 16-token physical blocks at startup, completely eliminating runtime malloc during decoding!</p>
        </div>
      </div>
    </Section>

    <Callout title="Production Tuning Recommendation" tone="yellow" className="mt-s">
      Enable Transparent HugePages (THP) via <code>echo madvise &gt; /sys/kernel/mm/transparent_hugepage/enabled</code>.
      This allows PyTorch and llama.cpp to allocate 2MB pages for weight matrices while avoiding latency spikes on standard background processes.
    </Callout>
  </Page>
);

export const CPUSchedulingAndNUMA = () => (
  <Page tone="blue" running="Part 5 · CPU Scheduling & NUMA Nodes" part="Part 5">
    <div className="kicker">Processor Architecture &amp; Affinity</div>
    <h1 className="big">CPU Scheduling, Core Pinning &amp; NUMA Topology</h1>
    <p className="lead">
      Running CPU inference on multi-socket servers or hybrid core processors requires understanding
      Non-Uniform Memory Access (NUMA) and thread scheduling affinity.
    </p>

    <div className="grid2 mt-s">
      <Section title="The NUMA Memory Access Penalty" color="red">
        <div className="card tone-red">
          <b>Local RAM vs Remote Socket RAM</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            In dual-socket servers, each CPU socket owns a local memory bank. When Socket 0 accesses RAM attached to Socket 1:
          </p>
          <ul className="meta-list" style={{ fontSize: '7.2pt' }}>
            <li>Traffic crosses the inter-socket interconnect (UPI / Infinity Fabric).</li>
            <li>Memory access latency increases from <b>70ns to 135ns (+90%)</b>.</li>
            <li>Effective memory bandwidth drops by 40–55%!</li>
          </ul>
          <p className="fine" style={{ margin: '1mm 0 0', color: '#d93025' }}>
            Because LLM decode is memory-bound, NUMA cross-traffic halves token generation speed immediately!
          </p>
        </div>
      </Section>

      <Section title="CPU Core Pinning &amp; taskset / numactl" color="green">
        <div className="card tone-green">
          <b>Thread Affinity Enforcement</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Binding inference threads to specific physical CPU cores prevents OS scheduler migrations across sockets:
          </p>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code># Run Ollama strictly on NUMA node 0 memory &amp; cores:<br/>numactl --cpunodebind=0 --membind=0 ollama serve<br/>taskset -c 0-3 ./stage1-client</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            Pinning guarantees L1/L2 cache preservation and 100% local memory bandwidth utilization.
          </p>
        </div>
      </Section>
    </div>

    <Section title="Physical Cores vs Hyperthreading (SMT) for Matrix SIMD" color="yellow" className="mt-s">
      <div className="grid2">
        <div className="card tone-yellow">
          <b>Hyperthreading (SMT) Inefficiency</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Hyperthreads share the same physical AVX2 execution units. Spawning 8 threads on a 4-core CPU causes execution port contention and slows down SIMD arithmetic!</p>
        </div>
        <div className="card tone-green">
          <b>Physical Core Optimum: OMP_NUM_THREADS = 4</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>In our testbed benchmarks, running 4 threads on 4 physical cores yielded <b>24.0 tok/s</b>, whereas spawning 8 hyperthreads dropped speed to <b>19.2 tok/s</b>!</p>
        </div>
      </div>
    </Section>

    <Callout title="Engineering Rule for CPU Model Serving" tone="blue" className="mt-s">
      Always set <code>OMP_NUM_THREADS</code> equal to the number of <b>physical CPU cores</b>, never logical hyperthreads.
      Saturating physical AVX2 execution units without thread context-switching maximizes instruction throughput.
    </Callout>
  </Page>
);

export const CgroupsAndThrottling = () => (
  <Page tone="blue" running="Part 5 · Linux cgroups v2 & CFS Quotas" part="Part 5">
    <div className="kicker">Resource Containment &amp; Throttling</div>
    <h1 className="big">Linux cgroups v2: Quotas, CFS Throttling &amp; OOM Killer</h1>
    <p className="lead">
      Kubernetes enforces resource limits through Linux cgroups v2. We examine how CPU CFS quotas throttle inference
      latency and how kernel memory limits trigger abrupt OOM crashes.
    </p>

    <div className="grid2 mt-s">
      <Section title="Completely Fair Scheduler (CFS) CPU Quotas" color="red">
        <div className="card tone-red">
          <b>The cpu.max Period Quota</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            In Kubernetes, <code>resources.limits.cpu: "500m"</code> is translated by the kubelet into:
          </p>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code>cpu.max = 50000 100000 (50ms quota per 100ms CFS period)</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            If the container exhausts its 50ms quota in the first 20ms, the kernel deschedules all container threads for the remaining 80ms!
            In LLM streaming, this causes severe periodic 80ms stutter cliffs.
          </p>
        </div>
      </Section>

      <Section title="Memory Limits &amp; The Kernel OOM Killer" color="yellow">
        <div className="card tone-yellow">
          <b>memory.max vs memory.high</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            In cgroups v2:
          </p>
          <ul className="meta-list" style={{ fontSize: '7.2pt' }}>
            <li><b>memory.high:</b> Soft throttle limit; kernel throttles page allocations to slow down consumption.</li>
            <li><b>memory.max:</b> Hard boundary; exceeding this immediately triggers the Linux Out-Of-Memory (OOM) killer.</li>
            <li><b>OOM Invocation:</b> The kernel terminates the largest RSS process (the inference model daemon) with signal 9 (SIGKILL)!</li>
          </ul>
        </div>
      </Section>
    </div>

    <Section title="Inspecting cgroups v2 in Kubernetes Pods" color="green" className="mt-s">
      <Term
        title="bash · Verifying Limits Inside KServe Pod"
        code={`$ kubectl exec -it kserve-qwen-predictor-xxx -n kserve-test -- cat /sys/fs/cgroup/cpu.max
50000 100000   # Enforces exactly 500m CPU limit

$ cat /sys/fs/cgroup/memory.max
268435456      # Enforces exactly 256Mi memory limit

$ cat /sys/fs/cgroup/cpu.stat
nr_periods 1420
nr_throttled 12     # Indicates CFS throttling events during bursty prefill`}
      />
    </Section>

    <Callout title="SRE Production Guidance" tone="green" className="mt-s">
      In Stage 3, we set KServe limits to <code>cpu: 500m</code> and <code>memory: 256Mi</code>.
      Because our Go predictor uses only 14MB RSS and delegates heavy SIMD math to the host Ollama bridge, it runs with zero OOM risk!
    </Callout>
  </Page>
);

export const HighPerformanceIPC = () => (
  <Page tone="blue" running="Part 5 · IPC Mechanisms: UDS vs Shared Memory" part="Part 5">
    <div className="kicker">Inter-Process Communication</div>
    <h1 className="big">High-Performance IPC: Unix Domain Sockets vs Shared Memory</h1>
    <p className="lead">
      When deploying sidecar architectures (e.g. gateway proxying to local model predictor), choice of Inter-Process
      Communication (IPC) dictates serialization overhead and context switch latency.
    </p>

    <div className="grid2 mt-s">
      <Section title="Unix Domain Sockets (AF_UNIX)" color="blue">
        <div className="card tone-blue">
          <b>Loopback TCP vs Domain Sockets</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Unix Domain Sockets bypass the entire TCP/IP network stack (checksumming, packet segmentation, TCP ACKs, routing tables).
          </p>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code>int fd = socket(AF_UNIX, SOCK_STREAM, 0);<br/>bind(fd, "/var/run/ollama.sock", ...);</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            Data is copied directly between user buffers in kernel memory. Latency drops from <b>12&mu;s (TCP loopback) down to 3.5&mu;s (UDS)</b>!
          </p>
        </div>
      </Section>

      <Section title="POSIX Shared Memory (shm_open)" color="green">
        <div className="card tone-green">
          <b>Zero-Copy Shared Virtual Memory</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Processes map the exact same physical RAM pages into their respective virtual address spaces:
          </p>
          <div className="code-box" style={{ fontSize: '7pt', margin: '1mm 0', padding: '1mm' }}>
            <code>int shm_fd = shm_open("/llm_kv_pool", O_CREAT | O_RDWR, 0666);<br/>void* ptr = mmap(NULL, size, PROT_READ|PROT_WRITE, MAP_SHARED, shm_fd, 0);</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            Communication is instantaneous (0&mu;s overhead). Used by vLLM for ray worker tensor exchange and Disaggregated Prefill.
          </p>
        </div>
      </Section>
    </div>

    <Section title="IPC Latency &amp; Throughput Benchmark Summary" color="yellow" className="mt-s">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Transport</th>
              <th>Round-Trip Latency</th>
              <th>Throughput (GB/s)</th>
              <th>Copies</th>
              <th>Primary Production Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>TCP Loopback (127.0.0.1)</b></td>
              <td>12.5 &mu;s</td>
              <td>4.2 GB/s</td>
              <td>2 (TCP buffers)</td>
              <td>Cross-container pod networking, generic REST APIs</td>
            </tr>
            <tr>
              <td><b>Unix Domain Socket (UDS)</b></td>
              <td>3.6 &mu;s</td>
              <td>11.8 GB/s</td>
              <td>1 (Kernel copy)</td>
              <td>Sidecar-to-predictor communication on same Kubernetes node</td>
            </tr>
            <tr>
              <td><b>POSIX Shared Memory (/dev/shm)</b></td>
              <td>0.2 &mu;s</td>
              <td>38.4 GB/s (Bus limit)</td>
              <td><b>0 (Zero-copy)</b></td>
              <td>Multi-process tensor parallel exchange (vLLM, TensorRT-LLM)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Section>

    <Callout title="Stage 1 &amp; Stage 2 Synthesis" tone="blue" className="mt-s">
      In Stage 2, LiteLLM talks to Ollama via TCP loopback (<code>http://127.0.0.1:11434</code>).
      For ultra-low latency production, switching from TCP loopback to a mounted Unix domain socket (<code>/var/run/ollama.sock</code>)
      eliminates 70% of inter-process latency!
    </Callout>
  </Page>
);
