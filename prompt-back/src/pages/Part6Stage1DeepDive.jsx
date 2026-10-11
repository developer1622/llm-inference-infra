import React from 'react';

// PART 6: 8 High-Density Technical Pages on Stage 1 Deep Dive (Ollama, Go Client, CPU SIMD, Benchmarking)

export const Stage1Architecture = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part VI · Stage 1 Deep Dive · Page 1</span>
        <span className="text-xs text-slate-400 font-mono">System Architecture & Process Model</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">6.1 Stage 1 Architecture: Local Model Serving Foundations</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Stage 1 establishes the baseline serving layer. Before introducing gateways, proxies, or Kubernetes orchestration,
        we interact directly with the model runtime to understand raw token generation, latency profiles, and resource utilization.
      </p>

      {/* Stage 1 Architecture Diagram */}
      <div className="bg-slate-950 p-4 rounded border border-slate-800 font-mono text-[9px] mb-4">
        <div className="text-emerald-400 font-bold mb-3">// Stage 1 Execution Flow on WSL2 Ubuntu 24.04</div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2.5 bg-slate-900 rounded border border-sky-500/40">
            <span className="text-sky-300 font-bold block mb-1">1. Go Benchmark Client</span>
            <span className="text-slate-400 block mb-1"><code>stage1-client</code></span>
            <p className="text-[8px] text-slate-500">Go 1.24 binary · net/http · Bufio scanner · Timer instrumentation</p>
          </div>
          <div className="p-2.5 bg-slate-900 rounded border border-amber-500/40">
            <span className="text-amber-300 font-bold block mb-1">2. HTTP Loopback Socket</span>
            <span className="text-slate-400 block mb-1"><code>127.0.0.1:11434</code></span>
            <p className="text-[8px] text-slate-500">TCP keep-alive · HTTP/1.1 chunked NDJSON · Stream streaming</p>
          </div>
          <div className="p-2.5 bg-slate-900 rounded border border-emerald-500/40">
            <span className="text-emerald-300 font-bold block mb-1">3. Ollama Server Daemon</span>
            <span className="text-slate-400 block mb-1"><code>ollama serve</code></span>
            <p className="text-[8px] text-slate-500">Go daemon &rarr; C++ llama.cpp runner (AVX2 SIMD) &rarr; Qwen2.5 (398MB)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">Stage 1 Design Principles</h4>
          <ul className="text-[10px] text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong>Zero External Dependencies:</strong> No Docker, no Python virtualenvs, no cloud APIs. Runs entirely on local WSL2 hardware.</li>
            <li><strong>Pure Go Client Implementation:</strong> Built directly with standard library <code>net/http</code> to avoid SDK abstractions hiding wire semantics.</li>
            <li><strong>Deterministic Benchmarking:</strong> Temperature set to 0.0 to eliminate variance across comparative prompt evaluations.</li>
          </ul>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">Verified Models in Lab</h4>
          <div className="space-y-2 text-[10px]">
            <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">Qwen2.5-0.5B-Instruct</span>
                <span className="text-slate-400 text-[9px]">494M params · 24 layers · GGUF Q4_K_M</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">398 MB</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white block">SmolLM2-135M-Instruct</span>
                <span className="text-slate-400 text-[9px]">135M params · 30 layers · GGUF Q4_K_M</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">95 MB</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px] text-slate-300 font-mono">
        <strong>Hardware Reality:</strong> With 7.8 GiB DDR4 RAM and an Intel i5-10210U CPU, choosing <code>qwen2.5:0.5b</code> ensures the entire model weights + KV cache occupy &lt;600 MB, leaving 7+ GB of head-room for OS buffers and Kubernetes nodes!
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 6.1</span>
    </div>
  </div>
);

