import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir=process.argv[2];fs.mkdirSync(dir,{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true});
const results={cases:[],http:[],errors:[],network:[],metadata:{},axe:[],links:[]};
try{
const context=await browser.newContext({permissions:['clipboard-read','clipboard-write']});
for(const locale of ['es','en'])for(const width of [390,820,1280,1440]){
 const page=await context.newPage();await page.setViewportSize({width,height:900});
 page.on('pageerror',e=>results.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')results.errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)results.network.push({url:r.url(),status:r.status()});});
 await page.goto(`http://127.0.0.1:4015/${locale}`);await page.waitForLoadState('networkidle');
 assert.equal(await page.locator('html').getAttribute('lang'),locale);assert.equal(await page.locator('h1').count(),1);
 const headings=await page.locator('h1,h2,h3,h4,h5,h6').evaluateAll(xs=>xs.map(x=>({level:Number(x.tagName[1]),text:x.textContent})));for(let i=1;i<headings.length;i++)assert(headings[i].level<=headings[i-1].level+1);
 for(let i=0;i<15;i++){await page.keyboard.press('Tab');assert(await page.locator(':focus').count()>0);}await page.reload();
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').getAttribute('href'),'#main');await page.keyboard.press('Enter');
 // Every section: check anchors exist, reveal content, load all images.
 for(const id of ['about','experience','stack','projects','contact']){assert.equal(await page.locator('#'+id).count(),1);await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(800);}
 await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(500);
 if(width<1024){const toggle=page.locator('header button');await toggle.focus();await page.keyboard.press('Enter');assert.equal(await toggle.getAttribute('aria-expanded'),'true');await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').getAttribute('href'),'#about');await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert(await toggle.evaluate(e=>document.activeElement===e));await toggle.click();await page.locator('#mobile-menu a[href="#projects"]').click();assert.equal(await page.locator('#mobile-menu').count(),0);await page.evaluate(()=>window.scrollTo(0,0));await toggle.click();}
 const switcher=page.locator('a[hreflang]').filter({visible:true});await switcher.click();const other=locale==='es'?'en':'es';await page.waitForURL('**/'+other);assert.equal(await page.locator('html').getAttribute('lang'),other);await page.reload();assert.equal(await page.locator('html').getAttribute('lang'),other);
 await page.goto(`http://127.0.0.1:4015/${locale}`);await page.waitForLoadState('networkidle');
 const downloadPromise=page.waitForEvent('download');await page.locator(`a[download][href="/CV_JCoding_${locale.toUpperCase()}.pdf"]`).first().click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),`CV_JCoding_${locale.toUpperCase()}.pdf`);
 await page.getByRole('button',{name:locale==='es'?'Copiar email':'Copy email',exact:true}).click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'joacoc-10@hotmail.com');await page.getByRole('status').filter({hasText:locale==='es'?'Email copiado':'Email copied'}).waitFor();
 for(const id of ['about','experience','stack','projects','contact']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.waitForTimeout(300);}
 await page.waitForLoadState('networkidle');const broken=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.src));assert.deepEqual(broken,[]);
 for(const link of await page.locator('a[href^="#"]').evaluateAll(xs=>xs.map(x=>x.getAttribute('href')))){assert(await page.locator(link).count()>0);}
 if(width===390||width===1440){const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();results.axe.push({locale,width,violations:axe.violations});}
 results.metadata[locale]=await page.locator('head').evaluate(e=>({titles:[...e.querySelectorAll('title')].map(x=>x.textContent),canonical:[...e.querySelectorAll('link[rel="canonical"]')].map(x=>x.href),metas:[...e.querySelectorAll('meta[name],meta[property]')].map(x=>[x.name||x.getAttribute('property'),x.content]),alternates:[...e.querySelectorAll('link[hreflang]')].map(x=>[x.hreflang,x.href])}));
 assert.equal(results.metadata[locale].titles.length,1);assert.deepEqual(results.metadata[locale].canonical,[`https://jcoding.vercel.app/${locale}`]);assert.equal(results.metadata[locale].metas.filter(x=>x[0]==='description').length,1);assert.equal(results.metadata[locale].metas.filter(x=>x[0]==='robots').length,1);
 const jsonld=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());assert.equal(jsonld['@graph'].length,2);
 results.links=await page.locator('a[href^="http"]').evaluateAll(xs=>[...new Set(xs.map(x=>x.href))]);
 for(const reveal of await page.locator('[data-reveal]').all()){await reveal.scrollIntoViewIfNeeded();await page.waitForTimeout(40);}
 await page.waitForTimeout(800);await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(250);await page.screenshot({path:`${dir}/${locale}-${width}.png`,fullPage:true});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForLoadState('networkidle');assert.equal(await page.locator('canvas').count(),0);assert.equal(await page.locator('.marquee-track').evaluate(e=>getComputedStyle(e).animationName),'none');assert.equal(await page.locator('.marquee-set[data-duplicate]').evaluate(e=>getComputedStyle(e).display),'none');assert.equal(await page.locator('html').evaluate(e=>getComputedStyle(e).scrollBehavior),'auto');
 console.log('PASS',locale,width);results.cases.push({locale,width,keyboard:true,menu:width<1024,languageSwitch:true,download:true,clipboard:true,images:true,anchors:true,reducedMotion:true});await page.close();
}
for(const path of ['/','/es','/en','/robots.txt','/sitemap.xml','/share.png','/favicon.ico','/apple-touch-icon.png','/CV_JCoding_ES.pdf','/CV_JCoding_EN.pdf','/es/missing','/en/missing','/fr','/en/fr','/es/fr','/api/missing','/missing.png']){const r=await context.request.get('http://127.0.0.1:4015'+path,{maxRedirects:0});results.http.push({path,status:r.status(),location:r.headers().location,link:r.headers().link,type:r.headers()['content-type'],...((path.includes('missing')||path==='/fr')?{noindex:(await r.text()).includes('noindex')}:{})});}
const rootEn=await context.request.get('http://127.0.0.1:4015/',{headers:{'Accept-Language':'en'},maxRedirects:0});results.http.push({path:'/ Accept-Language=en',status:rootEn.status(),location:rootEn.headers().location});
assert.deepEqual(results.errors,[]);assert.deepEqual(results.network,[]);assert(results.axe.every(a=>a.violations.length===0));console.log('PASS',results.cases.length,'responsive cases; axe violations:',results.axe.reduce((n,a)=>n+a.violations.length,0));
}finally{fs.writeFileSync(dir+'/results.json',JSON.stringify(results,null,2));await browser.close();}
