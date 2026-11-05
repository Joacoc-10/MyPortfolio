// Comportamiento de los carruseles de proyectos. Uso: node carousel.mjs [salida.json]
// Requiere build de producción en 127.0.0.1:4015. Con BASE se cambia la URL.
import {chromium} from 'playwright';import fs from 'node:fs';
const base=process.env.BASE||'http://127.0.0.1:4015';const res=[];const errs=[];
const ck=(c,m)=>{res.push({ok:!!c,m});console.log(c?'PASS':'FAIL',m);};
const b=await chromium.launch({channel:'chrome',headless:true});
const state=(p,i)=>p.evaluate(i=>{const c=document.querySelectorAll('[data-carousel-scope]')[i];const imgs=[...c.querySelectorAll('img[class*="object-cover"]')];const a=imgs.find(e=>e.classList.contains('opacity-100'));return {n:imgs.length,src:a?.getAttribute('src')||null,h:Math.round(c.getBoundingClientRect().height)}},i);
const names=p=>p.evaluate(()=>[...document.querySelectorAll('[data-carousel-scope]')].map(c=>c.querySelector('h3,h4')?.textContent.trim()));
const hasCarousel=(p,i)=>p.evaluate(i=>!!document.querySelectorAll('[data-carousel-scope]')[i].querySelector('img[class*="object-cover"]'),i);
async function setup(locale,width,extra={}){const m=width<500;const ctx=await b.newContext({viewport:{width,height:m?844:900},hasTouch:m,isMobile:m,...extra});const p=await ctx.newPage();
 p.on('pageerror',e=>errs.push(e.message));p.on('console',x=>{if(x.type()==='error')errs.push(x.text())});
 await p.addInitScript(()=>{window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});});
 return {ctx,p};}
// 1) Escritorio 1440: todos los proyectos, a fondo
{const {ctx,p}=await setup('es',1440);const reqs=[];p.on('request',r=>{if(r.url().includes('/_next/image'))reqs.push(decodeURIComponent(r.url()))});
 await p.goto(`${base}/es`);await p.waitForLoadState('networkidle');
 ck(!reqs.some(u=>u.includes('/images/projects/')),`carga inicial: 0 capturas de proyectos descargadas (${reqs.filter(u=>u.includes('/images/projects/')).length})`);
 const nm=await names(p);let multi=0;const rotNames=[];
 for(let i=0;i<nm.length;i++){
  if(!(await hasCarousel(p,i))){ck(true,`${nm[i]}: sin imágenes (diseño sin cambios)`);continue;}
  const c=p.locator('[data-carousel-scope]').nth(i);await c.locator('img[class*="object-cover"]').first().scrollIntoViewIfNeeded();await p.mouse.move(2,2);await p.waitForTimeout(300);
  const s0=await state(p,i);if(multi===0)ck(s0.n===1,`${nm[i]}: 1 sola imagen montada al entrar (${s0.n})`);
  await p.waitForTimeout(8800);const s1=await state(p,i);
  // distinguir estática de multi: tras 8,8 s debe haber cambiado o seguir 1 montada
  const rotates=s1.src!==s0.src;if(rotates)multi++;
  ck(rotates?s1.n>=2:s1.n===1,`${nm[i]}: ${rotates?'rota automáticamente ('+s1.n+' montadas)':'estática (1 imagen)'}`);rotNames.push(nm[i]+(rotates?'':' [estática]'));
  ck(s1.h===s0.h,`${nm[i]}: altura de tarjeta estable (${s0.h}→${s1.h}px)`);
  if(rotates){
   const box=await c.locator('img[class*="object-cover"]').first().boundingBox();
   await p.mouse.move(box.x+box.width/2,box.y+box.height/2);const h0=await state(p,i);await p.waitForTimeout(5500);ck((await state(p,i)).src===h0.src,`${nm[i]}: hover pausa`);
   await p.mouse.move(2,2);await p.waitForTimeout(6500);const r1=await state(p,i);ck(r1.src!==h0.src,`${nm[i]}: reanuda al salir`);
   await c.locator('a[target=_blank]').first().focus();const f0=await state(p,i);await p.waitForTimeout(5500);ck((await state(p,i)).src===f0.src,`${nm[i]}: foco en la tarjeta pausa`);
   await p.evaluate(()=>document.activeElement.blur());await c.locator('img[class*="object-cover"]').first().scrollIntoViewIfNeeded();await p.mouse.move(2,2);await p.waitForTimeout(6500);ck((await state(p,i)).src!==f0.src,`${nm[i]}: reanuda al salir el foco`);
  }
  // accesibilidad de las imágenes
  const a11y=await p.evaluate(i=>{const c=document.querySelectorAll('[data-carousel-scope]')[i];const imgs=[...c.querySelectorAll('img[class*="object-cover"]')];return {live:c.querySelectorAll('[aria-live],[role=status],[role=alert]').length,inactiveBad:imgs.filter(e=>!e.classList.contains('opacity-100')&&(e.getAttribute('alt')!==''||e.getAttribute('aria-hidden')!=='true')).length,activeAlt:imgs.filter(e=>e.classList.contains('opacity-100')).every(e=>(e.alt||'').length>3)}},i);
  ck(a11y.live===0&&a11y.inactiveBad===0&&a11y.activeAlt,`${nm[i]}: inactivas alt=""+aria-hidden (${a11y.inactiveBad} mal), sin aria-live (${a11y.live}), activa con alt`);
 }
 ck(multi===6,`proyectos con rotación: ${multi} (esperado 6: Order-A, Nexvia, ZatoBox, Fabio, Florencia, OliBar); resto: ${rotNames.filter(n=>n.includes('[estática]')).join(', ')}`);
 ck((await p.evaluate(()=>window.__cls))<0.01,`CLS acumulado ${await p.evaluate(()=>window.__cls)}`);
 // desfase entre tarjetas visibles
 await ctx.close();}
