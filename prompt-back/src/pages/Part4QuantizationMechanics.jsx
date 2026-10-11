import React from 'react';
import { Page, Section, Callout, Term } from '../components/ui.jsx';

// PART 4: 8 High-Density Technical Pages on LLM Quantization Mechanics
// Styled with Google Design System, A4 Print-Safe Layout & Side Background Formatting

export const QuantizationIntro = () => (
  <Page tone="green" running="Part 4 · Quantization Mechanics & Economics" part="Part 4">
    <div className="kicker">Memory Bandwidth &amp; Bit Economics</div>
    <h1 className="big">Why Quantization Is Mandatory in Modern Serving</h1>
    <p className="lead">
      In deep learning inference, quantization is an existential operational requirement: autoregressive decoding is
      strictly bounded by memory bandwidth, not compute capacity.
    </p>

    <div className="grid2 mt-s">
      <Section title="The Arithmetic Intensity Reality" color="green">
        <div className="card tone-green">
          <b>Token Generation Math (Batch Size = 1)</b>
          <p style={{ fontSize: '7.6pt', margin: '1mm 0' }}>
            Computing the next token requires loading every single parameter of the model from memory through the bus into processor registers for 2 FLOPs per weight.
          </p>
          <div className="code-box" style={{ margin: '1.5mm 0', padding: '1.5mm 2mm', fontSize: '7.4pt' }}>
            <code>Arithmetic Intensity = 2 FLOPs / B bytes loaded<br/>FP16: 2 FLOPs / 2 bytes = 1.0 FLOP/byte<br/>INT4: 2 FLOPs / 0.5 bytes = 4.0 FLOP/byte</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            On our 38.4 GB/s dual-channel DDR4 laptop, a 7B model in FP16 (14 GB) yields at best <b>2.74 tok/s</b>. In INT4 (3.9 GB), theoretical speed jumps to <b>9.85 tok/s</b>!
          </p>
        </div>
      </Section>

      <Section title="Memory Footprint Across Precisions" color="blue">
        <div className="card tone-blue">
          <b>VRAM &amp; Storage Scaling (7B Parameter Model)</b>
          <ul className="meta-list" style={{ marginTop: '1.5mm', fontSize: '7.4pt' }}>
            <li><b>FP32 (Single):</b> 4.0 bytes/param &bull; 28.0 GB VRAM (Impractical for serving)</li>
            <li><b>FP16 / BF16 (Half):</b> 2.0 bytes/param &bull; 14.0 GB VRAM (Standard master weights)</li>
            <li><b>INT8 (Quarter):</b> 1.0 bytes/param &bull; 7.0 GB VRAM (W8A8 Tensor Core target)</li>
            <li><b>INT4 / Q4_K_M:</b> ~0.55 bytes/param &bull; 3.9 GB VRAM (Standard edge &amp; CPU target)</li>
            <li><b>INT2 / Q2_K:</b> ~0.32 bytes/param &bull; 2.3 GB VRAM (Severe perplexity cliff)</li>
          </ul>
        </div>
      </Section>
    </div>

    <Section title="The Three Core Axes of LLM Quantization" color="yellow" className="mt-s">
      <div className="grid3">
        <div className="card tone-green">
          <b style={{ color: '#188038' }}>1. Weight-Only (W4A16, W8A16)</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Weights stored compressed in 4-bit or 8-bit; dequantized on-the-fly into registers for FP16 math. Best for memory-bounded single-user decode.</p>
        </div>
        <div className="card tone-blue">
          <b style={{ color: '#1a73e8' }}>2. Weight &amp; Activation (W8A8)</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Both weights and activations quantized. Matrix multiplications execute via integer INT8 Tensor Cores. Massive compute throughput boost for prefill.</p>
        </div>
        <div className="card tone-yellow">
          <b style={{ color: '#b06000' }}>3. KV Cache Quantization</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Keys and values in attention cache compressed to FP8 or INT4. Reduces context memory footprint by 50–75%, doubling maximum concurrent sequences.</p>
        </div>
      </div>
    </Section>

    <Callout title="Key Systems Takeaway" tone="green" className="mt-s">
      Compressing weights by 4&times; drops memory bus saturation by 4&times;, directly translating to a ~3.5&times; to 4&times;
      throughput increase during memory-bound autoregressive decoding.
    </Callout>
  </Page>
);

