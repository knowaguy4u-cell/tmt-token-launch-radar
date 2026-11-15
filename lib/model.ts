// Snapshot-only valuation. A candidate records no token; this is not a launch prediction.
export interface SnapshotProtocol {
  slug: string; name: string; category: string | null; chains: string[];
  tvl_usd: number; change_7d: number | null; mcap_usd: number | null;
  listed_at: string | null; gecko_id: string | null; symbol: string | null;
}
export interface Snapshot {
  as_of: string; source: string; floor_usd: number;
  protocols: SnapshotProtocol[]; watchlist: string[];
}
export const MODEL = {
  winsor_low: 0.01, winsor_high: 0.99, minimum_comps: 4, shrinkage: 4,
  growth_min: 0.80, growth_max: 1.25, age_base: 0.85, age_weight: 0.07, age_cap: 1.20,
  // Compatibility fields consumed by the unchanged Round 1 starter page.
  base_multiple: 1, growth_weight: 0, growth_floor: -60, growth_cap: 120,
  maturity_floor: 1, maturity_range: 0, maturity_days: 1095, unknown_age_days: 365,
};
export const MODEL_VERSION = 'tmt-comparables-1';
const excluded = new Set(['Bridge', 'Canonical Bridge', 'Liquid Staking', 'Liquid Restaking', 'Restaked BTC', 'CEX']);
export function isRankable(p: SnapshotProtocol): boolean {
  return p.mcap_usd === null && p.symbol === null && p.gecko_id === null && !excluded.has(p.category ?? '') &&
    !/\s(?:v\d+(?:\.\d+)*|\d+(?:\.\d+)+)$/i.test(p.name) &&
    !/\b(?:wrapped|staked|staking)\b/i.test(p.name) &&
    !/^(?:Binance|Coinbase|Bybit|Kraken|Bitget|OKX|Bitfinex|Gemini)/i.test(p.name);
}
const clamp = (x: number, low: number, high: number) => Math.min(high, Math.max(low, x));
const lexical = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
// Linear interpolation at (n - 1) * q, including the ordinary even-sample median.
export function quantile(sorted: number[], q: number): number {
  if (!sorted.length) throw new Error('No observations for quantile');
  const at = (sorted.length - 1) * q;
  const lo = Math.floor(at), hi = Math.ceil(at);
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (at - lo);
}
export function ageDays(asOf: string, listedAt: string | null): number | null {
  if (listedAt === null) return null;
  const days = (Date.parse(asOf) - Date.parse(listedAt)) / 86400000;
  if (!Number.isFinite(days) || days < 0) throw new Error('Invalid listing date');
  return days;
}
function action(category: string | null): string {
  const c = (category ?? '').toLowerCase();
  if (/lend|collateral|cdp/.test(c)) return 'supply supported collateral; borrow only if the displayed health factor remains above 2';
  if (/bridge/.test(c)) return 'bridge a small supported asset amount and verify receipt on the destination chain';
  if (/staking|restaking/.test(c)) return 'stake a supported asset through the protocol itself and inspect its withdrawal queue';
  if (/derivative|options|perpetual|basis/.test(c)) return 'trade the smallest supported position without added leverage, then close it';
  if (/dex|liquidity/.test(c)) return 'provide liquidity to a supported pair and inspect the withdrawal preview';
  if (/yield|farm|allocator|curator|vault|index/.test(c)) return 'deposit into an accessible vault after inspecting its assets, fees and withdrawal terms';
  if (/stable|synthetic|rwa|btc/.test(c)) return 'check eligibility, then mint or deposit a supported asset only if the redemption route is available';
  if (/prediction/.test(c)) return 'place a small market position only after checking settlement rules';
  if (/marketplace|otc/.test(c)) return 'make a small supported trade after inspecting settlement fees';
  if (/insurance/.test(c)) return 'quote and purchase a small applicable cover policy after reading exclusions';
  if (/payment|card/.test(c)) return 'make a small supported payment after checking eligibility and fees';
  return 'review public governance discussions and contribute a specific question about the protocol’s supported products';
}
export function farmSteps(p: SnapshotProtocol): string[] {
  const chain = p.chains.length ? p.chains.join(', ') : 'the chain listed in its official app';
  // Limit the chain list in prose; the complete list remains on the row.
  const network = chain.length > 100 ? `${p.chains.slice(0, 3).join(', ')} (choose one supported chain)` : chain;
  const capital = p.tvl_usd >= 1e9 ? 150 : p.tvl_usd >= 1e8 ? 100 : 50;
  const context = `${p.name} [${p.slug}] on ${network}`;
  const task = action(p.category);
  const governanceOnly = task.startsWith('review public');
  return [
    `${context}: confirm the official app, supported assets and ${p.category ?? 'protocol'} access requirements before connecting a wallet. Cost estimate: $0; time estimate: 10 minutes. Stop if access is restricted.`,
    `${context}: ${task}. Budget at most $${capital} in capital and $3–15 in fees; for discussion alone budget $0. Time estimate: 15–25 minutes. Skip if no suitable product is available.`,
    `${context}: ${governanceOnly ? 'follow up on the governance question with evidence from its documentation' : 'inspect the transaction receipt, record balances and test a partial withdrawal or close before increasing exposure'}. Cost estimate: ${governanceOnly ? '$0' : '$3–15 in fees with capital still at risk'}; time estimate: 15 minutes.`,
    `${context}: revisit the ${p.category ?? 'protocol'} activity once a week for four weeks; ${governanceOnly ? 'track replies and public proposals' : 'check position health and repeat the same small action only when useful'}. Cost estimate: $0–15 per visit, maximum capital $${capital}; time estimate: 10 minutes per week. Rewards are unconfirmed.`,
    `${context}: ${governanceOnly ? 'archive discussion links and review any official participation terms' : 'withdraw or close the trial position through the official app and reconcile fees and returned assets'}. Cost estimate: $0–15 plus any disclosed exit fee; time estimate: 15 minutes plus the displayed settlement queue.`,
  ];
}
export function buildBoard(snapshot: Snapshot) {
  const candidates = snapshot.protocols.filter(isRankable);
  const candidateSlugs = new Set(candidates.map(p => p.slug));
  for (const slug of snapshot.watchlist) if (!candidateSlugs.has(slug)) throw new Error(`Watchlist fails candidate rule: ${slug}`);
  if (!candidates.length) throw new Error('No eligible candidates');
  const comps = snapshot.protocols.filter(p => p.mcap_usd !== null && p.tvl_usd > 0);
  const ratios = comps.map(p => p.mcap_usd! / p.tvl_usd).sort((a, b) => a - b);
  const low = quantile(ratios, MODEL.winsor_low), high = quantile(ratios, MODEL.winsor_high);
  const global = quantile(ratios.map(x => clamp(x, low, high)), 0.5);
  const categories = new Map<string | null, number[]>();
  for (const p of comps) {
    const group = categories.get(p.category) ?? [];
    group.push(clamp(p.mcap_usd! / p.tvl_usd, low, high));
    categories.set(p.category, group);
  }
  const changes = candidates.flatMap(p => p.change_7d === null ? [] : [p.change_7d]).sort((a, b) => a - b);
  const scored = candidates.map(p => {
    const group = categories.get(p.category) ?? [];
    const weight = group.length / (group.length + MODEL.shrinkage);
    const multiple = group.length >= MODEL.minimum_comps ? weight * quantile([...group].sort((a,b) => a-b), 0.5) + (1-weight)*global : global;
    // Ties use average zero-based rank; min/max map to 0/1 when distinct.
    const below = p.change_7d === null ? 0 : changes.filter(x => x < p.change_7d!).length;
    const equal = p.change_7d === null ? 0 : changes.filter(x => x === p.change_7d).length;
    const percentile = changes.length <= 1 ? 0.5 : (below + (equal-1)/2)/(changes.length-1);
    const growth = p.change_7d === null ? 1 : MODEL.growth_min + percentile*(MODEL.growth_max-MODEL.growth_min);
    const days = ageDays(snapshot.as_of, p.listed_at);
    const years = days === null ? null : days/365.25;
    const age = years === null ? 1 : clamp(MODEL.age_base + MODEL.age_weight*Math.log1p(years), MODEL.age_base, MODEL.age_cap);
    const implied = clamp(Math.round(p.tvl_usd*multiple*growth*age), 1, 100000000000000);
    return { ...p, rank: 0, token_status: 'pre-token', age_days: days, age_years: years,
      multiple_used: multiple, growth_factor: growth, age_factor: age,
      growth_multiplier: growth, maturity_multiplier: age, implied_value_usd: implied,
      derivation: `TVL $${p.tvl_usd} × category multiple ${multiple} (${group.length} comps; global median ${global}) × growth ${growth} (7d ${p.change_7d ?? 'unreported'}%) × age ${age} (${years ?? 'unknown'} years) = $${implied}; records no token.`,
      model: { base_multiple: multiple, growth_multiplier: growth, maturity_multiplier: age, age_days: days },
      farm_steps: farmSteps(p) };
  });
  scored.sort((a,b) => b.implied_value_usd-a.implied_value_usd || b.tvl_usd-a.tvl_usd || lexical(a.slug,b.slug));
  return scored.map((p,i) => ({...p, rank: i+1}));
}
export type BoardRow = ReturnType<typeof buildBoard>[number];
export function buildRadar(snapshot: Snapshot) {
  const board = buildBoard(snapshot);
  const live = snapshot.protocols.filter(p => p.mcap_usd !== null).sort((a,b) => b.mcap_usd!-a.mcap_usd! || lexical(a.slug,b.slug));
  return { board, radar: { as_of: snapshot.as_of, source: snapshot.source, floor_usd: snapshot.floor_usd,
    tracked_size: snapshot.protocols.length, comparable_size: snapshot.protocols.filter(p => p.mcap_usd !== null && p.tvl_usd > 0).length, watchlist: snapshot.watchlist,
    model: MODEL, model_version: MODEL_VERSION, watchlist_size: snapshot.watchlist.length,
    board_size: board.length, early_size: board.filter(p => p.tvl_usd < snapshot.floor_usd).length,
    live_size: live.length, rows: board, live } };
}
export function parseSnapshot(text: string): Snapshot {
  const s = JSON.parse(text) as Snapshot;
  if (!Array.isArray(s.protocols) || !Array.isArray(s.watchlist) || !Number.isFinite(Date.parse(s.as_of))) throw new Error('Invalid snapshot');
  if (new Set(s.protocols.map(p => p.slug)).size !== s.protocols.length) throw new Error('Duplicate snapshot slug');
  return s;
}
export function boardIssue(board: BoardRow[], snapshot: Snapshot): string | null {
  if (board.length < 100 || board.length > 4000) return 'Row count outside gate';
  const known = new Set(snapshot.protocols.map(p => p.slug));
  const seen = new Set<string>();
  for (const [i,r] of board.entries()) {
    if (!known.has(r.slug) || seen.has(r.slug) || !/^\S{1,128}$/.test(r.slug) || !r.name.trim()) return 'Invalid row identity';
    seen.add(r.slug);
    if (r.rank !== i+1 || !Number.isSafeInteger(r.implied_value_usd) || r.implied_value_usd < 1 || r.implied_value_usd > 1e14) return 'Invalid rank or value';
    if (i && r.implied_value_usd > board[i-1]!.implied_value_usd) return 'Values rise';
    if (r.farm_steps.length < 3 || r.farm_steps.length > 12 || r.farm_steps.some(s => typeof s !== 'string' || s.trim().length < 20 || s.trim().length > 600)) return 'Invalid farm steps';
  }
  if (snapshot.watchlist.some(s => !seen.has(s))) return 'Missing watchlist';
  if (new Set(board.map(r => r.implied_value_usd)).size < 2) return 'Uniform values';
  return null;
}
export function dataScript(radar: ReturnType<typeof buildRadar>['radar']): string {
  return `window.RADAR=${JSON.stringify(radar).replace(/</g, '\\u003c')};\n`;
}
