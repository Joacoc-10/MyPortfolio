import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
import fs from 'node:fs';
const dir=process.argv[2];fs.mkdirSync(dir,{recursive:true});
for(const locale of ['es','en']) for(const desktop of [false,true]){
 const chrome=await launch({chromePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',chromeFlags:['--headless','--no-sandbox']});
 try {const result=await lighthouse(`http://127.0.0.1:4015/${locale}`,{port:chrome.port,output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],...(desktop?{formFactor:'desktop',screenEmulation:{mobile:false,width:1440,height:900,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1}}:{})});
 fs.writeFileSync(`${dir}/${locale}-${desktop?'desktop':'mobile'}.json`,result.report);console.log(locale,desktop?'desktop':'mobile',Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,v.score])));
 }finally{await chrome.kill();}
}
