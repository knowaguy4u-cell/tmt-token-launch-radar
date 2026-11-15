#!/bin/bash
set -eu
cd -- "$(dirname -- "$0")"
node main.ts --input "$HOME/workspace/goals/wealth-pipeline/hidden_files/makefun/token-radar-01-kit/input/snapshot.json" --output out
browser="$HOME/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell"
page="file://$PWD/out/dashboard/index.html"
"$browser" --no-sandbox --disable-gpu --hide-scrollbars --window-size=1440,900 --screenshot="$PWD/screenshots/1-board.png" "$page"
"$browser" --no-sandbox --disable-gpu --hide-scrollbars --window-size=1440,900 --screenshot="$PWD/screenshots/2-detail.png" "$page#p=sentora-curator"
"$browser" --no-sandbox --disable-gpu --hide-scrollbars --window-size=1440,900 --screenshot="$PWD/screenshots/3-filtered.png" "$page#cat=Risk%20Curators"
node check-local.mjs
