// Local metres, east = +x, north = -z. The reference point is 41.88900 N, 12.48084 E.
// The main Portunus rectangle excludes the projecting staircase in the mapped outline.
import {surface as M,seeded} from './texture.js?v=quarter1';
import {growTree,marketBarrow,forumSlabs} from './street.js?v=quarter1';
import {buildMarketQuarter,drawMarketPlan} from './market-quarter.js?v=quarter1';
const PI=Math.PI,TAU=PI*2,rad=PI/180;
export const port={x:5.65,z:-26.29,yaw:-162.55*rad};
export const hercules={x:-6.52,z:28.80};
const bridgeAngle=12.75*rad,bridgeZ=x=>-37.5-Math.tan(bridgeAngle)*(x+121.5);
export const bank=z=>-48+.22*z;
const bridgeWidth=8.6,riverY=-8.65;
const onBridge=(x,z)=>Math.abs(z-bridgeZ(x))*Math.cos(bridgeAngle)<bridgeWidth/2;
export const stops=[
  {name:'Hercules Victor',x:11.6,z:48.9,yaw:-.76,pitch:.20},
  {name:'Temple of Portunus',x:-8.8,z:-52.9,yaw:2.68,pitch:.20},
  {name:'Tiber landing',x:-42.6,z:21,yaw:-.55,pitch:-.215},
  {name:'Cattle market',x:18.65,z:28.8,yaw:-.94,pitch:-.02},
  {name:'Market street',x:18.1,z:12.1,yaw:.11,pitch:.10},
  {name:'Merchants courtyard',x:35.8,z:1.7,yaw:1.55,pitch:.22},
  {name:'Southern houses',x:8,z:53.3,yaw:2.90,pitch:.20},
  {name:'Pons Aemilius',x:-96,z:bridgeZ(-96),yaw:2.19,pitch:-.025}
];
const stone=0xe2d7c1,pale=0xf3ead5,tufa=0xaa9680,wood=0x816047,bronze=0x897456;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const quayHeight=u=>-6.12+6.12*clamp((u-4)/13.5,0,1);
export function groundHeight(x,z){
  const u=x-bank(z);
  let y=z< -4||z>30?0:quayHeight(u);
  if(onBridge(x,z)&&x<bank(z)+19)y=Math.max(y,.04);
  return y+.025;
}
export function withinDistrict(x,z){
  if(x>36.5 && x<49 && z> -6 && z<10.15)return true;
  if(z< -65||z>56||x>36.5)return false;
  if(x<bank(z)+.27)return onBridge(x,z)&&x> -198;
  return true;
}
export function placeAt(x,z){
  if(x>29 && z>-5.8 && z<10.1)return 'Merchants’ courtyard';
  if(onBridge(x,z)&&x<bank(z)+4)return 'Pons Aemilius';
  if(x<bank(z)+14)return 'Tiber landing';
  if(z>52 && x>-26 && x<36)return 'Southern houses';
  if(x>8&&z>15&&z<32)return 'Cattle market';
  if(Math.hypot(x-hercules.x,z-hercules.z)<29)return 'Hercules Victor';
  if(Math.hypot(x-port.x,z-port.z)<31)return 'Temple of Portunus';
  if(x>13)return 'Market street';
  return 'Forum Boarium';
}
function doorway(g,x,y,z,w,h){
  g.box(x,y,z,w,h,.18,0x654c33,M.wood);
  for(const side of [-1,1]){
    g.box(x+side*w*.53,y,z+.11,.16,h+.12,.29,pale);
    for(let i=0;i<4;i++){
      const yp=y+.21+i*(h-.34)/4;
      g.box(x+side*w*.25,yp,z+.11,w*.414,(h-.62)/4,.065,0x9b805b,M.metal);
      g.box(x+side*w*.25,yp+.065,z+.15,w*.344,(h-.95)/4,.02,0x6c5941,M.wood);
    }
  }
  g.box(x,y+h,z+.09,w+.5,.21,.33,pale);
}
function portunus(g,kit){
  const floor=2.12,cornice=9.87,deep=19,w=10.5;
  g.frame(port.x,port.z,port.yaw,()=>{
    g.box(0,0,0,w+.54,floor,deep+.34,tufa,M.ashlar);
    g.box(0,.22,0,w+.65,.22,deep+.49,stone);g.box(0,floor-.26,0,w+.70,.26,deep+.46,pale);
    g.ramp(0,0,w+.44,deep+.34,floor,floor);g.block(0,0,w+.54,deep+.34,-1,floor);
    const stairs=12,run=4.16,top=deep/2+.17;
    for(let i=0;i<stairs;i++){
      const y=(i+1)*floor/stairs,z=top+run-(i+.5)*run/stairs;
      g.box(0,0,z,7.75,y,run/stairs+.005,stone);
      g.box(0,y-.045,z+.12,7.79,.045,.105,pale);
    }
    g.ramp(0,top+run/2,7.75,run,floor/stairs,floor);
    const side=4.65,last=-8.78,front=8.70,pitch=(front-last)/6;
    g.wall(0,floor,-2.94,side*2,cornice-floor,11.68,0xe7d8bb,M.plaster);
    for(const x of [-side,-side/3,side/3,side])kit.column(x,floor,front,cornice-floor,.42,true);
    for(const s of [-1,1])for(let i=1;i<7;i++)kit.column(s*side,floor,front-i*pitch,cornice-floor,.42,true);
    for(const x of [-side/3,side/3])kit.column(x,floor,last,cornice-floor,.42,true);
    doorway(g,0,floor,2.97,2.73,4.95);
    // Moldings and dentils catch the warm grazing light under the eaves.
    for(const [y,h,offset,col] of [[0,.23,.06,pale],[.23,.38,.14,stone],[.61,.09,.22,0xb88c65],[.70,.41,.12,pale],[1.11,.20,.40,pale]]){
      g.box(0,cornice+y,0,w+offset,h,deep+offset,col);
    }
    for(const z of [-9.67,9.67])for(let i=0;i<32;i++)g.box(-5.16+i*.334,cornice+.99,z,.16,.16,.19,stone);
    kit.roof(0,cornice+1.32,0,11.22,19.95,1.98,0xb2724d);
    for(const z of [-10.00,10.00])for(const s of [-1,1])g.beam([s*5.70,11.19,z],[0,13.23,z],.122,pale,0,8);
    // The eastern precinct wall follows the older precinct. Leave the access at the rear open.
    g.wall(-8.95,0,-.40,1.16,1.48,31.5,0xb9a88c,M.ashlar);
    for(let i=0;i<7;i++)g.box(-8.21,0,-14+i*4.55,.54,1.45,.63,tufa,M.ashlar);
  });
}
function corinthian(g,x,z,y,h,r){
  g.post(x,y,z,[[0,r*1.27],[.11,r*1.32],[.19,r*1.07],[.27,r*1.18],[.40,r]],pale,0,28);
  g.post(x,y+.4,z,[[0,r],[h*.30,r*.98],[h-.99,r*.78]],pale,0,72,18);
  g.post(x,y+h-.64,z,[[0,r*.82],[.18,r*.98],[.38,r*1.15],[.51,r*1.33]],pale,0,24);
  for(let row=0;row<2;row++)for(let k=0;k<8;k++){
    const a=(k+row*.5)*TAU/8,c=Math.cos(a),s=Math.sin(a);
    const point=(v,side)=>{const radius=r*(.82+.36*v+.18*v*v);
      return [x+radius*c-side*s,y+h-.65+v*.37+row*.16,z+radius*s+side*c];};
    const base=point(0,0),tip=point(1,0),left=point(.46,-.105),right=point(.46,.105);
    const ridge=point(.55,0);ridge[0]+=.046*c;ridge[2]+=.046*s;
    g.face([base,left,ridge],stone);g.face([ridge,left,tip],pale);g.face([tip,right,ridge],pale);g.face([ridge,right,base],stone);
  }
  g.box(x,y+h-.12,z,r*2.94,.13,r*2.94,pale);g.block(x,z,r*1.76,r*1.76,y,y+h);
}
function roundTemple(g){
  const {x,z}=hercules,N=80,steps=7,floor=1.54,h=10.55,shaftR=.428;
  for(let k=0;k<steps;k++){
    const radius=9.18-.25*k,low=k*floor/steps,height=floor/steps;
    g.post(x,low,z,[[0,radius-.035],[.038,radius],[height-.035,radius],[height,radius-.035],[height,.001]],k<3?tufa:stone,0,N);
  }
  const R=6.82;
  for(let i=0;i<20;i++){const a=(i+.5)*TAU/20;corinthian(g,x+Math.cos(a)*R,z+Math.sin(a)*R,floor,h,shaftR);}
  const circle=(r,a,y)=>[x+Math.cos(a)*r,y,z+Math.sin(a)*r];
  // Door opens east. Curved courses alternate their joints around the cella.
  for(let row=0;row<13;row++){
    const y=floor+row*h/13;
    for(let i=0;i<40;i++){
      if(row<7 && (i<2||i>=38))continue;
      const a=i*TAU/40,b=(i+1)*TAU/40;
      const col=[0xe7dfce,0xece2d1,0xe5ddcd,0xeae1cf][(Math.floor((i+row%2)/3)+row*3)%4];
      g.face([circle(4.91,a,y),circle(4.91,a,y+h/13-.013),circle(4.91,b,y+h/13-.013),circle(4.91,b,y)],col,M.lime);
    }
  }
  g.frame(x,z,PI/2,()=>doorway(g,0,floor,4.76,2.96,h*7/13));
  // A close-fitting polygon keeps the colonnade walkable.
  for(let i=0;i<24;i++){const a=i*TAU/24;g.frame(x+Math.sin(a)*4.67,z+Math.cos(a)*4.67,a,()=>g.block(0,0,1.30,.47,floor,floor+h));}
  const eave=floor+h;
  g.post(x,eave,z,[[0,7.27],[.15,7.40],[.28,7.31],[.48,7.39],[.58,7.55],[.88,7.57],[.99,7.70],[1.16,7.85]],pale,0,N);
  for(let k=0;k<120;k++){
    const a=k*TAU/120;
    g.frame(x+Math.sin(a)*7.52,z+Math.cos(a)*7.52,a,()=>g.box(0,eave+.73,0,.19,.13,.20,stone));
  }
  for(let k=0;k<60;k++){
    const a=k*TAU/60,b=(k+1)*TAU/60;
    g.face([circle(4.87,a,eave+.04),circle(4.87,b,eave+.04),circle(7.52,b,eave+.04),circle(7.52,a,eave+.04)],k%3?0xd9c8a9:0xd1c0a3,M.lime);
    if(k%3===0)g.beam(circle(4.90,a,eave+.005),circle(7.28,a,eave+.005),.082,stone,0,6);
  }
  const base=eave+1.13,colors=[0xb87850,0xbc7d56,0xc1845a,0xb57750];
  for(let i=0;i<80;i++){
    const a=i*TAU/80,b=(i+1)*TAU/80;
    const pts=[circle(7.96,a,base),circle(.23,a,base+3.12),circle(.23,b,base+3.12),circle(7.96,b,base)];
    g.face(pts,colors[i%4],M.roof,[[i*.2,2.65],[i*.2,0],[(i+1)*.2,0],[(i+1)*.2,2.65]]);
    if(i%2===0)g.beam(circle(7.97,a,base+.025),circle(.19,a,base+3.16),.045,0xca9568,M.plaster,5);
  }
  g.post(x,base+3.1,z,[[0,.35],[.17,.30],[.26,.15],[.55,.065],[.62,.015]],bronze,M.metal,18);
  return (px,pz)=>{const dist=Math.hypot(px-x,pz-z);return dist>9.18?0:Math.min(steps,1+Math.floor((9.18-dist)/.25))*floor/steps;};
}

