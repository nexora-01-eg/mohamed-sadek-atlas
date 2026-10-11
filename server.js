/* Zero-dependency static server (Node built-ins only). Run: node server.js [port] */
const http=require("http"),fs=require("fs"),path=require("path");
const MIME={".html":"text/html",".css":"text/css",".js":"text/javascript",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon"};
const root=__dirname, port=+(process.argv[2]||8080);
http.createServer((req,res)=>{
  let u=decodeURIComponent(req.url.split("?")[0]);
  if(u==="/")u="/index.html";
  if(u.startsWith("/data-private/")){res.writeHead(403);res.end("private");return;}
  const f=path.join(root,path.normalize(u).replace(/^[/\\]+/,""));
  if(!f.startsWith(root)){res.writeHead(403);res.end();return;}
  fs.readFile(f,(e,b)=>{
    if(e){res.writeHead(404);res.end("not found");return;}
    res.writeHead(200,{"Content-Type":MIME[path.extname(f)]||"application/octet-stream","X-Robots-Tag":"noindex"});
    res.end(b);
  });
}).listen(port,()=>console.log("Mohamed Atlas → http://localhost:"+port));
