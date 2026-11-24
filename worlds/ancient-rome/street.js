// Small street details are grown from a fixed seed, in metres.
import {surface as M,seeded} from './texture.js?v=forum2';
const tau=Math.PI*2;
const palette=(list,r)=>list[Math.floor(r()*list.length)];
const shade=(color,k)=>[16,8,0].reduce((v,s)=>v+(Math.min(255,Math.round((color>>s&255)*k))<<s),0);

export function forumSlabs(g){
  const random=seeded(4512);
  for(let z=-13.55;z<24;){
    const next=Math.min(24,z+.64+random()*.57);
    for(let x=-13.32;x<12.68;){
      const end=Math.min(12.68,x+1.05+random()*1.34);
      const left=x+.008,right=end-.008,north=z+.007,south=next-.007;
      if(right-left>.07){
        const chip=()=>Math.min((right-left)*.18,.015+random()**3*.14);
        const outline=[[left+chip(),south],[right-chip(),south],[right,south-chip()],[right,north+chip()],
          [right-chip(),north],[left+chip(),north],[left,north+chip()],[left,south-chip()]];
        const cx=(left+right)/2,cz=(north+south)/2,h=.036+random()*.010;
        const shiftX=random()*16,shiftY=random()*16,tilt=(random()-.5)*.008;
        const top=outline.map(([a,b])=>[a+Math.sign(cx-a)*.016,h+(a-cx)*tilt,b+Math.sign(cz-b)*.016]);
        const base=outline.map(([a,b])=>[a,.014,b]);
        const color=shade(palette([0xe1d5c2,0xdad0bf,0xddd1bd,0xd8cdbb],random),.94+.085*random());
        const uv=p=>[p[0]/2.0+shiftX,p[2]/2.0+shiftY];
        const center=[cx,h,cz];
        for(let k=0;k<8;k++){
          const j=(k+1)%8, tri=[center,top[k],top[j]];
          g.face(tri,color,M.lime,tri.map(uv));
          g.face([base[k],base[j],top[j],top[k]],shade(color,.91),M.lime);
        }
      }
      x=end;
    }
    z=next;
  }
}
function foliageCard(g,x,y,z,w,h,a,lean,material,color,raised=0){
  const c=Math.cos(a),s=Math.sin(a),n=[s*.62,.78,c*.62];
  const corners=[[-1,0],[1,0],[1,1],[-1,1]].map(([side,t])=>
    [x+side*w*c+t*lean*s,y+h*t+side*raised,z-side*w*s+t*lean*c]);
  g.face(corners,color,material,[[0,1],[1,1],[1,0],[0,0]],[n,n,n,n]);
}
function limb(g,a,b,r1,r2,color,twist=0){
  const n=9,dx=b[0]-a[0],dz=b[2]-a[2],dy=b[1]-a[1],length=Math.hypot(dx,dy,dz);
  const horizontal=Math.hypot(dx,dz);
  const u=horizontal>.001?[dz/horizontal,0,-dx/horizontal]:[1,0,0];
  const v=[dy*u[2]/length,(dz*u[0]-dx*u[2])/length,-dy*u[0]/length];
  const vertex=(p,r,k)=>{const t=tau*k/n+twist,radius=r*(1+.12*Math.sin(t*5));return p.map((x,j)=>x+radius*(u[j]*Math.cos(t)+v[j]*Math.sin(t)));};
  for(let i=0;i<n;i++)g.face([vertex(a,r1,i),vertex(b,r2,i),vertex(b,r2,i+1),vertex(a,r1,i+1)],shade(color,.91+.11*Math.sin(i*3)**2),M.wood);
}
export function growTree(g,x,z,h,kind,solid=true){
  const r=seeded(92334+Math.round((x+180)*188+(z+140)*35));
  const foliage=kind==='cypress'?M.sprig:M.bough;
  g.frame(x,z,r()*tau,()=>{
    if(kind==='cypress'){
      g.post(0,0,0,[[0,.032*h],[.4,.030*h],[h*.88,.012*h]],0x70644d,M.wood,10);
      // Each spray is attached to a rising bough. Gaps between their tips show the sky.
      for(let k=0;k<315;k++){
        const f=k/315,y=h*(.10+.865*f),a=k*2.39996+r()*.68;
        const crown=(.055+.105*Math.sin(Math.PI*f)**.67)*(1-.84*f*f),width=crown*h;
        const distance=width*(.34+.58*r());
        const lift=(.07+.062*r())*h*(1-.29*f);
        foliageCard(g,Math.sin(a)*distance,y,Math.cos(a)*distance,
          width*(.32+.29*r()),lift,a,width*(.16+.38*r()),foliage,shade(0x61754f,.65+.39*r()));
      }
    }else{
      const pine=kind==='pine',bark=pine?0x7f6853:0x817866, crown=pine?.30:.43;
      const b0=[0,0,0], b1=[-.035*h,h*(pine?.37:.22),.026*h],b2=[.022*h,h*(pine?.56:.37),.008*h];
      limb(g,b0,b1,h*(pine?.032:.065),h*(pine?.025:.046),bark);
      limb(g,b1,b2,h*(pine?.025:.047),h*.035,bark);
      for(let k=0;k<(pine?9:8);k++){
        const a=k*2.39996+r()*.62, reach=h*crown*(.62+.48*r());
        const p=[Math.cos(a)*reach*.46,h*(pine?.68:.50)+r()*.42,Math.sin(a)*reach*.52];
        const tip=[Math.cos(a)*reach,h*(pine?.78:.67)+r()*h*.09,Math.sin(a)*reach];
        limb(g,b2,p,h*(pine?.019:.034),h*.017,bark,k);
        limb(g,p,tip,h*.018,h*.010,bark,k);
        for(let j=0;j<5;j++){
          const ang=a+(j-2)*.69,dist=h*(.072+.073*r());
          const end=[tip[0]+Math.cos(ang)*dist,tip[1]+h*(.06+.10*r()),tip[2]+Math.sin(ang)*dist];
          limb(g,tip,end,h*.009,h*.0028,bark,j);
          for(let m=0;m<(pine?10:17);m++){
            const az=r()*tau,rr=h*(.01+.093*Math.sqrt(r())),px=end[0]+Math.sin(az)*rr,pz=end[2]+Math.cos(az)*rr;
            const py=end[1]+h*(r()-.53)*(pine?.065:.14);
            foliageCard(g,px,py,pz,h*(pine?.042+.046*r():.073+.070*r()),h*(pine?.032+.047*r():.092+.089*r()),az,
              h*(.034+.11*r()),pine?M.sprig:M.bough,shade(pine?0x68764c:0x788964,.80+.27*r()),h*(r()-.5)*.043);
          }
        }
      }
    }
    if(solid)g.block(0,0,h*(kind==='olive'?.13:.072),h*(kind==='olive'?.13:.072));
  });
}
export function marketBarrow(g,x,z,angle){
  const r=seeded(3781),wood=0x815a3b;
  g.frame(x,z,angle,()=>{
    for(const side of [-1,1]){
      g.box(side*.98,0,0,.10,.80,.11,wood,M.wood);
      g.box(side*.98,0,-.9,.10,2.85,.12,wood,M.wood);
      g.beam([side*.98,1.90,.94],[side*.98,2.83,-.88],.037,wood,M.wood);
      g.beam([side*.98,.65,0],[side*.98,1.93,.94],.033,wood,M.wood);
    }
    for(let i=0;i<6;i++)g.box(0,.77,-.90+i*.20,2.28,.095,.195,wood,M.wood);
    g.block(0,-.4,2.30,1.1,0,.89);
    for(let k=0;k<16;k++){
      const l=-1.24+k*.155,color=k%6===0?0x9c603c:k%6===1?0xd4aa6d:0xe1c38c;
      const p=(x,t)=>[x,2.85-.89*t-.19*Math.sin(Math.PI*t)+.035*Math.sin(x*10+t*2),-.99+1.98*t];
      for(let j=0;j<6;j++)g.face([p(l,j/6),p(l,(j+1)/6),p(l+.155,(j+1)/6),p(l+.155,j/6)],color,M.linen);
      let a=p(l,1),b=p(l+.155,1);g.face([[l,a[1]-.13,.986],[l+.155,b[1]-.14,.986],b,a],color,M.linen);
    }
    for(let i=0;i<3;i++)for(let j=0;j<2;j++){
      const cx=(i-1)*.67,cz=-.15-j*.43;
      g.post(cx,.855,cz,[[0,.17],[.09,.23],[.14,.24],[.17,.245],[.17,.218],[.1,.19]],0xb29060,M.wood,17);
      for(let k=0;k<12;k++){
        const a=k*2.39996,dist=.17*Math.sqrt(k/12);
        g.post(cx+Math.sin(a)*dist,1.002+(1-k/12)*.040,cz+Math.cos(a)*dist,
          [[0,.030],[.035,.054],[.072,.045],[.083,.019]],shade([0x766338,0x9d7140,0xa24e3d][i],.83+.31*r()),M.plaster,7);
      }
    }
  });
}

