/* Bridge Test Lab: linear 2D frame model in relative classroom units.
 * Geometry, supports, stiffness and moving axle loads determine each result.
 * Euler–Bernoulli frame elements; the collapse animation is illustrative.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BridgeEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const LEFT=264, RIGHT=936, DECK=250, STEP=84;
  const materials={
    road:{name:'Road',EA:8000,EI:160,axial:500,moment:26,cost:35,weight:.15},
    wood:{name:'Wood',EA:4500,EI:6,axial:100,moment:12,cost:28,weight:.10},
    steel:{name:'Steel',EA:14000,EI:110,axial:240,moment:45,cost:58,weight:.23},
    cable:{name:'Cable',EA:7000,EI:0,axial:180,moment:0,cost:26,weight:.04,pretension:.003}
  };
  const vehicles={car:{name:'Car',load:10,width:88,wheelbase:55},truck:{name:'Truck',load:25,width:126,wheelbase:78},bus:{name:'School bus',load:45,width:168,wheelbase:110}};
  const bridgeTypes={
    girder:{name:'Beam',tip:'A deep steel frame resists bending. How much load can it carry without diagonals?'},
    truss:{name:'Truss',tip:'Triangles distribute forces through the wood beams. Reinforce the weak members to carry more.'},
    arch:{name:'Arch',tip:'The raised steel arch carries compression; its vertical ties lift the deck.'},
    suspension:{name:'Suspension',tip:'Steel towers support the main cable. Cable hangers lift the road; backstays tie the towers to the banks.'},
    custom:{name:'Custom',tip:'Build your own load path. Road is the driving surface; beams and cables support it.'}
  };
  function loadFor(vehicle,percent=100){
    if(!vehicles[vehicle]||!Number.isFinite(percent)||percent<50||percent>200)throw new Error('Choose a load from 50% to 200%.');
    return vehicles[vehicle].load*percent/100;
  }
  const key=(p)=>`${p.x},${p.y}`;
  const length=(m)=>Math.hypot(m.b.x-m.a.x,m.b.y-m.a.y)/STEP;
  const cost=(members)=>Math.round(members.reduce((v,m)=>v+materials[m.type].cost*length(m),0));
  function starter(kind='truss',type='wood'){
    const members=[];const add=(ax,ay,bx,by,t=type)=>members.push({a:{x:ax,y:ay},b:{x:bx,y:by},type:t});
    if(kind==='blank')return members;
    for(let i=0;i<8;i++)add(LEFT+i*STEP,DECK,LEFT+(i+1)*STEP,DECK,'road');
    if(kind==='beam')return members;
    if(kind==='arch'){
      const ys=[DECK,DECK-STEP,DECK-2*STEP,DECK-2*STEP,DECK-2*STEP,DECK-2*STEP,DECK-2*STEP,DECK-STEP,DECK];
      for(let i=0;i<8;i++)add(LEFT+i*STEP,ys[i],LEFT+(i+1)*STEP,ys[i+1],'steel');
      for(let i=1;i<8;i++)add(LEFT+i*STEP,DECK,LEFT+i*STEP,ys[i],'wood');
      return members;
    }
    if(kind==='suspension'){
      for(const [bank,x]of [[LEFT,LEFT+STEP],[RIGHT,RIGHT-STEP]]){
        add(x,DECK,x,DECK-STEP,'steel');add(x,DECK-STEP,x,DECK-2*STEP,'steel');add(bank,DECK,x,DECK-STEP,'steel');
      }
      add(LEFT,DECK,LEFT+STEP,DECK-2*STEP,'cable');add(RIGHT-STEP,DECK-2*STEP,RIGHT,DECK,'cable');
      for(let i=1;i<7;i++)add(LEFT+i*STEP,i===1?DECK-2*STEP:DECK-STEP,LEFT+(i+1)*STEP,i===6?DECK-2*STEP:DECK-STEP,'cable');
      for(let i=2;i<7;i++)add(LEFT+i*STEP,DECK-STEP,LEFT+i*STEP,DECK,'cable');
      return members;
    }
    if(kind==='girder'){
      for(let i=1;i<8;i++)add(LEFT+i*STEP,DECK,LEFT+i*STEP,DECK+STEP,'steel');
      for(let i=1;i<7;i++)add(LEFT+i*STEP,DECK+STEP,LEFT+(i+1)*STEP,DECK+STEP,'steel');
      add(LEFT,DECK,LEFT+STEP,DECK+STEP,'steel');add(RIGHT-STEP,DECK+STEP,RIGHT,DECK,'steel');
      return members;
    }
    for(let i=1;i<8;i++)add(LEFT+i*STEP,DECK,LEFT+i*STEP,DECK-STEP);
    for(let i=1;i<7;i++)add(LEFT+i*STEP,DECK-STEP,LEFT+(i+1)*STEP,DECK-STEP);
    add(LEFT,DECK,LEFT+STEP,DECK-STEP);add(RIGHT-STEP,DECK-STEP,RIGHT,DECK);
    if(kind==='truss')for(let i=1;i<7;i++){
      if(i<4)add(LEFT+i*STEP,DECK-STEP,LEFT+(i+1)*STEP,DECK);
      else add(LEFT+i*STEP,DECK,LEFT+(i+1)*STEP,DECK-STEP);
    }
    return members;
  }
  function validate(input){
    if(!Array.isArray(input)||input.length>100)throw new Error('Use a bridge with no more than 100 pieces.');
    const seen=new Set();
    return input.map(m=>{
      if(!m||!materials[m.type])throw new Error('Unknown bridge material.');
      const points=[m.a,m.b].map(p=>{
        if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<LEFT||p.x>RIGHT||p.y<DECK-2*STEP||p.y>DECK+2*STEP||(p.x-LEFT)%STEP!==0||(p.y-DECK)%STEP!==0)throw new Error('Bridge points must lie on the construction grid.');
        return {x:p.x,y:p.y};
      });
      const[a,b]=points;
      if(key(a)===key(b)||Math.hypot(b.x-a.x,b.y-a.y)>STEP*3.01)throw new Error('Pieces must connect different points no more than three grid spaces apart.');
      if(m.type==='road'&&(a.y!==DECK||b.y!==DECK||Math.abs(b.x-a.x)!==STEP))throw new Error('Road pieces join neighbouring points on the road line.');
      const id=[key(a),key(b)].sort().join('|');if(seen.has(id))throw new Error('There is already a piece between those points.');seen.add(id);
      return {a,b,type:m.type};
    });
  }
  function roadGaps(members){
    return Array.from({length:8},(_,i)=>({section:i+1,a:{x:LEFT+i*STEP,y:DECK},b:{x:LEFT+(i+1)*STEP,y:DECK}})).filter(gap=>!members.some(m=>m.type==='road'&&m.a.y===DECK&&m.b.y===DECK&&Math.min(m.a.x,m.b.x)===gap.a.x&&Math.max(m.a.x,m.b.x)===gap.b.x));
  }
  function roadComplete(members){return roadGaps(members).length===0;}
  function matchesType(members,type){
    if(type==='custom')return true;
    const rigid=members.filter(m=>m.type==='wood'||m.type==='steel'),cables=members.filter(m=>m.type==='cable');
    const path=(start,goal,pieces)=>{const reached=new Set([key(start)]),queue=[start];while(queue.length){const p=queue.shift();if(goal(p))return true;for(const m of pieces){let next=key(m.a)===key(p)?m.b:key(m.b)===key(p)?m.a:null;if(next&&!reached.has(key(next))){reached.add(key(next));queue.push(next);}}}return false;};
    if(type==='girder')return rigid.some(m=>m.type==='steel'&&m.a.y>DECK&&m.b.y>DECK&&m.a.x!==m.b.x)&&!cables.length;
    if(type==='truss'){
      const all=members.filter(m=>m.type!=='cable'),adj=new Map(),triangles=new Set();
      for(const m of all)for(const [a,b]of [[m.a,m.b],[m.b,m.a]]){if(!adj.has(key(a)))adj.set(key(a),new Map());adj.get(key(a)).set(key(b),b);}
      for(const m of all)for(const [id,p]of adj.get(key(m.a)).entries())if(adj.get(key(m.b)).has(id)&&(m.b.x-m.a.x)*(p.y-m.a.y)!==(m.b.y-m.a.y)*(p.x-m.a.x))triangles.add([key(m.a),key(m.b),id].sort().join('|'));
      return triangles.size>=4;
    }
    if(type==='arch'){
      const upper=rigid.filter(m=>m.a.y<=DECK&&m.b.y<=DECK);
      return path({x:LEFT,y:DECK},p=>p.x===RIGHT&&p.y===DECK,upper)&&path({x:LEFT,y:DECK},p=>p.y===DECK-2*STEP,upper);
    }
    if(type==='suspension'){
      const towers=[];for(let x=LEFT+STEP;x<RIGHT;x+=STEP){const vertical=rigid.filter(m=>m.type==='steel'&&m.a.x===x&&m.b.x===x);if(path({x,y:DECK},p=>p.y===DECK-2*STEP,vertical))towers.push({x,y:DECK-2*STEP});}
      return towers.length>=2&&[LEFT,RIGHT].every(x=>cables.some(m=>(m.a.x===x&&m.a.y===DECK&&m.b.y<DECK)||(m.b.x===x&&m.b.y===DECK&&m.a.y<DECK)))&&path(towers[0],p=>key(p)===key(towers[towers.length-1]),cables.filter(m=>m.a.y<DECK&&m.b.y<DECK))&&cables.some(m=>m.a.y===DECK||m.b.y===DECK);
    }
    return false;
  }
  function inferType(members){return ['suspension','arch','truss','girder'].find(type=>matchesType(members,type))||'custom';}
  function readDesign(data){
    if(!data||data.format!=='bridge-test-lab'||![1,2].includes(data.version))throw new Error('Choose a Bridge Test Lab design file.');
    const members=validate(data.members),loadPercent=data.loadPercent===undefined?100:data.loadPercent;
    if(!vehicles[data.vehicle]||![0,12,28].includes(data.wind)||!Number.isFinite(loadPercent)||loadPercent<50||loadPercent>200||loadPercent%10!==0||typeof data.challenge!=='string'||(data.bridgeType!==undefined&&!bridgeTypes[data.bridgeType]))throw new Error('This file has invalid test settings.');
    return {members,vehicle:data.vehicle,wind:data.wind,challenge:data.challenge,loadPercent,bridgeType:data.bridgeType||inferType(members)};
  }
  function element(m,ia,ib){
    const dx=(m.b.x-m.a.x)/STEP,dy=(m.a.y-m.b.y)/STEP,L=Math.hypot(dx,dy),c=dx/L,s=dy/L,p=materials[m.type];
    const a=p.EA/L,b=12*p.EI/L**3,d=6*p.EI/L**2,e=4*p.EI/L,f=2*p.EI/L;
    const K=[[a,0,0,-a,0,0],[0,b,d,0,-b,d],[0,d,e,0,-d,f],[-a,0,0,a,0,0],[0,-b,-d,0,b,-d],[0,d,f,0,-d,e]];
    const T=[[c,s,0,0,0,0],[-s,c,0,0,0,0],[0,0,1,0,0,0],[0,0,0,c,s,0],[0,0,0,-s,c,0],[0,0,0,0,0,1]];
    const kg=Array.from({length:6},()=>Array(6).fill(0));
    for(let i=0;i<6;i++)for(let j=0;j<6;j++)for(let r=0;r<6;r++)for(let t=0;t<6;t++)kg[i][j]+=T[r][i]*K[r][t]*T[t][j];
    return {m,ia,ib,L,c,s,K,T,kg,dofs:[3*ia,3*ia+1,3*ia+2,3*ib,3*ib+1,3*ib+2]};
  }
  function factor(A){
    const n=A.length,L=Array.from({length:n},()=>new Float64Array(n));
    for(let i=0;i<n;i++)for(let j=0;j<=i;j++){
      let s=A[i][j];for(let k=0;k<j;k++)s-=L[i][k]*L[j][k];
      if(i===j){if(s<1e-8||!Number.isFinite(s))return null;L[i][j]=Math.sqrt(s);}else L[i][j]=s/L[j][j];
    }
    return L;
  }
  function solveFactor(L,b){
    const n=b.length,x=new Float64Array(n),y=new Float64Array(n);
    for(let i=0;i<n;i++){let s=b[i];for(let j=0;j<i;j++)s-=L[i][j]*y[j];y[i]=s/L[i][i];}
    for(let i=n-1;i>=0;i--){let s=y[i];for(let j=i+1;j<n;j++)s-=L[j][i]*x[j];x[i]=s/L[i][i];}
    return x;
  }
  function prepare(members){
    validate(members);
    const nodes=[],map=new Map();for(const m of members)for(const p of[m.a,m.b])if(!map.has(key(p))){map.set(key(p),nodes.length);nodes.push({...p});}
    const N=nodes.length*3,K=Array.from({length:N},()=>new Float64Array(N));
    const elements=members.map(m=>element(m,map.get(key(m.a)),map.get(key(m.b))));
    const cables=elements.filter(el=>el.m.type==='cable'),framed=new Set();
    for(const el of elements)if(el.m.type!=='cable'){
      framed.add(el.ia);framed.add(el.ib);
      for(let i=0;i<6;i++)for(let j=0;j<6;j++)K[el.dofs[i]][el.dofs[j]]+=el.kg[i][j];
    }
    const free=[];for(let i=0;i<nodes.length;i++)for(let d=0;d<3;d++)if(!(d===2&&!framed.has(i))&&!((nodes[i].x===LEFT||nodes[i].x===RIGHT)&&nodes[i].y===DECK&&d<2))free.push(i*3+d);
    const L=factor(free.map(i=>free.map(j=>K[i][j])));
    const gaps=roadGaps(members);
    return {nodes,map,elements,free,L,K,cables,N,gaps,complete:gaps.length===0,cost:cost(members)};
  }
  // Corotational axial cable: changed length determines tension; shortening gives zero force.
  function cableResponse(el,u){
    const dofs=[el.ia*3,el.ia*3+1,el.ib*3,el.ib*3+1];
    const dx=el.c*el.L+u[dofs[2]]-u[dofs[0]],dy=el.s*el.L+u[dofs[3]]-u[dofs[1]],L=Math.hypot(dx,dy);
    const rest=el.L*(1-materials.cable.pretension),extension=L-rest,EA=materials.cable.EA,axial=Math.max(0,EA*extension/rest),c=L?dx/L:el.c,s=L?dy/L:el.s;
    const active=extension>=-1e-10,k=active?EA/rest:0,g=L?axial/L:0;
    const H=[[k*c*c+g*s*s,(k-g)*c*s],[(k-g)*c*s,k*s*s+g*c*c]];
    const tangent=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>H[i%2][j%2]*(i<2?1:-1)*(j<2?1:-1)));
    return {dofs,axial,active:axial>1e-7,energy:.5*EA/rest*Math.max(0,extension)**2,force:[-axial*c,-axial*s,axial*c,axial*s],tangent};
  }
  function nonlinearSolve(model,F){
    const u=model.cableGuess?Float64Array.from(model.cableGuess):new Float64Array(model.N),free=model.free,norm=r=>Math.max(0,...free.map(i=>Math.abs(r[i])));
    const response=(v,tangent)=>{
      const r=Float64Array.from(F),K=tangent?model.K.map(row=>Float64Array.from(row)):null;let energy=0;
      for(let i=0;i<model.N;i++){energy-=F[i]*v[i];for(let j=0;j<model.N;j++){r[i]-=model.K[i][j]*v[j];energy+=.5*v[i]*model.K[i][j]*v[j];}}
      for(const el of model.cables){const cable=cableResponse(el,v);energy+=cable.energy;for(let i=0;i<4;i++){r[cable.dofs[i]]-=cable.force[i];if(K)for(let j=0;j<4;j++)K[cable.dofs[i]][cable.dofs[j]]+=cable.tangent[i][j];}}
      return {r,K,energy};
    };
    for(let iteration=0;iteration<70;iteration++){
      const {r,K,energy}=response(u,true),error=norm(r),matrix=free.map(i=>free.map(j=>K[i][j]));let L=factor(matrix);
      if(error<1e-6){if(L)model.cableGuess=Float64Array.from(u);return L?u:null;}
      // A temporary tangent regularization lets a slack cable re-engage. It contributes
      // no force or stored energy, and a singular final equilibrium is still rejected.
      for(let i=0;i<matrix.length;i++)matrix[i][i]+=.03;
      L=factor(matrix);if(!L)return null;
      const delta=solveFactor(L,free.map(i=>r[i]));let accepted=false;
      const descent=free.reduce((sum,dof,i)=>sum+r[dof]*delta[i],0),start=Math.min(1,1/Math.max(1,...delta.map(Math.abs)));
      for(let alpha=start;alpha>=start/1048576;alpha/=2){
        const trial=Float64Array.from(u);for(let i=0;i<free.length;i++)trial[free[i]]+=alpha*delta[i];
        const candidate=response(trial,false);
        if(candidate.energy<=energy-1e-4*alpha*descent||(error<.001&&norm(candidate.r)<error)){u.set(trial);accepted=true;break;}
      }
      if(!accepted)return null;
    }
    return null;
  }
  function solve(model,vehicleName,centre,wind=0,loadPercent=100){
    const F=new Float64Array(model.N),displacements=new Float64Array(model.N),vehicle=vehicles[vehicleName],load=loadFor(vehicleName,loadPercent);
    const unstable=()=>({unstable:true,displacements,nodes:model.nodes,stress:[],maxStress:Infinity,maxDeflection:Infinity,critical:-1});
    if(!model.cables.length&&!model.L)return unstable();
    for(const el of model.elements){const w=materials[el.m.type].weight*el.L/2;F[el.ia*3+1]-=w;F[el.ib*3+1]-=w;}
    for(const [i,p]of model.nodes.entries())F[i*3]+=wind*.045*(p.y!==DECK?1:.25);
    const wheels=[centre-vehicle.wheelbase/2,centre+vehicle.wheelbase/2];
    for(const x of wheels){if(x<LEFT||x>RIGHT)continue;
      const ix=Math.min(7,Math.floor((x-LEFT)/STEP)),t=(x-LEFT-ix*STEP)/STEP;
      const ia=model.map.get(`${LEFT+ix*STEP},${DECK}`),ib=model.map.get(`${LEFT+(ix+1)*STEP},${DECK}`);
      if(ia!==undefined)F[ia*3+1]-=load/2*(1-t);
      if(ib!==undefined)F[ib*3+1]-=load/2*t;
    }
    if(model.cables.length){const u=nonlinearSolve(model,F);if(!u)return unstable();displacements.set(u);}
    else {const u=solveFactor(model.L,model.free.map(i=>F[i]));for(let i=0;i<model.free.length;i++)displacements[model.free[i]]=u[i];}
    let critical=-1,maxStress=0,maxDeflection=0;
    const stress=model.elements.map((el,idx)=>{
      if(el.m.type==='cable'){
        const r=cableResponse(el,displacements),ratio=r.axial/materials.cable.axial;
        if(ratio>maxStress){maxStress=ratio;critical=idx;}
        return {ratio,axial:r.axial,moment:0,active:r.active,mode:r.active?'tension':'slack'};
      }
      const local=el.T.map(row=>row.reduce((v,t,j)=>v+t*displacements[el.dofs[j]],0));
      const force=el.K.map(row=>row.reduce((v,k,j)=>v+k*local[j],0));
      const p=materials[el.m.type],axial=force[3];
      let moment=Math.max(Math.abs(force[2]),Math.abs(force[5]));
      if(el.m.type==='road')for(const x of wheels){const lo=Math.min(el.m.a.x,el.m.b.x),hi=Math.max(el.m.a.x,el.m.b.x);if(x>lo&&x<hi){const t=(x-lo)/STEP;moment+=load/2*el.L*t*(1-t);}}
      // Compression capacity decreases for a longer, unbraced member (buckling).
      const capacity=axial<0?Math.min(p.axial,Math.PI**2*p.EI/el.L**2):p.axial;
      const ratio=Math.abs(axial)/capacity+moment/p.moment;
      if(ratio>maxStress){maxStress=ratio;critical=idx;}
      return {ratio,axial,moment,mode:Math.abs(axial)/capacity>moment/p.moment?(axial<0?'compression':'tension'):'bending'};
    });
    for(let i=0;i<model.nodes.length;i++)if(model.nodes[i].y===DECK)maxDeflection=Math.max(maxDeflection,Math.abs(displacements[3*i+1])*STEP);
    return {unstable:false,displacements,nodes:model.nodes,stress,maxStress,maxDeflection,critical};
  }
  function scan(members,vehicle='truck',wind=0,loadPercent=100){
    loadFor(vehicle,loadPercent);const model=prepare(members);let worst=null,peakBend=0;
    if(!model.complete)return {pass:false,reason:'gap',cost:model.cost};
    for(let x=LEFT-vehicles[vehicle].wheelbase/2;x<=RIGHT+vehicles[vehicle].wheelbase/2;x+=7){const r=solve(model,vehicle,x,wind,loadPercent);if(!worst||r.maxStress>worst.maxStress)worst=r;peakBend=Math.max(peakBend,r.maxDeflection);if(r.unstable)return {pass:false,reason:'unstable',cost:model.cost,...r};}
    return {...worst,maxDeflection:peakBend,pass:worst.maxStress<=1&&peakBend<=45,reason:peakBend>45?'sag':worst.maxStress>1?'stress':'crossed',cost:model.cost};
  }
  return {LEFT,RIGHT,DECK,STEP,materials,vehicles,bridgeTypes,loadFor,key,length,cost,starter,validate,roadGaps,roadComplete,matchesType,inferType,readDesign,prepare,cableResponse,solve,scan};
});
