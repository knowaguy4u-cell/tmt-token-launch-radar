# TMT token launch radar — Round 2

Round 2 is **incomplete only at screenshot capture and visual review**. Model and dashboard implementation are committed; the three starter screenshots remain unchanged and must be replaced before submission. ROUND1.md remains historical and vendor/ remains byte-identical.

## Candidate correction

A candidate must have mcap_usd, symbol and gecko_id all null, then pass the existing separation rule. This removes 142 token-record rows: 340 → 198 candidates. Watchlist coverage remains 40/40; 138 candidates are below the watchlist floor. All valuation constants, comparable selection, winsorization, shrinkage, growth-percentile method and age method are unchanged. Growth values naturally change because percentiles now use the corrected candidate population. There are still 144 tokened comparables among 758 tracked protocols.

check-local.mjs independently checks all three token fields on every output row and asserts exactly 198 rows and a 40-member covered watchlist.

## New top 10

| Rank | Protocol | Implied USD |
|---|---|---:|
| 1 | Sentora Curator | $498,197,777 |
| 2 | Steakhouse Financial | $453,786,055 |
| 3 | Gauntlet | $293,675,113 |
| 4 | Veda | $228,612,802 |
| 5 | USDD | $171,905,382 |
| 6 | Upshift | $94,642,305 |
| 7 | Bittensor dTAO | $92,307,796 |
| 8 | OnRe | $77,975,857 |
| 9 | Nonce Capital | $67,819,160 |
| 10 | BitFi Basis | $66,192,812 |

## Dashboard

All three dashboard files were rewritten in this session. Deep ink, mint signal and amber warning colors; system type and tabular figures; no framework, external assets or network addresses. The board renders all 198 rows with ranks, categories, chains, TVL, seven-day change, years tracked, category multiples and implied values. Watchlist rows have visible badges. Name and all numeric columns sort in either direction; nulls sort last. Search, category, chain, TVL band and watchlist filters combine, with a reset control and result count.

Category hashes apply on initial load and navigation, including `#cat=Risk%20Curators` (34 rows). Protocol hashes open the supplied detail, including rank 1 at `#p=sentora-curator`. Details show whole-dollar figures, comparable counts, factors, the supplied full-precision derivation and five numbered farm steps. The methodology strip uses live counts and the phrase “records no token”. data.js already included all board fields; buildRadar now also supplies tracked/comparable counts and the watchlist used by the dashboard. main.ts documents that data contract.

Source sizes:

- dashboard/index.html: 667 bytes
- dashboard/app.css: 5,524 bytes
- dashboard/app.js: 8,179 bytes

Total: 14,370 bytes (under 60 KB).

## Screenshot blocker

The requested installed Chromium headless shell fails before page startup:

```
FATAL:content/browser/sandbox_host_linux.cc:41
Check failed: . shutdown: Operation not permitted (1)
```

Both the standard launch and a single-process/no-zygote launch failed with exit 133. No screenshot was produced and no visual review was possible. No permissions were escalated, dependencies installed, network used or files written outside the entry. capture-screenshots.sh contains the exact three file-URL captures at 1440×900 from out/, including the 34-row category. Run it in an environment that permits Chromium startup, inspect the renders, enforce the 512 KiB cap, and rerun checks. Avoid artificial size padding; smaller naturally compressed captures are allowed by the brief when unavoidable.

Existing **starter captures, not Round 2 evidence**:

- screenshots/1-board.png: 148,257 bytes; replacement pending
- screenshots/2-detail.png: 219,469 bytes; replacement pending
- screenshots/3-filtered.png: 137,873 bytes; replacement pending

## Validation

`node check-dashboard.mjs` passes offline rendering, search, all filters, exact ascending/descending row ordering for every sortable column, category/detail hashes, and the supplied farm plan. It uses a minimal DOM harness, so it does not validate browser layout.

`node check-local.mjs` runs main.ts twice, verifies every output hash is identical, and checks the model and output gates. It exits **1**, deliberately, because all three screenshots still match starter captures. The screenshot_format line below only verifies image structure and dimensions; it does not establish current visual evidence. Final output:

```
PASS: 198 rows; watchlist 40/40; 144 comparables
PASS: board_file, sorted_by_value, coverage, farm_steps, dashboard_files, screenshot_format, dossier_matches
PASS: candidate separation, formula, factors, unique farm text, reordered input, token-record test, unchanged vendor
PASS: consecutive runs identical for every output file
board.json SHA256 79620efeb493f10cdbff31994d171c48b0ba77f6a5c27f56a5d300b016639055
dossier.json SHA256 5f8d2087d0553c6898ec4c0d4064b2dae4d9391b3c6c028c0b1614d3fa28c876 (689443 bytes)
Top 10:
1. Sentora Curator (sentora-curator): $498,197,777
2. Steakhouse Financial (steakhouse-financial): $453,786,055
3. Gauntlet (gauntlet): $293,675,113
4. Veda (veda): $228,612,802
5. USDD (usdd): $171,905,382
6. Upshift (upshift): $94,642,305
7. Bittensor dTAO (bittensor-dtao): $92,307,796
8. OnRe (onre): $77,975,857
9. Nonce Capital (nonce-capital): $67,819,160
10. BitFi Basis (bitfi-basis): $66,192,812
INCOMPLETE: 3 screenshots still match starter captures; current-dashboard capture required
```
