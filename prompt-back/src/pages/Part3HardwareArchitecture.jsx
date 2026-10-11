import React from 'react'
import { Page, Section, Callout } from '../components/ui.jsx'

export function Part3Page1() {
  return (
    <Page tone="yellow" running="Part 3 · Silicon Realities" part="Part 3">
      <div className="kicker">Compute Platforms</div>
      <h1 className="big">Silicon Realities: CPU vs GPU vs TPU Architectures</h1>
      <p className="lead">
        Underneath the software layers lies the physical silicon. CPUs, GPUs, and TPUs represent fundamentally
        different design philosophies for processing matrix arithmetic.
      </p>

      <div className="grid-3 mt-s">
        <div className="card">
          <h4 style={{ margin: '0 0 2mm', color: '#1a73e8' }}>CPU (Latency-Optimized)</h4>
          <p style={{ fontSize: '8pt', margin: 0 }}>
            <b>Architecture:</b> 4 to 64 powerful cores, complex out-of-order speculative execution, massive branch predictors, large L3 caches (up to 96MB).<br /><br />
            <b>Strengths:</b> Sub-microsecond single-thread latency, versatile operating system task handling.<br />
            <b>Inference Role:</b> Quantized edge inference, lightweight CPU serving (e.g. Qwen 0.5B via AVX2), cost-effective dev environments.
          </p>
        </div>

        <div className="card">
          <h4 style={{ margin: '0 0 2mm', color: '#34a853' }}>GPU (Throughput-Optimized)</h4>
          <p style={{ fontSize: '8pt', margin: 0 }}>
            <b>Architecture:</b> Thousands of lightweight SIMT cores grouped into Streaming Multiprocessors (SMs), specialized Tensor Cores, and massive High-Bandwidth Memory (HBM).<br /><br />
            <b>Strengths:</b> Phenomenal parallel matrix throughput (thousands of TFLOPs).<br />
            <b>Inference Role:</b> Frontier model training and high-concurrency production serving (vLLM, TensorRT-LLM).
          </p>
        </div>

        <div className="card">
          <h4 style={{ margin: '0 0 2mm', color: '#ea4335' }}>TPU / ASIC (Matrix-Optimized)</h4>
          <p style={{ fontSize: '8pt', margin: 0 }}>
            <b>Architecture:</b> Custom Systolic Array hardware where data flows directly between multiplication units without register-file read/write roundtrips.<br /><br />
            <b>Strengths:</b> Maximum power efficiency for dense matrix-matrix products.<br />
            <b>Inference Role:</b> Hyper-scale cloud deployments (Google Cloud TPU v5e/v5p).
          </p>
        </div>
      </div>

      <Section title="Comparative Hardware Specifications" color="yellow" className="mt-s">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hardware Device</th>
                <th>Peak FP16 / BF16 Compute</th>
                <th>Memory Bandwidth</th>
                <th>Typical TDP</th>
                <th>Cost Profile</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Intel i5-10210U (Our Laptop)</b></td>
                <td>~0.4 TFLOP/s (AVX2 FP32)</td>
                <td><b>~40 GB/s (DDR4)</b></td>
                <td>15 – 25 Watts</td>
                <td>Commodity consumer laptop</td>
              </tr>
              <tr>
                <td><b>NVIDIA RTX 4090</b></td>
                <td>165 TFLOP/s (Tensor FP16)</td>
                <td><b>1,008 GB/s (GDDR6X)</b></td>
                <td>450 Watts</td>
                <td>~$1,800 workstation GPU</td>
              </tr>
              <tr>
                <td><b>NVIDIA A100 80GB SXM4</b></td>
                <td>312 TFLOP/s (Tensor FP16)</td>
                <td><b>2,039 GB/s (HBM2e)</b></td>
                <td>400 Watts</td>
                <td>~$12,000 enterprise data center</td>
              </tr>
              <tr>
                <td><b>NVIDIA H100 80GB SXM5</b></td>
                <td>989 TFLOP/s (Tensor FP16)</td>
                <td><b>3,350 GB/s (HBM3)</b></td>
                <td>700 Watts</td>
                <td>~$35,000 frontier AI cluster</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  )
}