export function herbBed(g,x,z,width,depth,seed){
  const r=seeded(seed);
  // Repeated slender shoots make mounds with an irregular edge and open soil between them.
  for(let row=0;row<3;row++)for(let col=0;col<4;col++){
    const cx=x+((col+.45+r()*.12)/4-.5)*width,cz=z+((row+.48+r()*.12)/3-.5)*depth;
    const size=.30+r()*.25,flower=(row+col)%3===0;
    for(let j=0;j<14;j++){
      const a=j*2.39996+r()*.54,d=Math.sqrt(r())*size*.60;
      foliageCard(g,cx+Math.cos(a)*d,.31,cz+Math.sin(a)*d,size*(.25+.18*r()),size*(.75+.47*r()),a,
        size*(.18+.45*r()),flower?M.herb:M.bough,flower?0xe4e1cb:shade(0x899b77,.74+.25*r()));
    }
  }
}
export function balcony(g,x,y,z,w,cloth){
  const wood=0x79543c;
  for(const side of [-1,1]){
    g.beam([x+side*w*.37,y-.71,z+.11],[x+side*w*.37,y-.05,z+.93],.081,wood,M.wood,7);
    g.box(x+side*w*.48,y,z+.89,.09,.88,.10,wood,M.wood);
  }
  for(let i=0;i<6;i++)g.box(x,y-.1,z+.17+i*.15,w,.11,.145,wood,M.wood);
  for(let i=0;i<9;i++)g.box(x-w*.46+i*w*.115,y,z+.88,.048,.78,.054,wood,M.wood);
  g.box(x,y+.77,z+.88,w+.12,.085,.12,wood,M.wood);
  // Linen tucks over the railing and hangs unevenly over its front.
  for(let i=0;i<14;i++){
    const pt=(k,t)=>{const u=k/14;return [x+w*(u*.56-.21),y+.83-t*(.69+.076*Math.sin(4*u)),
      z+.96+.033*Math.sin(u*25)*(.42+t*.58)];};
    for(let j=0;j<3;j++)g.face([pt(i,j/3),pt(i,(j+1)/3),pt(i+1,(j+1)/3),pt(i+1,j/3)],
      i===1||i===12?0xd3ad74:cloth,M.linen);
  }
}
export function capital(g,x,y,z,r,light){
  // The rolled ends are modeled on both faces so their undercuts cast a real shadow.
  for(const depth of [-.88,.88]){
    for(const side of [-1,1]){
      const point=k=>{
        const t=k/18,angle=t*2.11*Math.PI;
        const radius=(.30*(1-t)+.028)*r;
        return [x+side*(r*.85+radius*Math.sin(angle)),y+radius*Math.cos(angle),z+depth*r];
      };
      for(let j=0;j<18;j++)g.beam(point(j),point(j+1),.047*r,light,M.lime,6);
      g.beam([x+side*r*.85,y,z-.88*r],[x+side*r*.85,y,z+.88*r],r*.22,light,M.lime,12);
    }
    g.beam([x-r*.86,y+r*.31,z+depth*r],[x+r*.86,y+r*.31,z+depth*r],r*.05,light,M.lime,8);
  }
}

