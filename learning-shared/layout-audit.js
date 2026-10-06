'use strict';
const auditButton=document.querySelector('#audit'),auditOutput=document.querySelector('#audit-results');
auditButton.addEventListener('click',async()=>{
  auditButton.disabled=true;
  const results=[],sizes=[[1024,540],[1366,650],[768,900],[390,667],[320,568],[640,360]];
  const paths=JSON.parse(document.querySelector('#audit-paths').textContent);
  const auditFrame=document.createElement('iframe');auditFrame.title='Layout audit';auditFrame.style.cssText='position:absolute;left:0;top:0;border:0;visibility:hidden';document.body.appendChild(auditFrame);
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  try {
    for(const path of paths){
      status.textContent='Checking '+path+'…';
      auditFrame.style.width='1024px';auditFrame.style.height='540px';
      const loaded=new Promise(resolve=>{const timer=setTimeout(()=>resolve(false),15000);auditFrame.onload=()=>{clearTimeout(timer);resolve(true);};});
      auditFrame.src='../'+path+'?screen-check='+Date.now();
      if(!await loaded){results.push({path,error:'load timeout'});continue;}
      await Promise.race([auditFrame.contentDocument.fonts?.ready||Promise.resolve(),wait(1500)]);
      for(const [width,height] of sizes){
        auditFrame.style.width=width+'px';auditFrame.style.height=height+'px';await wait(120);
        const win=auditFrame.contentWindow,doc=auditFrame.contentDocument,root=doc.documentElement,overflow=Math.max(root.scrollWidth,doc.body.scrollWidth)-root.clientWidth,map=doc.querySelector('#map'),box=map?.getBoundingClientRect();
        results.push({path,width:win.innerWidth,height:win.innerHeight,overflow:Math.max(0,overflow),map:box?{width:Math.round(box.width),height:Math.round(box.height)}:null});
      }
    }
    const failures=results.filter(r=>r.error||r.overflow>1||(r.map&&(r.map.width<1||r.map.height<1)));
    auditOutput.hidden=false;auditOutput.textContent=JSON.stringify({checks:results.length,failures,results},null,2);status.textContent=results.length+' screen checks complete · '+failures.length+' layout issues.';
  }finally{auditFrame.remove();auditButton.disabled=false;}
});