export function Part3Page2() {
  return (
    <Page tone="yellow" running="Part 3 · The Memory Bandwidth Wall" part="Part 3">
      <div className="kicker">The Physics of Compute</div>
      <h1 className="big">The Memory Bandwidth Wall & The Roofline Model</h1>
      <p className="lead">
        To understand why GPU decode speed often fails to scale with core counts, systems engineers use the
        <b>Roofline Model</b> to analyze Arithmetic Intensity.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Arithmetic Intensity Defined" color="blue">
          <p>
            Arithmetic Intensity ($I$) measures the ratio of floating-point computations performed to memory bytes transferred:
          </p>
          <div className="code-box">
            <code>Arithmetic Intensity (I) = FLOPs / Bytes_Transferred</code>
          </div>
          <ul className="meta-list" style={{ marginTop: '2mm' }}>
            <li><b>Prefill Phase ($I \approx 100 - 500$ FLOPs/byte):</b> High intensity. Input prompt matrices are multiplied together; weights are reused across many tokens. Compute-bound!</li>
            <li><b>Decode Phase ($I \approx 1 - 2$ FLOPs/byte):</b> Low intensity. Only 1 token vector is multiplied against weights. Memory bandwidth bound!</li>
          </ul>
        </Section>

        <Section title="The Roofline Theoretical Ceiling" color="red">
          <p>
            Maximum achievable performance ($P$) is bounded by the minimum of two physical constraints:
          </p>
          <div className="code-box">
            <code>P = min(Peak_Compute_FLOPs, Memory_Bandwidth × I)</code>
          </div>
          <p style={{ marginTop: '2mm' }}>
            On an NVIDIA H100 (989 TFLOP/s, 3.35 TB/s HBM3), the crossover point between memory-bound and compute-bound
            is I = 989,000 / 3,350 &asymp; 295 FLOPs/byte.
            <br />
            Because decode operations operate at $I \le 2$, the H100 uses <b>less than 1% of its raw compute capacity</b> during single-stream decode!
          </p>
        </Section>
      </div>

      <Section title="Visualizing the Roofline Curve" color="yellow" className="mt-s">
        <div className="code-box">
          <code>Performance (TFLOP/s) ^<br />
             |             /--------------------- [Compute-Bound Ceiling (Peak FLOPs)]<br />
             |            /   ^ Prefill operates here!<br />
             |           /<br />
             |          / &larr; [Memory Bandwidth Slope = Bandwidth × Intensity]<br />
             |         /<br />
             |  * &larr; Decode Phase trapped down here!<br />
             +------------------------------------------------&gt; Arithmetic Intensity (FLOP/byte)</code>
        </div>
      </Section>
    </Page>
  )
}

export function Part3Page3() {
  return (
    <Page tone="yellow" running="Part 3 · Modern CPU Mechanics" part="Part 3">
      <div className="kicker">Host Architecture</div>
      <h1 className="big">Modern CPU Mechanics: AVX2 SIMD & Cache Hierarchies</h1>
      <p className="lead">
        When running model inference without a discrete GPU, performance is governed by CPU vector extensions (AVX2, AVX-512)
        and cache-line locality across the L1, L2, and L3 memory hierarchies.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Intel AVX2 SIMD Vectorization" color="blue">
          <p>
            Intel Advanced Vector Extensions 2 (AVX2) introduces 256-bit wide vector registers (<code>ymm0</code> to <code>ymm15</code>):
          </p>
          <ul className="meta-list">
            <li><b>SIMD Parallelism:</b> A single instruction processes eight 32-bit floats or thirty-two 8-bit integers simultaneously.</li>
            <li><b>Fused Multiply-Add (FMA3):</b> Computes $a \times b + c$ in a single clock cycle with zero rounding error.</li>
            <li><b>Quantized Unpacking:</b> GGML/llama.cpp executes highly optimized assembly kernels that unpack 4-bit weights and multiply them using 8-bit AVX2 integer instructions.</li>
          </ul>
        </Section>

        <Section title="The CPU Cache Latency Ladder" color="red">
          <p>
            CPU memory access latency follows an exponential penalty ladder:
          </p>
          <ul className="meta-list">
            <li><b>L1 Data Cache (32 KB/core):</b> ~4-5 clock cycles (~1 ns). Holds active hidden state vector slices.</li>
            <li><b>L2 Cache (256 KB/core):</b> ~12-14 clock cycles (~3 ns). Holds current layer intermediate activations.</li>
            <li><b>L3 Cache (Shared 6-12 MB):</b> ~35-45 clock cycles (~12 ns). Holds small model embedding chunks.</li>
            <li><b>Main Memory (DDR4 RAM):</b> ~200+ clock cycles (~60-80 ns). <i>Massive latency penalty for weight streaming!</i></li>
          </ul>
        </Section>
      </div>

      <Section title="Why Qwen 0.5B Shines on CPU" color="yellow" className="mt-s">
        <p>
          Qwen 2.5 0.5B quantized to 4-bit occupies only ~491 MB of RAM. Because its layer weights are small, a significant portion
          of current-layer matrix blocks fit into L2/L3 cache during repetitive token generation steps, keeping AVX2 vector units
          fed and achieving <b>9.7+ tokens/second</b> on our modest i5 laptop.
        </p>
      </Section>
    </Page>
  )
}

