import React from 'react';

// PART 4: 8 High-Density Technical Pages on LLM Quantization Mechanics

export const QuantizationIntro = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IV · Quantization Mechanics · Page 1</span>
        <span className="text-xs text-slate-400 font-mono">Memory Bandwidth & Bit Economics</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">4.1 Why Quantization Is Mandatory in Modern Serving</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        In traditional high-performance computing, mathematical precision is rarely sacrificed. In deep learning inference,
        however, <strong>quantization is not an optimization; it is an existential operational requirement</strong>. The fundamental
        reality of autoregressive decoding is that generative LLMs are strictly bounded by memory bandwidth, not compute capacity.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">The Arithmetic Intensity Reality</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            During token generation (batch size = 1), computing the next token requires loading every single parameter of the model
            from memory (RAM or VRAM) through the bus into the processor cache/registers to perform exactly 2 operations (multiply-accumulate) per weight.
          </p>
          <div className="bg-slate-950 p-2 rounded font-mono text-[10px] text-emerald-400 mb-2">
            Arithmetic Intensity = 2 FLOPs / B bytes loaded<br/>
            FP16: 2 FLOPs / 2 bytes = 1.0 FLOP/byte<br/>
            INT4: 2 FLOPs / 0.5 bytes = 4.0 FLOP/byte
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            A system with 38.4 GB/s memory bandwidth (such as our dual-channel DDR4-2667 laptop) can at best stream 38.4 GB of weights per second.
            A 7B parameter model in FP16 weighs 14 GB. The maximum theoretical decode speed is 38.4 / 14 = 2.74 tokens/second, regardless of CPU GHz!
          </p>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">Memory Footprint Across Precisions</h4>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between border-b border-slate-700/60 pb-1">
              <span className="text-slate-400">FP32 (Single Precision)</span>
              <span className="font-mono text-rose-400 font-bold">4.0 bytes / param (28 GB for 7B)</span>
            </div>
            <div className="flex justify-between border-b border-slate-700/60 pb-1">
              <span className="text-slate-400">FP16 / BF16 (Half Precision)</span>
              <span className="font-mono text-amber-400 font-bold">2.0 bytes / param (14 GB for 7B)</span>
            </div>
            <div className="flex justify-between border-b border-slate-700/60 pb-1">
              <span className="text-slate-400">INT8 (Quarter Precision)</span>
              <span className="font-mono text-blue-400 font-bold">1.0 bytes / param (7 GB for 7B)</span>
            </div>
            <div className="flex justify-between border-b border-slate-700/60 pb-1">
              <span className="text-slate-400">INT4 / Q4_K_M (Target Format)</span>
              <span className="font-mono text-emerald-400 font-bold">~0.55 bytes / param (3.9 GB for 7B)</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-400">INT2 / Q2_K (Extreme Compression)</span>
              <span className="font-mono text-purple-400 font-bold">~0.32 bytes / param (2.3 GB for 7B)</span>
            </div>
          </div>
          <div className="mt-3 p-2 bg-emerald-950/40 border border-emerald-500/30 rounded text-[10px] text-emerald-200">
            <strong>Key Engineering Takeaway:</strong> Compressing weights by 4x drops the memory bus pressure by 4x, directly translating to a ~3.5x - 4x throughput increase during single-stream token generation.
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 mb-1 font-mono uppercase tracking-wider">The Three Core Axes of LLM Quantization</h4>
        <div className="grid grid-cols-3 gap-3 text-[10px] text-slate-300">
          <div className="border-l-2 border-emerald-500 pl-2">
            <strong className="text-emerald-300">1. Weight-Only (W4A16, W8A16)</strong>
            <p className="text-slate-400 mt-1">Weights are stored compressed in 4-bit or 8-bit. During inference, weights are dequantized on-the-fly into registers for FP16 math. Best for memory-bounded decode.</p>
          </div>
          <div className="border-l-2 border-sky-500 pl-2">
            <strong className="text-sky-300">2. Weight & Activation (W8A8)</strong>
            <p className="text-slate-400 mt-1">Both weights and hidden states are quantized. Matrix multiplication is executed via integer INT8 tensor cores. Massive compute throughput boost for prefill.</p>
          </div>
          <div className="border-l-2 border-purple-500 pl-2">
            <strong className="text-purple-300">3. KV Cache Quantization</strong>
            <p className="text-slate-400 mt-1">Keys and values in attention cache are compressed to FP8 or INT4. Reduces context memory footprint by 50-75%, doubling maximum concurrent sequences.</p>
          </div>
        </div>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 4.1</span>
    </div>
  </div>
);

