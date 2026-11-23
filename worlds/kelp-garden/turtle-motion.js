// Sample distance along each diving route so the stroke controls speed even
// where the path bends sharply. Rendering and the animal tracker share this sampler.
const TAU = 2*Math.PI;
const segments = 192;

function point(a, phase, radius, center, out) {
  out[0] = center[0]+radius*(Math.cos(a)+.17*Math.sin(2*a+phase));
  out[1] = center[1]+.78*Math.sin(2*a+phase)+.52*Math.sin(3*a-.5*phase);
  out[2] = center[2]+radius*(.66*Math.sin(a)+.135*Math.sin(3*a+phase));
}

function createRoute(data, offset) {
  const radius=data[offset+3], start=data[offset+4], rate=data[offset+5], size=data[offset+6]*.94;
  const phase=data[offset+7]*TAU, direction=Math.sign(rate);
  const center=[data[offset],data[offset+1],data[offset+2]];
  // Keep the starting point of the original route, including when the model first loads.
  center[0]-=radius*.17*Math.sin(2*start+phase);
  center[1]+=.65*Math.sin(1.3*start+phase)-.78*Math.sin(2*start+phase)-.52*Math.sin(3*start-.5*phase);
  center[2]-=radius*(.01*Math.sin(start)+.135*Math.sin(3*start+phase));
  const distances=new Float64Array(segments+1);
  const p=[0,0,0], previous=[0,0,0];
  point(start,phase,radius,center,previous);
  for(let j=1;j<=segments;j++){
    point(start+direction*TAU*j/segments,phase,radius,center,p);
    distances[j]=distances[j-1]+Math.hypot(p[0]-previous[0],p[1]-previous[1],p[2]-previous[2]);
    previous[0]=p[0];previous[1]=p[1];previous[2]=p[2];
  }
  const length=distances[segments];
  const cruise=.55+radius*Math.abs(rate)*1.12;
  const tempo=TAU*(.64+.045*Math.sin(phase));
  const surgeRate=.45+.09*Math.cos(phase);
  const matrix=new Float32Array(16);
  const state={matrix,stroke:0,steer:0,climb:0};
  let lastTime=NaN;
  return function sample(time) {
    if(time===lastTime)return state;
    lastTime=time;
    const surge=phase+time*surgeRate;
    const clock=time+.23*(Math.sin(surge)-Math.sin(phase))/surgeRate;
    const stroke=tempo*clock+phase;
    // Peak forward speed just after the fastest part of the downstroke.
    const impulse=stroke-.32*TAU;
    const travel=cruise*(clock+.12*(Math.sin(impulse)-Math.sin(phase-.32*TAU))/tempo);
    const distance=travel-length*Math.floor(travel/length);
    let lo=0, hi=segments;
    while(hi-lo>1){
      const mid=(lo+hi)>>>1;
      if(distances[mid]<=distance)lo=mid; else hi=mid;
    }
    const fraction=(distance-distances[lo])/(distances[hi]-distances[lo]);
    const a=start+direction*TAU*(lo+fraction)/segments;
    const a2=2*a+phase, a3=3*a+phase, depth3=3*a-.5*phase;
    const dx=radius*(-Math.sin(a)+.34*Math.cos(a2));
    const dy=1.56*Math.cos(a2)+1.56*Math.cos(depth3);
    const dz=radius*(.66*Math.cos(a)+.405*Math.cos(a3));
    const ddx=radius*(-Math.cos(a)-.68*Math.sin(a2));
    const ddz=radius*(-.66*Math.sin(a)-1.215*Math.sin(a3));
    const horizontal=Math.hypot(dx,dz), tangent=Math.hypot(horizontal,dy);
    const pace=1+.23*Math.cos(surge);
    const speed=cruise*pace*(1+.12*Math.cos(impulse));
    const yawRate=direction*speed*(dz*ddx-dx*ddz)/(tangent*horizontal*horizontal);
    const steer=Math.tanh(yawRate/.47);
    const bank=.40*steer;
    const fx=direction*dx/tangent, fy=direction*dy/tangent, fz=direction*dz/tangent;
    const rx=direction*dz/horizontal, rz=-direction*dx/horizontal;
    // Upright frame with forward along the path; lower the inside shoulder in a turn.
    const ux=fy*rz, uy=horizontal/tangent, uz=-fy*rx;
    const c=Math.cos(bank), s=Math.sin(bank);
    matrix[0]=size*(rx*c-ux*s);matrix[1]=-size*uy*s;matrix[2]=size*(rz*c-uz*s);
    matrix[4]=size*(rx*s+ux*c);matrix[5]=size*uy*c;matrix[6]=size*(rz*s+uz*c);
    matrix[8]=size*fx;matrix[9]=size*fy;matrix[10]=size*fz;
    point(a,phase,radius,center,p);
    matrix[12]=p[0];matrix[13]=p[1];matrix[14]=p[2];matrix[15]=1;
    state.stroke=stroke/TAU;state.steer=steer;state.climb=fy;
    return state;
  };
}

export function createTurtleRoutes(data) {
  return Array.from({length:data.length/8},(_,i)=>createRoute(data,i*8));
}
