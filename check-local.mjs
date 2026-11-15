import assert from 'node:assert/strict';
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { buildDossier } from './vendor/makefun-board.ts';
import { buildBoard, isRankable, quantile } from './lib/model.ts';
const kit = '/home/hatch/workspace/goals/wealth-pipeline/hidden_files/makefun/token-radar-01-kit';
const input = process.argv[2] ?? join(kit, 'input/snapshot.json');
const out = resolve('out');
const snapshot = JSON.parse(readFileSync(input, 'utf8'));
const sha = b => createHash('sha256').update(b).digest('hex');
function run() {
  const result = spawnSync(process.execPath, ['main.ts', '--input', input], {
    env: {...process.env, MAKEFUN_OUTPUT_DIR: out}, encoding: 'utf8', cwd: import.meta.dirname,
  });
  assert.equal(result.status, 0, result.stderr);
}
run();
const bytes = readFileSync(join(out, 'board.json'));
assert(bytes.length <= 8*1024*1024);
const {rows} = JSON.parse(bytes);
assert(rows.length >= 100 && rows.length <= 4000);
const known = new Map(snapshot.protocols.map(p => [p.slug,p]));
const seen = new Set();
const allSteps = new Set();
const denied = new Set(['Bridge','Canonical Bridge','Liquid Staking','Liquid Restaking','Restaked BTC','CEX']);
const expected = snapshot.protocols.filter(p => p.mcap_usd === null && p.symbol === null && p.gecko_id === null && !denied.has(p.category) && !/\s(?:v\d+(?:\.\d+)*|\d+(?:\.\d+)+)$/i.test(p.name) && !/\b(wrapped|staked|staking)\b/i.test(p.name) && !/^(Binance|Coinbase|Bybit|Kraken|Bitget|OKX|Bitfinex|Gemini)/i.test(p.name));
assert.equal(rows.length, expected.length);
assert.equal(rows.length,198);
assert.equal(snapshot.watchlist.length,40);
for (const [i,r] of rows.entries()) {
  assert(known.has(r.slug) && !seen.has(r.slug)); seen.add(r.slug);
  assert(/^\S{1,128}$/.test(r.slug) && typeof r.name === 'string' && r.name.trim());
  assert(isRankable(known.get(r.slug)));
  for (const field of ["mcap_usd", "symbol", "gecko_id"]) assert.equal(known.get(r.slug)[field], null);
  assert.equal(r.rank, i+1);
  assert(Number.isSafeInteger(r.implied_value_usd) && r.implied_value_usd > 0 && r.implied_value_usd <= 1e14);
  if (i) assert(rows[i-1].implied_value_usd >= r.implied_value_usd);
  assert(r.farm_steps.length >= 4 && r.farm_steps.length <= 6);
  for (const step of r.farm_steps) {
    assert(typeof step === 'string' && step.trim().length >= 20 && step.trim().length <= 600);
    assert(step.includes(r.name) && /cost|budget/i.test(step) && /time estimate/i.test(step));
    assert(!allSteps.has(step)); allSteps.add(step);
  }
  assert.equal(r.implied_value_usd, Math.max(1,Math.min(1e14,Math.round(r.tvl_usd*r.multiple_used*r.growth_factor*r.age_factor))));
  assert(r.growth_factor >= .8 && r.growth_factor <= 1.25);
  assert(r.age_factor >= .85 && r.age_factor <= 1.2);
  if (r.change_7d === null) assert.equal(r.growth_factor,1);
  if (r.listed_at === null) assert.equal(r.age_factor,1);
}
assert(new Set(rows.map(r=>r.implied_value_usd)).size > 1);
for (const slug of snapshot.watchlist) assert(seen.has(slug));
assert.equal(snapshot.protocols.filter(p=>p.mcap_usd!==null && p.tvl_usd>0).length,144);
assert.equal(quantile([1,2,3,4],.5),2.5);
assert.equal(quantile([0,100],.01),1);
// Reordered input cannot alter a valuation or rank.
assert.deepEqual(buildBoard({...snapshot,protocols:[...snapshot.protocols].reverse()}),rows);
function walk(dir, relative='') {
  return readdirSync(dir).sort().flatMap(name => {
    assert(/^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/.test(name));
    const path=join(dir,name), st=lstatSync(path);
    if(st.isDirectory()) return walk(path,join(relative,name));
    assert(st.isFile()); return [{path,relative:join(relative,name),bytes:readFileSync(path)}];
  });
}
const files=walk(join(out,'dashboard'));
assert(files.some(f=>f.relative==='index.html'));
for(const ext of ['.css','.js']) assert(files.some(f=>extname(f.path)===ext));
assert(files.length <=400 && files.reduce((n,f)=>n+f.bytes.length,0)<=60000);
for(const f of files) {
  const text=f.bytes.toString('utf8');
  // Conservative offline check across every source context.
  assert(!/https?:\/\//i.test(text),f.relative);
}
const shots=walk(join(out,'screenshots'));
assert(shots.length>=3 && shots.length<=4);
function crc32(bytes) {
  let crc=0xffffffff;
  for(const b of bytes) { crc^=b; for(let i=0;i<8;i++) crc=(crc>>>1)^((crc&1)?0xedb88320:0); }
  return (crc^0xffffffff)>>>0;
}
for(const f of shots) {
  const b=f.bytes;
  assert(b.length<=524288);
  assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  let at=8, ended=false, width, height, depth, color, interlace;
  const data=[];
  while(at<b.length) {
    const n=b.readUInt32BE(at), type=b.toString('ascii',at+4,at+8);
    assert(at+12+n<=b.length);
    assert.equal(crc32(b.subarray(at+4,at+8+n)),b.readUInt32BE(at+8+n));
    if(at===8) { assert.equal(type,'IHDR'); assert.equal(n,13); width=b.readUInt32BE(at+8); height=b.readUInt32BE(at+12); depth=b[at+16];color=b[at+17];interlace=b[at+20]; }
    if(type==='IDAT') data.push(b.subarray(at+8,at+8+n));
    at+=12+n;
    if(type==='IEND') {assert.equal(n,0);ended=true;break;}
  }
  assert(ended && at===b.length);
  assert.equal(width,1440); assert.equal(height,900);
  assert.equal(interlace,0);
  const channels={0:1,2:3,3:1,4:2,6:4}[color]; assert(channels);
  const stride=Math.ceil(width*channels*depth/8)+1;
  const raw=inflateSync(Buffer.concat(data)); assert.equal(raw.length,stride*height);
  for(let y=0;y<height;y++) assert(raw[y*stride]<=4);
}
const dossier=readFileSync(join(out,'dossier.json'));
assert(dossier.length<=1.5*1024*1024);
assert.deepEqual(dossier,Buffer.from(buildDossier(out,{text_max_bytes:65536})));
assert.deepEqual(readFileSync('vendor/makefun-board.ts'),readFileSync(join(kit,'starter/vendor/makefun-board.ts')));
const first=walk(out).map(f=>[f.relative,sha(f.bytes)]);
run();
assert.deepEqual(walk(out).map(f=>[f.relative,sha(f.bytes)]),first);
console.log(`PASS: ${rows.length} rows; watchlist ${snapshot.watchlist.length}/${snapshot.watchlist.length}; 144 comparables`);
console.log('PASS: board_file, sorted_by_value, coverage, farm_steps, dashboard_files, screenshot_format, dossier_matches');
console.log('PASS: candidate separation, formula, factors, unique farm text, reordered input, token-record test, unchanged vendor');
console.log('PASS: consecutive runs identical for every output file');
console.log(`board.json SHA256 ${sha(bytes)}`);
console.log(`dossier.json SHA256 ${sha(dossier)} (${dossier.length} bytes)`);
console.log('Top 10:');
for(const r of rows.slice(0,10)) console.log(`${r.rank}. ${r.name} (${r.slug}): $${r.implied_value_usd.toLocaleString('en-US')}`);

// Format validity cannot establish that screenshots show the current implementation.
const stale=shots.filter(f=>f.bytes.equals(readFileSync(join(kit,'starter/screenshots',f.relative))));
if(stale.length){
 console.log(`INCOMPLETE: ${stale.length} screenshots still match starter captures; current-dashboard capture required`);
 process.exitCode=1;
}