export const NumericalFormats = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IV · Quantization Mechanics · Page 2</span>
        <span className="text-xs text-slate-400 font-mono">Numerical Representations & Bit Layouts</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">4.2 Floating Point vs Fixed Point Formats</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        To understand quantization error, we must examine the underlying silicon bit layouts. Every numeric format is a compromise
        between <strong>dynamic range</strong> (span between smallest and largest representable numbers) and <strong>precision</strong> (resolution between adjacent values).
      </p>

      {/* Bit Layout Visualizer */}
      <div className="space-y-3 mb-4 font-mono text-[10px]">
        {/* FP32 */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="font-bold text-white">IEEE 754 FP32 (Standard Float)</span>
            <span>Range: 1.4e-45 to 3.4e38 | Precision: ~7.2 decimal digits</span>
          </div>
          <div className="flex h-6 rounded overflow-hidden text-center text-[9px] font-bold">
            <div className="w-[3.125%] bg-rose-600 flex items-center justify-center text-white" title="Sign (1 bit)">S</div>
            <div className="w-[25%] bg-amber-600 flex items-center justify-center text-white" title="Exponent (8 bits)">Exponent (8 bits, bias 127)</div>
            <div className="w-[71.875%] bg-blue-600 flex items-center justify-center text-white" title="Mantissa (23 bits)">Mantissa / Fraction (23 bits)</div>
          </div>
        </div>

        {/* FP16 */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="font-bold text-white">IEEE 754 FP16 (Half Precision)</span>
            <span>Range: 6.0e-8 to 65,504 | Precision: ~3.3 decimal digits</span>
          </div>
          <div className="flex h-6 rounded overflow-hidden text-center text-[9px] font-bold">
            <div className="w-[6.25%] bg-rose-600 flex items-center justify-center text-white">S</div>
            <div className="w-[31.25%] bg-amber-600 flex items-center justify-center text-white">Exp (5b, bias 15)</div>
            <div className="w-[62.5%] bg-blue-600 flex items-center justify-center text-white">Mantissa (10 bits)</div>
          </div>
          <p className="text-[9px] text-amber-300/80 mt-1">Warning: Narrow exponent causes frequent overflow (NaN/Inf) during LLM training and heavy activations.</p>
        </div>

        {/* BF16 */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="font-bold text-white">Brain Floating Point (BF16 - Google Brain)</span>
            <span>Range: Identical to FP32 (~3.4e38) | Precision: ~2.4 decimal digits</span>
          </div>
          <div className="flex h-6 rounded overflow-hidden text-center text-[9px] font-bold">
            <div className="w-[6.25%] bg-rose-600 flex items-center justify-center text-white">S</div>
            <div className="w-[50%] bg-amber-600 flex items-center justify-center text-white">Exponent (8 bits, bias 127)</div>
            <div className="w-[43.75%] bg-blue-600 flex items-center justify-center text-white">Mantissa (7 bits)</div>
          </div>
          <p className="text-[9px] text-emerald-300/80 mt-1">Preserves FP32 dynamic range perfectly. Standard master weight format for Llama, Mistral, and Qwen.</p>
        </div>

        {/* FP8 & INT8 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="font-bold text-white mb-0.5">FP8 (E4M3 / E5M2)</div>
            <div className="flex h-5 rounded overflow-hidden text-center text-[8px] font-bold">
              <div className="w-[12.5%] bg-rose-600 flex items-center justify-center text-white">S</div>
              <div className="w-[50%] bg-amber-600 flex items-center justify-center text-white">Exp (4b)</div>
              <div className="w-[37.5%] bg-blue-600 flex items-center justify-center text-white">Mant (3b)</div>
            </div>
            <p className="text-[8px] text-slate-400 mt-1">Native to NVIDIA Hopper (H100) & Ada Lovelace. 2x faster than FP16.</p>
          </div>
          <div className="bg-slate-950 p-2 rounded border border-slate-800">
            <div className="font-bold text-white mb-0.5">INT8 (Signed Two's Complement)</div>
            <div className="flex h-5 rounded overflow-hidden text-center text-[8px] font-bold">
              <div className="w-[100%] bg-emerald-600 flex items-center justify-center text-white">8-bit Signed Integer [-128, 127]</div>
            </div>
            <p className="text-[8px] text-slate-400 mt-1">Linear spacing. Requires scale factor: X_real = Scale * X_int.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/80 p-3 rounded border border-slate-700 text-[11px] text-slate-300">
        <h4 className="text-xs font-bold text-white mb-1">The Dynamic Range Problem in Transformer Weights</h4>
        <p className="leading-relaxed">
          While most neural network weights are normally distributed around zero with variance &sigma; &asymp; 0.02,
          certain critical attention projection dimensions contain massive outlier values (exceeding &plusmn;15.0).
          If an integer format maps its entire range to accommodate the outlier, standard weights collapse into zero bins, destroying perplexity.
        </p>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 4.2</span>
    </div>
  </div>
);

export const UniformQuantization = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IV · Quantization Mechanics · Page 3</span>
        <span className="text-xs text-slate-400 font-mono">Symmetric vs Asymmetric Uniform Quantization</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">4.3 Uniform Quantization Math: Scale & Zero-Point</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Uniform quantization maps continuous floating-point values into discrete integer grid points using linear transformations.
        We dissect the exact formulas used in runtime engines like llama.cpp and vLLM.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Symmetric */}
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">Symmetric Quantization (Zero-Point = 0)</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            The floating-point zero maps exactly to integer zero. Used predominantly for weights because weight distributions are symmetric around zero.
          </p>
          <div className="bg-slate-950 p-2.5 rounded font-mono text-[10px] text-emerald-400 space-y-1 mb-2">
            <div>S = max(|X_min|, |X_max|) / (2^(b-1) - 1)</div>
            <div>q = clip(round(X / S), -2^(b-1), 2^(b-1) - 1)</div>
            <div>X_approx = q * S</div>
          </div>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p><strong>Benefit:</strong> Fast dequantization during SIMD execution. Integer multiply directly converts to float with a single broadcast multiply.</p>
            <p><strong>Drawback:</strong> If distribution is skewed (e.g. ReLU activations &ge; 0), half of the integer bit space is completely wasted.</p>
          </div>
        </div>

        {/* Asymmetric */}
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">Asymmetric Quantization (With Zero-Point)</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Maps arbitrary arbitrary continuous intervals [X_min, X_max] across the entire integer range [0, 2^b - 1].
          </p>
          <div className="bg-slate-950 p-2.5 rounded font-mono text-[10px] text-sky-400 space-y-1 mb-2">
            <div>S = (X_max - X_min) / (2^b - 1)</div>
            <div>Z = round(-X_min / S)</div>
            <div>q = clip(round(X / S) + Z, 0, 2^b - 1)</div>
            <div>X_approx = (q - Z) * S</div>
          </div>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p><strong>Benefit:</strong> Minimizes quantization noise on asymmetric data like post-activation tensors and attention scores.</p>
            <p><strong>Drawback:</strong> Dequantization requires subtracting zero-point Z for every element: (q - Z)*S, adding overhead in SIMD inner loops.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded border border-slate-800 mb-2">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 font-mono">Granularity: Per-Tensor vs Per-Channel vs Group-Wise (Block-Wise)</h4>
        <div className="grid grid-cols-3 gap-3 text-[10px]">
          <div className="p-2 bg-slate-900 rounded border border-slate-800">
            <div className="font-bold text-rose-400 mb-1">Per-Tensor Quantization</div>
            <p className="text-slate-400">One scale factor S for the entire weight matrix (e.g. 4096x4096). Minimal metadata overhead, but unacceptable accuracy loss due to outlier dominance.</p>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">
            <div className="font-bold text-amber-400 mb-1">Per-Channel / Per-Row</div>
            <p className="text-slate-400">One scale S per output channel. Standard for INT8 execution. Isolates channel-level scale variations effectively.</p>
          </div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">
            <div className="font-bold text-emerald-400 mb-1">Group-Wise / Block-Wise (GGUF)</div>
            <p className="text-slate-400">Divides each row into small blocks of 32 or 128 elements. Each block stores its own scale (and min). Crucial for retaining &gt;99% perplexity at 4-bit!</p>
          </div>
        </div>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 4.3</span>
    </div>
  </div>
);

export const AWQDeepDive = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IV · Quantization Mechanics · Page 4</span>
        <span className="text-xs text-slate-400 font-mono">Advanced Post-Training Quantization</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">4.4 AWQ: Activation-aware Weight Quantization</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Traditional quantization treats all weights equally. In 2023, MIT researchers proved that <strong>not all weights are equally important</strong>:
        protecting just 1% of salient weights completely prevents model perplexity collapse under 4-bit quantization.
      </p>

      <div className="bg-slate-800/80 p-4 rounded border border-slate-700 mb-4">
        <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">The Fundamental Discovery: Activation Magnitude Determines Saliency</h4>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
          Looking only at weight magnitudes (|W|) is misleading. What truly matters is the impact of weight error on output activations:
          &Delta;Y = (&Delta;W) &middot; X. Weights multiplied by large activations (X) produce disproportionately large output errors.
        </p>
        <div className="bg-slate-950 p-2.5 rounded font-mono text-[10px] text-emerald-400">
          Saliency Score: S_j = &Sigma;_i |X_ij|  (Average activation magnitude of input channel j)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">The Hardware Dilemma of Mixed Precision</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            If only 1% of weights are salient, why not store 1% in FP16 and 99% in INT4?
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p className="text-rose-400"><strong>Hardware Bottleneck:</strong> Irregular sparsity requires sparse matrix kernels or indexing overhead, destroying memory coalescing and GPU SM occupancy.</p>
            <p>Uniform INT4 matrix execution is vastly faster on Tensor Cores than irregular mixed-precision formats.</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">The AWQ Mathematical Solution: Per-Channel Scaling</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Instead of keeping salient weights in FP16, AWQ multiplies salient weight channels by a scale factor <strong>s &gt; 1</strong>,
            and divides corresponding activations by <strong>s</strong>:
          </p>
          <div className="bg-slate-950 p-2 rounded font-mono text-[10px] text-emerald-300">
            Y = (W &middot; s) &middot; (s^-1 &middot; X) = W' &middot; X'
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            By scaling up W, its relative quantization grid step becomes much finer, protecting the salient channel while keeping 100% of weights in regular INT4!
          </p>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px]">
        <h4 className="text-xs font-bold text-slate-200 mb-1 font-mono uppercase tracking-wider">AWQ Serving Advantages in vLLM</h4>
        <ul className="list-disc list-inside text-slate-300 space-y-1">
          <li><strong>No Retraining Required:</strong> Generates scale factors using only 128-512 calibration tokens from Pile or WikiText in under 10 minutes.</li>
          <li><strong>Zero Inference Overhead:</strong> Scale factor s is folded directly into preceding LayerNorm or linear weight biases. Run-time execution is pure W4A16 GEMM.</li>
          <li><strong>Superior Generalization:</strong> Unlike GPTQ which overfits to calibration distributions, AWQ scales preserve out-of-domain reasoning and code syntax.</li>
        </ul>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 4.4</span>
    </div>
  </div>
);

