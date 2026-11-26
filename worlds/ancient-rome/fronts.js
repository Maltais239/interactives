// Street-facing openings are cut into the plaster skin in local metres (+Z faces the street).
// The solid wall immediately behind the reveals also closes the building for navigation.
import {surface as M} from './texture.js?v=city1';

const reveal=.26;
const shutterPaint=[0x86705a,0x697b69,0x85634b,0x907352,0x7e5e49];
const planks=[0x826447,0x77593e,0x8b7051,0x785d43,0x927350];
function panel(g,l,b,r,t,z,color,mat){
  if(r-l>.001 && t-b>.001)g.face([[l,b,z],[r,b,z],[r,t,z],[l,t,z]],color,mat);
}
function windowFrame(g,{x,y,w,h,screen},style){
  const wood=shutterPaint[style%shutterPaint.length],l=x-w/2,r=x+w/2,t=y+h;
  panel(g,l,y,r,t,-reveal+.012,0x302c25,M.wood);
  for(let i=1;i<=3;i++)g.box(l+w*i/4,y+.04,-.19,.028,h-.08,.035,0x5b4b37,M.wood);
  g.box(x,y+h*.53,-.17,w,.046,.045,0x64503a,M.wood);
  // Splayed plaster jambs and a projecting sill catch sun on opposite sides of the opening.
  for(const side of [-1,1]){
    const x0=x+side*w/2,xi=x0-side*.05;
    const points=[[x0,y,0],[xi,y+.04,-reveal],[xi,t-.04,-reveal],[x0,t,0]];
    g.face(side<0?points:points.reverse(),0xd5c4a3,M.facade);
  }
  g.face([[l,t,0],[r,t,0],[r-.05,t-.04,-reveal],[l+.05,t-.04,-reveal]],0xcbbb9e,M.facade);
  g.box(x,y-.10,-.025,w+.23,.075,.44,0xb9a286);
  g.box(x,y-.032,-.013,w+.30,.058,.48,0xdfcfaf);
  g.box(x,t-.015,-.012,w+.28,.115,.21,0xb49771);
  g.box(x,t+.10,-.018,w+.38,.055,.27,0xd6c3a1);
  if(screen)return;
  // Each leaf has its own hinge angle. Raised battens throw a narrow shadow across the grain.
  for(const side of [-1,1]){
    const angles=[.24,.62,.38,1.29,.20,2.55,.84];
    const angle=angles[(style+(side<0?2:0))%angles.length], span=w*.49;
    g.frame(x+side*(w*.5+.015),.065,-side*angle,()=>{
      for(let k=0;k<3;k++){
        const px=side*(k+.5)*span/3;
        g.box(px,y+.025,0,span/3-.012,h-.048,.047,wood,M.wood);
      }
      for(const ht of [.19,.78]){
        g.box(side*span*.5,y+ht*h,.039,span,.066,.036,0x69543c,M.wood);
        g.box(side*.035,y+ht*h,.065,.055,.045,.022,0x605a4a,M.metal);
      }
    });
  }
}
function houseDoor(g,{x,y,w,h},style){
  const z=-.17,l=x-w/2,r=x+w/2;
  for(const side of [-1,1]){
    const joint=.009,parts=5;
    for(let j=0;j<parts;j++){
      const width=.14+(j%2)*.035;
      g.box(x+side*(w/2+width/2-.045),y+j*h/parts,0,width,h/parts-joint,.33,j%2?0xd3b999:0xc9b08e);
    }
  }
  panel(g,l,y,r,y+h,z-.036,0x47372d,M.wood);
  for(let i=0;i<6;i++)g.box(l+(i+.5)*w/6,y+.05,z,w/6-.011,h-.10,.071,planks[(i+style)%planks.length],M.wood);
  for(const side of [-1,1])for(const level of [.17,.80]){
    g.box(x+side*w*.25,y+h*level,z+.045,w*.46,.096,.050,0x6b5038,M.wood);
  }
  g.box(x,y+h-.05,0,w+.36,.20,.39,0xd8bfa0);
  g.box(x,y+h+.15,.028,w+.48,.07,.44,0xe4cfae);
  g.box(x,y,.075,w+.18,.082,.57,0xd1c0a2);
  const hx=x+w*.15,hy=y+1.05;
  g.box(hx,hy,z+.07,.08,.12,.038,0x69563e,M.metal);
  for(let k=0;k<8;k++){
    const at=j=>[hx+.041*Math.cos(j*Math.PI/4),hy-.037+.052*Math.sin(j*Math.PI/4),z+.127];
    g.beam(at(k),at(k+1),.010,0x87714b,M.metal,5);
  }
}
export function streetFront(g,w,d,bottom,top,color,openings,style){
  const left=-w/2,right=w/2;
  g.box(0,bottom,-(d+reveal)/2,w,top-bottom,d-reveal,color,M.facade);
  g.block(0,-d/2,w,d,bottom,top);
  for(const x of [left,right]){
    const face=[[x,bottom,-reveal],[x,bottom,0],[x,top,0],[x,top,-reveal]];
    g.face(x===left?face:face.reverse(),color,M.facade);
  }
  g.face([[left,top,0],[right,top,0],[right,top,-reveal],[left,top,-reveal]],color,M.facade);
  if(bottom>0)g.face([[left,bottom,-reveal],[right,bottom,-reveal],[right,bottom,0],[left,bottom,0]],color,M.facade);
  const levels=[...new Set([bottom,top,...openings.flatMap(o=>[o.y,o.y+o.h])])].sort((a,b)=>a-b);
  for(let j=1;j<levels.length;j++){
    const y=levels[j-1],t=levels[j];let last=left;
    const row=openings.filter(o=>o.y<t && o.y+o.h>y).sort((a,b)=>a.x-b.x);
    for(const o of row){panel(g,last,y,o.x-o.w/2,t,0,color,M.facade);last=o.x+o.w/2;}
    panel(g,last,y,right,t,0,color,M.facade);
  }
  openings.forEach((o,i)=>o.door?houseDoor(g,o,style):windowFrame(g,o,style+i*2));
}
export function paintedBand(g,left,right,y,h,z,color){
  panel(g,left,y,right,y+h,z,color,M.facade);
}
