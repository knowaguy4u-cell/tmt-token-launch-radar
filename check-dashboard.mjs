// Execute the offline rendering and control handlers without a browser dependency.
// This checks behavior, not visual layout; Chromium captures remain a separate requirement.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const nodes=new Map();
const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:''});return nodes.get(id)};
const sorts=['rank','name','tvl_usd','change_7d','age_years','multiple_used','implied_value_usd'].map(key=>({dataset:{sort:key}}));
const listeners={};
const context=vm.createContext({URLSearchParams,console,location:{hash:'',pathname:'/dashboard/index.html'},history:{replaceState(){}},document:{querySelector:node,querySelectorAll:()=>sorts}});
context.window=context;
context.addEventListener=(event,callback)=>listeners[event]=callback;
vm.runInContext(readFileSync('out/data.js','utf8'),context);
vm.runInContext(readFileSync('dashboard/app.js','utf8'),context);
const count=()=>Number(node('#count').textContent.split(' ')[0]);
assert.equal(count(),198);
node('#search').oninput({target:{value:'Sentora'}});assert.equal(count(),1);
node('#reset').onclick();
node('#watch').onchange({target:{checked:true}});assert.equal(count(),40);
node('#reset').onclick();
node('#chain').onchange({target:{value:'Ethereum'}});assert(count()>0&&count()<198);
node('#reset').onclick();
node('#band').onchange({target:{value:'Under $50M'}});assert.equal(count(),138);
node('#reset').onclick();
for(const button of sorts){
 for(let click=0;click<2;click++){
  button.onclick();assert.equal(count(),198);
  const key=button.dataset.sort;
  const ranked=[...context.RADAR.rows].sort((a,b)=>{
   const x=a[key],y=b[key];if(x===null)return y===null?a.rank-b.rank:1;if(y===null)return -1;
   const direction=vm.runInContext('state.direction',context);
   return (typeof x==='string'?x.localeCompare(y):x-y)*direction||a.rank-b.rank;
  });
  const rendered=[...node('tbody').innerHTML.matchAll(/href="#p=([^"]+)"/g)].map(m=>decodeURIComponent(m[1]));
  assert.deepEqual(rendered,ranked.map(r=>r.slug));
 }
}
context.location.hash='#cat=Risk%20Curators';listeners.hashchange();assert.equal(count(),34);
context.location.hash='#p=sentora-curator';listeners.hashchange();
const detail=node('#app').innerHTML;
assert(detail.includes('$498,197,777'));
assert(detail.includes('Full-precision derivation'));
assert.equal((detail.match(/<li>/g)||[]).length,5);
assert(detail.includes(context.RADAR.rows[0].farm_steps[0]));
context.location.hash='';listeners.hashchange();assert.equal(count(),198);
// Also verify direct initial hash routes rather than only subsequent navigation.
for(const hash of ['#cat=Risk%20Curators','#p=sentora-curator']){
 context.location.hash=hash;
 vm.runInContext('route()',context);
 assert(hash.includes('cat')?count()===34:node('#app').innerHTML.includes('$498,197,777'));
}
console.log('PASS: offline dashboard rendering, search, category/chain/TVL/watchlist filters, numeric/name sort handlers, category/detail hashes, supplied farm plan');