export const GPTQDeepDive = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IV · Quantization Mechanics · Page 5</span>
        <span className="text-xs text-slate-400 font-mono">Second-Order Error Compensation</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">4.5 GPTQ: Hessian Inversion & Second-Order Error Minimization</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        GPTQ (Generative Pre-trained Transformer Quantization) approaches model compression as an optimization problem:
        minimizing the mean squared error between full-precision and quantized layer outputs using second-order Taylor approximations.
      </p>

      <div className="bg-slate-800/80 p-4 rounded border border-slate-700 mb-4">
        <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">The Optimal Brain Surgeon (OBS) Formulation</h4>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
          When weight parameter w_q is rounded to integer q_q, it creates an error &delta;w_q = round(w_q) - w_q.
          To prevent output corruption, all remaining unquantized weights in the layer must be updated by vector &Delta;w to compensate:
        </p>
        <div className="bg-slate-950 p-2.5 rounded font-mono text-[10px] text-emerald-400 mb-2">
          argmin_&Delta;w &frac12; &Delta;w^T &middot; H &middot; &Delta;w  subject to &Delta;w_q = round(w_q) - w_q<br/>
          Optimal Weight Update: &Delta;w = - (w_q - round(w_q)) / [H^-1]_qq &middot; H^-1_q
        </div>
        <p className="text-[10px] text-slate-400">
          Where <strong>H = 2 &middot; X &middot; X^T</strong> is the Hessian matrix of layer inputs. GPTQ computes H^-1 once per layer,
          then quantizes columns iteratively while compensating future weights.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">Cholesky Decomposition Acceleration</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Inverting a 4096x4096 Hessian directly for every column takes O(d^3) operations, requiring months for a 70B model.
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>GPTQ utilizes Cholesky decomposition of the inverse Hessian matrix, allowing batch updates of 128 columns simultaneously (Block-wise quantization).</p>
            <p>Quantizes a full 175B parameter model in roughly 4 GPU hours.</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 font-mono">The Act-Order (Descend-Order) Trick</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Columns with highest diagonal inverse Hessian elements are quantized first.
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>By quantizing high-error columns early, subsequent weights have maximum degrees of freedom to compensate for the rounding error.</p>
            <p className="text-rose-400">Tradeoff: Act-order complicates kernel memory layouts, requiring special permute tables during CUDA execution.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px]">
        <h4 className="text-xs font-bold text-slate-200 mb-1 font-mono uppercase tracking-wider">Comparison: GPTQ vs AWQ in Production</h4>
        <div className="grid grid-cols-2 gap-4 text-slate-300">
          <div>
            <strong className="text-sky-300">GPTQ Best Use Case:</strong> Low-cost GPU inference where VRAM is constrained (e.g. running 13B models on single RTX 3090 / 4090 with ExLlamaV2 kernels).
          </div>
          <div>
            <strong className="text-emerald-300">AWQ Best Use Case:</strong> Enterprise vLLM serving clusters. Native Marlin kernel integration, better zero-shot reasoning retention, and cleaner deployment pipelines.
          </div>
        </div>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 4.5</span>
    </div>
  </div>
);

