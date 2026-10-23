import fs from 'node:fs';
const links=JSON.parse(fs.readFileSync('docs/phase-5/qa/results.json')).links;
const results=await Promise.all(links.map(async url=>{try{const r=await fetch(url,{signal:AbortSignal.timeout(15000),redirect:'follow'});await r.body?.cancel();return {url,status:r.status,finalUrl:r.url};}catch(e){return{url,error:e.message};}}));
fs.writeFileSync('docs/phase-5/external-links.json',JSON.stringify(results,null,2));console.log(results);