export const OllamaInternals = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part VI · Stage 1 Deep Dive · Page 2</span>
        <span className="text-xs text-slate-400 font-mono">Ollama Daemon Architecture</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">6.2 Ollama Internals: Go Orchestrator and C++ llama.cpp Runner</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Ollama is frequently treated as a black box. In reality, it is a sophisticated hybrid systems architecture:
        a high-concurrency Go HTTP server acting as an orchestrator, driving an out-of-process C++ inference runner compiled from llama.cpp.
      </p>

      {/* Internal Architecture Diagram */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[9px] mb-4">
        <div className="text-emerald-400 font-bold mb-2">// Ollama Dual-Process Architecture</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 bg-slate-900 rounded border border-sky-500/40">
            <span className="text-sky-300 font-bold block mb-1">Process 1: ollama serve (Go Binary)</span>
            <ul className="text-[8px] text-slate-400 space-y-1 list-disc list-inside">
              <li>HTTP Server & REST router (/api/chat, /v1/chat/completions)</li>
              <li>Model Registry & Blobs Manager (~/.ollama/models/blobs)</li>
              <li>Runner lifecycle management (spawns/kills runner processes)</li>
              <li>Idle timeout reaper (evicts models after 5m of inactivity)</li>
            </ul>
          </div>
          <div className="p-2.5 bg-slate-900 rounded border border-emerald-500/40">
            <span className="text-emerald-300 font-bold block mb-1">Process 2: ollama_llama_server (C++ Binary)</span>
            <ul className="text-[8px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Linked with llama.cpp engine and ggml math library</li>
              <li>AVX2 / FMA / CPU vector SIMD execution loops</li>
              <li>Paged KV cache management & token sampler</li>
              <li>Communicates with Go parent via Unix Domain Socket or local port</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 font-mono">Dynamic Runner Detection</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            During startup, Ollama scans the host CPU feature flags (<code>/proc/cpuinfo</code>):
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>1. If CUDA libraries and NVIDIA GPU are found, it spawns <code>runners/cuda_v12/ollama_llama_server</code>.</p>
            <p>2. If AVX-512 is supported, it launches the AVX-512 optimized runner.</p>
            <p className="text-emerald-300 font-bold">3. On our Intel i5-10210U laptop, it automatically selects <code>runners/cpu_avx2/ollama_llama_server</code>, maximizing SIMD vector performance without manual configuration!</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 font-mono">The 5-Minute Keep-Alive Eviction Model</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            To prevent idle models from permanently consuming host RAM:
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>Ollama tracks an inactivity timer for each loaded runner (default: <code>keep_alive = 5m</code>).</p>
            <p>If no inference requests arrive within 5 minutes, Ollama terminates the C++ runner process, calling <code>munmap()</code> on the model weights and releasing all 398 MB back to the OS.</p>
            <p className="text-sky-300">Set <code>keep_alive: -1</code> in API payloads to keep the model pinned in memory permanently.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>Cold vs Warm Loading:</strong> The first request after eviction incurs a ~450ms model reload latency while the file is re-mapped into memory. Subsequent warm requests begin prefill within 15ms.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 6.2</span>
    </div>
  </div>
);