export const SmoothQuantAndW8A8 = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IV · Quantization Mechanics · Page 6</span>
        <span className="text-xs text-slate-400 font-mono">Weight-Activation Quantization</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">4.6 SmoothQuant: Tackling Activation Outliers for W8A8 Compute</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        While W4A16 reduces memory traffic, matrix multiplications are still executed on floating-point arithmetic units.
        To unlock the full 2x-4x compute throughput of <strong>INT8 Tensor Cores</strong>, both weights and activations must be INT8 (W8A8).
      </p>

      <div className="bg-slate-800/80 p-4 rounded border border-slate-700 mb-4">
        <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">The Outlier Dilemma in Activations</h4>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
          Weights are easy to quantize to INT8 because their distributions are bounded. Activations, however, exhibit <strong>systematic channel outliers</strong>:
          in LLMs &gt;6.7B parameters, specific hidden dimensions develop activation spikes that are 100x larger than typical tokens.
        </p>
        <div className="bg-slate-950 p-2.5 rounded font-mono text-[10px] text-amber-300 mb-2">
          Typical hidden state token: [-0.5, 0.4, 0.8, -0.2]<br/>
          Outlier channel across all tokens: [85.4, 92.1, 88.0, 94.3]
        </div>
        <p className="text-[10px] text-slate-400">
          Quantizing activations per-tensor wipes out the precision of all 4095 normal channels to accommodate channel #4096.
          Per-token dynamic quantization also fails because the outlier channel dominates every token.
        </p>
      </div>

      <div className="bg-slate-850 p-4 rounded border border-slate-700 mb-4 bg-slate-800/80">
        <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">The SmoothQuant Migration Transformation</h4>
        <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
          SmoothQuant observes that weights are smooth and easy to quantize, while activations are spiky.
          The solution: <strong>mathematically migrate quantization difficulty from activations to weights</strong> via diagonal scaling matrix S:
        </p>
        <div className="bg-slate-950 p-2 rounded font-mono text-[10px] text-emerald-400 mb-2">
          Y = (X &middot; diag(s)^-1) &middot; (diag(s) &middot; W) = X_smooth &middot; W_smooth<br/>
          Scale Factor: s_j = max(|X_j|)^&alpha; / max(|W_j|)^(1 - &alpha;)   where &alpha; &isin; [0, 1]
        </div>
        <p className="text-[10px] text-slate-400">
          Setting migration strength &alpha; = 0.5 splits the difficulty equally: activation outlier channels are divided by ~10x,
          while weight channels are multiplied by 10x. Both sides become trivially quantizable to INT8!
        </p>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px]">
        <h4 className="text-xs font-bold text-slate-200 mb-1 font-mono uppercase tracking-wider">Serving Implications of W8A8</h4>
        <div className="grid grid-cols-2 gap-4 text-slate-300">
          <div>
            <strong className="text-emerald-400">Prefill Throughput Surge:</strong> Prefill phase is compute-bound. INT8 DP4A (CPU) and INT8 Tensor Cores (GPU) deliver 2x higher FLOPS/Watt than FP16.
          </div>
          <div>
            <strong className="text-sky-400">Zero Run-time Overhead:</strong> Weight scaling is pre-computed offline. Activation scaling is folded into preceding LayerNorm affine parameters.
          </div>
        </div>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 4.6</span>
    </div>
  </div>
);