function riverfront(g,kit){
  const q=(u,y,z)=>[bank(z)+u,y,z],lo=-134,hi=139;
  function strip(u,v,y,z1,z2,col,mat){
    g.face([q(u,y,z2),q(v,y,z2),q(v,y,z1),q(u,y,z1)],col,mat);
  }
  function riser(u,bottom,top,z1,z2,col,mat){
    g.face([q(u,bottom,z1),q(u,bottom,z2),q(u,top,z2),q(u,top,z1)],col,mat);
  }
  // Quay walls hold the upper ground. One inset flight gives access to the moorings.
  for(const [start,end] of [[lo,-4],[30,hi]]){
    strip(0,17.5,0,start,end,0xd4c7ac,M.paving);riser(0,-10.2,0,start,end,tufa,M.ashlar);
    strip(-.25,.42,.09,start,end,stone,M.lime);
    for(let z=start+1;z<end-2;z+=4.5){
      if(Math.abs(z-bridgeZ(bank(z)))<7)continue;
      const x=bank(z)+.34;
      g.box(x,0,z,.56,.68,.68,stone);g.post(x,.65,z,[[0,.34],[.09,.39],[.18,.30]],pale,0,10);
    }
  }
  const steps=34,base=-6.12;
  strip(0,4,base,-4,30,0xbba98b,M.paving);riser(0,-10,base,-4,30,tufa,M.ashlar);
  for(let i=0;i<steps;i++){
    const u=4+i*13.5/steps,v=u+13.5/steps,y=base+(i+1)*(-base)/steps;
    strip(u,v,y,-4,30,i%4?0xc7b99d:0xcfc1a8,M.lime);riser(u,y+base/steps,y,-4,30,tufa,M.lime);
    for(const z of [-4,30])g.face([q(u,y,z),q(v,y,z),q(v,0,z),q(u,0,z)],tufa,M.ashlar);
  }
  // Quayside working groups: unloaded cargo, tether rings and a deck covered in jars.
  for(const z of [-1,7.8,23.6,28]){
    const x=bank(z)+.52;g.post(x,base,z,[[0,.31],[.27,.25],[.49,.30],[.59,.32],[.63,.20]],0x776149,M.wood,12);
    g.block(x,z,.59,.59,base,base+.65);
  }
  for(let i=0;i<12;i++){const z=1+Math.floor(i/3)*.56,x=bank(z)+1.4+(i%3)*.59;kit.pot(x,base,z,.21+.022*(i%3),[0xc48d64,0xb27750,0xcb986c][i%3]);}
  function boat(cx,cz,len,width,heading,loaded){
    g.frame(cx,cz,heading,()=>{
      const stations=24,y=riverY;
      const at=(i,side,level)=>{
        const f=i/stations,t=Math.abs(f*2-1),half=width*.5*(Math.sin(f*PI)**.64+.015);
        return [side*half*[.21,.84,1,.90][level],y+[-.43,.08,.61,.52][level]+.69*t**3,(f-.5)*len];};
      for(let i=0;i<stations;i++)for(const side of [-1,1]){
        for(let level=0;level<3;level++)g.face([at(i,side,level),at(i+1,side,level),at(i+1,side,level+1),at(i,side,level+1)],level===2?0xb69870:(i%6?0x78503a:0x80573e),M.wood);
        g.beam(at(i,side,2),at(i+1,side,2),.054,0xc29d71,M.wood,6);
        if(i%3===0)g.beam(at(i,side,3),at(i,side,0),.072,wood,M.wood,6);
        if(side===1)g.face([at(i,-1,1),at(i,1,1),at(i+1,1,1),at(i+1,-1,1)],0x8e7153,M.wood);
      }
      for(let j=-2;j<=2;j++)g.box(0,y+.28,j*len*.12,width*.74,.12,.28,wood,M.wood);
      if(loaded){
        const mast=[0,y+6.55,-len*.17],foot=[0,y+.14,-len*.17];
        g.beam(foot,mast,.105,wood,M.wood,10);
        const a=[-width*.99,y+5.47,-len*.15],b=[width*.99,y+5.79,-len*.19];
        g.beam(a,b,.064,wood,M.wood,8);
        const cloth=(u,v)=>[a[0]+(b[0]-a[0])*u,(1-u)*a[1]+u*b[1]-.14-v*(.58+.23*Math.sin(u*PI))+.055*Math.sin(u*37+v*1.7),
          -len*.17+.16*v+.13*Math.sin(u*PI)*Math.sin(v*PI)];
        for(let i=0;i<16;i++)for(let j=0;j<3;j++)g.face([cloth(i/16,j/3),cloth((i+1)/16,j/3),cloth((i+1)/16,(j+1)/3),cloth(i/16,(j+1)/3)],i%4===1?0xc8b18d:0xeee0bd,M.linen);
        for(const end of [at(2,1,2),at(22,-1,2),at(21,1,2)])g.beam(mast,end,.018,0x90744c,M.wood,4);
        for(let i=0;i<15;i++)kit.pot((i%3-1)*.49,y+.27,.33+Math.floor(i/3)*.57,.22,0xbe825b);
      }
    });
  }
  boat(bank(11)-2.9,11,12.6,2.9,.22,true);
  boat(bank(25)-3.7,25,9.4,2.27,.29,false);
  for(const [a,b] of [[6,7.8],[17,23.6]]){
    g.beam([bank(a)-2.8,riverY+1.00,a],[bank(b)+.50,base+.45,b],.03,0x846945,M.wood,5);
  }
  // The far bank is scenery. The bridge follows the surviving span's axis.
  const farShore=z=>-174+.13*z+2.4*Math.sin(z*.046)+1.15*Math.cos(z*.087);
  for(let z=-141;z<138;z+=4.5){
    const next=z+4.5;
    for(const [x0,y0,x1,y1,col] of [[-42,0,-4,0,0xc2b395],[-4,0,3,-2.1,0xb5a68b],[3,-2.1,7,-5.7,0xada081],[7,-5.7,11,-9.7,0xa0967f]]){
      g.face([[farShore(next)+x0,y0,next],[farShore(next)+x1,y1,next],[farShore(z)+x1,y1,z],[farShore(z)+x0,y0,z]],col,M.garden);
    }
  }
  for(let i=0;i<15;i++){
    const z=-98+i*13.7,shore=farShore(z),angle=PI/2+.18*Math.sin(i);
    g.frame(shore-7.2,z,angle,()=>kit.house(8.2+(i%4)*1.4,8,4.2+(i%4)*1.03,true));
    if(i%3===0)growTree(g,shore-3,z+6.3,7.4+Math.sin(i)*1.3,'pine',false);
  }
  const water=()=>{for(let z=-162;z<154;z+=2.5)for(let x=-207;x< -2;x+=3.8){
    g.face([[x,riverY,z+2.5],[x+3.8,riverY,z+2.5],[x+3.8,riverY,z],[x,riverY,z]],0x52685f,M.water);
  }};
  water();
  const cx=-121.5,cz=bridgeZ(cx),span=20.5,deck=.055;
  g.frame(cx,cz,bridgeAngle,()=>{
    for(let i=-3;i<=3;i++){
      const mid=i*span,opening=8.38,impost=-7.10,archRise=5.48;
      for(let k=0;k<25;k++){
        const arc=(j,r,z)=>{const a=PI*j/25;return [mid+Math.cos(a)*r,impost+Math.sin(a)*(archRise+r-opening),z];};
        const a=k+.006,b=k+.994,r=opening+.65;
        for(const sg of [-1,1]){
          const z=sg*bridgeWidth/2,pt=arc(a,r,z),qt=arc(b,r,z);
          g.face([arc(a,opening,z),arc(b,opening,z),qt,pt],k%4===0?pale:stone);
          g.face([pt,qt,[qt[0],-.26,z],[pt[0],-.26,z]],0xbfad8f,M.ashlar);
        }
        g.face([arc(a,opening,bridgeWidth/2),arc(b,opening,bridgeWidth/2),arc(b,opening,-bridgeWidth/2),arc(a,opening,-bridgeWidth/2)],tufa);
      }
      const pier=mid+span/2;if(i===3)continue;
      g.box(pier,-10.1,0,span-2*opening,9.86,bridgeWidth,0xbdac91,M.ashlar);
      for(const sg of [-1,1]){
        const pts=[[pier-1.75,-9.2,sg*4.12],[pier,-9.2,sg*6.0],[pier+1.75,-9.2,sg*4.12]];
        for(let k=0;k<2;k++)g.face([pts[k],pts[k+1],[pts[k+1][0],-3.3,pts[k+1][2]],[pts[k][0],-3.3,pts[k][2]]],tufa,M.ashlar);
        g.face(pts.map(p=>[p[0],-3.3,p[2]]),stone);
      }
    }
    const length=span*7+18;
    g.box(0,-.31,0,length,.36,bridgeWidth+.28,0xc9b79a,M.paving);
    for(const sg of [-1,1]){
      g.wall(0,deck,sg*(bridgeWidth/2-.10),length,.87,.37,0xc9baa1,M.ashlar);
      g.box(0,deck+.87,sg*(bridgeWidth/2-.10),length,.12,.49,pale);
    }
  });
}

