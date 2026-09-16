---
layout: post
title: "Fixing a Tutorial Demo: An Open-Source PR Retrospective"
title_zh: "给开源教程修了个 demo"
subtitle: "I rewrote the §5 Paged Attention demo in mlsysim's KV-Cache tutorial and opened PR #2135; before merging, the maintainer revised it and shrank my numbers from 314 to 259. A retrospective of that experience."
subtitle_zh: "给 mlsysim 的 KV-Cache 教程重写了 §5 的 Paged Attention demo 并提了 PR #2135;合并前维护者又改了一版,把数字从 314 改小到 259。复盘这次经历。"
lang: en
lang_pair: /blog/mlsysim-paged-demo-pr/
description: "A complete retrospective of one open-source contribution: while reading mlsysim's KV-Cache tutorial I found that the §5 Paged Attention demo printed identical results for all three page sizes — max_batch_size binding, seq_len dividing every page size evenly, the engine modeling only last-page internal fragmentation, and a fixed 0.6 speedup factor. I rewrote the whole demo (static contiguous vs paged block-pool allocators sharing one KV budget, long-tailed request lengths, internal/external fragmentation, a page-size sweep, prefix sharing) and opened PR #2135. When merging, the maintainer pushed his own small fix: admit requests in arrival order and stop at the first one that does not fit — my version kept feeding short requests after memory ran out, which flattered the numbers (314→259 users, 1.78x→1.47x). What I learned from being edited: demo code is the most common victim of 'looks like it runs', honest experiments stop at the first rejected request, and modeling granularity decides how far a conclusion travels."
date: 2026-09-16
author: Ryan
permalink: /blog/mlsysim-paged-demo-pr-en/
catalog: true
categories:
  - Tech
  - Learning Notes
tags:
  - MLSys
  - mlsysim
  - KV Cache
  - Open Source
  - PR
---

