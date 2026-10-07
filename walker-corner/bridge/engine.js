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
    steel:{name:'Steel',EA:14000,EI:110,axial:240,moment:45,cost:58,weight:.23}
  };
  const vehicles={car:{name:'Car',load:10,width:88,wheelbase:55},truck:{name:'Truck',load:25,width:126,wheelbase:78},bus:{name:'School bus',load:45,width:168,wheelbase:110}};
  const key=(p)=>`${p.x},${p.y}`;
  const length=(m)=>Math.hypot(m.b.x-m.a.x,m.b.y-m.a.y)/STEP;
  const cost=(members)=>Math.round(members.reduce((v,m)=>v+materials[m.type].cost*length(m),0));
  function starter(kind='truss',type='wood'){
    const members=[];const add=(ax,ay,bx,by,t=type)=>members.push({a:{x:ax,y:ay},b:{x:bx,y:by},type:t});
    if(kind==='blank')return members;
    for(let i=0;i<8;i++)add(LEFT+i*STEP,DECK,LEFT+(i+1)*STEP,DECK,'road');
    if(kind==='beam')return members;
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
  function roadComplete(members){
    return Array.from({length:8},(_,i)=>LEFT+i*STEP).every(x=>members.some(m=>m.type==='road'&&Math.min(m.a.x,m.b.x)===x&&Math.max(m.a.x,m.b.x)===x+STEP));
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
    for(const el of elements)for(let i=0;i<6;i++)for(let j=0;j<6;j++)K[el.dofs[i]][el.dofs[j]]+=el.kg[i][j];
    const free=[];for(let i=0;i<nodes.length;i++)for(let d=0;d<3;d++)if(!((nodes[i].x===LEFT||nodes[i].x===RIGHT)&&nodes[i].y===DECK&&d<2))free.push(i*3+d);
    const L=factor(free.map(i=>free.map(j=>K[i][j])));
    return {nodes,map,elements,free,L,N,complete:roadComplete(members),cost:cost(members)};
  }
  function solve(model,vehicleName,centre,wind=0){
    const F=new Float64Array(model.N),displacements=new Float64Array(model.N),vehicle=vehicles[vehicleName];
    if(!model.L)return {unstable:true,displacements,nodes:model.nodes,stress:[],maxStress:Infinity,maxDeflection:Infinity,critical:-1};
    for(const el of model.elements){const w=materials[el.m.type].weight*el.L/2;F[el.ia*3+1]-=w;F[el.ib*3+1]-=w;}
    for(const [i,p]of model.nodes.entries())F[i*3]+=wind*.045*(p.y!==DECK?1:.25);
    const wheels=[centre-vehicle.wheelbase/2,centre+vehicle.wheelbase/2];
    for(const x of wheels){if(x<LEFT||x>RIGHT)continue;
      const ix=Math.min(7,Math.floor((x-LEFT)/STEP)),t=(x-LEFT-ix*STEP)/STEP;
      const ia=model.map.get(`${LEFT+ix*STEP},${DECK}`),ib=model.map.get(`${LEFT+(ix+1)*STEP},${DECK}`);
      if(ia!==undefined)F[ia*3+1]-=vehicle.load/2*(1-t);
      if(ib!==undefined)F[ib*3+1]-=vehicle.load/2*t;
    }
    const u=solveFactor(model.L,model.free.map(i=>F[i]));for(let i=0;i<model.free.length;i++)displacements[model.free[i]]=u[i];
    let critical=-1,maxStress=0,maxDeflection=0;
    const stress=model.elements.map((el,idx)=>{
      const local=el.T.map(row=>row.reduce((v,t,j)=>v+t*displacements[el.dofs[j]],0));
      const force=el.K.map(row=>row.reduce((v,k,j)=>v+k*local[j],0));
      const p=materials[el.m.type],axial=force[3];
      let moment=Math.max(Math.abs(force[2]),Math.abs(force[5]));
      if(el.m.type==='road')for(const x of wheels){const lo=Math.min(el.m.a.x,el.m.b.x),hi=Math.max(el.m.a.x,el.m.b.x);if(x>lo&&x<hi){const t=(x-lo)/STEP;moment+=vehicle.load/2*el.L*t*(1-t);}}
      // Compression capacity decreases for a longer, unbraced member (buckling).
      const capacity=axial<0?Math.min(p.axial,Math.PI**2*p.EI/el.L**2):p.axial;
      const ratio=Math.abs(axial)/capacity+moment/p.moment;
      if(ratio>maxStress){maxStress=ratio;critical=idx;}
      return {ratio,axial,moment,mode:Math.abs(axial)/capacity>moment/p.moment?(axial<0?'compression':'tension'):'bending'};
    });
    for(let i=0;i<model.nodes.length;i++)if(model.nodes[i].y===DECK)maxDeflection=Math.max(maxDeflection,Math.abs(displacements[3*i+1])*STEP);
    return {unstable:false,displacements,nodes:model.nodes,stress,maxStress,maxDeflection,critical};
  }
  function scan(members,vehicle='truck',wind=0){
    const model=prepare(members);let worst=null;
    if(!model.complete)return {pass:false,reason:'gap',cost:model.cost};
    for(let x=LEFT-vehicles[vehicle].wheelbase/2;x<=RIGHT+vehicles[vehicle].wheelbase/2;x+=7){const r=solve(model,vehicle,x,wind);if(!worst||r.maxStress>worst.maxStress)worst=r;if(r.unstable)return {pass:false,reason:'unstable',cost:model.cost,...r};}
    return {pass:worst.maxStress<=1&&worst.maxDeflection<=45,reason:worst.maxDeflection>45?'sag':worst.maxStress>1?'stress':'crossed',cost:model.cost,...worst};
  }
  return {LEFT,RIGHT,DECK,STEP,materials,vehicles,key,length,cost,starter,validate,roadComplete,prepare,solve,scan};
});