export const NumericalFormats = () => (
  <Page tone="green" running="Part 4 · Floating Point vs Fixed Point" part="Part 4">
    <div className="kicker">Numerical Representations &amp; Bit Layouts</div>
    <h1 className="big">Floating Point vs Fixed Point Formats</h1>
    <p className="lead">
      To understand quantization error, we examine silicon bit layouts. Every numeric format balances
      dynamic range against precision resolution.
    </p>

    <Section title="Bit Layout Architecture Across Formats" color="green" className="mt-s">
      <div className="space-y-2 text-[8pt]">
        <div className="card tone-blue" style={{ padding: '2mm 3mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
            <b>IEEE 754 FP32 (Single Precision)</b>
            <span className="fine">Range: 1.4e-45 to 3.4e38 &bull; Precision: ~7.2 decimal digits</span>
          </div>
          <div style={{ display: 'flex', height: '5mm', borderRadius: '1mm', overflow: 'hidden', textAlign: 'center', fontSize: '6.5pt', fontWeight: 700, color: '#fff' }}>
            <div style={{ width: '3.125%', background: '#d93025' }}>S</div>
            <div style={{ width: '25%', background: '#b06000' }}>Exponent (8 bits, bias 127)</div>
            <div style={{ width: '71.875%', background: '#1a73e8' }}>Mantissa / Fraction (23 bits)</div>
          </div>
        </div>

        <div className="card tone-yellow" style={{ padding: '2mm 3mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
            <b>IEEE 754 FP16 (Half Precision)</b>
            <span className="fine">Range: 6.0e-8 to 65,504 &bull; Precision: ~3.3 decimal digits</span>
          </div>
          <div style={{ display: 'flex', height: '5mm', borderRadius: '1mm', overflow: 'hidden', textAlign: 'center', fontSize: '6.5pt', fontWeight: 700, color: '#fff' }}>
            <div style={{ width: '6.25%', background: '#d93025' }}>S</div>
            <div style={{ width: '31.25%', background: '#b06000' }}>Exp (5b, bias 15)</div>
            <div style={{ width: '62.5%', background: '#1a73e8' }}>Mantissa (10 bits)</div>
          </div>
          <p className="fine" style={{ margin: '1mm 0 0', color: '#b06000' }}>Warning: Narrow 5-bit exponent triggers frequent overflow (NaN/Inf) during LLM training.</p>
        </div>

        <div className="card tone-green" style={{ padding: '2mm 3mm' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1mm' }}>
            <b>Brain Floating Point (BF16 &bull; Google Brain)</b>
            <span className="fine">Range: Identical to FP32 (~3.4e38) &bull; Precision: ~2.4 decimal digits</span>
          </div>
          <div style={{ display: 'flex', height: '5mm', borderRadius: '1mm', overflow: 'hidden', textAlign: 'center', fontSize: '6.5pt', fontWeight: 700, color: '#fff' }}>
            <div style={{ width: '6.25%', background: '#d93025' }}>S</div>
            <div style={{ width: '50%', background: '#b06000' }}>Exponent (8 bits, bias 127)</div>
            <div style={{ width: '43.75%', background: '#1a73e8' }}>Mantissa (7 bits)</div>
          </div>
          <p className="fine" style={{ margin: '1mm 0 0', color: '#188038' }}>Preserves FP32 dynamic range. The standard master weights format for LLaMA 3, Mistral, and Qwen.</p>
        </div>
      </div>
    </Section>

    <div className="grid2 mt-s">
      <Section title="FP8 (E4M3 / E5M2)" color="blue">
        <div className="card tone-blue">
          <b>Hopper FP8 Format</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Native to NVIDIA H100 and Ada Lovelace. Provides 2&times; compute throughput over FP16 with hardware-accelerated transformer engine scaling.</p>
        </div>
      </Section>
      <Section title="INT8 Signed Two's Complement" color="green">
        <div className="card tone-green">
          <b>Integer Quantization Target</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Uniform linear grid spanning [-128, 127]. Replaces floating point multiply with fast integer SIMD arithmetic via scale factor $X = S \times q$.</p>
        </div>
      </Section>
    </div>

    <Callout title="The Dynamic Range Challenge" tone="red" className="mt-s">
      While 99% of weights cluster normally around zero, critical attention dimensions contain massive outlier activations (&gt;15.0).
      Mapping integer ranges naively destroys precision on standard weights, causing severe perplexity degradation.
    </Callout>
  </Page>
);

export const UniformQuantization = () => (
  <Page tone="green" running="Part 4 · Uniform Quantization Math" part="Part 4">
    <div className="kicker">Linear Mapping Mechanics</div>
    <h1 className="big">Uniform Quantization Math: Scale &amp; Zero-Point</h1>
    <p className="lead">
      Uniform quantization maps continuous floating-point values into discrete integer grid points using linear transformations.
      Here is the exact arithmetic executed by llama.cpp and vLLM.
    </p>

    <div className="grid2 mt-s">
      <Section title="Symmetric Quantization (Zero-Point = 0)" color="green">
        <div className="card tone-green">
          <b>Zero Maps to Zero</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Predominantly used for weights because weight distributions naturally center around zero.
          </p>
          <div className="code-box" style={{ fontSize: '7.2pt', padding: '1.5mm 2mm', margin: '1.5mm 0' }}>
            <code>S = max(|X_min|, |X_max|) / (2^(b-1) - 1)<br/>q = clip(round(X / S), -2^(b-1), 2^(b-1) - 1)<br/>X_approx = q &times; S</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            <b>Benefit:</b> Zero overhead during SIMD decode; single broadcast scalar multiplication.
          </p>
        </div>
      </Section>

      <Section title="Asymmetric Quantization (With Zero-Point)" color="blue">
        <div className="card tone-blue">
          <b>Arbitrary Interval Mapping</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Maps asymmetric intervals [X_min, X_max] across the full integer range $[0, 2^b - 1]$.
          </p>
          <div className="code-box" style={{ fontSize: '7.2pt', padding: '1.5mm 2mm', margin: '1.5mm 0' }}>
            <code>S = (X_max - X_min) / (2^b - 1)<br/>Z = round(-X_min / S)<br/>q = clip(round(X / S) + Z, 0, 2^b - 1)<br/>X_approx = (q - Z) &times; S</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            <b>Benefit:</b> Eliminates quantization noise on asymmetric data like post-ReLU activations.
          </p>
        </div>
      </Section>
    </div>

    <Section title="Quantization Granularity Comparison" color="yellow" className="mt-s">
      <div className="grid3">
        <div className="card tone-red">
          <b style={{ color: '#d93025' }}>Per-Tensor Quantization</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>One scale $S$ for the entire matrix ($4096 \times 4096$). Minimal metadata overhead, but severe accuracy loss due to outlier dominance.</p>
        </div>
        <div className="card tone-yellow">
          <b style={{ color: '#b06000' }}>Per-Channel / Per-Row</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>One scale $S$ per output channel. Standard for INT8 execution. Effectively isolates channel-level scale variations.</p>
        </div>
        <div className="card tone-green">
          <b style={{ color: '#188038' }}>Group-Wise / Block-Wise (GGUF)</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Divides rows into small blocks of 32 or 128 elements. Each block stores its own scale. Preserves &gt;99% perplexity at 4-bit!</p>
        </div>
      </div>
    </Section>

    <Callout title="Why Block Quantization Wins for 4-Bit" tone="green" className="mt-s">
      Block-wise grouping (e.g., GGUF Q4_K blocks of 32 weights) ensures that an activation outlier in column 10
      does not distort the quantization grid for column 100, maintaining high factual accuracy.
    </Callout>
  </Page>
);

export const AWQDeepDive = () => (
  <Page tone="green" running="Part 4 · Activation-aware Quantization (AWQ)" part="Part 4">
    <div className="kicker">Salient Weight Protection</div>
    <h1 className="big">AWQ: Activation-aware Weight Quantization</h1>
    <p className="lead">
      Not all weights in a neural network are equally important. AWQ observes that preserving just 1% of salient weights
      drastically reduces quantization error without requiring expensive backpropagation fine-tuning.
    </p>

    <div className="grid2 mt-s">
      <Section title="Salient Weight Identification" color="blue">
        <div className="card tone-blue">
          <b>Activation-Guided Importance</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Instead of judging importance by weight magnitude $|W|$, AWQ measures the magnitude of input activations $|X|$.
            Weights multiplied by large activation magnitudes are classified as salient.
          </p>
          <div className="code-box" style={{ fontSize: '7.2pt', padding: '1.5mm 2mm', margin: '1.5mm 0' }}>
            <code>Salience Score = S_w = W &times; mean(|X_channel|)</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            Protecting the top 1% salient channels reduces output perplexity error by up to 80% compared to round-to-nearest (RTN).
          </p>
        </div>
      </Section>

      <Section title="Per-Channel Scaling Transformation" color="green">
        <div className="card tone-green">
          <b>Mathematical Equivalence</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Rather than keeping salient weights in FP16 (which ruins regular memory layouts), AWQ scales salient channels before quantization:
          </p>
          <div className="code-box" style={{ fontSize: '7.2pt', padding: '1.5mm 2mm', margin: '1.5mm 0' }}>
            <code>Y = W &times; X = (W &times; s) &times; (s^(-1) &times; X) = W_scaled &times; X_scaled</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            Multiplying weights by scale factor $s &gt; 1$ lowers their relative quantization error while dividing input activations preserves exact mathematical output!
          </p>
        </div>
      </Section>
    </div>

    <Section title="The AWQ 3-Step Pipeline" color="yellow" className="mt-s">
      <div className="grid3">
        <div className="card tone-blue">
          <b style={{ color: '#1a73e8' }}>1. Calibration Pass</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Feed 128-512 domain text tokens through FP16 model to record average channel activation magnitudes.</p>
        </div>
        <div className="card tone-yellow">
          <b style={{ color: '#b06000' }}>2. Grid Search for Scales</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Optimize per-channel scale factors $s$ to minimize mean-squared output reconstruction error.</p>
        </div>
        <div className="card tone-green">
          <b style={{ color: '#188038' }}>3. Standard Quantization</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Quantize scaled weights into standard 4-bit INT4 integers. Fuse inverse scale $s^{-1}$ into previous LayerNorm!</p>
        </div>
      </div>
    </Section>

    <Callout title="Why vLLM Prefers AWQ for GPU Serving" tone="blue" className="mt-s">
      Because AWQ requires no backpropagation or complex matrix inversions, a 70B model can be quantized in under 15 minutes.
      At runtime, fused GEMM kernels dequantize weights into registers with zero runtime activation scaling overhead!
    </Callout>
  </Page>
);

export const GPTQDeepDive = () => (
  <Page tone="green" running="Part 4 · Second-Order Error Compensation" part="Part 4">
    <div className="kicker">Second-Order Error Compensation</div>
    <h1 className="big">GPTQ: Hessian Inversion &amp; Layer Reconstruction</h1>
    <p className="lead">
      GPTQ is an advanced Post-Training Quantization (PTQ) method based on second-order Taylor expansion (Optimal Brain Surgeon),
      compensating for quantization errors across remaining unquantized weights.
    </p>

    <div className="grid2 mt-s">
      <Section title="The Optimal Brain Surgeon Objective" color="red">
        <div className="card tone-red">
          <b>Quadratic Error Minimization</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            When weight $w_q$ is quantized to w_hat_q, it incurs error Delta w_q = w_hat_q - w_q. To cancel this error,
            GPTQ updates all remaining unquantized weights w_-q using the inverse Hessian matrix H^-1:
          </p>
          <div className="code-box" style={{ fontSize: '7.2pt', padding: '1.5mm 2mm', margin: '1.5mm 0' }}>
            <code>{"\\Delta w = - (w_q - \\hat{w}_q) / [H^(-1)]_qq \\times H^(-1)_{:, q}"}</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            Where the Hessian is estimated from calibration activations: $H = 2 X X^T$.
          </p>
        </div>
      </Section>

      <Section title="Cholesky Factorization &amp; Block Updates" color="yellow">
        <div className="card tone-yellow">
          <b>O(d^3) Computational Efficiency</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Standard OBS takes days to quantize a large model. GPTQ computes Cholesky decomposition of H^-1 once per layer
            and quantizes weights in blocks of 128 columns simultaneously.
          </p>
          <div className="code-box" style={{ fontSize: '7.2pt', padding: '1.5mm 2mm', margin: '1.5mm 0' }}>
            <code>H^(-1) = L &times; L^T &bull; Block Lazy Updates on GPU</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            Reduces quantization time for a 7B model from 30 hours down to approximately 4 minutes on a single GPU.
          </p>
        </div>
      </Section>
    </div>

    <Section title="Comparing AWQ vs GPTQ in Serving Practice" color="green" className="mt-s">
      <div className="grid3">
        <div className="card tone-green">
          <b>Inference Speed</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Both formats pack into W4A16 GEMM kernels. Runtime throughput in vLLM is virtually identical (~18–24 tok/s on consumer GPUs).</p>
        </div>
        <div className="card tone-blue">
          <b>Calibration Sensitivity</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>GPTQ is slightly more sensitive to calibration dataset distribution; AWQ generalizes better across out-of-domain prompts.</p>
        </div>
        <div className="card tone-yellow">
          <b>Quantization Time</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>AWQ grid search is faster and uses less VRAM during quantization than GPTQ Cholesky Hessian inversion.</p>
        </div>
      </div>
    </Section>

    <Callout title="Engineering Rule of Thumb" tone="green" className="mt-s">
      For CUDA/Triton deployments on NVIDIA GPUs with vLLM, choose <b>AWQ</b> for superior out-of-distribution stability.
      For CPU-only local execution with llama.cpp/Ollama, choose <b>GGUF K-quants</b>.
    </Callout>
  </Page>
);

export const SmoothQuantAndW8A8 = () => (
  <Page tone="green" running="Part 4 · W8A8 Tensor Cores & SmoothQuant" part="Part 4">
    <div className="kicker">W8A8 Matrix Multiplication</div>
    <h1 className="big">SmoothQuant: Tackling Activation Outliers</h1>
    <p className="lead">
      While weight-only quantization (W4A16) accelerates memory-bound decode, high-batch serving (prefill and enterprise concurrency)
      requires accelerating compute-bound matrix multiplications using INT8 Tensor Cores (W8A8).
    </p>

    <div className="grid2 mt-s">
      <Section title="The Activation Outlier Barrier" color="red">
        <div className="card tone-red">
          <b>Why W8A8 Fails Naively</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Weights are easy to quantize to INT8. Activations, however, develop systematic outliers up to 100&times; larger than normal values
            in specific channels across all tokens.
          </p>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            Per-tensor activation quantization collapses normal features into 0, destroying LLM reasoning abilities completely.
          </p>
        </div>
      </Section>

      <Section title="The SmoothQuant Mathematical Scale" color="green">
        <div className="card tone-green">
          <b>Migrating Quantization Difficulty</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            SmoothQuant divides activation channels by smoothing factor $s$ while multiplying corresponding weight rows by $s$:
          </p>
          <div className="code-box" style={{ fontSize: '7.2pt', padding: '1.5mm 2mm', margin: '1.5mm 0' }}>
            <code>Y = (X &times; diag(s)^(-1)) &times; (diag(s) &times; W) = X_hat &times; W_hat</code>
          </div>
          <p className="fine" style={{ margin: 0, fontSize: '7.2pt' }}>
            Balancing migration strength $\alpha = 0.5$ splits difficulty equally between weights and activations, enabling smooth INT8 GEMM.
          </p>
        </div>
      </Section>
    </div>

    <Section title="INT8 Tensor Core Serving Benefits" color="blue" className="mt-s">
      <div className="grid3">
        <div className="card tone-blue">
          <b>2&times; Higher Prefill Throughput</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>NVIDIA INT8 Tensor Cores deliver double the peak TFLOPs of FP16, halving Time-to-First-Token (TTFT) on large prompts.</p>
        </div>
        <div className="card tone-green">
          <b>50% Memory Reduction</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Cuts model VRAM from 14 GB to 7 GB for a 7B model, allowing twice the continuous batching concurrency on a single GPU.</p>
        </div>
        <div className="card tone-yellow">
          <b>Zero Degraded Perplexity</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Achieves less than 0.1 perplexity delta compared to FP16 baseline on models from 7B to 175B parameters.</p>
        </div>
      </div>
    </Section>

    <Callout title="Production Deployment Reality" tone="yellow" className="mt-s">
      W8A8 with SmoothQuant is the production gold standard for enterprise API gateways (like LiteLLM routing to TensorRT-LLM)
      serving hundreds of concurrent enterprise users simultaneously.
    </Callout>
  </Page>
);

export const GGUFDeepDive = () => (
  <Page tone="green" running="Part 4 · GGUF Format & CPU Execution" part="Part 4">
    <div className="kicker">Binary Architecture &amp; ggml/llama.cpp</div>
    <h1 className="big">The GGUF Format: Single-Binary Storage &amp; CPU SIMD</h1>
    <p className="lead">
      GGUF (GPT-Generated Unified Format) is the modern open binary specification created by Georgi Gerganov and the llama.cpp team,
      powering fast local inference on edge hardware, WSL2, and Apple Silicon.
    </p>

    <div className="grid2 mt-s">
      <Section title="GGUF Binary File Architecture" color="green">
        <div className="card tone-green">
          <b>Single-File Self-Contained Binary</b>
          <ul className="meta-list" style={{ marginTop: '1.5mm', fontSize: '7.4pt' }}>
            <li><b>Header:</b> Magic number <code>0x46554747</code> (<code>GGUF</code> in ASCII), version (v3), tensor count, metadata KV count.</li>
            <li><b>Metadata KV:</b> Embedded tokenizer vocabulary, merge tables, context length, architecture type (qwen2, llama), and chat template.</li>
            <li><b>Tensor Info Table:</b> Offsets, dimensions, and quantization type for every layer weight tensor.</li>
            <li><b>Aligned Tensor Data:</b> 32-byte aligned raw quantized weight buffers directly mapped via Linux <code>mmap()</code>.</li>
          </ul>
        </div>
      </Section>

      <Section title="The K-Quant Block Hierarchy" color="blue">
        <div className="card tone-blue">
          <b>Super-Blocks &amp; Sub-Blocks</b>
          <p style={{ fontSize: '7.4pt', margin: '1mm 0' }}>
            Standard GGUF formats (like <code>Q4_K_M</code> used in our lab) partition rows into super-blocks of 256 weights:
          </p>
          <ul className="meta-list" style={{ fontSize: '7.2pt' }}>
            <li><b>Super-block (256 weights):</b> Stores master 16-bit FP16 scale $d$ and minimum value d_min.</li>
            <li><b>8 Sub-blocks (32 weights each):</b> Store 6-bit quantization scales and 4-bit integer nibbles.</li>
            <li><b>Mixed Quantization (K_M):</b> Critical attention heads (v_proj, output) kept in 5-bit or 6-bit; feed-forward in 4-bit!</li>
          </ul>
        </div>
      </Section>
    </div>

    <Section title="Why GGUF Dominates Local &amp; Edge Serving" color="yellow" className="mt-s">
      <div className="grid3">
        <div className="card tone-green">
          <b>Zero-Copy mmap Loading</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Loads model weights instantly without allocating heap copies. The Linux kernel pages weights directly from NVMe SSD into page cache on demand.</p>
        </div>
        <div className="card tone-blue">
          <b>Vector SIMD Kernels</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Handcrafted Intel AVX2, AVX-512, and ARM NEON intrinsics unpack 4-bit nibbles and compute FMA matrix operations in hardware registers.</p>
        </div>
        <div className="card tone-yellow">
          <b>Flexible GPU Offloading</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}>Supports partial layer offloading: run 16 layers in VRAM and 8 layers in system RAM seamlessly without crashing.</p>
        </div>
      </div>
    </Section>

    <Callout title="Empirical Lab Verification" tone="green" className="mt-s">
      Our Stage 1 Ollama deployment runs <code>qwen2.5:0.5b</code> packaged in GGUF Q4_K_M (398 MB).
      On our 4-core Intel i5 laptop with AVX2 SIMD, it starts up in 180 ms and decodes at 24 tokens/sec!
    </Callout>
  </Page>
);

export const QuantizationMatrix = () => (
  <Page tone="green" running="Part 4 · Precision Selection Matrix" part="Part 4">
    <div className="kicker">Empirical Benchmarks &amp; Selection Framework</div>
    <h1 className="big">Precision, Perplexity &amp; Hardware Tradeoffs</h1>
    <p className="lead">
      A comprehensive production decision matrix comparing quantization methods across memory footprint,
      perplexity degradation, and optimal runtime platforms.
    </p>

    <Section title="Comprehensive Quantization Benchmark Matrix" color="green" className="mt-s">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Bits/Weight</th>
              <th>VRAM (7B)</th>
              <th>Perplexity Delta</th>
              <th>Target Runtime</th>
              <th>Primary Production Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>FP16 / BF16</b></td>
              <td>16.0</td>
              <td>14.0 GB</td>
              <td>0.00 (Baseline)</td>
              <td>PyTorch / vLLM</td>
              <td>Model fine-tuning, training, reference verification</td>
            </tr>
            <tr>
              <td><b>SmoothQuant (W8A8)</b></td>
              <td>8.0</td>
              <td>7.0 GB</td>
              <td>+0.05</td>
              <td>TensorRT-LLM</td>
              <td>High-throughput enterprise API gateways (concurrency &gt; 50)</td>
            </tr>
            <tr>
              <td><b>FP8 (E4M3)</b></td>
              <td>8.0</td>
              <td>7.0 GB</td>
              <td>+0.03</td>
              <td>vLLM (Hopper/Ada)</td>
              <td>Next-gen enterprise GPU clusters (H100, L40S, RTX 4090)</td>
            </tr>
            <tr>
              <td><b>AWQ (W4A16)</b></td>
              <td>4.0</td>
              <td>3.9 GB</td>
              <td>+0.12</td>
              <td>vLLM / SGLang</td>
              <td>Cost-effective cloud GPU serving (T4, A10G, L4)</td>
            </tr>
            <tr>
              <td><b>GPTQ (W4A16)</b></td>
              <td>4.0</td>
              <td>3.9 GB</td>
              <td>+0.14</td>
              <td>AutoGPTQ / vLLM</td>
              <td>Single-GPU self-hosted consumer deployments</td>
            </tr>
            <tr>
              <td><b>GGUF Q4_K_M</b></td>
              <td>4.5</td>
              <td>3.9 GB</td>
              <td>+0.11</td>
              <td>Ollama / llama.cpp</td>
              <td><b>CPU-only laptops, edge devices, and WSL2 developer machines</b></td>
            </tr>
            <tr>
              <td><b>GGUF Q2_K</b></td>
              <td>2.6</td>
              <td>2.3 GB</td>
              <td>+2.45</td>
              <td>llama.cpp</td>
              <td>Extreme memory constraint testing (severe quality degradation)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Section>

    <Section title="Production Architecture Decision Framework" color="blue" className="mt-s">
      <div className="grid3">
        <div className="card tone-green">
          <b>Edge &amp; Local Dev (No GPU)</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}><b>Choose GGUF Q4_K_M:</b> Optimal balance of CPU AVX2 memory streaming bandwidth and factual perplexity preservation.</p>
        </div>
        <div className="card tone-blue">
          <b>Cloud GPU Single-Stream</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}><b>Choose AWQ W4A16:</b> Minimizes GPU VRAM requirement on cloud nodes, fitting 70B models onto a single 48GB A40 GPU.</p>
        </div>
        <div className="card tone-yellow">
          <b>High-Concurrency Gateway</b>
          <p style={{ margin: 0, fontSize: '7.4pt' }}><b>Choose W8A8 / FP8:</b> Unlocks INT8 Tensor Core compute capacity for prefill-heavy RAG pipelines and multi-tenant clusters.</p>
        </div>
      </div>
    </Section>

    <Callout title="The Golden Rule of Model Serving" tone="green" className="mt-s">
      Never deploy unquantized FP16 models in production unless required for scientific precision benchmarks.
      4-bit and 8-bit quantization deliver a 2&times; to 4&times; throughput multiplier with negligible perceptual degradation.
    </Callout>
  </Page>
);
