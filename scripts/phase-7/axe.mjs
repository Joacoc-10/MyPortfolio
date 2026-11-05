// axe (WCAG 2.0–2.2 AA) sobre #experience y #projects, ES/EN × 390/1440. Uso: node axe.mjs [salida.json]
import {chromium} from 'playwright';import AxeBuilder from '@axe-core/playwright';import fs from 'node:fs';
const base=process.env.BASE||'http://127.0.0.1:4015';const out=[];
const b=await chromium.launch({channel:'chrome',headless:true});
for(const locale of ['es','en'])for(const width of [390,1440]){
 const m=width<500;const c=await b.newContext({viewport:{width,height:900},isMobile:m,hasTouch:m});const p=await c.newPage();
 await p.goto(`${base}/${locale}`);await p.waitForLoadState('networkidle');
 const h=await p.evaluate(()=>document.body.scrollHeight);for(let y=0;y<h;y+=400){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(100);}
 for(const id of ['experience','projects']){
  const r=await new AxeBuilder({page:p}).include('#'+id).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']).analyze();
  out.push({locale,width,section:id,violations:r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length})),passes:r.passes.length,incomplete:r.incomplete.map(v=>v.id)});
  console.log(locale,width,id,'violaciones:',r.violations.length,r.violations.map(v=>v.id).join(','),'| incomplete:',r.incomplete.map(v=>v.id).join(','));}
 await c.close();}
await b.close();if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(out,null,2));