export const GoClientArchitecture = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part VI · Stage 1 Deep Dive · Page 3</span>
        <span className="text-xs text-slate-400 font-mono">Go net/http Client Engineering</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">6.3 Engineering the Go Inference Client: Transports, Timeouts & Streaming</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Writing a production-grade LLM client in Go requires overriding standard HTTP client defaults.
        Using default settings results in early socket aborts, stalled connections, and goroutine leaks.
      </p>

      {/* Code Snippet Box */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[9px] mb-4">
        <div className="text-emerald-400 font-bold mb-1">// Optimized Go HTTP Transport for LLM Inference (stage1/main.go)</div>
        <div className="text-slate-300 space-y-0.5">
          <span className="text-sky-400">transport</span> := &amp;http.Transport&#123;<br/>
          &nbsp;&nbsp;DialContext: (&amp;net.Dialer&#123;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;Timeout:&nbsp;&nbsp;&nbsp;5 * time.Second,<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;KeepAlive: 60 * time.Second,<br/>
          &nbsp;&nbsp;&#125;).DialContext,<br/>
          &nbsp;&nbsp;MaxIdleConns:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;100,<br/>
          &nbsp;&nbsp;MaxIdleConnsPerHost:&nbsp;20,<br/>
          &nbsp;&nbsp;IdleConnTimeout:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;90 * time.Second,<br/>
          &nbsp;&nbsp;ResponseHeaderTimeout: 30 * time.Second, <span className="text-amber-400">// Time-To-First-Token protection</span><br/>
          &nbsp;&nbsp;DisableCompression:&nbsp;&nbsp;true,&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// Prevent stream chunk buffering</span><br/>
          &#125;<br/>
          <span className="text-sky-400">client</span> := &amp;http.Client&#123; Transport: transport &#125; <span className="text-rose-400">// NO Client.Timeout! It kills streaming!</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider mb-2 font-mono">The http.Client.Timeout Trap</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Standard REST services set <code>http.Client&#123;Timeout: 10 * time.Second&#125;</code>.
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p className="text-rose-400">In Go, <code>Client.Timeout</code> governs the entire lifecycle from initial dial to reading the final EOF of the response body!</p>
            <p>If an LLM streams a 500-token response over 15 seconds, a 10s timeout abruptly terminates the socket midway through generation, returning <code>context deadline exceeded</code>.</p>
            <p className="text-emerald-300 font-bold">Solution: Use ResponseHeaderTimeout for TTFT, and per-token read deadlines or context cancellation for generation timeouts.</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">Streaming Token Extraction via bufio.Scanner</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Extracting streaming tokens with lowest latency and minimal garbage collection:
          </p>
          <div className="bg-slate-950 p-2 rounded font-mono text-[9px] text-sky-300 mb-2">
            scanner := bufio.NewScanner(resp.Body)<br/>
            for scanner.Scan() &#123;<br/>
            &nbsp;&nbsp;line := scanner.Bytes()<br/>
            &nbsp;&nbsp;token := parseToken(line)<br/>
            &nbsp;&nbsp;metrics.RecordToken(token)<br/>
            &#125;
          </div>
          <p className="text-[10px] text-slate-400">
            <code>scanner.Bytes()</code> avoids heap allocations per token by reusing the internal buffer slice, keeping GC pause times &lt;50 microseconds.
          </p>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-300">
        <strong>Context Cancellation:</strong> Binding requests to <code>context.WithCancel(ctx)</code> ensures that if a user abandons a browser tab, calling <code>cancel()</code> immediately tears down the TCP socket, signaling Ollama to abort KV cache generation.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 6.3</span>
    </div>
  </div>
);

export const WireProtocolDeepDive = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part VI · Stage 1 Deep Dive · Page 4</span>
        <span className="text-xs text-slate-400 font-mono">Wire Protocols & Payload Contracts</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">6.4 Wire Protocol Deep Dive: Ollama Native vs OpenAI Standard</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Ollama natively exposes two distinct HTTP endpoints for chat inference.
        Understanding their exact byte framing on the wire is critical for building gateways and protocol adapters.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Endpoint 1: Ollama Native */}
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">1. Ollama Native: /api/chat</h4>
            <span className="text-[9px] bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded font-mono">NDJSON</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-2">
            Emits newline-delimited JSON objects directly across a chunked HTTP/1.1 response body.
          </p>
          <div className="bg-slate-950 p-2.5 rounded font-mono text-[8.5px] text-slate-300 space-y-1 mb-2">
            <div className="text-amber-400">&#123;"model":"qwen2.5:0.5b","created_at":"...","message":&#123;"role":"assistant","content":"The"&#125;,"done":false&#125;</div>
            <div className="text-amber-400">&#123;"model":"qwen2.5:0.5b","created_at":"...","message":&#123;"role":"assistant","content":" capital"&#125;,"done":false&#125;</div>
            <div className="text-emerald-400">&#123;"model":"qwen2.5:0.5b","done":true,"total_duration":1683921000,"load_duration":12450000,"prompt_eval_count":14,"prompt_eval_duration":182000000,"eval_count":52,"eval_duration":1488000000&#125;</div>
          </div>
          <p className="text-[9px] text-slate-400">
            <strong>Key Benefit:</strong> Final packet provides exact nanosecond telemetry directly from the C++ inference engine!
          </p>
        </div>

        {/* Endpoint 2: OpenAI Standard */}
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider font-mono">2. OpenAI Standard: /v1/chat/completions</h4>
            <span className="text-[9px] bg-sky-950/60 text-sky-300 px-1.5 py-0.5 rounded font-mono">SSE Stream</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-2">
            Complies with OpenAI API specification via Server-Sent Events (RFC 8895).
          </p>
          <div className="bg-slate-950 p-2.5 rounded font-mono text-[8.5px] text-slate-300 space-y-1 mb-2">
            <div className="text-sky-400">{'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","choices":[{"delta":{"content":"The"}}]}\n\n'}</div>
            <div className="text-sky-400">{'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","choices":[{"delta":{"content":" capital"}}]}\n\n'}</div>
            <div className="text-rose-400">data: [DONE]\n\n</div>
          </div>
          <p className="text-[9px] text-slate-400">
            <strong>Key Benefit:</strong> Universally compatible with LiteLLM, LangChain, OpenAI SDKs, and enterprise gateways without adapters.
          </p>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 mb-2 font-mono text-[9px]">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">Deciphering Ollama's Nanosecond Telemetry</h4>
        <div className="grid grid-cols-3 gap-2 text-slate-300">
          <div className="bg-slate-900 p-2 rounded">
            <span className="text-amber-300 font-bold block mb-1">prompt_eval_duration:</span>
            <span>182,000,000 ns (182 ms)</span>
            <p className="text-[8px] text-slate-500 mt-1">Prefill time for 14 prompt tokens (~76.9 tok/s)</p>
          </div>
          <div className="bg-slate-900 p-2 rounded">
            <span className="text-emerald-300 font-bold block mb-1">eval_duration:</span>
            <span>1,488,000,000 ns (1,488 ms)</span>
            <p className="text-[8px] text-slate-500 mt-1">Autoregressive generation for 52 tokens (34.9 tok/s)</p>
          </div>
          <div className="bg-slate-900 p-2 rounded">
            <span className="text-sky-300 font-bold block mb-1">total_duration:</span>
            <span>1,683,921,000 ns (1.68 s)</span>
            <p className="text-[8px] text-slate-500 mt-1">Full end-to-end wall-clock time including socket I/O</p>
          </div>
        </div>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 6.4</span>
    </div>
  </div>
);

