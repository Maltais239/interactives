// All surfaces are painted into a repeatable local texture array at startup.
export const surface = {lime:0, plaster:1, brick:2, paving:3, roof:4, wood:5, linen:6, metal:7, garden:8, mosaic:9, water:10, leaf:11, labels:12,sprig:21,ashlar:22,meander:23};
export const words=['CONCORDIA','PANIS','OLEVM','VINVM','POMA','VICVS AVREVS','HORTVS','FORVM','SALVE'];
export function seeded(seed) {
  return () => {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
}
export function makeTextures(device) {
  const size=512, count=surface.meander+1, canvas=document.createElement('canvas');
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
    for(let level=0;level<10;level++){
      const w=size>>level;
      if(level)mip.drawImage(level===1?canvas:mipCanvas,0,0,w*2,w*2,0,0,w,w);
      const rgba=(level?mip:ctx).getImageData(0,0,w,w).data;
      device.queue.writeTexture({texture:tex,mipLevel:level,origin:[0,0,layer]},rgba,{bytesPerRow:w*4},[w,w,1]);
    }
  }
  return tex;
}