export function Part3Page4() {
  return (
    <Page tone="yellow" running="Part 3 · GPU Architecture" part="Part 3">
      <div className="kicker">Accelerated Compute</div>
      <h1 className="big">GPU Architecture: Streaming Multiprocessors & Tensor Cores</h1>
      <p className="lead">
        Modern GPUs (NVIDIA Ampere, Hopper, Blackwell) achieve astronomical throughput by organizing thousands of ALUs
        into Streaming Multiprocessors (SMs) managed by hardware warp schedulers.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Streaming Multiprocessor (SM) Anatomy" color="blue">
          <p>
            An NVIDIA H100 GPU contains 132 Streaming Multiprocessors. Each SM includes:
          </p>
          <ul className="meta-list">
            <li><b>Warp Schedulers:</b> Manages execution of warps (groups of 32 parallel threads lockstepping through instructions).</li>
            <li><b>Tensor Cores (4th Gen):</b> Specialized hardware matrix-multiply units executing <code>mma.sync</code> (Matrix Multiply-Accumulate) instructions.</li>
            <li><b>Configurable Shared Memory / L1 Cache:</b> 228 KB per SM of ultra-low latency on-chip memory operating at 30+ TB/s.</li>
            <li><b>Register File:</b> 64k 32-bit registers per SM, providing instantaneous data access to active warps.</li>
          </ul>
        </Section>

        <Section title="Tensor Core Matrix Accumulation" color="green">
          <p>
            Standard CUDA cores compute 1 scalar multiply-add per cycle. Tensor Cores execute an entire matrix operation in hardware:
          </p>
          <div className="code-box">
            <code>D = A × B + C   (where A, B, C, D are 16×16 matrices)</code>
          </div>
          <p style={{ marginTop: '2mm' }}>
            In Hopper, 4th-Gen Tensor Cores support native <b>FP8 precision (E4M3 and E5M2)</b>, doubling theoretical throughput
            over FP16 to nearly 2,000 TFLOP/s while cutting weight memory footprint in half.
          </p>
        </Section>
      </div>

      <Callout title="Why GPU Programming is Latency-Hiding" tone="yellow" className="mt-s">
        CPUs minimize latency with giant caches and branch predictors. GPUs <b>hide latency through massive concurrency</b>:
        when one warp stalls waiting for a DRAM memory read, the warp scheduler instantly switches execution to another ready warp in zero clock cycles.
      </Callout>
    </Page>
  )
}

