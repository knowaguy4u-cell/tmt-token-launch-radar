# Round 3 — completed candidate; visual recapture pending

Implemented A, B and C on top of HEAD `f6d3b4d`. No submission or network request was made. `vendor/makefun-board.ts` is unchanged. No specified change required stopping: all original implied values remain identical.

## Changes

A. Each protocol has exactly five farm steps using its own name, named snapshot chains, category mechanics and TVL tier (under $50M, $50M–$100M, $100M–$1B or $1B+). Trial capital is $50/$100/$150 according to the existing budget tiers. Plans cover verification, a conditional product action, receipt/exit inspection, weekly monitoring and exit. Each step includes explicit dollar costs or capital and time estimates; access and product availability remain conditional. No URLs, addresses, APYs or partnerships were invented. These are snapshot-based trial plans, not verified instructions for a currently available interface.

B. Every detail has a Sensitivity block showing snapshot TVL, full-dollar values and three multiples: global winsorized median; the category multiple already used (shrunk, or labelled global fallback); and the unshrunk category P75, with global P75 explicitly labelled when fewer than four category comparables exist. P75 uses the same globally winsorized comparable observations as the model, without category shrinkage. Growth and age factors remain fixed. The block labels results as sensitivity estimates, not predictions. Added fields: multiple_global, multiple_p75, p75_source, implied_at_global, implied_at_p75, sensitivity_low and sensitivity_high. The core formula, constants, comparable selection and candidate separation rule are unchanged.

C. Added a compact Sensitivity range column with global/P75 endpoints ordered low to high, sorting numerically by its lower endpoint, with original rank breaking ties and nulls last in either direction. The existing multiple column remains. All 198 current rows have global ≤ P75. The table scrolls horizontally when needed; the sensitivity block adapts to narrow screens.

## Gates and numbers

- **PASS — `node check-local.mjs`:** 198 rows, watchlist 40/40, 144 tokened comparables. Candidate separation, rank order, formula/factors, reordered-input invariance, step lengths (20–600 characters), exactly five steps per row, explicit costs/times, chains/category/TVL context, PNG format and dossier reconstruction all pass. Vendor matches the kit byte for byte.
- **PASS — sensitivity:** independently recomputed global median and category/global P75 from snapshot comparables for every row; both sensitivity dollar values equal round(TVL × respective multiple × growth × age); all lower/upper endpoints match min/max and satisfy low ≤ high.
- **PASS — `node check-dashboard.mjs`:** offline rendering, search, category/chain/TVL/watchlist filters, category/detail hash routing, all numeric/name sort handlers in both directions. All 198 details render the sensitivity values and correct P75 source label. Synthetic null presentation values sort last in both directions.
- **PASS — determinism:** two consecutive program runs produce byte-identical hashes for all 9 output files, including board.json and dossier.json.
- **PASS — farm uniqueness:** 990 distinct step texts out of 990 total texts (198 × 5); maximum rows sharing any one text: **1**.
- **PASS — implied-value diff:** board.json was uncommitted/ignored at HEAD, so the pre-change `out/board.json` was preserved before regeneration. Its SHA256 was `79620efeb493f10cdbff31994d171c48b0ba77f6a5c27f56a5d300b016639055`, matching the Round 2 report. Compared every ordered `(slug, rank, implied_value_usd)` tuple: **198 identical; 0 added, 0 removed, 0 value differences, 0 rank differences**. `round2-values.json` preserves those baseline tuples for repeatable checks. Rank 1 remains Sentora Curator at $498,197,777.
- **PASS — bundle:** 9 output files, **2,178,902 bytes**, below 400 files / 4 MiB. Dashboard source is 3 files / 16,123 bytes. No network specifiers in executable dashboard assets; the existing snapshot source URL remains inert provenance in data/dossier. Language checks reject “has no token”; the dashboard uses “records no token”.
- **PASS — `git diff --check`:** no whitespace errors.
- **DEFERRED as instructed — screenshots:** no capture attempted. Existing PNGs are retained and format-valid, but do not establish Round 3 screenshot/code agreement. Nova must recapture and visually review the views below. No claim of current visual validation is made.

Regenerated board.json SHA256: `ff17f348f1329f6c904cfb8f1be6afa655452bc6071c01700f056679710b3a91` (518,371 bytes).

Regenerated dossier.json SHA256: `7da11727b1e54b288b734301cc681c54f73e12cd1da52dca4f93515d5c35d106` (627,965 bytes).

## Nova screenshot recapture list

Use the regenerated `out/` dashboard, 1440 × 900, each PNG ≤512 KiB:

1. Board: `out/dashboard/index.html`, showing the new Sensitivity range column → `screenshots/1-board.png`.
2. Detail: `out/dashboard/index.html#p=sentora-curator`, with the Sensitivity block visible → `screenshots/2-detail.png`.
3. Filtered view: `out/dashboard/index.html#cat=Risk%20Curators` (34 candidates), showing the range column → `screenshots/3-filtered.png`.

After recapture, regenerate outputs and rerun both suites. Current verdict: **all requested executable gates pass; Round 3 visual agreement awaits Nova's explicitly deferred recapture.**
