import {masonry} from './masonry.js';
import {seeded,surface as M} from './texture.js?v=forum2';

import {forumSlabs,growTree,marketBarrow,herbBed,balcony,capital} from './street.js?v=forum2';

export const stops=[
  {name:'The Forum',x:9.3,z:15.5,yaw:-.34,pitch:.14},
  {name:'Temple portico',x:-2,z:-20.4,yaw:2.96,pitch:.06},
  {name:'Market street',x:-10.5,z:13.5,yaw:-.49,pitch:.04},
  {name:'Aqueduct garden',x:21,z:-33,yaw:2.78,pitch:.11}
];
export function buildDistrict(){
  const g=masonry(),{box,wall,frame,block,face,post,beam,label,ramp}=g,R=seeded(7534),PI=Math.PI;
  const stone=0xe4cda6,light=0xf5e3bc,shadowStone=0xbfa887,tile=0xbe6e48,red=0x984b36,
    brick=0xcb8b68,timber=0x755037,bronze=0x72684b;
  const tone=(col,k)=>[16,8,0].reduce((sum,shift)=>sum+(Math.min(255,Math.max(0,Math.round((col>>shift&255)*k)))<<shift),0);
  const colors=[0xd9aa7c,0xe0c39c,0xd7b992,0xe4cfa9,0xc99674,0xe8c695];

  const pick=a=>a[Math.floor(R()*a.length)];
  function roof(x,y,z,w,d,rise,color=tile){
    const l=x-w/2,r=x+w/2,n=z-d/2,s=z+d/2,peak=y+rise;
    face([[l,y,s],[r,y,s],[x,peak,s]],stone,M.plaster);
    face([[r,y,n],[l,y,n],[x,peak,n]],stone,M.plaster);
    const uv=[[0,0],[d/3,0],[d/3,w/5],[0,w/5]];
    // Tile ribs run down each pitch. The eaves cast real shadows.
    face([[l,y,n],[l,y,s],[x,peak,s],[x,peak,n]],color,M.roof,[[0,w/5],[d/3,w/5],[d/3,0],[0,0]]);
    face([[x,peak,n],[x,peak,s],[r,y,s],[r,y,n]],tone(color,.96),M.roof,uv);
    beam([x,peak+.04,n],[x,peak+.04,s],.115,tone(color,1.12),M.roof,9);
    if(w<18 && d<20){
      const count=Math.round(d/.38);
      for(const side of [-1,1])for(let k=0;k<count;k++){
        const cx=x+side*w/2,cz=n+(k+.5)*d/count,radius=.085;
        const end=(a,inset)=>[cx-side*inset,y+.012+inset*rise/(w/2)+Math.sin(a)*radius,cz+Math.cos(a)*radius];
        for(let j=0;j<5;j++){
          const a=j*PI/5,b=(j+1)*PI/5;
          face([end(a,-.09),end(b,-.09),end(b,.57),end(a,.57)],tone(color,.87+.12*((k*43)%11)/10),M.plaster);
        }
      }
    }
    box(l,y-.16,z,.14,.19,d+.08,tone(color,.81));box(r,y-.16,z,.14,.19,d+.08,tone(color,.81));
  }
  function column(x,y,z,h,r,fancy){
    const cap=fancy?0xf2e7d2:0xe0d3bd;
    box(x,y,z,r*2.48,.20,r*2.48,cap);
    post(x,y+.19,z,[[0,1.21*r],[.07,1.24*r],[.14,1.08*r],[.22,r],[.29,1.03*r]],cap,0,20);
    post(x,y+.47,z,[[0,r],[h*.23,r*.99],[h*.56,r*.91],[h-.98,r*.78]],cap,0,fancy?64:16,fancy?16:0);
    post(x,y+h-.52,z,[[0,r*.81],[.06,r*.94],[.11,r*.91],[.15,r*.98],[.29,r*1.19],[.36,r*1.26]],cap,0,24);
    if(fancy)capital(g,x,y+h-.31,z,r,cap);
    box(x,y+h-.16,z,r*2.72,.16,r*2.72,cap);block(x,z,r*1.78,r*1.78,y,y+h);
  }
  // A podium with a climbable frontal stair and a shaded, six-column porch.
  function temple(){
    box(0,0,-5,17.5,1.68,17.2,shadowStone,M.ashlar);
    block(0,-5,17.5,17.2,-1,1.68);ramp(0,-5,17.5,17.2,1.68,1.68);
    box(0,.20,-5,17.75,.19,17.40,stone);box(0,1.43,-5,17.85,.20,17.50,light);
    for(let i=0;i<9;i++){
      const z=7.75-i*.49,h=(i+1)*1.68/9;
      box(0,0,z,15.7,h,.50,stone);box(0,h-.065,z+.18,15.76,.07,.16,light);
    }
    ramp(0,5.65,15.7,4.42,1.68/9,1.68);
    for(const side of [-1,1]){
      for(let i=0;i<9;i++)box(side*8.12,0,7.75-i*.49,.58,(i+1)*1.68/9+.38,.51,shadowStone);
      block(side*8.12,5.78,.59,4.6);
    }
    const floor=1.68,h=6.75;
    for(const x of [-7.15,-4.29,-1.43,1.43,4.29,7.15])column(x,floor,2.14,h,.48,true);
    for(const x of [-7.15,7.15])for(const z of [-1.35,-5.12,-8.89,-12.1])column(x,floor,z,h,.48,true);
    wall(0,floor,-8.8,12.1,h,7.7,0xe6d1ab,M.plaster);
    for(const x of [-3.86,3.86])label(x,floor+.59,-4.928,2.60,4.96,M.fresco);
    for(const x of [-5.68,5.68])box(x,floor,-4.87,.62,h,.35,light);
    box(0,floor,-4.84,3.7,4.9,.25,shadowStone);box(0,floor,-4.64,3.19,4.54,.19,0x65492f,M.wood);
    for(const x of [-1.64,1.64])box(x,floor,-4.51,.19,4.76,.19,light);
    box(0,floor+4.65,-4.51,3.64,.25,.29,light);
    for(const x of [-.80,.8])for(let j=0;j<4;j++){
      box(x,1.96+j*1.03,-4.50,1.29,.83,.12,0x917143,M.metal);box(x,2.06+j*1.03,-4.42,1.07,.61,.06,0x665639,M.metal);
    }
    box(0,floor+h,-5.02,16.02,.32,16.04,light);box(0,8.74,-5.02,16.25,.14,16.2,shadowStone);
    box(0,8.88,-5.02,16.14,.70,16.07,0xc7ac87);
    label(0,8.88,3.031,5.65,.69,M.labels);
    for(const side of [-1,1])for(let i=0;i<7;i++){
      const x=side*(3.32+i*.69);box(x,9.04,3.06,.12,.35,.11,light);
    }
    box(0,9.58,-5.02,16.53,.23,16.52,light);
    for(let i=0;i<47;i++)box(-8.05+i*.35,9.77,3.19,.19,.16,.27,stone);
    box(0,9.92,-5.02,17.08,.22,16.97,light);
    roof(0,10.15,-5.02,17.45,17.29,2.44);
    const centerZ=3.66;
    face([[-7.45,10.33,centerZ],[7.45,10.33,centerZ],[0,12.38,centerZ]],0x74817c,M.plaster);
    for(const side of [-1,1]){
      beam([side*8.73,10.18,3.71],[0,12.62,3.71],.145,light,0,8);
      beam([side*8.48,10.25,3.73],[0,12.59,3.73],.06,stone,0,7);
      for(let i=0;i<10;i++){
        const a=i/9*1.54,x=side*(.28+1.07*Math.sin(a)),y=10.58+.90*(1-Math.cos(a));
        beam([x,y,3.75],[x+side*.27,y+.10+.12*i/9,3.75],.084,bronze,M.metal);
        if(i>0)beam([x,y,3.75],[side*(.28+1.07*Math.sin((i-1)/9*1.54)),10.58+.90*(1-Math.cos((i-1)/9*1.54)),3.75],.055,bronze);
      }
    }
    // Two low-relief olive branches fill the long, shallow corners of the pediment.
    for(const side of [-1,1]){
      const point=t=>[side*(1.58+4.33*t),10.65+.28*Math.sin(t*PI)-.17*t,3.72];
      for(let i=0;i<18;i++){
        const t=i/18,a=point(t),b=point((i+1)/18);beam(a,b,.026,0xc1a16b,M.metal,6);
        for(const v of [-1,1]){
          const len=.25*(1-.48*t),cx=a[0],cy=a[1],dx=side*len,dy=v*len*.75;
          face([[cx,cy,3.75],[cx+dx*.46,cy+dy*.73+.038,3.78],[cx+dx,cy+dy,3.75],[cx+dx*.65,cy+dy*.27-.026,3.78]],0xd2b883,M.metal);
        }
      }
    }
    for(const x of [-6.5,6.5]){
      const z=9;
      box(x,0,z,.95,.17,.95,stone);post(x,.17,z,[[0,.34],[.20,.38],[.32,.23],[.93,.18],[1.02,.25],[1.09,.23],[1.2,.40],[1.30,.42],[1.36,.36],[1.27,.27]],bronze,M.metal,18);
      block(x,z,.86,.86);
    }
    // The painted band wraps under the pale stone cornice.
    box(0,9.46,-5.02,16.29,.083,16.22,red,M.plaster);
    // A bronze patera in relief anchors the two branches in the pediment.
    const discY=11.27;
    for(let i=0;i<32;i++){
      const a=i*PI/16,b=(i+1)*PI/16;
      const relief=(t,r,d)=>[r*Math.cos(t),discY+r*Math.sin(t),3.73+d];
      face([[0,discY,3.99],relief(a,.49,.11),relief(b,.49,.11)],0xb5945a,M.metal);
      face([relief(a,.49,.11),relief(a,.57,.06),relief(b,.57,.06),relief(b,.49,.11)],bronze,M.metal);
      if(i%2===0)beam(relief(a,.27,.19),relief(a,.43,.13),.024,light);
    }
    for(let i=0;i<5;i++)for(let j=0;j<2;j++){
      const x=-5.9+i*2.95,z=.7-j*2.8;
      box(x,8.34,z,2.38,.12,2.2,0xb89c79);box(x,8.30,z,1.67,.08,1.48,0x987954);
    }
  }
  function arch(cx,bottom,z,r,ring,depth,tint){
    const impost=bottom,n=17;
    function point(i,r,z){const a=i/n*PI;return [cx+r*Math.cos(a),impost+r*Math.sin(a),z];}
    for(let i=0;i<n;i++){
      const a=i+.012,b=i+.988,outer=r+ring+(i===(n-1)/2?.115:0);
      const innerA=point(a,r,z+depth/2),innerB=point(b,r,z+depth/2),outerA=point(a,outer,z+depth/2),outerB=point(b,outer,z+depth/2);
      const back=p=>[p[0],p[1],z-depth/2],c=tone(tint,.93+.09*R());
      face([innerA,outerA,outerB,innerB],c);face([back(innerB),back(outerB),back(outerA),back(innerA)],c);
      face([innerB,back(innerB),back(innerA),innerA],tone(c,.94));
      const cap=impost+r+ring+.08;const o1=point(i,r+ring-.04,z+depth/2-.09),o2=point(i+1,r+ring-.04,z+depth/2-.09);
      face([o1,[o1[0],cap,o1[2]],[o2[0],cap,o2[2]],o2],brick,M.brick);
      face([back(o2),[o2[0],cap,z-depth/2],[o1[0],cap,z-depth/2],back(o1)],brick,M.brick);
    }
  }
  function aqueduct(){
    const span=6.5,pier=1.52,r=(span-pier)/2;
    for(let i=0;i<=9;i++){
      const x=i*span;
      wall(x,0,0,pier,4.31,2.18,brick,M.brick);
      box(x,0,0,pier+.55,.43,2.67,shadowStone);box(x,.43,0,pier+.25,.19,2.43,stone);
      box(x,3.88,0,pier+.29,.24,2.46,stone);box(x,4.13,0,pier+.43,.16,2.61,light);
      box(x,4.28,0,pier,3.10,2.18,brick,M.brick);
      if(i<9)arch(x+span/2,4.29,0,r,.57,2.3,0xddaf89);
    }
    box(29.25,7.36,0,60.03,.29,2.57,light);box(29.25,7.63,0,60.03,1.02,2.22,brick,M.brick);
    box(29.25,8.63,0,60.20,.22,2.67,stone);
  }
  function pot(x,y,z,r,color,style=0){
    const heights=style===1?[[0,.43],[.16,.65],[.48,1],[.95,1.06],[1.04,1.16],[1.12,1.11],[1.11,.87],[.93,.81]]:
      [[0,.26],[.18,.44],[.95,.91],[1.56,1.0],[1.99,.72],[2.11,.38],[2.52,.34],[2.54,.45],[2.68,.45],[2.69,.28],[2.3,.25]];
    post(x,y,z,heights.map(([a,b])=>[a*r,b*r]),color,M.plaster,16);
    if(style===0)for(const sign of [-1,1]){
      const p=[[.32,2.47],[.67,2.42],[.89,2.16],[.84,1.93],[.72,1.85]];
      for(let j=1;j<p.length;j++)beam([x+sign*p[j-1][0]*r,y+p[j-1][1]*r,z],[x+sign*p[j][0]*r,y+p[j][1]*r,z],.077*r,color,M.plaster,7);
    }
  }
  const cloths=[0x9e493b,0x6e8b7b,0xc28d40,0x9c5d4b,0x778891];
  function awning(w,h,c){
    for(const side of [-1,1]){
      post(side*w*.47,0,2.05,[[0,.065],[h-.58,.065]],timber,M.wood,7);
      beam([side*w*.47,h,0],[side*w*.47,h-.55,2.05],.055,timber);
    }
    beam([-w*.5,h-.56,2.05],[w*.5,h-.56,2.05],.061,timber);
    const strips=11;
    for(let i=0;i<strips;i++){
      const l=-w/2+w*i/strips,r=l+w/strips,k=i%3===1?0xe8ceb0:c;
      const y=(d,x)=>h-.57*d-.19*Math.sin(d*PI)-.04*Math.sin(x*3+d);
      for(let j=0;j<4;j++){
        const a=j/4,b=(j+1)/4;
        face([[l,y(a,l),2.11*a],[l,y(b,l),2.11*b],[r,y(b,r),2.11*b],[r,y(a,r),2.11*a]],k,M.linen);
      }
      face([[l,y(1,l)-.23,2.11],[r,y(1,r)-.29,2.11],[r,y(1,r),2.11],[l,y(1,l),2.11]],k,M.linen);
    }
  }
  function windowBay(x,y,z,w,h){
    box(x,y,z,w+.20,h+.21,.12,0xb59a74);box(x,y+.08,z+.075,w,h-.02,.12,0x39342b,M.wood);
    box(x,y+.10,z+.15,.075,h-.06,.05,timber);box(x,y+h*.61,z+.16,w,.075,.05,timber);
    box(x,y-.045,z+.075,w+.36,.13,.32,stone);
    for(const side of [-1,1]){box(x+side*(w*.5+.18),y+.09,z+.09,.27,h-.09,.10,0x846340,M.wood);}
  }
  function shop(w,d,h,id){
    const color=pick(colors),back=-d;
    if(id%2===0)balcony(g,0,4.05,.17,w*.51,[0xab5843,0x778f89,0xae794a][id/2%3]);
    wall(0,0,back,w,h,.38,color,M.plaster);
    for(const sign of [-1,1])wall(sign*(w/2-.17),0,back/2,.34,h,d,color,M.plaster);
    for(const sign of [-1,1]){
      wall(sign*w*.415,0,0,w*.17,3.01,.43,color,M.plaster);
      box(sign*w*.415,.12,.23,w*.17,1.02,.09,red,M.plaster);
      box(sign*w*.415,1.16,.23,w*.17,.065,.1,0xb98650);
    }
    wall(0,3.02,-d/2,w,h-3.02,d,color,M.plaster);
    box(0,2.92,.03,w,.29,.50,timber,M.wood);
    for(let i=-1;i<=1;i++)windowBay(i*w*.30,4.01,.05,Math.min(.95,w*.14),1.39);
    box(0,h-.27,-d/2,w+.29,.24,d+.32,stone);roof(0,h,-d/2,w+.65,d+.64,1.17+R()*.46);
    box(0,.01,-d/2,w,.07,d,0xb49477,M.paving);
    for(const col of [-1,0,1])label(w*.296*col,.37,back+.199,w*.277,2.28,M.fresco);
    box(0,1.17,back+.25,w*.89,.13,.32,timber,M.wood);
    box(0,1.95,back+.25,w*.89,.13,.32,timber,M.wood);
    for(let i=0;i<8;i++)pot((i-3.5)*w*.102,i%2?1.29:2.08,back+.33,.13+R()*.09,0xc48b60);
    frame(0,0,0,()=>awning(w*.86,2.92,cloths[id%cloths.length]));
    label(0,3.35,.06,2.45,.53,M.labels+1+id%4);
    const tableX=-w*.16;
    wall(tableX,0,-.67,w*.47,.88,.9,0xac7755,M.plaster);
    box(tableX,.88,-.67,w*.49,.105,1.04,light);
    if(id%4===0 || id%4===3){
      for(let i=0;i<4;i++)for(let j=0;j<2;j++)post(tableX-.76+i*.47,1,-.92+.42*j,[[0,.17],[.12,.215],[.21,.14],[.23,.02]],id%4===0?0xca8a46:pick([0xb46943,0xd6a03d,0x809143]),M.plaster,10);
    }else for(let i=-1;i<=1;i++)pot(tableX+i*.54,1,-.67,.21,i%2?0xcb855d:0xa66d4e);
    // Stacked storage amphorae and woven produce baskets give each stall a working floor.
    if(id%2===1)for(let i=0;i<3;i++)pot(w*.28+(i%2)*.36,.08,-1.24-Math.floor(i/2)*.45,.27+.038*i,0xb97651);
    if(id%3===1){pot(w*.38,.03,1.07,.43,0xa86848);pot(w*.36,.03,1.89,.29,0xc48b65);}
  }
  function house(w,d,h,decor=true){
    const color=pick(colors);
    wall(0,0,-d/2,w,h,d,color,M.plaster);
    box(0,.04,.025,w,1.26,.09,pick([red,0xb27c55,0xa68b6f]),M.plaster);
    box(0,1.34,.06,w,.065,.07,0xd2a46e);box(0,.0,.04,w,.20,.12,shadowStone);
    if(decor){
      const x=w*.22;
      box(x,0,.06,1.32,2.45,.19,shadowStone);box(x,.04,.18,1.08,2.20,.10,0x70533a,M.wood);
      const rows=h>8?2:1;
      for(let j=0;j<rows;j++)for(let i=0;i<3;i++)windowBay((i-1)*w*.29,3.09+j*2.66,.045,.78,1.23);
      if(h>8)box(0,5.52,.12,w+.13,.16,.33,stone);
    }
    box(0,h-.19,-d/2,w+.23,.18,d+.22,shadowStone);roof(0,h,-d/2,w+.52,d+.57,1.21);
  }
  function fountain(x,z,scale=1){
    frame(x,z,0,()=>{
      const s=scale;
      post(0,0,0,[[0,2.30*s],[.14,2.44*s],[.30,2.33*s],[.36,2.20*s]],stone,0,40);
      post(0,.34,0,[[0,2.16*s],[.29,2.22*s],[.46,2.36*s],[.56,2.38*s],[.60,2.28*s],[.50,2.11*s],[.15,2.04*s]],light,0,40);
      post(0,.70,0,[[0,2.13*s],[.02,2.13*s],[.021,0]],0x72a59a,M.water,48);
      post(0,.72,0,[[0,.57],[.12,.65],[.25,.41],[.86,.25],[1.0,.34],[1.13,.83],[1.26,1.12],[1.41,1.17],[1.45,1.04],[1.27,.67]],bronze,M.metal,32);
      post(0,2.045,0,[[0,.40],[.06,.42],[.09,.36],[.14,.35]],bronze,M.metal,36);
      post(0,2.067,0,[[0,1.00],[.009,1.00],[.010,0]],0x83a69e,M.water,48);
      for(let i=0;i<8;i++){
        const a=i/8*PI*2, point=t=>[(1.09+.58*t)*Math.cos(a),2.124+.14*t-1.53*t*t,(1.09+.58*t)*Math.sin(a)];
        for(let j=0;j<11;j++)beam(point(j/11),point((j+1)/11),.019-.005*j/11,0xd3daca,M.water,4);
      }
      // Round rims use several short tangent colliders so the basin feels round.
      for(let i=0;i<16;i++){const a=i/16*2*PI;frame(Math.sin(a)*2.17*s,Math.cos(a)*2.17*s,a,()=>block(0,0,.88*s,.38*s));}
    });
  }
  function tree(x,z,h,pine=false,solid=true){
    growTree(g,x,z,h,pine?'pine':'cypress',solid);
  }
  // Forum pavement, edging, and a continuous route around the sanctuary.
  box(0,-.24,0,190,.21,165,0xddd3b6,M.garden);
  box(0,-.075,4.5,46,.075,43,0xb8ad9c,M.paving);
  forumSlabs(g);
  for(const x of [-13.48,12.82]){box(x,.005,5.3,.22,.025,39,light);box(x+.34,.005,5.3,.08,.027,39,0xb7916c);}
  box(-.05,.003,10.2,26.8,.016,.19,light);
  for(const x of [-13.12,12.48])face([[x-.20,.058,24],[x+.20,.058,24],[x+.20,.058,-12],[x-.20,.058,-12]],0xfff3dc,M.meander,[[0,1],[0,0],[36,0],[36,1]]);
  face([[-13.14,.059,10.69],[12.51,.059,10.69],[12.51,.059,10.28],[-13.14,.059,10.28]],0xfff3dc,M.meander,[[0,1],[25,1],[25,0],[0,0]]);
  box(-16.8,-.02,0,7.2,.12,47.2,0xd3c4a9,M.lime);
  box(22,-.07,-5,12,.075,68,0xafa698,M.paving);
  box(-3,-.075,-25,28,.075,30,0xafa698,M.paving);
  frame(-2,-20,0,temple);
  for(let i=0;i<6;i++)frame(-19.8,-15.05+i*6.62,PI/2,()=>shop(6.6,5.2+R()*.24,6.13+R()*1.02,i));
  // Market portico, open toward the piazza and lit through the full length.
  for(let i=0;i<13;i++)column(-14.65,.08,-18.2+i*3.31,3.88,.25,false);
  box(-16.98,3.93,1.65,5.10,.27,40.35,stone);box(-14.58,4.18,1.65,.38,.17,40.59,light);
  for(let i=0;i<5;i++)frame(-19.3+i*7.3,27.1,PI,()=>house(7.15,5.6,6.8+R()*2.4));
  frame(28,12,-PI/2,()=>shop(7.5,5.8,6.9,1));
  frame(28,20,-PI/2,()=>house(8.1,6.0,8.8));
  frame(30,-2,-PI/2,()=>house(7.2,5.4,6.8));
  frame(30,-9,-PI/2,()=>house(6.9,5.4,7.5));
  frame(11.5,-18.8,0,aqueduct);
  fountain(7.4,1.2);
  growTree(g,14.1,8.0,6.7,'olive');
  growTree(g,-11.85,-1.1,5.3,'olive');
  marketBarrow(g,-11.55,4.4,.63);
  marketBarrow(g,-11.47,-8.1,1.12);
  // The garden is accessible under several different spans.
  box(24,-.04,-32.3,31,.07,17.7,0xf7e9ca,M.garden);
  box(23.40,.032,-31,3,.04,19,0xbfb59b,M.paving);
  box(25,.036,-32.1,29,.04,2.72,0xbfb59b,M.paving);
  for(const x of [15.2,31.7])for(const z of [-26.4,-36.8]){
    box(x,.05,z,5.1,.22,4.4,0xc9b696);box(x,.27,z,4.76,.04,4.05,0xab9577,M.garden);
    tree(x,z,6.8+R()*1.3);herbBed(g,x,z,4.52,3.82,Math.round(x*140-z*42));
  }
  for(const [x,z] of [[20,-38.2],[26.6,-38.2],[13.6,-31],[34.6,-31]]){
    box(x,.018,z,3.25,.24,2.20,0xc4b198);box(x,.258,z,3.06,.04,2.01,0x867b61,M.garden);
    herbBed(g,x,z,2.93,1.83,Math.round(x*230));block(x,z,3.25,2.20,0,.30);
  }
  for(const x of [17.5,29.5]){
    box(x,.18,-32.2,.94,.39,2.7,shadowStone);box(x,.56,-32.2,1.22,.18,3,light);
    block(x,-32.2,1.22,3);
  }
  // A roofed courtyard behind the eastern shops with a tessellated threshold.
  box(22,.016,7.3,4.6,.031,4.6,0xffffff,M.mosaic);
  for(let i=0;i<3;i++)frame(-13+i*8,-39.6,0,()=>house(7.84,5.1,5.0+R()*2.1));
  for(let i=0;i<3;i++)frame(14+i*8.2,-41.3,0,()=>house(8.04,5.2,5.5+R()*1.33));
  // Architectural boundaries, with other city blocks continuing beyond them.
  wall(-26.2,0,-7.2,.76,3.2,66,0xd1b891,M.brick);wall(41,0,-7,.66,3.24,68,brick,M.brick);
  wall(7.1,0,-41,68,3.2,.74,0xc1aa89,M.brick);wall(7.1,0,28,68,3.1,.74,0xc1aa89,M.brick);
  for(let i=0;i<9;i++){
    frame(-34+i*9.1,-50-R()*4,0,()=>house(7+R()*2,5+R()*4,5+R()*5,false));
    frame(-34+i*9,39+R()*4,PI,()=>house(7.7,6,6+R()*5,false));
  }
  for(let i=0;i<8;i++){
    frame(-35,-36+i*9,PI/2,()=>house(7.4,6.5,6+R()*3,false));
    frame(47,-35+i*9,-PI/2,()=>house(8.2,6.7,5+R()*5,false));
  }
  tree(10.2,-9.4,9.1);tree(-11.9,19.8,7.2);tree(37.1,-34.7,10.2,true);
  for(const [x,z,h] of [[-24,-43,12],[9,-45,13],[44,-42,14],[-34,18,13],[20,39,12]])tree(x,z,h,true,false);
  return g;
}