export function buildBoarium(g,kit){
  const rng=seeded(88901);
  g.reflectionOrigin=[-64,-6.7,2];g.shadowRadius=100;
  for(let z=-135;z<141;z+=3){
    const end=z+3,y=-.012;
    g.face([[bank(end)+17.49,y,end],[101,y,end],[101,y,z],[bank(z)+17.49,y,z]],0xd3c4aa,M.paving);
  }
  riverfront(g,kit);portunus(g,kit);
  const roundFloor=roundTemple(g);
  g.groundHeight=(x,z)=>Math.max(groundHeight(x,z),Math.hypot(x-hercules.x,z-hercules.z)<9.19?roundFloor(x,z):-100);
  // Flags mark the two sanctuaries. An open trading lane connects them.
  g.frame(9,5,-.12,()=>forumSlabs(g));
  buildMarketQuarter(g,kit);
  for(let i=0;i<6;i++){
    g.frame(-19+i*9.3,61,PI,()=>kit.house(7.9+rng()*1.25,8.1,5.1+rng()*2.8));
    g.frame(-30+i*11,-71,0,()=>kit.house(8.2+rng()*1.2,9.3,6.2+rng()*2.4));
  }
  for(const z of [-57,-42,-27,33,48,63])g.frame(52,z,-PI/2,()=>kit.house(10,8,6.3+rng()*3.1,false));
  for(const [x,z,a] of [[18.5,2,-1.0],[18.8,14,-1.85],[19,-11,-1.5]])marketBarrow(g,x,z,a);
  for(const [x,z,h] of [[-16,43,5.65],[14,-4.4,5.8],[20.5,35.2,5.7],[-25,-39,6.1]])growTree(g,x,z,h,'olive');
  for(const [x,z] of [[-22,58],[1,60],[38,-50],[45,-7],[-30,-73]])growTree(g,x,z,9+rng()*2,'pine',false);
  // Cargo is grouped by work area, with an open route from the landing to the shops.
  for(const [x,z,a] of [[-23,11,.3],[-21,4,.5],[20,-2.5,1.9]]){
    g.frame(x,z,a,()=>{
      for(let k=0;k<4;k++)g.box(0,.10,k*.28-0.42,2.12,.11,.24,wood,M.wood);
      for(let k=0;k<6;k++)kit.pot((k%3-1)*.60,.21,(Math.floor(k/3)-.5)*.51,.22+.035*rng(),k%3?0xb57653:0xcb9268);
      g.block(0,0,2.10,1.15);
    });
  }
  // The modest holding pen is illustrative. Keep the east market lane and approaches open.
  g.frame(13.7,21.5,.12,()=>{
    for(const side of [-1,1]){
      for(let i=0;i<4;i++){
        const z=-3.9+i*2.6;g.post(side*3.1,.02,z,[[0,.085],[1.27,.074],[1.34,.021]],wood,M.wood,7);
      }
      for(const y of [.50,1.00])g.beam([side*3.1,y,-3.9],[side*3.1,y,3.9],.055,wood,M.wood,6);
      g.block(side*3.1,0,.15,7.9,0,1.30);
    }
    for(const z of [-3.9,3.9]){
      for(const y of [.51,.99])g.beam([-3.1,y,z],[3.1,y,z],.052,wood,M.wood,6);
      g.block(0,z,6.2,.14,0,1.30);
    }
  });
  // A broken line of tree-covered hills gives long views across the river a horizon.
  for(let k=0;k<38;k++){
    const z=-240+k*13,centerX=-240-16*Math.sin(k*.38),floor=-2;
    g.post(centerX,floor,z,[[0,43],[5,40],[11+5*Math.sin(k*.48),25],[14+5*Math.sin(k*.48),11],[15+5*Math.sin(k*.48),.02]],0x9f9d79,M.garden,16);
  }
  return g;
}
export function drawSitePlan(p,w,h,cam){
  const scale=Math.min((w-42)/244,(h-48)/132),ox=w-51-42*scale,oz=h*.53;
  p.fillStyle='#eee1c9';p.fillRect(0,0,w,h);
  const pt=(x,z)=>[ox+x*scale,oz+z*scale];
  const polygon=(points,color)=>{p.beginPath();points.forEach(([x,z],i)=>i?p.lineTo(...pt(x,z)):p.moveTo(...pt(x,z)));p.closePath();p.fillStyle=color;p.fill();};
  polygon([[-204,-110],[bank(-110),-110],[bank(100),100],[-163,100]],'#8aafa8');
  polygon([[bank(-4),-4],[bank(-4)+17.5,-4],[bank(30)+17.5,30],[bank(30),30]],'#baad8e');
  const bridgeEnds=[-198,-42];
  polygon([[bridgeEnds[0],bridgeZ(bridgeEnds[0])-4],[bridgeEnds[1],bridgeZ(bridgeEnds[1])-4],[bridgeEnds[1],bridgeZ(bridgeEnds[1])+4],[bridgeEnds[0],bridgeZ(bridgeEnds[0])+4]],'#a38b6e');
  const local=(x,z)=>[port.x+x*Math.cos(port.yaw)+z*Math.sin(port.yaw),port.z+z*Math.cos(port.yaw)-x*Math.sin(port.yaw)];
  polygon([local(-5.5,-9.5),local(5.5,-9.5),local(5.5,9.5),local(-5.5,9.5)],'#ad8963');
  polygon([local(-3.8,9.5),local(3.8,9.5),local(3.8,13.8),local(-3.8,13.8)],'#c1a57d');
  for(const [radius,col] of [[9.2,'#b29776'],[6.15,'#dfcdb0'],[4.9,'#a88b69']]){
    p.fillStyle=col;p.beginPath();p.arc(...pt(hercules.x,hercules.z),radius*scale,0,TAU);p.fill();
  }
  drawMarketPlan(p,pt);
  p.font='italic 21px Georgia';p.textAlign='center';p.fillStyle='#36574f';p.fillText('Tiber',...pt(-106,12));
  p.font='600 16px system-ui';p.fillStyle='#54482f';p.fillText('N ↑',w-32,28);
  const sx=20,sy=h-24;p.fillRect(sx,sy,20*scale,2);p.textAlign='left';p.fillText('20 m',sx,sy-7);
  const names=[['Courtyard',39,-12],['Market',31,20],['Hercules Victor',hercules.x-2,hercules.z+16],['Portunus',port.x-14,port.z+16],['Landing',bank(14)+2,31],['Pons Aemilius',-122,bridgeZ(-122)-8]];
  p.font='18px Georgia';p.textAlign='center';p.lineWidth=4;p.strokeStyle='#eee2c9';
  for(const [s,x,z] of names){p.strokeText(s,...pt(x,z));p.fillStyle='#463d31';p.fillText(s,...pt(x,z));}
  p.save();p.translate(...pt(cam.x,cam.z));p.rotate(cam.yaw);p.beginPath();
  p.moveTo(0,-12);p.lineTo(8,9);p.lineTo(0,5);p.lineTo(-8,9);p.closePath();p.fillStyle='#aa472a';p.strokeStyle='#fff2d7';p.lineWidth=2;p.fill();p.stroke();p.restore();
}