export function Part3Page5() {
  return (
    <Page tone="yellow" running="Part 3 · Memory Subsystems" part="Part 3">
      <div className="kicker">Memory Bandwidth</div>
      <h1 className="big">HBM3 vs DDR4: The 80× Bandwidth Chasm</h1>
      <p className="lead">
        The single most decisive hardware metric dictating LLM token generation speed is <b>memory bandwidth</b>.
        Comparing enterprise GPU High-Bandwidth Memory to standard CPU system RAM reveals a massive performance gap.
      </p>

      <div className="grid-2 mt-s">
        <Section title="DDR4 / DDR5 System Memory (CPU)" color="blue">
          <p>
            Standard desktop and laptop processors connect to memory over a narrow 64-bit or 128-bit bus:
          </p>
          <ul className="meta-list">
            <li><b>Bus Width:</b> Dual-channel 128-bit memory bus running at 2666–3200 MHz.</li>
            <li><b>Peak Bandwidth:</b> Typically <b>35 to 50 GB/second</b>.</li>
            <li><b>Physical Distance:</b> Traces travel several inches across the motherboard, incurring significant capacitive load and latency.</li>
          </ul>
        </Section>

        <Section title="High-Bandwidth Memory (HBM3 / HBM3e)" color="red">
          <p>
            High-Bandwidth Memory vertically stacks DRAM dies using Through-Silicon Vias (TSVs), placed on an ultra-dense silicon interposer beside the GPU die:
          </p>
          <ul className="meta-list">
            <li><b>Bus Width:</b> 4,096 to 8,192 bits wide (up to 64× wider than CPU memory buses!).</li>
            <li><b>Peak Bandwidth:</b> Up to <b>3,350 GB/second (3.35 TB/s)</b> on H100; over <b>4.8 TB/s</b> on H200.</li>
            <li><b>Physical Distance:</b> Micro-bumps on a silicon interposer with distances measured in micrometers.</li>
          </ul>
        </Section>
      </div>

      <Section title="Visualizing Theoretical Decode Velocity" color="yellow" className="mt-s">
        <p>
          For a 7 Billion parameter model (FP16 = 14 GB per forward pass), theoretical maximum decode speed is:
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hardware Platform</th>
                <th>Memory Bandwidth</th>
                <th>Theoretical Max Decode Speed (7B FP16)</th>
                <th>Actual Observed Speed</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>CPU (DDR4 Dual Channel)</b></td>
                <td>40 GB/s</td>
                <td>40 / 14 = <b>2.8 tok/s</b></td>
                <td>~1.5 – 2.5 tok/s (OOM risk)</td>
              </tr>
              <tr>
                <td><b>GPU RTX 4090 (GDDR6X)</b></td>
                <td>1,008 GB/s</td>
                <td>1,008 / 14 = <b>72.0 tok/s</b></td>
                <td>~50 – 65 tok/s</td>
              </tr>
              <tr>
                <td><b>GPU A100 (HBM2e)</b></td>
                <td>2,039 GB/s</td>
                <td>2,039 / 14 = <b>145.6 tok/s</b></td>
                <td>~110 – 130 tok/s</td>
              </tr>
              <tr>
                <td><b>GPU H100 (HBM3)</b></td>
                <td>3,350 GB/s</td>
                <td>3,350 / 14 = <b>239.2 tok/s</b></td>
                <td>~170 – 210 tok/s</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  )
}

export function Part3Page6() {
  return (
    <Page tone="yellow" running="Part 3 · FlashAttention Mechanics" part="Part 3">
      <div className="kicker">IO-Aware Algorithms</div>
      <h1 className="big">FlashAttention 1 & 2: Tiling & SRAM Awareness</h1>
      <p className="lead">
        In 2022, Tri Dao et al. introduced FlashAttention, demonstrating that standard attention was slow not because
        of compute constraints, but because of redundant reading and writing of intermediate attention matrices to GPU VRAM.
      </p>

      <div className="grid-2 mt-s">
        <Section title="The Standard Attention Memory Bottleneck" color="red">
          <p>
            Standard self-attention materializes the full N &times; N attention matrix S = Q K^T and P = softmax(S) in High-Bandwidth Memory (HBM):
          </p>
          <ul className="meta-list">
            <li><b>Excessive HBM Traffic:</b> Reads $Q$ and $K$ &rarr; Writes $S$ to HBM &rarr; Reads $S$ &rarr; Computes softmax &rarr; Writes $P$ to HBM &rarr; Reads $P$ and $V$ &rarr; Writes output $O$.</li>
            <li><b>Memory Overhead:</b> Materializing $P$ consumes $O(N^2)$ memory, leading to out-of-memory errors on long sequences.</li>
            <li><b>Memory Stalling:</b> GPU compute cores spend 80% of their cycles waiting for HBM read/write rounds.</li>
          </ul>
        </Section>

        <Section title="FlashAttention\'s Tiled Kernel Innovation" color="green">
          <p>
            FlashAttention reorganizes the attention computation into <b>tiles</b> that fit entirely within fast SRAM (Shared Memory):
          </p>
          <ul className="meta-list">
            <li><b>Tiling (Blocking):</b> Loads blocks of $Q$, $K$, and $V$ into 228 KB SRAM.</li>
            <li><b>Online Softmax:</b> Computes softmax incrementally using running maximums and normalizers, never materializing the full $N \times N$ matrix.</li>
            <li><b>Single HBM Pass:</b> Reads $Q, K, V$ once and writes output $O$ once.</li>
          </ul>
        </Section>
      </div>

      <Section title="FlashAttention 2 Optimizations" color="blue" className="mt-s">
        <p>
          FlashAttention 2 doubled throughput over FlashAttention 1 by parallelizing work across the sequence dimension
          rather than just batch/head dimensions, reducing non-matmul FLOPs, and optimizing register allocations to reach
          <b>73% of theoretical peak FP16 TFLOP/s</b> on NVIDIA A100.
        </p>
      </Section>
    </Page>
  )
}