// A compact scan supplies the carving. All stonework, water and setting are generated.
export async function installFountainLion(g){
  try{
    const response=await fetch(new URL('./fountain-lion.bin',import.meta.url));
    if(!response.ok)return;
    const data=new DataView(await response.arrayBuffer());
    const vertices=data.getUint16(0,true),indices=data.getUint16(2,true);
    if(data.byteLength!==4+vertices*10+indices*2)return;
    const first=g.data.length/12,scale=1.56,yaw=.10,c=Math.cos(yaw),s=Math.sin(yaw);
    for(let k=0;k<vertices;k++){
      const offset=4+k*10,x=data.getInt16(offset,true)/30000,y=data.getInt16(offset+2,true)/30000,z=data.getInt16(offset+4,true)/30000;
      const nx=data.getInt8(offset+6)/127,ny=data.getInt8(offset+7)/127,nz=data.getInt8(offset+8)/127;
      const patina=data.getUint8(offset+9)/255,light=.39+.61*patina;
      g.data.push(7.4+scale*(x*c+z*s),2.18+y*scale,1.2+scale*(z*c-x*s),nx*c+nz*s,ny,nz*c-nx*s,x,y,
        .49*light,.435*light,.315*light,M.metal);
    }
    for(let k=0;k<indices;k++)g.indices.push(first+data.getUint16(4+vertices*10+k*2,true));
    const stream=t=>[7.4+(.265+.71*t)*s,2.85+.13*t-.92*t*t,1.2+(.265+.71*t)*c];
    for(let j=0;j<13;j++)g.beam(stream(j/13),stream((j+1)/13),.017-.005*j/13,0xb7c9bf,M.water,6);
  }catch{return;}
}