export async function installCattle(g){
  const response=await fetch(new URL('./market-cattle.bin',import.meta.url));
  if(!response.ok)throw Error('The market animals could not be loaded. Reload to try again.');
  const data=new DataView(await response.arrayBuffer());
  const vertices=data.getUint16(0,true),indices=data.getUint16(2,true);
  if(data.byteLength!==4+vertices*12+indices*2)throw Error('Incomplete market animal model.');
  for(const [cx,cz,yaw,scale,warmth] of [[12.1,20.9,1.09,.99,1.05],[15.2,22.6,2.83,.88,1.34]]){
    const first=g.data.length/12,c=Math.cos(yaw),s=Math.sin(yaw);
    for(let k=0;k<vertices;k++){
      const o=4+k*12,x=data.getInt16(o,true)/20000,y=data.getInt16(o+2,true)/20000,z=data.getInt16(o+4,true)/20000;
      const nx=data.getInt8(o+6)/127,ny=data.getInt8(o+7)/127,nz=data.getInt8(o+8)/127;
      const rgb=[0,1,2].map(j=>(data.getUint8(o+9+j)/255)**.66);
      g.data.push(cx+scale*(x*c+z*s),.05+scale*y,cz+scale*(z*c-x*s),nx*c+nz*s,ny,nz*c-nx*s,z,y,
        Math.min(1,rgb[0]*warmth+.032),rgb[1]+.025,rgb[2]+.02,27);
    }
    for(let i=0;i<indices;i++)g.indices.push(first+data.getUint16(4+vertices*12+2*i,true));
    g.frame(cx,cz,yaw,()=>g.block(0,0,.78*scale,2.28*scale,0,1.4));
  }
}