export function Part3Page7() {
  return (
    <Page tone="yellow" running="Part 3 · FlashAttention 3" part="Part 3">
      <div className="kicker">Hopper Specialization</div>
      <h1 className="big">FlashAttention 3: Asynchronous Warp-Specialization</h1>
      <p className="lead">
        Designed specifically for NVIDIA Hopper H100 GPUs, FlashAttention 3 harnesses asynchronous hardware features
        (Tensor Memory Accelerator, FP8 precision, warp-specialization) to achieve unprecedented attention throughput.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Tensor Memory Accelerator (TMA)" color="blue">
          <p>
            On Hopper architecture, TMA offloads memory copying from CUDA registers:
          </p>
          <ul className="meta-list">
            <li><b>Hardware DMA Engine:</b> Asynchronously transfers multidimensional tensor tiles between global HBM and shared memory (SRAM) without consuming register cycles.</li>
            <li><b>Asynchronous Transaction Barriers:</b> Threads initiate transfers and continue computing without polling or blocking.</li>
          </ul>
        </Section>

        <Section title="Warp Specialization" color="red">
          <p>
            In traditional kernels, all warps perform identical roles. FlashAttention 3 divides warps into specialized teams:
          </p>
          <ul className="meta-list">
            <li><b>Producer Warps:</b> Exclusively manage TMA data movement from HBM to SRAM and coordinate synchronization barriers.</li>
            <li><b>Consumer Warps:</b> Exclusively feed Hopper Tensor Cores, executing matrix multiplications without ever stalling for memory IO.</li>
          </ul>
        </Section>
      </div>

      <Section title="FP8 Precision & Attention Performance" color="green" className="mt-s">
        <p>
          FlashAttention 3 introduces support for native <b>FP8 quantization</b> with block scaling, pushing sustained attention
          throughput past <b>850 TFLOP/s</b> on H100—nearly 2× faster than FlashAttention 2!
        </p>
      </Section>

      <Callout title="Engineering Significance" tone="yellow" className="mt-s">
        FlashAttention 3 makes processing <b>128,000+ token context windows</b> economically viable by reducing prefill attention
        duration from dozens of seconds down to fractions of a second.
      </Callout>
    </Page>
  )
}

