import {chromium} from 'playwright';
const out=process.argv[2];
const css='a[href*="maps.app.goo.gl"]{display:none !important}';
const b=await chromium.launch({channel:'chrome',headless:true});
// escritorio
let ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
let p=await ctx.newPage(); await p.goto('https://oli-bar.vercel.app/'); await p.waitForLoadState('networkidle'); await p.addStyleTag({content:css}); await p.waitForTimeout(800);
await p.screenshot({path:`${out}/d1.png`}); await ctx.close();
// móvil
ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
p=await ctx.newPage(); await p.goto('https://oli-bar.vercel.app/'); await p.waitForLoadState('networkidle'); await p.addStyleTag({content:css}); await p.waitForTimeout(800);
await p.screenshot({path:`${out}/m1.png`});
await p.locator('a[href="#milanesas"]').first().click(); await p.waitForTimeout(2000);
await p.screenshot({path:`${out}/m2.png`});
await b.close();