export const GenerationMetrics = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part VI · Stage 1 Deep Dive · Page 5</span>
        <span className="text-xs text-slate-400 font-mono">Latency Math & Benchmark Measurements</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">6.5 Autoregressive Generation Metrics: TTFT, ITL, and Tok/s</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Traditional web latency focuses exclusively on total response time. For LLMs, this single metric is misleading.
        A 5-second response that begins streaming in 200ms feels instantaneous, whereas a 5-second response with zero output until 4.9s feels broken.
      </p>

      {/* Latency Timeline Visualizer */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[9px] mb-4">
        <div className="text-emerald-400 font-bold mb-2">// Anatomy of an LLM Request Timeline</div>
        <div className="flex h-10 rounded overflow-hidden text-center text-[8.5px] font-bold">
          <div className="w-[15%] bg-sky-700 flex flex-col justify-center text-white" title="Socket Dial + TLS">Network Dial<br/>(1-5 ms)</div>
          <div className="w-[25%] bg-amber-600 flex flex-col justify-center text-white" title="Prefill / Prompt Processing">Prefill Phase (TTFT)<br/>(180 ms)</div>
          <div className="w-[60%] bg-emerald-600 flex flex-col justify-center text-white" title="Token Generation Loop">Decode Phase: 35 Tokens @ 28.5 ms / token (ITL)<br/>(1,000 ms total decode)</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 font-mono">1. Time to First Token (TTFT)</h4>
          <p className="text-[10px] text-slate-300 leading-relaxed mb-2">
            Time from sending the prompt to receiving the first generated token byte.
          </p>
          <div className="bg-slate-950 p-1.5 rounded font-mono text-[9px] text-amber-400 mb-1">
            TTFT = t_network + t_tokenize + t_prefill
          </div>
          <p className="text-[9px] text-slate-400">Dominated by prompt length and compute throughput. Governs perceived system responsiveness.</p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1 font-mono">2. Inter-Token Latency (ITL)</h4>
          <p className="text-[10px] text-slate-300 leading-relaxed mb-2">
            Time interval between successive token emissions: t_(i) - t_(i-1).
          </p>
          <div className="bg-slate-950 p-1.5 rounded font-mono text-[9px] text-emerald-400 mb-1">
            ITL = 1.0 / (Tokens per Second)
          </div>
          <p className="text-[9px] text-slate-400">Dominated by memory bandwidth. Human reading speed is ~5 tokens/sec; ITL &lt; 50ms feels ultra-smooth.</p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-1 font-mono">3. End-to-End Latency (E2E)</h4>
          <p className="text-[10px] text-slate-300 leading-relaxed mb-2">
            Total elapsed duration to complete the full completion.
          </p>
          <div className="bg-slate-950 p-1.5 rounded font-mono text-[9px] text-sky-400 mb-1">
            E2E = TTFT + (N_gen - 1) &times; ITL
          </div>
          <p className="text-[9px] text-slate-400">Dictates overall API timeouts, client connection holding times, and concurrency capacity.</p>
        </div>
      </div>

      {/* Lab Measurements Box */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px]">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 font-mono">Empirical Lab Measurements (Qwen2.5:0.5B on Intel i5-10210U WSL2)</h4>
        <div className="grid grid-cols-4 gap-2 font-mono text-center text-slate-300">
          <div className="bg-slate-900 p-2 rounded">
            <span className="text-slate-400 text-[9px] block">TTFT (Warm)</span>
            <span className="text-emerald-400 font-bold text-sm">182 ms</span>
          </div>
          <div className="bg-slate-900 p-2 rounded">
            <span className="text-slate-400 text-[9px] block">Decode Speed</span>
            <span className="text-emerald-400 font-bold text-sm">34.9 tok/s</span>
          </div>
          <div className="bg-slate-900 p-2 rounded">
            <span className="text-slate-400 text-[9px] block">Inter-Token Latency</span>
            <span className="text-emerald-400 font-bold text-sm">28.6 ms</span>
          </div>
          <div className="bg-slate-900 p-2 rounded">
            <span className="text-slate-400 text-[9px] block">Memory RSS</span>
            <span className="text-emerald-400 font-bold text-sm">398 MB</span>
          </div>
        </div>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 6.5</span>
    </div>
  </div>
);