export const GGUFDeepDive = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IV · Quantization Mechanics · Page 7</span>
        <span className="text-xs text-slate-400 font-mono">Modern File Formats & Architecture</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">4.7 The GGUF Format: Single-Binary Storage & Mmap Loading</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Deploying models across heterogeneous edge systems requires robust file formats.
        The transition from GGML to <strong>GGUF (GPT-Generated Unified Format)</strong> revolutionized CPU and edge LLM serving.
      </p>

      {/* Binary Layout Diagram */}
      <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-[10px] mb-4">
        <div className="text-emerald-400 font-bold mb-2">// GGUF Binary File Specification (Little-Endian)</div>
        <div className="space-y-1 text-slate-300">
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800 flex justify-between">
            <span className="text-sky-300 font-bold">1. Magic Number & Version</span>
            <span className="text-slate-400">0x46554747 ('GGUF') | uint32 version (3)</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800 flex justify-between">
            <span className="text-amber-300 font-bold">2. Tensor Count & Metadata Count</span>
            <span className="text-slate-400">uint64 tensor_count | uint64 metadata_kv_count</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800 flex justify-between">
            <span className="text-purple-300 font-bold">3. Key-Value Metadata Pairs</span>
            <span className="text-slate-400">Architecture, context_length, RoPE freq, tokenizer vocab & merges</span>
          </div>
          <div className="bg-slate-900 p-1.5 rounded border border-slate-800 flex justify-between">
            <span className="text-rose-300 font-bold">4. Tensor Info Headers</span>
            <span className="text-slate-400">Name, dimensions (n_dims), type (Q4_K_M, F16), byte offset</span>
          </div>
          <div className="bg-emerald-950/40 p-2 rounded border border-emerald-500/40 flex justify-between">
            <span className="text-emerald-300 font-bold">5. Memory-Aligned Tensor Data</span>
            <span className="text-emerald-400">Raw weight blocks aligned to 32-byte / page boundaries for mmap()</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-2 font-mono">Zero-Copy Ingestion via mmap()</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Traditional Python loaders read multi-gigabyte PyTorch checkpoints into RAM, duplicate tensors during casting, and take minutes to start.
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>GGUF files are mapped directly into the process virtual address space via POSIX <code>mmap()</code>.</p>
            <p className="text-emerald-400"><strong>Instant Start:</strong> Startup latency drops from 45 seconds to <strong>50 milliseconds</strong>. Linux Kernel page cache lazily loads weights on demand.</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-2 font-mono">Self-Contained Single File Deployment</h4>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Unlike Hugging Face repositories split across 10 JSON config files and 5 safetensors shards:
          </p>
          <div className="text-[10px] text-slate-400 space-y-1">
            <p>A GGUF file embeds tokenizer vocabularies, BPE merges, chat templates, and architectural hyperparameters directly in its header.</p>
            <p>Ollama or llama.cpp can serve a model with zero internet access, zero Python dependencies, and zero configuration files.</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-950 p-3 rounded border border-slate-800 text-[10px]">
        <h4 className="text-xs font-bold text-slate-200 mb-1 font-mono uppercase tracking-wider">K-Quants in GGUF: Q4_K_M Breakdown</h4>
        <p className="text-slate-300 leading-relaxed">
          In our lab testbed with <code>qwen2.5:0.5b</code>, Ollama uses <strong>Q4_K_M (Medium K-Quant)</strong>.
          Instead of uniform 4-bit across all layers, critical layers (attention V-projection and output down-projection) are retained in 6-bit (Q6_K),
          while feedforward intermediate projections use 4-bit (Q4_K). This hybrid allocation achieves FP16 perplexity within 0.1% while slashing RAM to 398 MB!
        </p>
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 4.7</span>
    </div>
  </div>
);

