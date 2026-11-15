# TMT token launch radar — Round 1

Implemented a snapshot-only comparables model, category shrinkage, growth percentiles, listing-age factors, deterministic ranking and five category-derived farm steps per row. The full separation rule is applied to every snapshot record; watchlist inclusion is asserted. Each row includes all requested inputs, factors and a numeric derivation. The owner claim and LICENSE are committed.

## Model conventions and constants

- 144 comparables: market cap present and positive TVL. Linear-interpolated quantiles at (n−1)q; winsorize at 1% and 99%. Observed bounds: 0 and 55.123691228912485. Global winsorized median: 0.16889204487299375.
- A category needs 4 comparables; shrink its median toward the global median with weight n/(n+4). Smaller groups use the global median.
- Growth uses average ranks for ties among candidates with reported growth, divided by n−1, then 0.80 + percentile × 0.45. A singleton uses percentile 0.5; null growth uses factor 1.
- Age years = UTC elapsed days / 365.25; factor clamp(0.85 + 0.07 × ln(1+years), 0.85, 1.20); null listing uses factor 1. Listing age is a tracking proxy, not proof of operating age.
- Value rounds to dollars and clamps to [1, 100000000000000]. Ties use descending TVL then code-unit slug order.
- Farm capital tiers: $50 below $100M TVL, $100 below $1B, $150 thereafter. Five steps include estimated fees and time, chain context, eligibility checks and an exit/review. These are category-derived trial plans, not verified product instructions or reward promises.

No data-forced model changes or constant tuning were needed. Some familiar names record no token in this sealed snapshot; eligibility follows the requested snapshot fields without outside corrections.

## Validation

Run: node check-local.mjs

PASS: 340 rows; watchlist 40/40; 144 comparables.
PASS: board_file, sorted_by_value, coverage, farm_steps, dashboard_files, screenshots, dossier_matches.
PASS: candidate separation, formula, factor bounds/null handling, unique farm text, reordered input, unchanged starter assets/vendor.
PASS: two consecutive runs identical for every output file.

board.json SHA256: 16b64aa76b4448d0538a755e5ec0975bb10a12d8fdfbb641c2f08b757b8dd2d4

dossier.json SHA256: 1c30cf47decc87e68138c2d3dc2096a65e1f9e14ac14bbaf3302b9f2771b620d (705011 bytes).

206 rows are below the $50M floor. Data is written beside the unchanged dashboard in out/data.js; board, copied assets and dossier are in out/. Generated output is ignored by Git and reproducible. No network calls or dependencies. This checks local output gates, not the submission transcript gate or a remote grade.

## Top 10

| Rank | Protocol | Implied USD |
|---|---|---:|
| 1 | Ethena USDe | $1,983,587,845 |
| 2 | Morpho Blue | $1,476,226,814 |
| 3 | Sky Lending | $566,678,672 |
| 4 | Spark Liquidity Layer | $526,496,896 |
| 5 | SparkLend | $506,675,658 |
| 6 | Sentora Curator | $505,151,020 |
| 7 | Steakhouse Financial | $468,274,038 |
| 8 | PancakeSwap AMM | $389,162,457 |
| 9 | Curve DEX | $322,272,542 |
| 10 | Gauntlet | $296,222,739 |

## Environment and Round 2 limits

The pre-mounted .git directory is read-only. Standard git init failed, so the repository metadata lives in .repo-git inside this entry. Use ./git-entry status (or GIT_DIR=.repo-git GIT_WORK_TREE=. git ...). The first commit is dc72001, titled “Start from the make.fun starter kit”, containing every starter file and the owner claim with the requested local identity. No history was rewritten.

The installed runtime is Node 24.22.1; local validation used it. Code uses Node standard-library APIs and erasable TypeScript suitable for Node 22 with TypeScript execution enabled; Node 22 itself was unavailable for testing.

As requested, dashboard source and screenshots remain byte-identical to the kit. The table consumes the new implied values, but the starter detail view still recomputes its old formula and regenerates its old farm plan; it will flag a formula mismatch. The model panel and screenshots also retain starter content. Compatibility data fields keep that page operational. Round 2 must connect detail rendering to the supplied derivation and farm_steps, replace the old formula panel, and capture matching screenshots. No dashboard UI work was performed this round.