> In [The KV-Cache Memory Ledger](/blog/mlsysim-kv-cache-en/), I accounted for where the memory goes with formulas. The tutorial itself is well written, but while reading its third companion experiment ([Tutorial 03: KV-Cache](https://harvard-edge.github.io/cs249r_book_dev/mlsysim/tutorials/03_kv_cache.html)) I found that the §5 Paged Attention demo printed **identical** results for all three configurations. So I opened an [issue](https://github.com/harvard-edge/cs249r_book/issues/2134), wrote a [PR](https://github.com/harvard-edge/cs249r_book/pull/2135) to rewrite it — and then watched the maintainer shrink my numbers to make them more honest. This post documents the whole ride.

---

## 1. What Was Wrong with the Demo: an Experiment That Couldn't Fail

Section 5 wants to show the value of PagedAttention: carve the KV-Cache into fixed-size blocks, allocate on demand, and waste far less than statically reserving whole segments. But the demo printed this:

| System | Max Users | Throughput | Frag | Speedup |
|--------|-----------|------------|------|---------|
| Static (baseline) | 32 | 3225 t/s | 0.0% | 1.3x |
| Paged (16 tok) | 32 | 3225 t/s | 0.0% | 1.3x |
| Paged (64 tok) | 32 | 3225 t/s | 0.0% | 1.3x |

Three page sizes, byte-identical output. It did not crash, it did not warn, every row had numbers — but it demonstrated nothing. This is the most dangerous kind of bug: **"it looks like it runs" and "it actually demonstrates the idea" are two different things.**

## 2. Root Cause: Four Coincidences Stacked on Top of Each Other

It was not a single point of failure; four things collided:

| # | Root cause | Effect |
|---|------------|--------|
| 1 | `max_batch_size=32` was passed identically to all three configs, and the memory-derived limit (~130) was larger | `min(limit, 32)` is always 32; the batch cap pins all three rows |
| 2 | `seq_len=4096` divides evenly into 2048/16/64 | All three page sizes compute the same padded size, so last-page fragmentation is 0% for all |
| 3 | The engine models only *last-page* internal fragmentation; static allocation's real waste (reserving `max_seq` per request, external fragmentation under churn) is not in the model | The Frag column is identical across rows |
| 4 | `speedup_vs_static` is a fixed 0.6 factor (from Kwon et al. 2023), independent of allocation strategy; throughput is decided solely by memory-bound step time | Speedup and throughput have zero response to the allocation strategy |

#4 is the killer: even with the batch cap and the divisibility problem removed, the output still would not vary with page size — because the solver being demoed does not distinguish allocation strategies at all. Conclusion: this demo needed a rewrite, not a patch.

## 3. The Rewrite: Let the Experiment Tell the Theory Itself

The PR's idea was to drop the engine call and replace it with a self-contained analytical simulation: two small allocators sharing one KV budget —

- **Static contiguous**: every request reserves a whole `max_seq` slot; simple but wasteful;
- **Paged block pool**: fixed-size blocks allocated on demand, with a block table;

Fed the same long-tailed request stream (fixed random seed, reproducible), so each of the four classic conclusions got its own experiment:

1. **Internal fragmentation**: 77.8% waste for static reservation vs 0.4% for 16-token pages; concurrent users 65 → 314;
2. **External fragmentation**: after churn, the static first-fit allocator hits 97.1% fragmentation and admits 0 of 10 fresh 8K requests despite free space; paged admits 10/10;
3. **Page-size sweep** (8→1024 tokens): the trade-off between waste and block-table bookkeeping;
4. **Prefix sharing**: 8 requests sharing a 1K system prompt cut peak KV by 58%.

Every conclusion is directly visible in a table, and every number is reproducible. After the PR landed, the maintainer Vijay Janapa Reddi replied quickly: **"diagnosis is spot on and the new demo actually shows the idea"** — then he pushed a small fix and merged.

## 4. The Merge: the Maintainer Made My Numbers More Honest

Before merging, the maintainer made one more round of changes on top of my commit. Each one is worth studying:

**1. The cutoff: stop at the first request that does not fit, instead of feeding the whole stream.**

My version fed all 100,000 requests to the allocator — including the ones arriving after memory was exhausted. `PagedAllocator.admit()` internally rejects requests that do not fit, so short requests after a rejected long one kept getting in; the allocator "picked its food" and the numbers flattered. The maintainer changed it to:

```python
def fill(alloc, lengths):
    """Admit requests in arrival order; stop at the first one that does not fit."""
    for t in lengths:
        if not alloc.admit(t):
            break
    return alloc
```

Cut off in arrival order. It is only a few lines, but it turns the experiment from "it runs" into "it's honest": in a real system, requests keep coming whether you have memory or not, and an allocator should not quietly accept short requests after refusing long ones.

**2. Shrink the numbers; embrace the less pretty truth.**

My version: 314 users, 1.78x throughput speedup. After the merge: 259 users, 1.47x. The difference is exactly what the "food-picking" had fed. The maintainer preferred a plain but true number over a pretty but cheating one.

**3. Terminology cleanup.**

"Static (first-fit)" became "Contiguous (first-fit)" — there was already a "Static (reserve 8K)" above, two "static"s would confuse readers, and contiguous allocation is genuinely a different thing from static reservation.

**4. Fixing a wrong intuition in the exercise.**

The original Exercise 3 hint said "page size matters more at long context". The maintainer flipped it to the correct direction: **page slack is a fixed cost per request, so the longer the request, the smaller its share — page size matters *less*, not more, at long context.** My hint had been leading readers astray.

He also noted that the fixed 0.6 speedup factor in the engine "deserves its own issue" and he would open one — modeling granularity is worth a separate discussion.

## 5. Four Takeaways from Being Edited

1. **Demo code is ground zero for "looks like it runs".** Crashes and errors get caught instantly; an experiment that prints numbers on every row can be demonstrating nothing. Before writing a demo, ask: does this output *actually* vary with the independent variable, and by how much? I found root cause #4 — the output simply does not depend on the variable being demoed — last, and it was the most fundamental one.

2. **Honest experiments cut off in arrival order.** Feeding the whole stream gives the allocator a choice it should not have. In any queuing/allocation simulation, stop at the first failure; otherwise you are measuring a "food-picking allocator", not the allocator.

3. **Ugly numbers are fine; cheating numbers are not.** 314 sounds better than 259, but it is fake. The reputation an open-source maintainer cares about most is that every number can be reproduced and traced back to the model.

4. **Modeling granularity decides how far a conclusion travels.** A fixed 0.6 speedup factor means the "allocation-strategy benefit" dimension is distorted inside the engine — conclusions only hold within that granularity. Understanding what a tool decouples beats memorizing its output.

## 6. References

- Issue: [#2134 Paged Attention demo returns identical results for every page size](https://github.com/harvard-edge/cs249r_book/issues/2134)
- PR: [#2135 fix(mlsysim): redesign §5 Paged Attention demo in KV-Cache tutorial](https://github.com/harvard-edge/cs249r_book/pull/2135) (merged)
- Related post: [The KV-Cache Memory Ledger](/blog/mlsysim-kv-cache-en/) — my study notes for tutorial 03; that is where I ran into this demo.

If this retrospective helps you, feel free to reach out.