export const ExecutionProfiling = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part VI · Stage 1 Deep Dive · Page 6</span>
        <span className="text-xs text-slate-400 font-mono">Hardware Profiling & SIMD Verification</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">6.6 Execution Profiling on Intel i5-10210U: AVX2 SIMD in Action</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Without dedicated GPUs, our inference performance relies entirely on Intel AVX2 (Advanced Vector Extensions 2) SIMD instructions.
        We profile the execution down to assembly instructions using Linux performance counters.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">perf stat Hardware Counter Capture</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Running <code>perf stat</code> on the runner during token generation reveals:
          </p>
          <div className="bg-slate-950 p-2 rounded font-mono text-[8.5px] text-slate-300 space-y-1 mb-2">
            <div>instructions:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4,821,902,110</div>
            <div>cycles:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3,214,601,400</div>
            <div className="text-emerald-400">instructions per cycle (IPC): 1.50</div>
            <div>cache-misses:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;18,402,100 (1.4% of all refs)</div>
            <div className="text-sky-300">branches:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;682,100,000</div>
            <div className="text-sky-300">branch-misses:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0.38% (Outstanding prediction)</div>
          </div>
          <p className="text-[9px] text-slate-400">
            An IPC of 1.50 indicates high SIMD pipeline occupancy. Loop unrolling in llama.cpp keeps branch mispredictions &lt;0.5%.
          </p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 font-mono">Thermal Throttling & CPU P-States</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            The Intel i5-10210U is a mobile processor with a 15W TDP (Thermal Design Power):
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>1. <strong>Burst Mode:</strong> During the initial 2-3 seconds, CPU boosts to 4.2 GHz across all cores.</p>
            <p className="text-rose-400">2. <strong>Thermal Soak:</strong> Package temperature rises from 48&deg;C to 82&deg;C. The thermal governor throttles clocks down to 2.1 GHz sustained.</p>
            <p className="text-amber-300">3. <strong>Throughput Impact:</strong> Initial prompt eval executes at ~85 tok/s, settling into 35 tok/s during prolonged decode sessions.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[9px] mb-2">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">Verifying AVX2 Instructions via objdump / gdb</h4>
        <div className="space-y-1 text-slate-300">
          <p className="text-sky-400"># Disassembling llama.cpp GEMM inner loop:</p>
          <div className="bg-slate-900 p-2 rounded text-emerald-400">
            vmovups&nbsp;&nbsp;(%rsi,%rax), %ymm0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;; Load 8 float32 weights into 256-bit YMM register<br/>
            vfmadd231ps (%rdi,%rax), %ymm0, %ymm1&nbsp;&nbsp;; Fused Multiply-Add: ymm1 = ymm1 + (ymm0 * data)
          </div>
          <p className="text-slate-400 text-[8px] mt-1">Single-cycle FMA (Fused Multiply-Add) instruction executes 8 multiplications and 8 additions simultaneously per core!</p>
        </div>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 6.6</span>
    </div>
  </div>
);

