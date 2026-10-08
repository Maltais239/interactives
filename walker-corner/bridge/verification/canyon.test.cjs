const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {chromium:pw}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const E=require('../engine.js');
const root=path.resolve(__dirname,'..'),errors=[],checks=[];
const server=http.createServer((req,res)=>{const file=path.join(root,decodeURIComponent(req.url.split('?')[0]).replace(/^\//,''));try{const data=fs.readFileSync(file);res.setHeader('Content-Type',file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.webp')?'image/webp':'application/octet-stream');res.end(data);}catch{res.statusCode=404;res.end('Missing');}});
const settle=p=>p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
async function capture(p,file){if(process.env.BRIDGE_SCREENSHOTS==='1'||process.env.BRIDGE_SCREENSHOTS==='final'&&/large-text|crossing-complete/.test(file)){const cdp=await p.context().newCDPSession(p);try{const result=await cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(__dirname,file),Buffer.from(result.data,'base64'));}finally{await cdp.detach();}}}
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 const launch={headless:true};
 if(process.env.BRIDGE_BROWSER_PATH)launch.executablePath=process.env.BRIDGE_BROWSER_PATH;
 if(process.env.BRIDGE_CHROMIUM_MODULE){const {default:chromium}=await import(process.env.BRIDGE_CHROMIUM_MODULE);launch.args=chromium.args;}
 const b=await pw.launch(launch);
 try{
  const p=await b.newPage({viewport:{width:1366,height:650},hasTouch:true});p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(10000);
  await p.route('https://fonts.googleapis.com/**',route=>route.abort());
  await p.addInitScript(()=>{const original=CanvasRenderingContext2D.prototype.scale;CanvasRenderingContext2D.prototype.scale=function(...args){original.apply(this,args);if(this.canvas.id==='bridgeCanvas'){const t=this.getTransform();window.testCamera={a:t.a,e:t.e,f:t.f,dpr:Math.min(devicePixelRatio||1,2)};}};});
  await p.goto(base+'/index.html',{waitUntil:'domcontentloaded'});await settle(p);
  const pieces=()=>p.locator('#pieces').textContent(),zoom=()=>p.locator('#zoomLevel').textContent();
  async function screenPoint(point){return p.evaluate(pt=>{const r=document.getElementById('bridgeCanvas').getBoundingClientRect(),t=window.testCamera;return {x:r.x+(pt.x*t.a+t.e)/t.dpr,y:r.y+(pt.y*t.a+t.f)/t.dpr};},point);}
  const originalPieces=await pieces();assert.equal(originalPieces,'8 pieces');
  const sizes=[[1024,540],[1366,650],[768,900],[390,667],[320,568],[640,360]];
  for(const [w,h]of sizes){
   console.log('Checking viewport '+w+'x'+h);
   await p.setViewportSize({width:w,height:h});await settle(p);
   let layout=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,scene:[scene.clientWidth,scene.clientHeight],toolbar:document.querySelector('.viewport-bar').getBoundingClientRect().height}));
   assert(layout.overflow<=1,`${w} normal overflow: ${layout.overflow}`);assert.equal(await pieces(),originalPieces);
   await capture(p,`canyon-${w}x${h}.png`);
   await p.click('#expandBtn');await settle(p);
   const expanded=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,scene:[scene.clientWidth,scene.clientHeight],dock:document.querySelector('.build-dock').getBoundingClientRect().bottom,exit:expandBtn.getBoundingClientRect().bottom,height:innerHeight}));
   assert(expanded.overflow<=1,`${w} expanded overflow`);assert(expanded.exit<h,`${w} exit hidden`);assert(expanded.scene[1]>=140);assert(expanded.dock<=h+2,`${w} dock out of expanded view: ${expanded.dock} > ${h}`);
   await capture(p,`canyon-expanded-${w}x${h}.png`);
   checks.push({size:[w,h],normal:layout,expanded});await p.click('#expandBtn');await settle(p);
  }
  console.log('Checking pinch, pan and placement');
  await p.setViewportSize({width:1366,height:650});await p.click('#expandBtn');await settle(p);
  await p.click('#zoomBtn');assert.equal(await zoom(),'125%');await p.click('#zoomBtn');assert.equal(await zoom(),'156%');
  await p.click('#fitBtn');assert.equal(await zoom(),'100%');
  await p.locator('#bridgeCanvas').press('ArrowRight');await p.locator('#bridgeCanvas').press('Enter');await p.locator('#bridgeCanvas').press('Escape');assert.equal(await p.locator('#expandBtn').getAttribute('aria-pressed'),'true','Escape cancels a selected point without leaving the canyon');
  const cdp=await p.context().newCDPSession(p),rect=await p.locator('#bridgeCanvas').boundingBox();
  const send=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map(([id,x,y])=>({id,x:rect.x+x,y:rect.y+y,radiusX:8,radiusY:8,force:1}))});
  await send('touchStart',[[0,rect.width/2-50,rect.height/2]]);await send('touchStart',[[0,rect.width/2-50,rect.height/2],[1,rect.width/2+50,rect.height/2]]);
  await send('touchMove',[[0,rect.width/2-110,rect.height/2],[1,rect.width/2+110,rect.height/2]]);await send('touchEnd',[]);await settle(p);
  assert(parseInt(await zoom())>=210,'Native pinch must enlarge the bridge');assert.equal(await pieces(),originalPieces,'Pinching must not add a beam');
  const beforePan=await p.evaluate(()=>window.testCamera);await p.click('#panBtn');await p.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);await p.mouse.down();await p.mouse.move(rect.x+rect.width/2+80,rect.y+rect.height/2+25,{steps:5});await p.mouse.up();await settle(p);assert.equal(await pieces(),originalPieces);assert.notDeepEqual(await p.evaluate(()=>window.testCamera),beforePan,'Pan moves the view');await p.click('#panBtn');
  await p.click('[data-tool=wood]');
  const a=await screenPoint({x:600,y:250}),end=await screenPoint({x:600,y:166});await p.mouse.click(a.x,a.y);await p.mouse.move(end.x,end.y);await settle(p);
  await capture(p,'canyon-piece-preview.png');await p.mouse.click(end.x,end.y);assert.equal(await pieces(),'9 pieces','Building works at a zoomed and panned location');
  await p.click('[data-tool=erase]');const mid=await screenPoint({x:600,y:208});await p.mouse.click(mid.x,mid.y);assert.equal(await pieces(),originalPieces,'Erasing works after pinch and pan');
  await p.click('[data-tool=wood]');await p.click('#fitBtn');await settle(p);
  const anchor=await screenPoint({x:264,y:250}),tip=await screenPoint({x:348,y:166});await p.mouse.click(anchor.x,anchor.y);await p.mouse.click(tip.x,tip.y);assert.equal(await pieces(),'9 pieces');await p.click('#expandBtn');
  await p.setViewportSize({width:390,height:667});await settle(p);assert.equal(await pieces(),'9 pieces','Resize preserves the design');await p.reload({waitUntil:'domcontentloaded'});await settle(p);assert.equal(await pieces(),'9 pieces','Saved design preserved on reload');
  await p.evaluate(()=>document.documentElement.style.fontSize='200%');await settle(p);assert((await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=1,'Large text does not overflow');await p.click('#expandBtn');await settle(p);await capture(p,'canyon-expanded-large-text.png');await p.click('#expandBtn');
  await p.setViewportSize({width:1366,height:650});await p.evaluate(()=>document.documentElement.style.fontSize='100%');
  // Seed a player's completed design, then verify an actual crossing and progression.
  await p.evaluate(members=>{const key='bgsd-walker-bridge-game-v1',saved=JSON.parse(localStorage.getItem(key));localStorage.setItem(key,JSON.stringify({...saved,members,challenge:'first',vehicle:'car',bridgeType:'truss',wind:0,trials:[]}));},E.starter('truss'));
  await p.reload({waitUntil:'domcontentloaded'});await p.click('#expandBtn');await p.click('#testBtn');await p.locator('#resultCard').waitFor({state:'visible',timeout:20000});await settle(p);
  assert.equal(await p.locator('#resultKicker').textContent(),'CHALLENGE COMPLETE');assert(await p.locator('#nextChallengeBtn').isVisible());
  await capture(p,'canyon-crossing-complete.png');await p.click('#nextChallengeBtn');assert((await p.locator('#modeBadge').textContent())==='BUILD MODE');assert.equal(await p.locator('#challenge').inputValue(),'supply');
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(__dirname,'canyon-checks.json'),JSON.stringify({checks,gestures:'Native touch pinch; pan; zoomed placement and erasing; resize and reload; success and progression; large text',errors},null,2));
  console.log(JSON.stringify({passed:true,viewports:checks.length,errors}));
 }finally{await b.close();server.close();}
}
main().catch(e=>{console.error(e);server.close();process.exitCode=1});
