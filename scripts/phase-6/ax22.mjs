import {chromium} from 'playwright';import AxeBuilder from '@axe-core/playwright';
const b=await chromium.launch({channel:'chrome',headless:true});
for(const locale of ['es','en'])for(const width of [390,1440]){const c=await b.newContext({viewport:{width,height:900}});const p=await c.newPage();await p.goto(`http://127.0.0.1:4015/${locale}`);await p.waitForLoadState('networkidle');
 for(const id of ['about','experience','stack','projects','contact']){await p.locator('#'+id).scrollIntoViewIfNeeded();await p.waitForTimeout(500);}
 const r=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
 console.log(locale,width,'violations',r.violations.map(v=>v.id+':'+v.nodes.length+' '+v.nodes.slice(0,2).map(n=>n.target.join(' ')).join(' | ')));await p.close();}
await b.close();
