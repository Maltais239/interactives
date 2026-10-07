// npm install && npm run build (Node 24 or newer).
const fs=require('node:fs'),path=require('node:path');
const babel=require('@babel/core'),postcss=require('postcss'),tailwind=require('tailwindcss');
const root=__dirname,jsx=fs.readFileSync(path.join(root,'app.jsx'),'utf8');
const code=babel.transformSync(jsx,{babelrc:false,configFile:false,presets:[['@babel/preset-react',{runtime:'classic'}]],compact:true}).code;
fs.writeFileSync(path.join(root,'app.js'),code+'\n');
fs.mkdirSync(path.join(root,'vendor'),{recursive:true});
for(const name of ['react','react-dom'])fs.copyFileSync(path.join(root,'node_modules',name,'umd',name+'.production.min.js'),path.join(root,'vendor',name+'18.min.js'));
postcss([tailwind({content:[path.join(root,'index.html'),path.join(root,'app.jsx')],theme:{extend:{}},plugins:[]})]).process('@tailwind base;@tailwind components;@tailwind utilities;',{from:undefined}).then(result=>fs.writeFileSync(path.join(root,'styles.css'),result.css)).catch(error=>{console.error(error);process.exitCode=1;});