export const QuantizationMatrix = () => (
  <div className="page flex flex-col justify-between p-10 bg-slate-900 text-slate-100 font-sans">
    <div>
      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-4">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Part IV · Quantization Mechanics · Page 8</span>
        <span className="text-xs text-slate-400 font-mono">Quantization Tradeoff Matrix & Benchmarks</span>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">4.8 Precision, Perplexity & Hardware Tradeoff Matrix</h2>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        Engineering production inference requires selecting the optimal quantization scheme for specific SLA, budget, and memory limits.
        Below is the authoritative empirical comparison across precision types.
      </p>

      {/* Comparison Table */}
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left font-mono text-[9px] border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/80 text-slate-300">
              <th className="p-2">Format</th>
              <th className="p-2">Bits/Param</th>
              <th className="p-2">Memory Footprint</th>
              <th className="p-2">Perplexity Delta (&Delta;PPL)</th>
              <th className="p-2">SIMD Acceleration Kernel</th>
              <th className="p-2">Recommended Serving Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            <tr>
              <td className="p-2 font-bold text-white">FP16 / BF16</td>
              <td className="p-2">16.0</td>
              <td className="p-2">100% (Baseline)</td>
              <td className="p-2 text-emerald-400 font-bold">0.00 (Reference)</td>
              <td className="p-2 text-slate-400">Native FP16 CUDA / FMA AVX2</td>
              <td className="p-2 text-slate-400">High-budget GPU clusters, base training</td>
            </tr>
            <tr className="bg-slate-950/40">
              <td className="p-2 font-bold text-sky-300">INT8 (W8A8)</td>
              <td className="p-2">8.0</td>
              <td className="p-2 text-sky-400">50%</td>
              <td className="p-2 text-emerald-400 font-bold">+0.02 (Negligible)</td>
              <td className="p-2 text-sky-300">INT8 Tensor Core / AVX2 VNNI</td>
              <td className="p-2 text-sky-200">High-throughput prefill clusters (SmoothQuant)</td>
            </tr>
            <tr>
              <td className="p-2 font-bold text-emerald-300">AWQ (W4A16)</td>
              <td className="p-2">4.0</td>
              <td className="p-2 text-emerald-400">25%</td>
              <td className="p-2 text-emerald-400 font-bold">+0.05</td>
              <td className="p-2 text-emerald-300">Marlin / ExLlamaV2 CUDA</td>
              <td className="p-2 text-emerald-200">Production vLLM serving on NVIDIA GPUs</td>
            </tr>
            <tr className="bg-slate-950/40">
              <td className="p-2 font-bold text-purple-300">GPTQ (W4A16)</td>
              <td className="p-2">4.0</td>
              <td className="p-2 text-purple-400">25%</td>
              <td className="p-2 text-emerald-400 font-bold">+0.08</td>
              <td className="p-2 text-purple-300">ExLlamaV2 / Triton GEMM</td>
              <td className="p-2 text-purple-200">Consumer GPU servers (24GB VRAM)</td>
            </tr>
            <tr>
              <td className="p-2 font-bold text-amber-300">GGUF Q4_K_M</td>
              <td className="p-2">~4.5</td>
              <td className="p-2 text-amber-400">28%</td>
              <td className="p-2 text-emerald-400 font-bold">+0.06</td>
              <td className="p-2 text-amber-300">AVX2 / AVX-512 / ARM NEON</td>
              <td className="p-2 text-amber-200 font-bold">CPU & Laptop Inference (Our WSL2 Lab!)</td>
            </tr>
            <tr className="bg-slate-950/40">
              <td className="p-2 font-bold text-rose-300">GGUF Q2_K</td>
              <td className="p-2">~2.6</td>
              <td className="p-2 text-rose-400">16%</td>
              <td className="p-2 text-rose-400 font-bold">+1.85 (Degradation)</td>
              <td className="p-2 text-rose-300">llama.cpp custom 2-bit kernel</td>
              <td className="p-2 text-rose-200">Extreme edge IoT, Raspberry Pi with &lt;2GB RAM</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1 font-mono">The Sweet Spot: 4-Bit vs 8-Bit</h4>
          <p className="text-[10px] text-slate-300 leading-relaxed">
            Extensive empirical evaluations (Dettmers et al.) establish that <strong>4-bit precision offers the optimal tradeoff between model accuracy and bit savings</strong>.
            Going from 16-bit to 4-bit delivers a 4x reduction in RAM with less than 1% perplexity drop. Moving from 4-bit to 3-bit or 2-bit causes sharp non-linear degradation.
          </p>
        </div>

        <div className="bg-slate-800/80 p-3 rounded border border-slate-700">
          <h4 className="text-xs font-bold text-sky-300 uppercase tracking-wider mb-1 font-mono">Larger Quantized Model vs Smaller Dense Model</h4>
          <p className="text-[10px] text-slate-300 leading-relaxed">
            A critical rule of thumb for systems architects: <strong>A 14B model quantized to 4-bit almost always outperforms an unquantized 7B model in FP16</strong>,
            even though both occupy approximately the same 8 GB of system memory. Parameter diversity outweighs raw weight precision.
          </p>
        </div>
      </div>

      <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-[10px] text-slate-400 font-mono">
        <strong>WSL2 Lab Validation:</strong> Deploying <code>qwen2.5:0.5b</code> in Q4_K_M consumes 398 MB RSS, allowing instant startup in our KServe container under a strict 256 MiB container footprint (with host bridge) or 512 MiB standalone limit.
      </div>
    </div>
    <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex justify-between font-mono">
      <span>LLM INFERENCE FIELD GUIDE · RAMU MANGALARAPU</span>
      <span>SECTION 4.8</span>
    </div>
  </div>
);
