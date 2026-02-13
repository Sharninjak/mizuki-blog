const fs = require('fs');
const path = require('path');
const root = process.cwd();
const srcDir = path.join(root, 'src');
const exts = new Set(['.ts', '.js', '.mjs', '.cjs', '.astro', '.svelte']);
const files = [];
function walk(d) {
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (exts.has(path.extname(ent.name))) files.push(p);
  }
}
walk(srcDir);
const importRe = /import\s+(?:[^'\";]+\s+from\s+)?['\"]([^'\"]+)['\"]/g;
const dynamicRe = /import\(\s*['\"]([^'\"]+)['\"]\s*\)/g;
const graph = new Map();
const externalCount = new Map();
const indeg = new Map();
const outdeg = new Map();
function countExternal(spec) { externalCount.set(spec, (externalCount.get(spec) || 0) + 1); }
function tryResolve(base, includeJson=false) {
  const list = [base, ...['.ts','.js','.mjs','.cjs','.astro','.svelte'].map(e=>base+e), path.join(base,'index.ts'), path.join(base,'index.js'), path.join(base,'index.astro')];
  if (includeJson) list.push(base + '.json');
  for (const c of list) if (fs.existsSync(c)) return c;
  return null;
}
function resolveImport(from, spec) {
  if (spec.startsWith('.')) return tryResolve(path.resolve(path.dirname(from), spec), true);
  const aliasMap = [['@/','src/'],['@components/','src/components/'],['@utils/','src/utils/'],['@i18n/','src/i18n/'],['@layouts/','src/layouts/'],['@constants/','src/constants/'],['@assets/','src/assets/']];
  for (const [prefix,target] of aliasMap) {
    if (spec.startsWith(prefix)) return tryResolve(path.join(root, target, spec.slice(prefix.length)), false);
  }
  return null;
}
for (const f of files) {
  const txt = fs.readFileSync(f, 'utf8');
  const edges = [];
  let m;
  while ((m = importRe.exec(txt))) { const spec=m[1]; const r=resolveImport(f,spec); if(r) edges.push(r); else countExternal(spec); }
  while ((m = dynamicRe.exec(txt))) { const spec=m[1]; const r=resolveImport(f,spec); if(r) edges.push(r); else countExternal(spec); }
  graph.set(f, [...new Set(edges)]);
}
for (const [f, edges] of graph) {
  outdeg.set(f, edges.length);
  for (const t of edges) indeg.set(t, (indeg.get(t)||0)+1);
}
const nodes=[...graph.keys()];
let idx=0; const stack=[]; const onStack=new Set(); const dfn=new Map(); const low=new Map(); const scc=[];
function dfs(v){
  dfn.set(v, ++idx); low.set(v, idx); stack.push(v); onStack.add(v);
  for (const w of (graph.get(v)||[])) {
    if (!dfn.has(w)) { dfs(w); low.set(v, Math.min(low.get(v), low.get(w))); }
    else if (onStack.has(w)) low.set(v, Math.min(low.get(v), dfn.get(w)));
  }
  if (low.get(v)===dfn.get(v)) {
    const comp=[]; let w;
    do { w=stack.pop(); onStack.delete(w); comp.push(w); } while (w!==v);
    if (comp.length>1) scc.push(comp);
  }
}
for (const n of nodes) if (!dfn.has(n)) dfs(n);
const rel = p => path.relative(root,p).replace(/\\\\/g,'/').replace(/\\/g,'/');
const topOut=[...outdeg.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([f,n])=>({file:rel(f),out:n,in:indeg.get(f)||0}));
const topIn=[...indeg.entries()].sort((a,b)=>b[1]-a[1]).slice(0,12).map(([f,n])=>({file:rel(f),in:n,out:outdeg.get(f)||0}));
const topExternal=[...externalCount.entries()].sort((a,b)=>b[1]-a[1]).slice(0,20);
const result={totalFiles:files.length,totalEdges:[...graph.values()].reduce((s,e)=>s+e.length,0),cycleCount:scc.length,cycles:scc.map(c=>c.map(rel)),topOut,topIn,topExternal};
fs.writeFileSync('dep-analysis.json', JSON.stringify(result,null,2));
console.log(JSON.stringify({totalFiles:result.totalFiles,totalEdges:result.totalEdges,cycleCount:result.cycleCount}, null, 2));