// 2) Responsive: rotación + sin saltos + enlaces en 390/820/1280
for(const [locale,w] of [['en',390],['es',820],['en',1280],['es',1440]]){
 const {ctx,p}=await setup(locale,w);await p.goto(`${base}/${locale}`);await p.waitForLoadState('networkidle');
 const nm=await names(p);const iF=nm.findIndex(n=>n.includes('Fabio'));const iL=nm.findIndex(n=>n.includes('Florencia'));
 for(const i of [iF,iL]){await p.locator('[data-carousel-scope]').nth(i).locator('img[class*="object-cover"]').first().scrollIntoViewIfNeeded();await p.waitForTimeout(300);const s0=await state(p,i);await p.waitForTimeout(9000);const s1=await state(p,i);ck(s1.src!==s0.src&&s1.h===s0.h,`${locale}/${w} ${nm[i]}: rota y altura estable`);}
 const links=await p.$$eval('[data-carousel-scope] a[target=_blank]',a=>a.map(x=>({h:x.href,t:x.textContent.trim(),l:x.getAttribute('aria-label'),r:x.rel,hgt:x.getBoundingClientRect().height})));
 ck(links.length===13&&links.every(l=>l.h.startsWith('https://')&&l.l&&l.r.includes('noopener')&&l.hgt>=40),`${locale}/${w} 13 enlaces con nombre, rel seguro, ≥40px`);
 ck(links.filter(l=>/^(Código|Code)$/.test(l.t)).length===2,`${locale}/${w} 2 botones Código`);
 ck(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${locale}/${w} sin scroll horizontal`);
 ck((await p.evaluate(()=>window.__cls))<0.01,`${locale}/${w} CLS ${await p.evaluate(()=>window.__cls)}`);
 await ctx.close();}
// 3) Enlaces: respuesta HTTP real
{const {ctx,p}=await setup('es',1440);await p.goto(`${base}/es`);const urls=await p.$$eval('[data-carousel-scope] a[target=_blank]',a=>[...new Set(a.map(x=>x.href))]);
 for(const u of urls){let s;try{s=(await ctx.request.get(u,{timeout:20000})).status()}catch(e){s='ERR'}ck(s===200,`enlace ${u} → ${s}`);}await ctx.close();}
// 4) Foco visible
{const {ctx,p}=await setup('es',1440);await p.goto(`${base}/es`);await p.waitForLoadState('networkidle');
 await p.locator('[data-carousel-scope] a[target=_blank]').first().scrollIntoViewIfNeeded();
 await p.evaluate(()=>{const a=document.querySelector('[data-carousel-scope] a[target=_blank]');const prev=a.previousElementSibling;(document.querySelector('#projects')||document.body).focus?.();});
 for(let i=0;i<60;i++){await p.keyboard.press('Tab');const o=await p.evaluate(()=>{const e=document.activeElement;if(!e||!e.matches('[data-carousel-scope] a[target=_blank]'))return null;const s=getComputedStyle(e);return {w:parseFloat(s.outlineWidth),st:s.outlineStyle}});if(o){ck(o.w>=2&&o.st!=='none','foco visible en enlace de tarjeta (outline '+o.w+'px '+o.st+')');break;}}
 await ctx.close();}
// 5) Reduced motion: estático, sin rotación, sin transición
{const {ctx,p}=await setup('es',1440,{reducedMotion:'reduce'});await p.goto(`${base}/es`);await p.waitForLoadState('networkidle');const nm=await names(p);
 for(const n of ['Fabio','Lienzo','Order-A']){const i=nm.findIndex(x=>x.includes(n));await p.locator('[data-carousel-scope]').nth(i).scrollIntoViewIfNeeded();await p.waitForTimeout(500);const s0=await state(p,i);await p.waitForTimeout(10000);const s1=await state(p,i);ck(s0.src&&s1.src===s0.src&&s1.n===1,`reduced-motion ${n}: estático, 1 imagen montada (${s0.n}→${s1.n})`);}
 await ctx.close();}
console.log('ERRORES CONSOLA',JSON.stringify([...new Set(errs)]));ck(errs.length===0,'sin errores de consola');
await b.close();if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({results:res,errors:errs},null,2));
console.log(`\n${res.filter(r=>r.ok).length}/${res.length} OK`);
