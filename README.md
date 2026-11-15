# tmt-token-launch-radar

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/knowaguy4u-cell/tmt-token-launch-radar/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/knowaguy4u-cell/tmt-token-launch-radar/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

A token launch radar built from the competition's sealed DefiLlama snapshot (758 protocols, as of 2026-11-14). It separates the 144 protocols that already record a token from the ones that record none, excludes wrapped/staked products and bridge/CEX categories, then ranks **198 pre-token candidates** by implied launch value. Each implied value is derived from the snapshot's own figures: TVL × a winsorized category market-cap/TVL multiple (shrunk toward the global median when a category has few comparables) × a 7-day growth factor × a tokenless-age factor, with the full derivation shown per protocol. All 40 watchlist protocols are covered. Every row carries a concrete five-step farm plan with capital tier, cost and time estimates. The static dashboard in `dashboard/` renders the board offline with sorting, search, category/chain/TVL filters, a watchlist toggle and a per-protocol detail view — no network calls.

## Run it

```sh
node main.ts
```

Reads `input/snapshot.json`, writes `board.json`, `dossier.json` and the rendered dashboard under `out/`. Node 22, standard library only, no network; two runs are byte-identical.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
