// Local preview only. Production uses ordinary static hosting.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const args=process.argv.slice(2);const port=Number(args[args.indexOf('--port')+1])||3000;
const root=__dirname;
http.createServer((req,res)=>{let url;try{url=decodeURIComponent(new URL(req.url,'http://local').pathname);}catch{res.writeHead(400);res.end();return;}const file=path.resolve(root,'.'+url+(url.endsWith('/')?'index.html':''));if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(data);});}).listen(port,'0.0.0.0',()=>process.stdout.write(`http://localhost:${port}\n`));
