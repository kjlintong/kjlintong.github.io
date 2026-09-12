---
layout: post
title: "The KV-Cache Memory Ledger: Long Context, Concurrency, and the Quantization–Pruning Trade-off"
title_zh: "KV-Cache 的显存账本：长上下文、并发与量化剪枝的取舍"
subtitle: "MLSys·im Learning Notes (Part 3) — a formula for how much memory one request eats, why sequence length decides your concurrency ceiling, and why 'compression' and 'pruning' are two completely different stories for inference speedup"
subtitle_zh: "MLSys·im 学习笔记（三）——用公式算清一个请求吃多少显存，序列长度如何决定并发上限，以及为什么\"压缩\"和\"剪枝\"在推理提速上完全是两回事"
lang: en
lang_pair: /blog/mlsysim-kv-cache/
description: "Third stage of my MLSys learning: following the Datawhale mlsysim task (KV-Cache & model properties), I hand-compute the KV-Cache memory ledger — each term of the formula mapped to a Llama-3-8B hyperparameter — verify that doubling sequence length halves the concurrency ceiling (260 @2K → 130 @4K → 16 @32K → 4 @128K on one H100), and settle an AI-assistant's wrong prediction: INT4 speedup actually climbs monotonically with batch (3.38x → 3.86x) instead of hitting a critical point, because the engine scales KV-Cache bytes with precision too. Finally CompressionModel shows quantization 'compresses and accelerates' while unstructured pruning 'saves storage but no time'."
date: 2026-09-12
author: Ryan
permalink: /blog/mlsysim-kv-cache-en/
catalog: true
categories:
  - Tech
  - Learning Notes
tags:
  - MLSys
  - KV Cache
  - Memory Optimization
  - Quantization
  - Pruning
  - LLM Inference
  - mlsysim
---