export function Part3Page8() {
  return (
    <Page tone="yellow" running="Part 3 · Distributed Tensor Parallelism" part="Part 3">
      <div className="kicker">Multi-GPU Scaling</div>
      <h1 className="big">Tensor Parallelism (Megatron-LM Sharding)</h1>
      <p className="lead">
        When a model\'s weights exceed the memory of a single GPU, or when latency demands ultra-fast parallel matrix compute,
        engines partition weight tensors across multiple GPUs using <b>Tensor Parallelism (TP)</b>.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Column-Parallel Linear Layers" color="blue">
          <p>
            In Multi-Head Attention and MLP projection layers, the weight matrix $W$ is sliced column-wise across $K$ GPUs:
          </p>
          <div className="code-box">
            <code>W = [W₁, W₂, ..., Wₖ]<br />
Yᵢ = X · Wᵢ   (Computed locally on GPU i)</code>
          </div>
          <p style={{ marginTop: '2mm' }}>
            Each GPU multiplies the entire input activation vector $X$ by its local weight slice $W_i$. Zero inter-GPU communication is required during this step!
          </p>
        </Section>

        <Section title="Row-Parallel Linear Layers" color="red">
          <p>
            The subsequent layer (e.g. Attention Output projection $W_o$ or MLP Down projection) is sliced row-wise:
          </p>
          <div className="code-box">
            <code>W = [W₁ᵀ; W₂ᵀ; ...; Wₖᵀ]ᵀ<br />
Y = ∑ (Yᵢ · Wᵢ) = AllReduce-Sum(local_outputs)</code>
          </div>
          <p style={{ marginTop: '2mm' }}>
            Each GPU computes a partial sum locally. An <b>All-Reduce Sum</b> collective communication operation synchronizes the outputs across all $K$ GPUs.
          </p>
        </Section>
      </div>

      <Section title="The Communication Overhead Constraint" color="yellow" className="mt-s">
        <p>
          Because every Transformer layer requires two <code>All-Reduce</code> operations, Tensor Parallelism requires
          <b>extreme inter-GPU interconnect bandwidth</b> (typically 900 GB/s NVLink). Running Tensor Parallelism over slow
          PCIe or standard Ethernet degrades performance severely as GPUs spend more time communicating than computing.
        </p>
      </Section>
    </Page>
  )
}

export function Part3Page9() {
  return (
    <Page tone="yellow" running="Part 3 · Pipeline & Sequence Parallelism" part="Part 3">
      <div className="kicker">Distributed Topologies</div>
      <h1 className="big">Pipeline Parallelism & Sequence Parallelism</h1>
      <p className="lead">
        While Tensor Parallelism shards individual layer weights, <b>Pipeline Parallelism (PP)</b> and <b>Sequence Parallelism (SP)</b>
        offer alternative distributed strategies for scaling across nodes with slower network interconnects.
      </p>

      <div className="grid-2 mt-s">
        <Section title="Pipeline Parallelism (PP)" color="blue">
          <p>
            PP partitions Transformer layers sequentially across different nodes:
          </p>
          <ul className="meta-list">
            <li><b>Layer Allocation:</b> In an 80-layer model across 4 nodes, Node 1 hosts layers 1–20; Node 2 hosts layers 21–40; and so forth.</li>
            <li><b>Point-to-Point Communication:</b> Data transfers between nodes are limited to activations at layer boundaries. Can run over InfiniBand or 100GbE!</li>
            <li><b>The Pipeline Bubble:</b> Standard PP causes idle time (&ldquo;bubbles&rdquo;). Modern schedulers use <b>1F1B (One-Forward-One-Backward)</b> interleaved execution to keep all nodes busy.</li>
          </ul>
        </Section>

        <Section title="Sequence Parallelism (SP)" color="green">
          <p>
            For ultra-long context prompts (128k to 1M tokens), individual activation tensors exceed single-GPU VRAM:
          </p>
          <ul className="meta-list">
            <li><b>Activation Sharding:</b> Slices activations along the sequence length dimension across multiple GPUs.</li>
            <li><b>Ring Attention:</b> Circularly passes Key and Value blocks between GPUs in a ring topology while computing attention concurrently with communication.</li>
            <li><b>Zero VRAM Overflow:</b> Enables processing prompts of virtually infinite length.</li>
          </ul>
        </Section>
      </div>

      <Section title="Comparing Distributed Serving Strategies" color="yellow" className="mt-s">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Sharded Entity</th>
                <th>Required Interconnect</th>
                <th>Primary Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Tensor Parallelism (TP)</b></td>
                <td>Individual Layer Weights</td>
                <td><b>NVLink (900 GB/s)</b></td>
                <td>Ultra-low latency inference within a single multi-GPU node (8× H100)</td>
              </tr>
              <tr>
                <td><b>Pipeline Parallelism (PP)</b></td>
                <td>Consecutive Layer Groups</td>
                <td>InfiniBand / RoCE (400 Gbps)</td>
                <td>Serving giant models (405B, 671B) across multiple separate physical nodes</td>
              </tr>
              <tr>
                <td><b>Sequence Parallelism (SP)</b></td>
                <td>Sequence Tokens</td>
                <td>InfiniBand (400 Gbps)</td>
                <td>Long-context documents, massive RAG, multi-modal video understanding</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  )
}

