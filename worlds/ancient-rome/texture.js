// The district shares four scanned surfaces. All other material layers are drawn locally.
export const surface = {lime:0, plaster:1, brick:2, paving:3, roof:4, wood:5, linen:6, metal:7, garden:8, mosaic:9, water:10, leaf:11, labels:12,sprig:21,ashlar:22,meander:23,bough:24,fresco:25,herb:26, facade:28, flagstone:29};
export const words=['CONCORDIA','PANIS','OLEVM','VINVM','POMA','VICVS AVREVS','HORTVS','FORVM','SALVE'];
export function seeded(seed) {
  return () => {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
}
async function imageAsset(name){
  try{
    const response=await fetch(new URL(name,import.meta.url));if(!response.ok)return null;
    return await createImageBitmap(await response.blob(),{colorSpaceConversion:'none'});
  }catch{return null;}
}
export async function makeTextures(device) {
  const [pigment,relief,skyImage,soil,streetStone]=await Promise.all(['stone-color.webp','stone-relief.webp','day-sky.webp','garden-soil.webp','street-stone.webp'].map(imageAsset));
  const size=512, count=surface.herb+1, canvas=document.createElement('canvas');
  canvas.width=canvas.height=size;
  const ctx=canvas.getContext('2d',{willReadFrequently:true}), rng=seeded(714);
  const tex=device.createTexture({label:'Generated Roman materials',size:[size,size,count],format:'rgba8unorm',mipLevelCount:10,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});
  const mipCanvas=document.createElement('canvas');
  mipCanvas.width=mipCanvas.height=size;
  const mip=mipCanvas.getContext('2d',{willReadFrequently:true});
  mip.globalCompositeOperation='copy';
  const gray=n=>'rgb('+n+','+n+','+n+')';
  function fill(t){ctx.fillStyle=t;ctx.fillRect(0,0,size,size);}
  function rect(x,y,w,h,t){ctx.fillStyle=t;ctx.fillRect(x,y,w,h);}
  function line(points,color,width){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function noise(strength){
    const img=ctx.getImageData(0,0,size,size),p=img.data;
    for(let i=0;i<p.length;i+=4){const a=(rng()-.5)*strength;
      for(let j=0;j<3;j++)p[i+j]+=a;
    } ctx.putImageData(img,0,0);
  }
  function mineral(veins){
    for(let i=0;i<4200;i++){
      const x=rng()*size,y=rng()*size,r=rng()**4*2+.35;
      ctx.fillStyle=i%3?'rgba(55,42,23,.10)':'rgba(255,255,245,.18)';
      ctx.fillRect(x,y,r*(veins?2.8:1),r);
    }
    if(veins) for(let i=0;i<72;i++){
      const x=rng()*size,y=rng()*size,dx=2+rng()*17;
      line([[x,y],[x+dx*.4,y+rng()*1.4],[x+dx,y-1]],'rgba(81,65,43,.13)',.5+rng());
    }
  }
  function cobbles(){
    // Periodic Voronoi blocks. Shared boundaries keep the joints continuous.
    const n=6,cell=size/n, sites=[];
    for(let z=0;z<n;z++)for(let x=0;x<n;x++)sites.push([x+.15+rng()*.70,z+.15+rng()*.70,182+rng()*40]);
    for(let z=-1;z<=n;z++)for(let x=-1;x<=n;x++){
      const seed=(a,b)=>sites[((b%n+n)%n)*n+((a%n+n)%n)];
      const p=seed(x,z), px=cell*(Math.floor(x/n)*n+p[0]),py=cell*(Math.floor(z/n)*n+p[1]);
      let poly=[[-130,-130],[130,-130],[130,130],[-130,130]];
      for(let b=z-2;b<=z+2;b++)for(let a=x-2;a<=x+2;a++){
        if(a===x&&b===z)continue;
        const q=seed(a,b),dx=(Math.floor(a/n)*n+q[0])*cell-px,dy=(Math.floor(b/n)*n+q[1])*cell-py,h=(dx*dx+dy*dy)/2,next=[];
        for(let k=0;k<poly.length;k++){const s=poly[k],e=poly[(k+1)%poly.length],ds=s[0]*dx+s[1]*dy-h,de=e[0]*dx+e[1]*dy-h;
          if(ds<=0)next.push(s);if((ds<0)!==(de<0)){const u=ds/(ds-de);next.push([s[0]+u*(e[0]-s[0]),s[1]+u*(e[1]-s[1])]);}}
        poly=next;
      }
      if(!poly.length)continue;
      ctx.beginPath();poly.forEach(([a,b],k)=>k?ctx.lineTo(px+a,py+b):ctx.moveTo(px+a,py+b));ctx.closePath();
      ctx.fillStyle=gray(Math.round(p[2]));ctx.fill();ctx.lineJoin='round';ctx.strokeStyle='#756e60';ctx.lineWidth=3;ctx.stroke();
      for(let k=0;k<poly.length;k++){const a=poly[k],b=poly[(k+1)%poly.length];if(b[0]-a[0]>10)line([[px+a[0]*.97,py+a[1]*.97],[px+b[0]*.97,py+b[1]*.97]],'rgba(255,250,226,.42)',1.9);}
    }
  }
  function uploadMips(texture,layer,source,levels){
    let w=source.width;
    for(let level=0;level<levels;level++){
      if(level)mip.drawImage(level===1?source:mipCanvas,0,0,w*2,w*2,0,0,w,w);
      const rgba=(level?mip:source.getContext('2d')).getImageData(0,0,w,w).data;
      device.queue.writeTexture({texture,mipLevel:level,origin:[0,0,layer]},rgba,{bytesPerRow:w*4},[w,w,1]);
      w>>=1;
    }
  }
  function chip(image,layer,dest,width){
    const n=image.width/2;
    dest.drawImage(image,(layer%2)*n,Math.floor(layer/2)*n,n,n,0,0,width,width);
  }
  for(let layer=0;layer<count;layer++){
    fill('#e5e1d9');
    switch(layer){
      case surface.lime: mineral(true);noise(17);break;
      case surface.plaster: mineral(false);noise(13);break;
      case surface.brick:
        fill('#bc9b88');
        for(let row=0;row<16;row++)for(let i=-1;i<6;i++){
          const w=size/5,x=(i+(row%2)*.5)*w,y=row*32,v=178+rng()*45|0;
          rect(x+1,y+2,w-3,28,'rgb('+v+','+(v-12)+','+(v-17)+')');
          rect(x+3,y+3,w-7,2,'rgba(255,244,221,.41)');
        }mineral(true);noise(18);break;
      case surface.paving: fill('#8e8575');cobbles();mineral(true);noise(23);break;
      case surface.roof:
        for(let y=0;y<6;y++)for(let x=0;x<8;x++){const px=x*64,py=y*size/6,v=185+rng()*30|0;
          rect(px,py,64,size/6,gray(v));rect(px,py,64,3,'#9a8274');
          const g=ctx.createLinearGradient(px,py,px+18,py);g.addColorStop(0,'#8d7767');g.addColorStop(.39,'#e6dace');g.addColorStop(.65,'#faf0df');g.addColorStop(1,'#ad9786');rect(px,py+1,18,size/6-1,g);
        }noise(12);break;
      case surface.wood:
        fill('#c5b4a0');
        for(let i=0;i<840;i++){const x=rng()*size,y=rng()*size;
          line([[x,y],[x+1,y+9],[x-1.5,y+22]],i%3?'rgba(53,37,24,.12)':'rgba(251,238,212,.3)',rng()*1.5+.4);}
        for(let i=0;i<6;i++)rect(i*size/6,0,2.7,size,'#837465');noise(15);break;
      case surface.linen:fill('#ece5d9');for(let x=0;x<size;x+=4){rect(x,0,1,size,'#d0c5b6');rect(0,x,size,1,'#e1d5c7');}noise(9);break;
      case surface.metal:fill('#dfdfd7');mineral(false);noise(15);break;
      case surface.garden:fill('#b7b2a0');mineral(true);noise(63);break;
      case surface.mosaic:
        fill('#e2d7bc');for(let z=0;z<32;z++)for(let x=0;x<32;x++){
          const ring=Math.max(Math.abs((x+8)%16-8),Math.abs((z+8)%16-8));
          const c=ring===6||ring===3?'#494344':ring===5?'#a0563c':ring<2?'#5b6964':'#dfd5b7';rect(x*16+.7,z*16+.7,14.7,14.7,c);
        }noise(20);break;
      case surface.water: fill('#edf5eb');break;
      case surface.leaf: fill('#c7c8b8');mineral(false);noise(43);break;
      case surface.sprig:{
        ctx.clearRect(0,0,size,size);
        // Layered sprays of cypress foliage with transparent space between tips.
        for(let j=0;j<74;j++){
          const a=j/74, y=490-a*451,reach=23+126*Math.sin(a*Math.PI)**.68;
          for(const sign of [-1,1]){
            const len=reach*(.72+rng()*.52),x=254+sign*len,endY=y-37-rng()*40;
            line([[252,y+20],[254+sign*len*.49,y-2],[x,endY]],'#888b6c',3+7*(1-a));
            for(let k=0;k<13;k++){
              const u=k/13,px=254+sign*len*u,py=y+11-(y+11-endY)*u*u,l=(1-u*.58)*(13+rng()*29);
              line([[px,py],[px+sign*l*.43,py-l*.50],[px+sign*l*.69,py-l]],k%3?'#bec5a3':'#e0dfba',2+rng()*3);
            }
          }
        }
        break;
      }
      case surface.fresco:{
        fill('#a04c37');
        for(let k=0;k<330;k++){
          const x=rng()*512,y=rng()*512,rad=12+rng()*65;
          const wash=ctx.createRadialGradient(x,y,0,x,y,rad);
          wash.addColorStop(0,k%3?'rgba(231,171,112,.10)':'rgba(80,49,34,.16)');wash.addColorStop(1,'rgba(180,110,65,0)');
          ctx.fillStyle=wash;ctx.fillRect(x-rad,y-rad,rad*2,rad*2);
        }
        for(const [gap,col,w] of [[7,'#4c5149',13],[19,'#d6ad68',4],[27,'#ddc08a',1.8],[45,'#bf9465',2]]){
          ctx.strokeStyle=col;ctx.lineWidth=w;ctx.strokeRect(gap,gap,512-2*gap,512-2*gap);
        }
        for(let j=0;j<2;j++)for(let k=0;k<24;k++){
          const t=k/23,a=2.34-t*2.28,sgn=j?1:-1,x=256+sgn*68*Math.sin(a),y=252+66*Math.cos(a);
          ctx.save();ctx.translate(x,y);ctx.rotate(sgn*(1.55-a));ctx.fillStyle=k%3?'#ccae6f':'#d8bc82';
          ctx.beginPath();ctx.ellipse(0,0,3.8,8,0,0,6.28);ctx.fill();ctx.restore();
        }
        ctx.fillStyle='#d7b77a';ctx.beginPath();ctx.ellipse(256,252,10,5,0,0,6.28);ctx.fill();
        line([[256,252],[256,264],[250,267],[262,267]],'#d7b77a',2);
        mineral(false);noise(19);break;
      }
      case surface.herb:{
        ctx.clearRect(0,0,size,size);
        for(let i=0;i<24;i++){
          const bx=244+(rng()-.5)*128,tx=50+rng()*408,ty=26+rng()*200;
          line([[bx,501],[bx+(tx-bx)*.44,325],[tx,ty]],'#77835b',3.2);
          for(let j=0;j<17;j++){
            const t=j/17,px=bx+(tx-bx)*t,py=500+(ty-500)*t;
            const side=j%2?1:-1;line([[px,py],[px+side*(10+rng()*23),py-14]],'#9eac7b',5);
          }
          for(let j=0;j<9;j++){
            ctx.beginPath();ctx.fillStyle=j%3?'#a699b9':'#c1b1c9';ctx.ellipse(tx+(rng()-.5)*10,ty+j*2.5,3+rng()*2,4,.25,0,6.28);ctx.fill();
          }
        }break;
      }
      case surface.bough:{
        ctx.clearRect(0,0,size,size);
        // An olive spray with a twig, opposite pairs of leaves and silver undersides.
        for(let twig=-2;twig<=2;twig++){
          const xt=255+twig*90,yt=32+Math.abs(twig)*48;
          line([[254,505],[255+twig*33,287],[xt,yt]],'#70694c',4);
          for(let k=0;k<17;k++){
            const t=(k+1)/18,x=254+(xt-254)*t*t,y=492+(yt-492)*t;
            for(const side of [-1,1]){
              const dx=side*(23+31*rng()),dy=-22-35*rng(),w=3+6*rng();
              ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+dx*.48+w,y+dy*.5-w,x+dx,y+dy);
              ctx.quadraticCurveTo(x+dx*.56-w,y+dy*.56+w,x,y);
              ctx.fillStyle=['#c8cbb5','#dde1c8','#9eae8c','#a8b893','#e2e2c9'][Math.floor(rng()*5)];ctx.fill();
            }
          }
        }break;
      }
      case surface.ashlar:
        fill('#a79983');
        for(let row=0;row<5;row++)for(let x=-1;x<5;x++){
          const w=128,h=size/5,px=(x+(row%2)*.5)*w,py=row*h;
          rect(px+1.4,py+1.6,w-2.8,h-3.3,gray(212+rng()*19|0));
          rect(px+2.5,py+2,w-5,2,'rgba(254,246,220,.44)');
        }mineral(true);noise(22);break;
      case surface.meander:
        fill('#d5c4a3');for(const y of [40,62,443,464])rect(0,y,size,7,'#6a5b48');
        for(let i=-1;i<3;i++){const x=i*256;line([[x-20,135],[x+180,135],[x+180,343],[x+48,343],[x+48,220],[x+113,220],[x+113,274]],'#78614c',25);}
        for(let x=0;x<512;x+=16){rect(x,0,1.5,512,'#bcab8f');rect(0,x,512,1.5,'#bcab8f');}noise(14);break;
      default:
        fill('#e1cdaa');mineral(true);ctx.strokeStyle='#9f7950';ctx.lineWidth=3;ctx.strokeRect(10,112,492,288);
        ctx.fillStyle='#593b2b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 98px Georgia,serif';
        ctx.save();ctx.translate(256,256);ctx.scale(1,2.68);ctx.fillText(words[layer-surface.labels],0,2,458);ctx.restore();break;
    }
    if(pigment&&layer<=3)chip(pigment,layer,ctx,size);
    if(streetStone && (layer===surface.paving || layer===surface.ashlar)){
      chip(streetStone,layer===surface.paving?0:1,ctx,size);
    }
    if(soil && layer===surface.garden)ctx.drawImage(soil,0,0,size,size);
    uploadMips(tex,layer,canvas,10);
  }
  const detailSize=512,detail=device.createTexture({label:'Stone relief and roughness',size:[detailSize,detailSize,5],
    format:'rgba8unorm',mipLevelCount:10,usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});
  canvas.width=canvas.height=detailSize;
  for(let layer=0;layer<5;layer++){
    ctx.fillStyle='#8080cd';ctx.fillRect(0,0,detailSize,detailSize);
    if(relief && layer<4)chip(relief,layer,ctx,detailSize);
    if(streetStone && layer>=3)chip(streetStone,layer-1,ctx,detailSize);
    uploadMips(detail,layer,canvas,10);
  }
  const width=skyImage?.width||1,height=skyImage?.height||1;
  const sky=device.createTexture({label:'Daylight sky',size:[width,height],format:'rgba8unorm',
    usage:GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_DST});
  canvas.width=width;canvas.height=height;if(skyImage)ctx.drawImage(skyImage,0,0);
  device.queue.writeTexture({texture:sky},ctx.getImageData(0,0,width,height).data,{bytesPerRow:width*4},[width,height]);
  streetStone?.close();soil?.close();pigment?.close();relief?.close();skyImage?.close();
  return {material:tex,detail,sky,hasSky:!!skyImage};
}