> In [The Memory Wall & Two Phases](/blog/mlsysim-memory-wall-en/), I split a single LLM request into two walls: Prefill hits the compute wall, Decode hits the memory wall. Today I moved on to the third stage of the Datawhale [mlsysim study activity](https://github.com/datawhalechina/llm-algo-leetcode/issues/133), flipping the lens from "time" to "space": **where does the memory actually go, and what do you do when the model gets bigger?** Corresponding tutorials: [KV-Cache: The Hidden Memory Consumer](https://mlsysbook.ai/mlsysim/blog/how-much-memory-llama3.html) and [Quantization: Not a Free Lunch](https://harvard-edge.github.io/cs249r_book_dev/mlsysim/tutorials/05_quantization.html). The core tools switch from `Engine` to `ServingModel`, `calc_kv_cache_size` and `CompressionModel` — three tools for three questions: how much memory does one request eat, how many requests fit on one card, and what does shrinking the weights actually accelerate?

---

## 1. KV-Cache: Where the Memory Goes

Task 2 left us a cliffhanger: a 70B model in FP16 weighs 141.2 GB, far beyond one H100's 85.9 GB (80 GiB). The "where does memory go" question starts with the weight ledger (E1):

| Model | FP16 | INT8 | INT4 |
|-------|------|------|------|
| Llama-3-8B | 16.06 GB | 8.03 GB | 4.02 GB |
| Llama-3-70B | 141.2 GB | 70.6 GB | 35.3 GB |

8B params × 2 bytes = 16.06 GB; 70B × 2 = 141.2 GB. **70B in FP16 doesn't fit a single card; INT8 (70.6 GB) is marginal and INT4 (35.3 GB) is comfortable** — that's conclusion one, but the bigger question is behind it: even once the weights are in, how much does one 2K-request's KV-Cache eat?

The KV-Cache is the memory block that caches the K/V matrices of all previous tokens so Decode can reuse them instead of recomputing attention. Its formula:

```
KV-Cache = 2 × L × n_kv_heads × head_dim × seq_len × batch_size × bytes_per_elem
```

Every term maps to a Llama-3-8B hyperparameter:

| Symbol | Meaning | Llama-3-8B value |
|--------|---------|------------------|
| L | number of layers | 32 |
| n_kv_heads | KV heads (≪ Q heads under GQA) | 8 |
| head_dim | dimension per head | 128 |
| seq_len | sequence length | variable |
| batch_size | concurrent requests | variable |
| bytes_per_elem | bytes per element | FP16=2, INT8=1, INT4=0.5 |

Sanity check for a single request at 2K context:

```
2 × 32 × 8 × 128 × 2048 × 1 × 2 = 268,435,456 bytes = 0.268 GB
```

This matches `ServingModel.solve()`'s `kv_cache_size` output exactly: `0.268 GB`. Hand-calculated, engine-reported, and the [official blog](https://mlsysbook.ai/mlsysim/blog/how-much-memory-llama3.html) all agree. Stretch the sequence length and the E2 ledger looks like this:

| Seq length | KV-Cache per request (8B) | Multiple of 4K |
|-----------|---------------------------|----------------|
| 2K (2048) | 268 MB | 0.5× |
| 4K (4096) | 537 MB | 1× (baseline) |
| 32K (32768) | 4,295 MB | 8× |
| 128K (131072) | 17,180 MB | 32× |

**KV-Cache is strictly linear in sequence length: double the length, double the cache.** seq_len is a plain multiplicative factor with no amortization. A single 128K request's KV-Cache (17.18 GB) already exceeds the model weights (16.06 GB) — **long context is not free; it is priced per token**.

![KV-Cache grows linearly with sequence length](/img/posts/2026-09-12-mlsysim-kv-cache/kv_growth.png)

*Fig 1: KV-Cache grows linearly with sequence length; both 8B and 70B are exact straight lines (70B has 2.5× the layers, hence the steeper slope).*

---

## 2. The Capacity Wall: Sequence Length Sets the Concurrency Ceiling

With 16.06 GB of weights inside the 85.9 GB H100, the remaining budget buys KV-Cache. So E3's core question: **given a sequence length, how many requests can one card serve concurrently?**

The plain arithmetic: max concurrency = (85.9 − 16.06) ÷ KV-Cache per request. At 4K: `69.84 ÷ 0.537 ≈ 130`. Then sweep with `ServingModel.solve()`'s `feasible` flag; ground truth for all four lengths:

| Seq length | KV-Cache per request | Max concurrent (feasible) | Pattern |
|-----------|----------------------|---------------------------|---------|
| 2K | 268 MB | **260** | baseline |
| 4K | 537 MB | **130** | halved |
| 32K | 4,295 MB | **16** | keeps halving |
| 128K | 17,180 MB | **4** | single digits |

![Concurrency ceiling halves as sequence length doubles](/img/posts/2026-09-12-mlsysim-kv-cache/concurrency.png)

*Fig 2: doubling sequence length halves the concurrency ceiling — the direct consequence of KV-Cache's pure linearity.*

The 130 matches the hand calculation, which also confirms that `ServingModel`'s memory budget is a plain sum of "weights + KV-Cache + system overhead". Note that at 128K the ceiling is down to 4 — **even though a single 128K request is feasible (33.24 GB total), the concurrent capacity is already near zero**. Compared to 260 concurrent requests at 2K, 128K context is a cliff in cost-effectiveness.

This is the "capacity wall" — the second form of the memory wall (flagged in Part 2). **The bandwidth wall decides how fast each token is; the capacity wall decides how big a model, and how much concurrency, one card can serve.** Sequence length is the knob pressing down on the concurrency ceiling.

---

## 3. What If the Model Gets Bigger: 8B → 70B and Quantization

### O1: Scaling the model scales both phases

Switching from 8B to 70B (FP16, H100, seq 2048, bs 1), measured:

| Metric | Llama-3-8B | Llama-3-70B | Growth |
|--------|-----------|------------|--------|
| Weights | 16.06 GB | 141.2 GB | 8.8× |
| TTFT (Prefill) | 70.97 ms | 607.0 ms | **8.6×** |
| ITL (Decode) | 5.19 ms | 43.15 ms | **8.3×** |

Parameters grow 8.8× and both TTFT and ITL follow at ~8× — **both phases are linearly dominated by model scale**. TTFT because prefill FLOPs scale with parameter count; ITL because decode moves the entire weight matrix per token, so 8.8× the weights means 8.8× the moving time. This confirms the Task 2 conclusion: the bottleneck region doesn't change as the model grows; both walls just get taller.

### E4+E5: Quantization helps Decode, not Prefill

Quantization halves/quarters the weight bytes, with completely asymmetric effects on the two phases (8B, H100, seq 2048):

| Precision | Weights | ITL (Decode) | TTFT (Prefill) |
|-----------|---------|--------------|----------------|
| fp16 | 16.06 GB | 5.19 ms | 70.97 ms |
| int8 | 8.03 GB | 2.76 ms (1.9×) | 35.47 ms (2.0×) |
| int4 | 4.02 GB | 1.54 ms (**3.4×**) | 70.97 ms (1.0×) |

- **Decode side: halve the bytes, halve the ITL.** 5.19 → 2.76 → 1.54, strictly tracking weight size. Decode moves the whole weight matrix per token; bytes are the lever.
- **Prefill side: it only accelerates if the hardware has a low-precision compute path.** int8 looks up 1979 TFLOP/s in H100's precision_flops table and halves TTFT; int4 finds no native INT4 path on H100, falls back to the FP16 peak, and TTFT snaps back — the "inverted V" I traced to the source in Part 2.

One line: **quantization rescues Decode, not Prefill.** That is the soul of Task 3, and it seeds the next section: what exactly does compression "compress", and what does it accelerate?

---

## 4. Compression vs Pruning: Saving Storage ≠ Saving Time

Optional experiment O3 uses `CompressionModel` to compare the two compression routes. I ran both end-to-end (8B, H100):

| Method | Compressed size | Ratio | Accuracy Δ | Speedup | Memory savings |
|--------|----------------|-------|-----------|---------|----------------|
| FP16 (baseline) | 16.06 GB | 2.0× | +0.00% | 2.00× | 50.0% |
| INT8 quantization | 8.03 GB | 4.0× | -0.00% | **4.00×** | 75.0% |
| INT4 quantization | 4.02 GB | 8.0× | -0.03% | **8.00×** | 87.5% |
| Prune 50% (unstructured) | 16.06 GB | 2.0× | -0.00% | **1.00×** | 50.0% |
| Prune 75% (unstructured) | 8.03 GB | 4.0× | -0.04% | **1.00×** | 75.0% |
| Prune 90% (unstructured) | 3.21 GB | 10.0× | -0.06% | **1.00×** | 90.0% |

![Compression ratio vs inference speedup](/img/posts/2026-09-12-mlsysim-kv-cache/compression_frontier.png)

*Fig 3: quantization hugs the ideal "compress 2×, speed up 2×" line; unstructured pruning speeds up exactly 1.00× no matter how much it compresses — storage saved, time unchanged.*

Two patterns jump out:

1. **Quantization: compression ratio = speedup.** INT4 compresses 8× and accelerates 8×. Quantization reduces each weight element's bit width, so the bytes moved per Decode step shrink proportionally — `inference_speedup` faithfully mirrors "how much less data is moved".
2. **Unstructured pruning: huge compression, speedup stuck at 1.00×.** Pruning 90% saves 90% of storage but doesn't speed up inference by a single step. That is the most counter-intuitive and most instructive row — **for unstructured pruning, saving storage and saving time are completely decoupled**.

### Why doesn't unstructured pruning accelerate?

This was the core question I asked today. The answer lies in a double mismatch of hardware and sparsity pattern:

- **GPUs are designed for dense GEMM.** The heart of neural inference is matrix multiplication; Tensor Cores assume every matrix position holds a valid number and stream at full throughput in tiles. There is no hardware logic for "skip if the value is zero".
- **Unstructured pruning produces "random sparsity".** Zeroing the smallest-magnitude weights element-wise scatters zeros randomly across the matrix — a pattern that matches neither the dense-compute paradigm nor any hardware-recognized regular sparsity.
- **"Fits in memory" and "computes fast" are two different pipelines.** After pruning you can store only the non-zero values in a compressed format, so the model file gets smaller; but at compute time you either decompress back to dense (no speedup) or run sparse GEMM — random sparsity's sparse-matrix multiply speedup is near zero, plus it pays index overhead.
- **Hardware-accelerated sparsity demands *regular* sparsity.** NVIDIA's sparse Tensor Cores (Ampere and later) support the 2:4 pattern (exactly 2 zeros per 4 elements) at 2× speedup, but only if the pruning algorithm deliberately conforms to that pattern. Ordinary unstructured pruning (random zero distribution) doesn't qualify.

Against Fig 3 it's clear: **quantization makes each number shorter, directly cutting bytes moved; unstructured pruning erases some numbers, cutting storage but not the per-step byte count** — because sparse matrices still go through dense GEMM on ordinary hardware. This is also the fundamental reason quantization is far more common in production than unstructured pruning.

(One clarification: the engine's `estimated_accuracy_delta` is a simplified static estimate — the local numbers (-0.03% ~ -0.06%) are far gentler than the "INT4 loses 2.5%" often quoted in tutorials. It shows the direction of the trade-off, not a real evaluation — see Section 6.)

---

## 5. Questions Met Along the Way

### Q1: Is PagedAttention a GPU mechanism or a model mechanism?

Neither. **PagedAttention is a software memory-management algorithm implemented by the inference engine (vLLM)** — analogous to virtual memory/page tables in an OS: it maintains a "block table" underneath that stitches physically scattered blocks into a logically contiguous memory region to feed the model. The GPU hardware only understands contiguous physical addresses; the model only does math; the engine does the translation in between. That's the key to the last section of the tutorial: it solves the engineering problem of memory fragmentation and redundancy, not a model-structure problem.

### Q2: Why do Static / Paged-16 / Paged-64 produce identical results?

The tutorial and task both show an experiment where only `page_size` changes (2048 / 16 / 64) and `Max Users`, `Throughput`, `Frag`, `Speedup` come out identical. My local run reproduced it exactly (seq_len=32768, max_batch=16):

```
System             Max Users  Throughput  Frag  Speedup
───────────────────────────────────────────────────────
Static (baseline)         16     632 t/s  0.0%     1.1x
Paged (16 tok)            16     632 t/s  0.0%     1.1x
Paged (256 tok)           16     632 t/s  0.0%     1.1x
```

Three stacked reasons:

1. **`seq_len` divides evenly by `page_size`, so fragmentation is naturally 0.** Tutorial default seq_len=4096: ÷2048=2, ÷16=256, ÷64=64 — all exact, perfect fill, `Frag` all 0.0%. PagedAttention removes *waste*; with no waste to remove it has nothing to do.
2. **`max_batch_size` caps concurrency.** All three configurations are pinned by the same ceiling (16); memory never becomes the bottleneck.
3. **All requests live and die together.** In the simulator every request has the same length and the same lifecycle; no short request finishes early to free space — "allocate on demand + reuse dynamically" has zero room to play.

I changed seq_len to 4000 and raised `max_batch_size` to 1000 to make memory the bottleneck, and finally saw a difference: Static fits 130, Paged-16 fits 133, Paged-64 fits 132. The difference exists, but is far smaller than intuition suggests.

### Q3: When does PagedAttention actually pay off?

The key insight: **PagedAttention is a "space" optimization, Continuous Batching is a "time" optimization; combined they amplify throughput to the extreme.**

- PagedAttention eliminates space waste: physical blocks allocated on demand, prefix sharing (multiple requests with the same system prompt share one KV copy), copy-on-write.
- Continuous Batching eliminates time waste: whoever finishes first releases first, and the freed slot is immediately taken by a new request.
- Only when **request lengths follow a long-tail distribution** (80% short + 20% long) do short requests release memory quickly and PagedAttention fill the gaps dynamically — that is when the two produce a real 1+1>2. The simulator's "requests live and die together" setup removes the time dimension, so the space optimization can't express itself either.

This also explains why the tutorial puts PagedAttention in the "memory utilization" lesson: like quantization, it **makes better use of the wall's interior rather than pushing the wall**.

### Q4: INT4 speedup rises with batch instead of falling — the AI assistant's prediction was wrong?

This is the most dramatic question of the day. Optional experiment O2 asks you to "sweep batch 1–256 and find where INT4 speedup drops below 2× and 1.5×" — the wording implies speedup decays with batch. My AI assistant predicted the same: "as batch grows, inference shifts from memory-bound to compute-bound and INT4 speedup gradually declines; the critical batch is somewhere in the tens to low hundreds."

Measured results (H100, 8B, seq 2048) say otherwise:

| Batch | ITL fp16 | ITL int4 | Speedup |
|-------|----------|----------|---------|
| 1 | 5.19 ms | 1.54 ms | **3.38×** |
| 2 | 5.27 ms | 1.56 ms | 3.38× |
| 4 | 5.43 ms | 1.60 ms | 3.40× |
| 8 | 5.76 ms | 1.68 ms | 3.43× |
| 16 | 6.40 ms | 1.84 ms | 3.48× |
| 32 | 7.68 ms | 2.16 ms | 3.56× |
| 64 | 10.24 ms | 2.80 ms | 3.66× |
| 128 | 15.37 ms | 4.08 ms | 3.76× |
| 256 | 25.63 ms | 6.65 ms | 3.86× |

![INT4 speedup climbs monotonically with batch](/img/posts/2026-09-12-mlsysim-kv-cache/int4_speedup_batch.png)

*Fig 4: INT4 vs FP16 ITL speedup climbs monotonically from 3.38× at batch=1 to 3.86× at batch=256. There is no "critical point" decline.*

**The speedup doesn't decay — it climbs, asymptotically approaching the theoretical limit of 4×.** Two root causes:

1. **Task 2 already proved it: Decode is memory-bound forever and never flips to compute-bound with batch.** LLM decoding has arithmetic intensity of order 1 FLOP/byte, and no realistic batch gets anywhere near any GPU's ridge point. The assistant transferred the ResNet-50 experience ("larger batch crosses the ridge into compute-bound") onto decode, where it doesn't apply — **different workload class, the regime-shift rule doesn't transfer**.
2. **In the engine, the KV-Cache scales with precision too** (bytes_per_elem follows precision, so INT4's KV is also quartered, see Section 6). FP16's ledger is "16.06 GB + KV", INT4's is "4.02 GB + KV/4"; the ratio actually widens as KV grows, and the fixed per-layer tax gets amortized away — so the speedup monotonically approaches 4×.

This also shows that the "critical batch" premise of the task wording rests on two wrong assumptions: "KV doesn't scale with precision" and "decode can turn compute-bound". **The simulator gives you the answer; wrong premises give you wrong expectations — running it yourself beats any prediction.**

### Q5: Why does the engine's INT4 KV-Cache shrink too?

A follow-up to Q4. In real deployments the KV-Cache normally stays FP16 (or gets its own dedicated KV quantization) — a separate concern from weight quantization. But mlsysim's `ServingModel` binds `bytes_per_elem` to precision, so at INT4 the KV elements count as 0.5 bytes each — hence int4's KV (0.070 GB @bs1) is a quarter of fp16's (0.268 GB) in the O2 table above. That's a simplification the engine makes, not a deployment convention. Its benefit: the "quantization speedup" experiment cleanly approaches the weight-byte ratio. Its cost: if you want to model a real system (INT4 weights + FP16 KV), you have to manually add the KV part back. **Knowing which assumptions the engine made for you is something no documentation will tell you.**

---

## 6. Two Details Dug Out of the Engine Source

Continuing the habit from Parts 1 and 2, I took `CompressionModel` and `ServingModel` apart:

**Detail one: `CompressionModel.solve()`'s signature and result.**

```python
CompressionModel.solve(
    model, hardware,
    method="quantization",   # "quantization" | "pruning" | "distillation"
    target_bitwidth=8,       # 4, 8, 16 (quantization)
    sparsity=0.0,            # 0.0–1.0 (pruning)
    sparsity_type="unstructured"  # "unstructured" | "structured" | "n_m"
) → CompressionResult
```

`CompressionResult` fields: `compressed_size_gb`, `compression_ratio`, `memory_savings_pct`, `inference_speedup`, `estimated_accuracy_delta`.

**Detail two: the three semantic families must be read separately.** `compression_ratio` and `memory_savings_pct` are two ways of saying the same thing (ratio = 1/(1−savings)). `inference_speedup` equals the compression ratio under quantization but stays 1.00× under pruning — it models "the ratio of bytes moved in Decode", not real compute change; and `estimated_accuracy_delta` is a lookup-table static estimate (locally -0.00% ~ -0.06%, clearly optimistic) — **fine for direction, not for conclusions**. Real accuracy loss needs calibration + evaluation, beyond what a simulation tool can do. The tool's value is drawing the storage-vs-time trade-off clearly; leave "accuracy" to real evaluation.

---

## 7. Personal Takeaways

1. **The memory ledger is a multiplication problem.** Every factor in the KV-Cache formula (layers, KV heads, head_dim, seq_len, batch, bit width) multiplies with zero sharing or amortization. **Any factor doubling doubles the memory** — long context, high concurrency, and high precision cannot all fit on an 80 GB card at once. "Where did the memory go?" The answer: the multiplicands ate it.

2. **Sequence length is a more insidious memory killer than model size.** Weights are static (paid once at purchase); KV-Cache is dynamic (grows with every request's context). 130 concurrent requests at 4K vs 4 at 128K — the same Llama-3-8B on the same H100 serves completely different products. **Context length is a product decision that translates directly into a cost decision** — which is why "128K context" is a marketing bullet point and an operations bill at the same time.

3. **Quantization/pruning solves capacity — correction: quantization solves both, pruning only one.** Quantization cuts bytes per element, which simultaneously cuts decode time (bandwidth wall: less to move) and total footprint (capacity wall); unstructured pruning cuts only storage, not movement. **Before picking an optimization, ask which side of the wall you're hitting**: cut memory → prune; cut time → quantize (or 2:4 sparsity).

4. **AI assistants get it wrong too — and representatively.** The O2 prediction failure is a valuable reminder: the assistant transplanted ResNet-50's "bigger batch crosses the ridge into compute-bound" onto LLM decode, whose arithmetic intensity (~1) never gets that chance. **When prediction conflicts with measurement, trust measurement; when a task's wording implies a conclusion, ask what its premises are first** — that habit is worth more than learning mlsysim itself.

5. **The simulation tool's simplifications are its boundaries.** KV scaling with precision, static accuracy_delta — both are simplifications the engine makes to teach mechanisms clearly. When using a tool for decisions, you must know which numbers are mechanism (reliable) and which are assumptions (reference only). **Where the tool ends is where you go back to the real system to run the experiment.**

---

## 8. References & Reproduction

- Tutorial chain: 00 Hello Roofline ([Part 1](/blog/mlsysim-roofline-en/)) → 01 Memory Wall + 02 Two Phases ([Part 2](/blog/mlsysim-memory-wall-en/)) → [03 KV-Cache: The Hidden Memory Consumer](https://mlsysbook.ai/mlsysim/blog/how-much-memory-llama3.html) (this post) → [Quantization: Not a Free Lunch](https://harvard-edge.github.io/cs249r_book_dev/mlsysim/tutorials/05_quantization.html) (this post).
- Task: [Datawhale llm-algo-leetcode #133](https://github.com/datawhalechina/llm-algo-leetcode/issues/133).
- Reproduction: `pip install mlsysim`, full scripts in the appendix below.
- The KV-Cache formula and concurrency derivation reference the [official blog: How much memory is needed for Llama 3 70B?](https://mlsysbook.ai/mlsysim/blog/how-much-memory-llama3.html).
- Environment: WSL2 + conda env mlsysim (python 3.11, mlsysim 0.1.1), no GPU involved — pure simulation.

## Appendix: Full runnable scripts

**Script 1: The KV-Cache memory ledger (E1+E2+E3) — weight sizes, KV growth vs sequence length, concurrency ceiling, and the PagedAttention comparison**

```python
import mlsysim
from mlsysim.solvers import ServingModel
from mlsysim.show import table, info

model = mlsysim.Models.Language.Llama3_8B
hardware = mlsysim.Hardware.Cloud.H100
solver = ServingModel()

# E1: weight sizes at different precisions
print("--- Llama-3-8B weights ---")
for prec, byte in [("fp16", "2 byte"), ("int8", "1 byte"), ("int4", "0.5 byte")]:
    print(f"{prec}: {model.size_in_bytes(precision=mlsysim.ureg(byte)).to('GB'):.2f} GB")
print(f"70B fp16: {mlsysim.Models.Language.Llama3_70B.size_in_bytes(precision=mlsysim.ureg('2 byte')).to('GB'):.1f} GB (H100 = {hardware.memory_capacity.to('GB'):.1f} GB)")

# E2: KV-Cache per request vs sequence length
from mlsysim.core import calc_kv_cache_size
rows = []
for ctx in [2048, 4096, 32768, 131072]:
    kv = calc_kv_cache_size(n_layers=model.layers, n_heads=model.kv_heads,
                            head_dim=model.hidden_dim // model.heads,
                            seq_len=ctx, batch_size=1, bytes_per_elem=2)
    rows.append([ctx, f"{kv.to('MB'):.0f} MB"])
table(["SeqLen", "KV per request"], rows)

# E3: concurrency ceiling sweep (feasible)
rows = []
for ctx in [2048, 4096, 32768, 131072]:
    best = 0
    for b in range(1, 1500):
        r = solver.solve(model=model, hardware=hardware, seq_len=ctx, batch_size=b, precision="fp16")
        if r.feasible:
            best = b
        else:
            break
    rows.append([ctx, best])
table(["SeqLen", "Max concurrent"], rows)

# PagedAttention comparison (why the three configs are identical:
# seq_len divides evenly by page_size + max_batch caps the ceiling)
from mlsysim.solvers import ContinuousBatchingModel
cb = ContinuousBatchingModel()
rows = []
for label, page in [("Static", 2048), ("Paged 16", 16), ("Paged 256", 256)]:
    c = cb.solve(model=model, hardware=hardware, seq_len=32768,
                 max_batch_size=16, page_size=page, precision="fp16")
    rows.append([label, c.max_active_requests, f"{c.throughput_tokens_per_sec:.0f} t/s",
                 f"{c.memory_fragmentation_pct:.1f}%", f"{c.speedup_vs_static:.1f}x"])
table(["System", "Max Users", "Throughput", "Frag", "Speedup"], rows)
```

**Script 2: Quantization & compression (O1+O2+O3) — 8B→70B, INT4 speedup vs batch, CompressionModel quantization vs pruning**

```python
import mlsysim
from mlsysim.solvers import ServingModel, CompressionModel
from mlsysim.show import table

model = mlsysim.Models.Language.Llama3_8B
hardware = mlsysim.Hardware.Cloud.H100
solver = ServingModel()

# O1: 8B → 70B scaling of both phases
for m in [model, mlsysim.Models.Language.Llama3_70B]:
    r = solver.solve(model=m, hardware=hardware, seq_len=2048, batch_size=1, precision="fp16")
    print(f"{m.name}: TTFT {r.ttft.to('ms')}  ITL {r.itl.to('ms')}  weights {r.model_weights_size}")

# O2: INT4 speedup vs batch (conclusion: climbs monotonically, no critical point)
rows = []
for b in [1, 2, 4, 8, 16, 32, 64, 128, 256]:
    r16 = solver.solve(model=model, hardware=hardware, seq_len=2048, batch_size=b, precision="fp16")
    r4 = solver.solve(model=model, hardware=hardware, seq_len=2048, batch_size=b, precision="int4")
    rows.append([b, r16.itl.to("ms"), r4.itl.to("ms"),
                 f"{r16.itl.to('ms').magnitude / r4.itl.to('ms').magnitude:.2f}x"])
table(["Batch", "ITL fp16", "ITL int4", "Speedup"], rows)

# O3: quantization vs pruning (compression-accuracy trade-off)
cs = CompressionModel()
rows = []
for bits in [16, 8, 4]:
    c = cs.solve(model=model, hardware=hardware, method="quantization", target_bitwidth=bits)
    rows.append([f"Q-{bits}bit", c.compressed_size_gb, f"{c.compression_ratio:.1f}x",
                 f"{c.estimated_accuracy_delta:+.2f}%", f"{c.inference_speedup:.2f}x"])
for sp in [0.5, 0.75, 0.9]:
    c = cs.solve(model=model, hardware=hardware, method="pruning", sparsity=sp, sparsity_type="unstructured")
    rows.append([f"Prune {sp:.0%}", c.compressed_size_gb, f"{c.compression_ratio:.1f}x",
                 f"{c.estimated_accuracy_delta:+.2f}%", f"{c.inference_speedup:.2f}x"])
table(["Method", "Compressed", "Ratio", "Acc Delta", "Speedup"], rows)
```

If this note helps you, feel free to reach out.