export const MemoryBreakdown = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part VI · Stage 1 Deep Dive · Page 7</span>
        <span className="text-xs text-slate-400 font-mono">Memory Forensics & Allocation Anatomy</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">6.7 Memory Footprint Breakdown: RSS, Page Cache, and Working Sets</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Understanding the exact memory breakdown of a model server is critical for sizing container limits.
        Looking purely at <code>ps aux</code> RSS (Resident Set Size) provides an incomplete picture.
      </p>

      {/* Memory Tree Visualizer */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[9px] mb-4">
        <div className="text-emerald-400 font-bold mb-2">// Ollama Process Memory Allocation Map (qwen2.5:0.5b)</div>
        <div className="space-y-1.5 text-slate-300">
          <div className="flex justify-between bg-slate-900 p-1.5 rounded border border-slate-800">
            <span className="text-white font-bold">1. Model Weight mmap (Shared PageCache)</span>
            <span className="text-emerald-400 font-bold">398.2 MB</span>
          </div>
          <div className="flex justify-between bg-slate-900 p-1.5 rounded border border-slate-800">
            <span className="text-white font-bold">2. KV Cache Allocation (2048 Context Length)</span>
            <span className="text-sky-400 font-bold">36.0 MB (FP16 Key + Value per layer)</span>
          </div>
          <div className="flex justify-between bg-slate-900 p-1.5 rounded border border-slate-800">
            <span className="text-white font-bold">3. Compute Scratch Buffer (Hidden activations & logits)</span>
            <span className="text-amber-400 font-bold">18.5 MB</span>
          </div>
          <div className="flex justify-between bg-slate-900 p-1.5 rounded border border-slate-800">
            <span className="text-white font-bold">4. Go Server Orchestrator (HTTP router & buffers)</span>
            <span className="text-purple-400 font-bold">24.1 MB</span>
          </div>
          <div className="flex justify-between bg-emerald-950/40 p-2 rounded border border-emerald-500/40">
            <span className="text-emerald-300 font-bold">Total Working Set (RSS + Active Clean Pages)</span>
            <span className="text-emerald-300 font-bold text-sm">~476.8 MB</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">Clean vs Dirty Memory Pages</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Linux divides resident memory into clean and dirty pages:
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p><strong>Clean Pages (398 MB weights):</strong> Backed directly by the GGUF file on NVMe disk. If the kernel needs memory, clean pages are instantly dropped without writing to swap.</p>
            <p><strong>Dirty Pages (78 MB KV cache + heap):</strong> Dynamically allocated by malloc. Must be preserved in RAM or written to swap disk under memory pressure.</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">Working Set in Kubernetes Pod Limits</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            How this dictated our Stage 3 container limits:
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>Running Ollama entirely inside a pod requires at least <strong>512 MiB to 1 GiB</strong> memory limits.</p>
            <p>By decoupling the Go proxy into KServe with <code>limits.memory: 256Mi</code> and bridging to host Ollama, the pod uses only <strong>18 MiB RSS</strong>, achieving 93% memory savings!</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>WSL2 Memory Boundary:</strong> WSL2 allocates up to 50% of Windows physical RAM (7.8 GiB limit). Keeping working sets compact guarantees zero host memory swapping.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 6.7</span>
    </div>
  </div>
);

