# Brief R3 — enhancement round for the TMT Token Launch Radar (make.fun token-radar-01)

You are the sole code-writing harness for this entry (competition transcript rules). Work in this repository only. The entry is already submitted once (commit f6d3b4d on the public repo); this round produces a stronger candidate commit. Do NOT submit anything, do NOT touch vendor/makefun-board.ts, do NOT change the valuation model's core formula, factors, or the candidate separation rule — rounds 1-2 outputs (board.json values, 198 rows, watchlist 40/40) must remain reproducible except where a change below explicitly alters presentation or farm-plan text. If any change would alter a row's implied_value_usd, STOP and say so in ROUND3.md instead of making it.

## The judge's criteria (public, from the kit) — improve against these, in order
1. Working radar + coverage + screenshot/code agreement.
2. Value model derived from the snapshot's own figures, tokened vs pre-token separated.
3. Farm plans concrete, with costs and times.
4. Sortable/filterable page with per-protocol detail.
5. Looks made.

## Changes to make
A. **Farm plans — protocol-specific, not just category-templated.** Regenerate farm_steps so each row's steps reference that protocol's own facts from the snapshot: its name, its chains (by name), its category mechanics, its TVL tier. Steps must stay truthful: describe actions on the protocol's own product (supply, stake, provide liquidity, borrow, vote, hold the receipt token — whichever fits its category) without inventing URLs, contract addresses, APYs, or partnership claims. Keep 5 steps per row, each 20-600 chars, each carrying an explicit cost or capital figure and a time estimate, as now. Steps must differ meaningfully across rows (no two rows with identical step text except where protocols genuinely share category+chains+tier — and even then the protocol name inside the text differentiates them).

B. **Detail view — valuation sensitivity strip.** On each protocol's detail view, add a "Sensitivity" block showing the implied value recomputed at three multiples, all derived from the snapshot's tokened comparables: (i) the global winsorized median multiple, (ii) the category multiple actually used (shrunk, as in the model), (iii) the category's 75th-percentile multiple (unshrunk, from that category's comparables; if the category has fewer than 4 comparables, use the global 75th percentile and label it as global). Show TVL and the three resulting dollar values, labelled as sensitivity, not predictions. The program must emit whatever extra per-row fields the dashboard needs (e.g. multiple_global, multiple_p75, implied_at_global, implied_at_p75) — these are presentation fields; implied_value_usd itself must not change.

C. **Board — one more useful column.** Add an "Implied / TVL" column (the multiple used, already shown) — instead: add a "Sensitivity range" column showing implied_at_global – implied_at_p75 as a compact range (e.g. "$41M – $310M"). Sortable like the other numeric columns, nulls last.

D. Keep everything else: static dashboard, no network specifiers anywhere, ≤400 files / 4 MiB, board.json/dossier.json regeneration deterministic (two runs byte-identical), language discipline ("records no token", never "has no token").

## Gates (all must pass; report each in ROUND3.md)
- Your check-local.mjs and check-dashboard.mjs suites, extended for the new fields (sensitivity values must be internally consistent: implied_at_global == round(TVL × multiple_global × growth × age) within rounding, likewise p75 with its multiple; ranges ordered low ≤ high).
- Two consecutive program runs byte-identical.
- Farm-step uniqueness report: count of distinct step texts across all rows and the maximum number of rows sharing any one step text.
- Implied values unchanged: diff board.json against the round-2 board (git show HEAD:board.json if board.json is committed, else the copy in out/) — every row's implied_value_usd, rank order, and row set identical; report the diff result explicitly.
- Screenshots: do NOT attempt capture (this sandbox blocks Chromium); list the three views Nova must recapture (board, one detail showing the sensitivity block, one filtered view).

## Deliverables
- Code + regenerated outputs committed on top of HEAD with a clear message.
- ROUND3.md in the repo root: what changed per item (A/B/C), gate results with numbers, the farm-step uniqueness counts, the implied-value diff verdict, and the screenshot recapture list.
