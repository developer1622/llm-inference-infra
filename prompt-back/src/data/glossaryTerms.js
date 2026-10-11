// 100 Essential GenAI & LLM Inference Engineering Terms
// Structured into 4 distinct pages of 25 terms each for clean A4 printing.

export const glossaryPages = [
  {
    pageTitle: 'Part A · Core Architecture & Inference Lifecycle',
    terms: [
      {
        id: 1,
        term: 'Transformer',
        def: 'Deep learning architecture built on stacked self-attention and feed-forward layers, eliminating recurrent connections.',
      },
      {
        id: 2,
        term: 'Self-Attention',
        def: 'Mathematical mechanism computing pairwise token relevance by projecting tokens into Query, Key, and Value vectors.',
      },
      {
        id: 3,
        term: 'Multi-Head Attention (MHA)',
        def: 'Attention variant running independent query, key, and value heads to attend to information in parallel representation subspaces.',
      },
      {
        id: 4,
        term: 'Grouped-Query Attention (GQA)',
        def: 'Optimization sharing a smaller pool of key/value heads across multiple query heads, cutting KV cache memory by 4x–8x.',
      },
      {
        id: 5,
        term: 'Multi-Query Attention (MQA)',
        def: 'Extreme variant sharing a single key and value head across all query heads to maximize memory bandwidth efficiency.',
      },
      {
        id: 6,
        term: 'Multi-Head Latent Attention (MLA)',
        def: 'DeepSeek innovation compressing Key-Value projections into low-rank latent vectors, reducing KV cache size by over 90%.',
      },
      {
        id: 7,
        term: 'Feed-Forward Network (FFN)',
        def: 'Position-wise multi-layer perceptron with non-linear activation (e.g. SwiGLU) applied to each token vector independently.',
      },
      {
        id: 8,
        term: 'Residual Connection',
        def: 'Skip connection adding layer input directly to output (x + f(x)), preventing gradient vanishing in deep networks.',
      },
      {
        id: 9,
        term: 'RMSNorm',
        def: 'Root Mean Square Normalization; scales inputs by root-mean-square without mean subtraction, accelerating layer norm by ~20%.',
      },
      {
        id: 10,
        term: 'Rotary Position Embedding (RoPE)',
        def: 'Relative positional encoding rotating Query and Key vectors in complex 2D planes, enabling long-context extrapolation.',
      },
      {
        id: 11,
        term: 'Context Window',
        def: 'Maximum token count (prompt + generated response) a model can attend to in a single attention computation pass.',
      },
      {
        id: 12,
        term: 'Tokenizer',
        def: 'Subword parser (Byte-Pair Encoding, WordPiece) mapping raw Unicode text to discrete integer token IDs and vice versa.',
      },
      {
        id: 13,
        term: 'ChatML',
        def: 'Chat Markup Language; token protocol using special tokens (<|im_start|>, <|im_end|>) to isolate system, user, and assistant roles.',
      },
      {
        id: 14,
        term: 'Prompt Prefill Phase',
        def: 'Initial compute-bound inference stage processing all prompt tokens in parallel to generate the initial KV cache.',
      },
      {
        id: 15,
        term: 'Autoregressive Decode Phase',
        def: 'Sequential memory-bound inference stage predicting one new token at a time by feeding generated output back into input.',
      },
      {
        id: 16,
        term: 'Time to First Token (TTFT)',
        def: 'Wall-clock latency from client HTTP request dispatch until the arrival of the very first generated token chunk.',
      },
      {
        id: 17,
        term: 'Time Per Output Token (TPOT)',
        def: 'Average duration required to generate each incremental token during the autoregressive decode phase (inverse of decode tok/s).',
      },
      {
        id: 18,
        term: 'Inter-Token Latency (ITL)',
        def: 'Time variance and delta between two consecutive streamed token chunks; measures streaming smoothness for users.',
      },
      {
        id: 19,
        term: 'Token Throughput',
        def: 'Aggregate generation rate across all concurrent streams, measured in total tokens processed or generated per second.',
      },
      {
        id: 20,
        term: 'Arithmetic Intensity',
        def: 'Ratio of floating-point operations (FLOPs) to memory bytes transferred (FLOPs/byte), dictating whether a workload is compute or memory bound.',
      },
      {
        id: 21,
        term: 'Compute-Bound',
        def: 'State where execution throughput is strictly throttled by the arithmetic speed of ALUs or GPU Tensor Cores (e.g. prefill).',
      },
      {
        id: 22,
        term: 'Memory-Bandwidth Bound',
        def: 'State where execution throughput is throttled by data transfer rates from GPU VRAM or CPU RAM (e.g. decode phase).',
      },
      {
        id: 23,
        term: 'End-of-Sequence (EOS) Token',
        def: 'Special control token signaling that the model has completed generation and the serving loop should stop emitting chunks.',
      },
      {
        id: 24,
        term: 'Stop Sequences',
        def: 'User-specified string patterns triggering immediate inference termination when encountered in the generated text.',
      },
      {
        id: 25,
        term: 'Next-Token Prediction',
        def: 'Fundamental objective of causal language modeling: outputting a probability distribution over the vocabulary for position t+1.',
      },
    ],
  },
  {
    pageTitle: 'Part B · KV Cache, Memory Management & Scheduling',
    terms: [
      {
        id: 26,
        term: 'Key-Value (KV) Cache',
        def: 'GPU VRAM tensors storing past Key and Value attention states so previous tokens never need recomputation during decode.',
      },
      {
        id: 27,
        term: 'PagedAttention',
        def: 'vLLM virtual-memory innovation partitioning the KV cache into fixed-size non-contiguous physical memory blocks.',
      },
      {
        id: 28,
        term: 'Block Allocation Table',
        def: 'Page table data structure mapping a request’s logical sequence token positions to physical GPU KV cache memory blocks.',
      },
      {
        id: 29,
        term: 'Prefix Caching',
        def: 'Technique retaining KV cache blocks for common prompt prefixes (system instructions, tool schemas) across different requests.',
      },
      {
        id: 30,
        term: 'Radix Tree Caching',
        def: 'Tree-based index structure storing token sequences to enable longest-prefix-match KV cache lookup across concurrent queries.',
      },
      {
        id: 31,
        term: 'Context Paging',
        def: 'Evicting cold KV cache blocks from fast GPU VRAM to host CPU RAM or NVMe when GPU memory limits are approached.',
      },
      {
        id: 32,
        term: 'Attention Sink',
        def: 'Finding that initial tokens absorb massive attention softmax scores regardless of semantics; keeping them prevents stream collapse.',
      },
      {
        id: 33,
        term: 'KV Cache Compression',
        def: 'Techniques (FP8 quantization, token eviction, window pruning) shrinking the memory footprint of stored attention keys and values.',
      },
      {
        id: 34,
        term: 'Internal Memory Fragmentation',
        def: 'Unused VRAM inside pre-allocated fixed-size buffers; eliminated by fine-grained 16-token PagedAttention block sizing.',
      },
      {
        id: 35,
        term: 'External Memory Fragmentation',
        def: 'Unusable free memory scattered in disjoint non-contiguous chunks; resolved by virtual memory abstraction in inference engines.',
      },
      {
        id: 36,
        term: 'Chunked Prefill',
        def: 'Splitting massive prompt prefills into smaller token chunks interleaved with decode iterations to prevent request starvation.',
      },
      {
        id: 37,
        term: 'Continuous Batching',
        def: 'Iteration-level scheduling that evicts finished requests and admits new ones after every single token generation step.',
      },
      {
        id: 38,
        term: 'Static Batching',
        def: 'Legacy serving paradigm locking a fixed batch of requests together until the slowest sequence finishes, causing massive idle padding.',
      },
      {
        id: 39,
        term: 'Head-of-Line (HoL) Blocking',
        def: 'Queue pathology where short, quick requests are delayed waiting behind a long 4k-token prefill or generation in static queues.',
      },
      {
        id: 40,
        term: 'In-Flight Batching',
        def: 'Nvidia TensorRT-LLM terminology for continuous batching; dynamic addition and removal of requests at each iteration.',
      },
      {
        id: 41,
        term: 'Disaggregated Serving',
        def: 'Architectural separation of prefill-heavy worker nodes from decode-heavy worker nodes to optimize hardware resource utilization.',
      },
      {
        id: 42,
        term: 'vLLM',
        def: 'Pioneering open-source LLM inference engine featuring PagedAttention, continuous batching, and high-throughput multi-GPU serving.',
      },
      {
        id: 43,
        term: 'SGLang',
        def: 'High-performance inference engine built around RadixAttention, structured JSON decoding, and multi-node execution.',
      },
      {
        id: 44,
        term: 'TensorRT-LLM',
        def: 'Nvidia proprietary runtime optimized for Hopper/Blackwell GPUs with fused kernels, FP8 GEMM, and in-flight batching.',
      },
      {
        id: 45,
        term: 'Ollama',
        def: 'Developer-friendly serving tool packaging llama.cpp into a Dockerized daemon with an OpenAI-compatible REST API.',
      },
      {
        id: 46,
        term: 'llama.cpp',
        def: 'Bare-metal C/C++ inference runtime executing quantized GGUF models on CPUs and consumer GPUs with zero dependencies.',
      },
      {
        id: 47,
        term: 'KServe',
        def: 'Kubernetes custom resource framework providing autoscaling, canary rollouts, and ingress networking for production ML models.',
      },
      {
        id: 48,
        term: 'LiteLLM',
        def: 'API gateway proxy normalizing 100+ model providers into a unified OpenAI schema with auth, rate limits, and failover.',
      },
      {
        id: 49,
        term: 'Transfer-Encoding: chunked',
        def: 'HTTP/1.1 transport mechanism transmitting tokens as a series of size-prefixed data chunks without requiring Content-Length.',
      },
      {
        id: 50,
        term: 'Server-Sent Events (SSE)',
        def: 'Standard HTTP text protocol streaming real-time unidirectional events (data: {...}) over a single persistent TCP connection.',
      },
    ],
  },
  {
    pageTitle: 'Part C · Sampling, Acceleration, Hardware & Distributed Systems',
    terms: [
      {
        id: 51,
        term: 'Temperature',
        def: 'Hyperparameter scaling raw logits before softmax; low values sharpen probabilities (deterministic), high values broaden them.',
      },
      {
        id: 52,
        term: 'Top-P (Nucleus Sampling)',
        def: 'Sampling technique restricting the candidate token pool to the smallest set whose cumulative probability reaches threshold P.',
      },
      {
        id: 53,
        term: 'Top-K Sampling',
        def: 'Filtering logits to only retain the K highest probability candidate tokens, discarding the tail of unlikely predictions.',
      },
      {
        id: 54,
        term: 'Min-P Sampling',
        def: 'Dynamic thresholding discarding tokens whose probability is less than a fraction of the single highest-probability token.',
      },
      {
        id: 55,
        term: 'Repetition Penalty',
        def: 'Logit penalty discounting probabilities of tokens that have already occurred in the context to discourage repetitive loops.',
      },
      {
        id: 56,
        term: 'Logprobs',
        def: 'Natural logarithm of probabilities assigned to tokens; used for confidence scoring, perplexity measurement, and ranking.',
      },
      {
        id: 57,
        term: 'Greedy Decoding',
        def: 'Deterministic decoding selecting the single token with the absolute highest probability at every step (Temperature = 0).',
      },
      {
        id: 58,
        term: 'Beam Search',
        def: 'Heuristic search tracking the top B candidate sequences concurrently; common in translation, rarely used in LLM chat.',
      },
      {
        id: 59,
        term: 'Frequency Penalty',
        def: 'Additive penalty proportional to the exact number of times a token has appeared in the response so far.',
      },
      {
        id: 60,
        term: 'Presence Penalty',
        def: 'One-time flat logit penalty applied to any token that has appeared at least once, encouraging exploration of new concepts.',
      },
      {
        id: 61,
        term: 'Speculative Decoding',
        def: 'Acceleration method where a small draft model predicts K tokens verified in a single parallel step by the large target model.',
      },
      {
        id: 62,
        term: 'Draft Model',
        def: 'Lightweight model generating speculative token candidate sequences to boost decode throughput on larger target models.',
      },
      {
        id: 63,
        term: 'Multi-Token Prediction',
        def: 'Architectural design equipping an LLM with multiple output heads to predict N subsequent tokens in a single forward pass.',
      },
      {
        id: 64,
        term: 'FlashAttention',
        def: 'IO-aware exact attention computing softmax tiling without writing intermediate N×N attention matrices to high-latency HBM.',
      },
      {
        id: 65,
        term: 'FlashDecoding',
        def: 'FlashAttention extension parallelizing the reduction across sequence length during the decode stage for extreme long context.',
      },
      {
        id: 66,
        term: 'Kernel Fusion',
        def: 'Merging consecutive GPU mathematical operations into a single kernel to eliminate intermediate memory load/store cycles.',
      },
      {
        id: 67,
        term: 'CUDA Graphs',
        def: 'Recording a chain of GPU kernel launches once to submit them as a single execution graph, bypassing CPU driver overhead.',
      },
      {
        id: 68,
        term: 'Tensor Parallelism (TP)',
        def: 'Sharding individual weight matrices across multiple GPUs (e.g. TP=8) linked by high-bandwidth NVLink to execute layer math.',
      },
      {
        id: 69,
        term: 'Pipeline Parallelism (PP)',
        def: 'Partitioning sequential model layers across multiple GPUs, passing activation tensors sequentially from node to node.',
      },
      {
        id: 70,
        term: 'Expert Parallelism (EP)',
        def: 'Distributing independent feed-forward expert networks of a Mixture of Experts model across different cluster nodes.',
      },
      {
        id: 71,
        term: 'High Bandwidth Memory (HBM3e)',
        def: '3D-stacked DRAM integrated on GPU substrates delivering up to 8.0 TB/s bandwidth, the primary bottleneck for decode.',
      },
      {
        id: 72,
        term: 'NVLink & NVSwitch',
        def: 'Nvidia high-speed interconnect fabric delivering up to 1.8 TB/s bidirectional bandwidth per GPU for multi-GPU scaling.',
      },
      {
        id: 73,
        term: 'NCCL',
        def: 'Nvidia Collective Communications Library; GPU communication primitives executing all-reduce, all-gather, and broadcast.',
      },
      {
        id: 74,
        term: 'RoCE (RDMA over Converged Ethernet)',
        def: 'Protocol enabling direct memory transfer across cluster nodes over Ethernet without kernel CPU intervention.',
      },
      {
        id: 75,
        term: 'InfiniBand',
        def: 'Low-latency, high-throughput switched fabric interconnect widely used in large-scale AI distributed supercomputing.',
      },
    ],
  },
  {
    pageTitle: 'Part D · Quantization, MoE, Reasoning & Application Systems',
    terms: [
      {
        id: 76,
        term: 'Quantization',
        def: 'Mapping high-precision weight and activation tensors (FP16) to lower-bit representations (FP8, INT4) to save memory.',
      },
      {
        id: 77,
        term: 'Bfloat16 (BF16)',
        def: '16-bit brain floating point format keeping 8 exponent bits (same range as FP32) with 7 mantissa bits for stable training/inference.',
      },
      {
        id: 78,
        term: 'FP8 (E4M3 / E5M2)',
        def: '8-bit floating point formats; E4M3 offers high precision for forward passes, while E5M2 offers wider dynamic range.',
      },
      {
        id: 79,
        term: 'INT4 Quantization',
        def: 'Compressing model weights to 4-bit integers with scaling factors, shrinking 70B parameter models from 140 GB to under 38 GB.',
      },
      {
        id: 80,
        term: 'AWQ (Activation-aware Quantization)',
        def: 'Weight quantization technique protecting the top 1% most salient weight channels identified from activation distributions.',
      },
      {
        id: 81,
        term: 'GPTQ',
        def: 'Second-order Taylor expansion post-training quantization method minimizing output distortion per matrix block.',
      },
      {
        id: 82,
        term: 'GGUF Format',
        def: 'Extensible binary format by Georgi Gerganov storing quantized model weights, metadata, and tokenizers for llama.cpp.',
      },
      {
        id: 83,
        term: 'Weight-Only Quantization',
        def: 'Quantizing model weights to INT4/INT8 while dequantizing to FP16 dynamically on-chip during matrix multiplication.',
      },
      {
        id: 84,
        term: 'W8A8 Quantization',
        def: 'Joint quantization of both weights and activations to 8-bit, enabling ultra-fast INT8/FP8 Tensor Core GEMM matrix kernels.',
      },
      {
        id: 85,
        term: 'Outlier Activations',
        def: 'Extreme activation values emerging in large models that disrupt naive integer quantization if not scaled separately.',
      },
      {
        id: 86,
        term: 'LoRA (Low-Rank Adaptation)',
        def: 'Parameter-efficient fine-tuning freezing base weights and injecting trainable low-rank decomposition matrices (A × B).',
      },
      {
        id: 87,
        term: 'QLoRA',
        def: 'Fine-tuning technique quantizing base weights into 4-bit NormalFloat (NF4) while backpropagating gradients into FP16 LoRA adapters.',
      },
      {
        id: 88,
        term: 'Mixture of Experts (MoE)',
        def: 'Architecture replacing monolithic FFN layers with multiple expert sub-networks, activating only a sparse subset per token.',
      },
      {
        id: 89,
        term: 'Sparse Gating (Router)',
        def: 'Learned softmax router assigning input tokens to the top-K expert networks based on token semantic features.',
      },
      {
        id: 90,
        term: 'Active Parameters',
        def: 'Fraction of total weights executed per forward pass; e.g. DeepSeek-V3 routes 37B active parameters out of 671B total.',
      },
      {
        id: 91,
        term: 'Dense Model',
        def: 'Architecture executing 100% of all parameter weights for every single token in the sequence (e.g. Llama 3.1 70B).',
      },
      {
        id: 92,
        term: 'Small Language Model (SLM)',
        def: 'High-capability models under 10B parameters (Phi-4, Qwen 2.5 0.5B) trained on synthetic data for edge and CPU inference.',
      },
      {
        id: 93,
        term: 'Reasoning Model',
        def: 'Model trained via reinforcement learning to generate internal verification and thinking tokens before producing user answers.',
      },
      {
        id: 94,
        term: 'Test-Time Compute',
        def: 'Allocating additional GPU computation during inference (via search, self-correction, or reasoning tokens) to raise output quality.',
      },
      {
        id: 95,
        term: 'Chain of Thought (CoT)',
        def: 'Methodology prompting or training models to produce intermediate logical deduction steps before outputting final answers.',
      },
      {
        id: 96,
        term: 'System Prompt',
        def: 'Initial developer-defined instructions establishing behavioral constraints, identity, safety rules, and schema definitions.',
      },
      {
        id: 97,
        term: 'Retrieval-Augmented Generation (RAG)',
        def: 'Architecture retrieving relevant external facts from a vector database or search engine to inject into the prompt context.',
      },
      {
        id: 98,
        term: 'Tool / Function Calling',
        def: 'Capability where the model emits structured JSON arguments to trigger external database lookups or code executions.',
      },
      {
        id: 99,
        term: 'Model Context Protocol (MCP)',
        def: 'Open standard protocol standardizing how client applications connect LLMs to tools, data sources, and agentic environments.',
      },
      {
        id: 100,
        term: 'Guardrails & Verification',
        def: 'Deterministic and ML validation layers filtering prompt injections, schema violations, and hallucinations before output.',
      },
    ],
  },
]