export function Part3Page10() {
  return (
    <Page tone="yellow" running="Part 3 · Interconnect Topologies" part="Part 3">
      <div className="kicker">Network Fabric</div>
      <h1 className="big">Interconnect Topologies: NVLink, PCIe & InfiniBand</h1>
      <p className="lead">
        In distributed model serving, the performance bottleneck often shifts entirely from the processor cores
        to the <b>bandwidth and topology of the interconnect fabric</b> connecting compute nodes.
      </p>

      <div className="grid-3 mt-s">
        <div className="card">
          <h4 style={{ margin: '0 0 2mm', color: '#1a73e8' }}>PCIe Gen4 / Gen5</h4>
          <p style={{ fontSize: '8pt', margin: 0 }}>
            <b>Bandwidth:</b> 32 GB/s (Gen4) to 64 GB/s (Gen5) x16 duplex.<br /><br />
            <b>Role:</b> Connects CPU to GPU, host memory to accelerator, and NVMe drives to RAM.<br />
            <b>Bottleneck:</b> Too slow for real-time Tensor Parallelism on models &gt;13B parameters; adequate for single-GPU offloading.
          </p>
        </div>

        <div className="card">
          <h4 style={{ margin: '0 0 2mm', color: '#34a853' }}>NVLink & NVSwitch</h4>
          <p style={{ fontSize: '8pt', margin: 0 }}>
            <b>Bandwidth:</b> 900 GB/s (Hopper NVLink 4) to 1,800 GB/s (Blackwell NVLink 5).<br /><br />
            <b>Role:</b> High-speed point-to-point mesh connecting all 8 GPUs inside an HGX baseboard.<br />
            <b>Capability:</b> Full all-to-all crossbar; enables all 8 GPUs to act as a single unified memory space.
          </p>
        </div>

        <div className="card">
          <h4 style={{ margin: '0 0 2mm', color: '#ea4335' }}>InfiniBand & RoCE v2</h4>
          <p style={{ fontSize: '8pt', margin: 0 }}>
            <b>Bandwidth:</b> 400 Gbps (NDR) to 800 Gbps (XDR) per NIC port.<br /><br />
            <b>Role:</b> Inter-node scale-out network fabric for multi-server clusters.<br />
            <b>Technology:</b> RDMA (Remote Direct Memory Access) bypasses the host operating system kernel and CPU entirely.
          </p>
        </div>
      </div>

      <Section title="The Latency & Bandwidth Hierarchy" color="yellow" className="mt-s">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Interconnect Level</th>
                <th>Technology</th>
                <th>Bidirectional Bandwidth</th>
                <th>Typical Latency</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>On-Chip Memory</td>
                <td>SRAM to Registers</td>
                <td><b>30,000+ GB/s</b></td>
                <td>&lt; 1 ns</td>
              </tr>
              <tr>
                <td>Device Memory</td>
                <td>HBM3 to GPU Core</td>
                <td><b>3,350 GB/s</b></td>
                <td>~ 15 ns</td>
              </tr>
              <tr>
                <td>Intra-Node Interconnect</td>
                <td>NVIDIA NVLink 4</td>
                <td><b>900 GB/s</b></td>
                <td>~ 100 ns</td>
              </tr>
              <tr>
                <td>Host Bus</td>
                <td>PCIe Gen5 x16</td>
                <td><b>64 GB/s</b></td>
                <td>~ 250 ns</td>
              </tr>
              <tr>
                <td>Inter-Node Network</td>
                <td>NDR InfiniBand (RDMA)</td>
                <td><b>50 GB/s (400 Gbps)</b></td>
                <td>~ 1,500 ns</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </Page>
  )
}
