import {chromium} from 'playwright';import fs from 'node:fs';import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});const results=[];
try{
for(const locale of ['es','en']){const page=await b.newPage({viewport:{width:390,height:844}});await page.goto(`http://127.0.0.1:4015/${locale}`);await page.waitForLoadState('networkidle');
 await page.locator('main section').first().locator('a[href="#contact"]').click();await page.waitForTimeout(900);assert.equal(await page.evaluate(()=>location.hash),'#contact');await page.waitForFunction(()=>{const r=document.getElementById('contact').getBoundingClientRect();return r.top<innerHeight&&r.bottom>80});
 await page.locator('header button').click();await page.mouse.click(5,700);assert.equal(await page.locator('#mobile-menu').count(),0);
 await page.locator('header button').click();await page.setViewportSize({width:1440,height:900});await page.locator('#mobile-menu').waitFor({state:'detached'});
 const card=page.locator('.card-glow').first();await card.hover();await page.waitForTimeout(450);assert.equal(await card.evaluate(e=>Number(getComputedStyle(e,'::after').opacity)>0),true);
 const button=page.locator('a[download]').first();await button.focus();await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(250);assert.equal(await page.locator('canvas').count(),0);for(const hidden of await page.locator('[data-reveal="hidden"]').all())assert.equal(await hidden.evaluate(e=>getComputedStyle(e).opacity),'1');
 results.push({locale,heroCTA:true,outsideMenuClose:true,resizeMenuClose:true,cardHover:true,keyboardFocusOutline:true,dynamicReducedMotion:true});await page.close();
 const nojs=await b.newPage({javaScriptEnabled:false});await nojs.goto(`http://127.0.0.1:4015/${locale}`);assert.equal(await nojs.locator('h1').count(),1);assert.equal(await nojs.locator('[data-reveal="hidden"]').count(),0);results.push({locale,noJavaScriptContentVisible:true});await nojs.close();
}
const context=await b.newContext();const root=await context.request.get('http://127.0.0.1:4015/',{headers:{'accept-language':'es'},maxRedirects:0});assert.equal(root.status(),307);assert(root.headers().location.endsWith('/es'));
for(const locale of ['es','en']){const r=await context.request.get(`http://127.0.0.1:4015/${locale}/missing`);assert.equal(r.status(),404);assert.equal(r.headers().link?.includes('hreflang')??false,false);const html=await r.text();assert(!html.includes('name="robots" content="index'));assert(!html.includes('rel="canonical"'));results.push({locale,notFoundNoindex:true,noInvalidCanonical:true,noAlternateHeader:true});}
const sitemap=await (await context.request.get('http://127.0.0.1:4015/sitemap.xml')).text();assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]),['https://jcoding.vercel.app/es','https://jcoding.vercel.app/en']);
console.log('PASS extra checks');
}finally{fs.writeFileSync('docs/phase-5/qa/extra.json',JSON.stringify(results,null,2));await b.close();}