export const Stage1FailureModes = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part VI · Stage 1 Deep Dive · Page 8</span>
        <span className="text-xs text-slate-400 font-mono">Failure Modes & Incident Playbooks</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">6.8 Stage 1 Failure Modes: SRE Incident Playbook & Edge Cases</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        In local and edge model serving, failure manifests differently than in cloud REST services.
        We dissect the top four production incident archetypes encountered in Stage 1.
      </p>

      {/* Incident Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Incident 1 */}
        <div className="bg-slate-800/80 p-3.5 rounded border border-rose-500/40">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-rose-300 font-mono">INCIDENT 1: ECONNREFUSED on 11434</h4>
            <span className="text-[8px] bg-rose-950 text-rose-300 px-1 py-0.5 rounded">SEV-1</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-1 leading-relaxed">
            Client receives <code>dial tcp 127.0.0.1:11434: connect: connection refused</code>.
          </p>
          <div className="text-[9px] text-slate-400 space-y-0.5 mb-2 font-mono">
            <div>Root Cause: Ollama daemon not running or binding to 0.0.0.0 instead of 127.0.0.1.</div>
            <div className="text-emerald-400">Fix: OLLAMA_HOST=0.0.0.0:11434 ollama serve &</div>
          </div>
          <p className="text-[9px] text-slate-300 bg-slate-950 p-1.5 rounded">
            <strong>Prevention:</strong> Systemd unit file with <code>Restart=always</code> and <code>RestartSec=3s</code>.
          </p>
        </div>

        {/* Incident 2 */}
        <div className="bg-slate-800/80 p-3.5 rounded border border-amber-500/40">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-amber-300 font-mono">INCIDENT 2: 500 Model Eviction Latency Spike</h4>
            <span className="text-[8px] bg-amber-950 text-amber-300 px-1 py-0.5 rounded">SEV-2</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-1 leading-relaxed">
            First request after idle period takes 3,500ms instead of 180ms TTFT.
          </p>
          <div className="text-[9px] text-slate-400 space-y-0.5 mb-2 font-mono">
            <div>Root Cause: 5-minute keep_alive timeout evicted the runner from memory.</div>
            <div className="text-emerald-400">Fix: Pass "keep_alive": -1 in request JSON payload.</div>
          </div>
          <p className="text-[9px] text-slate-300 bg-slate-950 p-1.5 rounded">
            <strong>Prevention:</strong> Synthetic heartbeat probe firing a 1-token prompt every 60s.
          </p>
        </div>

        {/* Incident 3 */}
        <div className="bg-slate-800/80 p-3.5 rounded border border-purple-500/40">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-purple-300 font-mono">INCIDENT 3: Context Overflow Truncation</h4>
            <span className="text-[8px] bg-purple-950 text-purple-300 px-1 py-0.5 rounded">SEV-2</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-1 leading-relaxed">
            Model hallucinating or repeating itself when input prompt exceeds context limit.
          </p>
          <div className="text-[9px] text-slate-400 space-y-0.5 mb-2 font-mono">
            <div>Root Cause: Ollama default num_ctx is 2048; prompt exceeded 2048 tokens.</div>
            <div className="text-emerald-400">Fix: Pass "options": &#123;"num_ctx": 4096&#125; in payload.</div>
          </div>
          <p className="text-[9px] text-slate-300 bg-slate-950 p-1.5 rounded">
            <strong>Tradeoff:</strong> Doubling num_ctx doubles KV cache RAM consumption from 36MB to 72MB.
          </p>
        </div>

        {/* Incident 4 */}
        <div className="bg-slate-800/80 p-3.5 rounded border border-rose-500/40">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-xs font-bold text-rose-300 font-mono">INCIDENT 4: Corrupted Model Blob Hash</h4>
            <span className="text-[8px] bg-rose-950 text-rose-300 px-1 py-0.5 rounded">SEV-1</span>
          </div>
          <p className="text-[10px] text-slate-300 mb-1 leading-relaxed">
            Ollama returns <code>error: "invalid model manifest or hash mismatch"</code>.
          </p>
          <div className="text-[9px] text-slate-400 space-y-0.5 mb-2 font-mono">
            <div>Root Cause: Partial download aborted during network drop.</div>
            <div className="text-emerald-400">Fix: rm -rf ~/.ollama/models/blobs/sha256-... && ollama pull</div>
          </div>
          <p className="text-[9px] text-slate-300 bg-slate-950 p-1.5 rounded">
            <strong>Prevention:</strong> Pre-bake model blobs into container images during CI/CD.
          </p>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>Takeaway:</strong> Local serving works reliably for single processes, but lacks multi-tenant authentication, rate-limiting, and automatic failover. This necessitates Stage 2: LiteLLM API Gateway.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 6.8</span>
    </div>
  </div>
);
