// A single indexed mesh holds the district. Colliders use the same local frames.
export function masonry(){
  const data=[],indices=[],blocks=[],stairs=[];
  let tx=0,tz=0,angle=0,cs=1,sn=0;
  function frame(x,z,yaw,draw){
    const saved=[tx,tz,angle,cs,sn];
    tx+=x*cs+z*sn;tz+=z*cs-x*sn;angle+=yaw;cs=Math.cos(angle);sn=Math.sin(angle);
    draw();[tx,tz,angle,cs,sn]=saved;
  }
  const rgb=hex=>[(hex>>16&255)/255,(hex>>8&255)/255,(hex&255)/255];
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  function unit(a){const l=Math.hypot(...a)||1;return a.map(v=>v/l);}
  function vert(p,n,uv,color,mat){
    const [x,y,z]=p,[a,b,c]=n;
    data.push(tx+x*cs+z*sn,y,tz+z*cs-x*sn,a*cs+c*sn,b,c*cs-a*sn,uv[0],uv[1],...color,mat);
  }
  function face(pts,color,mat=0,uv=null,normals=null){
    const i=data.length/12,n=unit(cross(sub(pts[1],pts[0]),sub(pts[2],pts[0]))),c=rgb(color);
    const top=Math.abs(n[1])>.7,alongX=Math.abs(n[2])>Math.abs(n[0]);
    pts.forEach((p,j)=>vert(p,normals?normals[j]:n,uv?uv[j]:top?[p[0]/2.8,p[2]/2.8]:[ (alongX?p[0]:p[2])/2.8,-p[1]/2.8],c,mat));
    indices.push(i,i+1,i+2);if(pts.length===4)indices.push(i,i+2,i+3);
  }
  function box(x,y,z,w,h,d,c,mat=0){
    if(w<=0||d<=0||h<=0)return;
    const l=x-w/2,r=x+w/2,b=y,t=y+h,n=z-d/2,s=z+d/2;
    face([[l,b,s],[r,b,s],[r,t,s],[l,t,s]],c,mat);
    face([[r,b,n],[l,b,n],[l,t,n],[r,t,n]],c,mat);
    face([[l,b,n],[l,b,s],[l,t,s],[l,t,n]],c,mat);
    face([[r,b,s],[r,b,n],[r,t,n],[r,t,s]],c,mat);
    face([[l,t,s],[r,t,s],[r,t,n],[l,t,n]],c,mat);
    if(y>.08)face([[l,b,n],[r,b,n],[r,b,s],[l,b,s]],c,mat);
  }
  function block(x,z,w,d,bottom=-2,top=24){
    blocks.push({x:tx+x*cs+z*sn,z:tz+z*cs-x*sn,hx:w/2,hz:d/2,c:cs,s:sn,bottom,top});
  }
  function wall(x,y,z,w,h,d,c,mat=0){box(x,y,z,w,h,d,c,mat);block(x,z,w,d,y,y+h);}
  function post(x,y,z,profile,c,mat=0,N=18,flutes=0){
    const col=rgb(c),first=data.length/12;
    for(let k=0;k<profile.length;k++){
      const [height,rad]=profile[k],a=profile[Math.max(0,k-1)],b=profile[Math.min(profile.length-1,k+1)];
      const slope=-(b[1]-a[1])/Math.max(.002,b[0]-a[0]);
      for(let i=0;i<=N;i++){
        const t=i/N*Math.PI*2,ct=Math.cos(t),st=Math.sin(t);
        const f=flutes?1-.055*(.5+.5*Math.cos(t*flutes)):1;
        const tangent=flutes?.0275*flutes*Math.sin(t*flutes):0;
        const n=unit([ct+st*tangent,slope*f,st-ct*tangent]);
        vert([x+rad*f*ct,y+height,z+rad*f*st],n,[i/N*Math.PI*rad/1.4,-(y+height)/2.8],col,mat);
      }
    }
    for(let k=0;k<profile.length-1;k++)for(let i=0;i<N;i++){
      const a=first+k*(N+1)+i,b=a+N+1;indices.push(a,b,b+1,a,b+1,a+1);
    }
  }
  function beam(a,b,r,c,mat=0,sides=7){
    const dir=unit(sub(b,a)),u=unit(cross(dir,Math.abs(dir[1])<.85?[0,1,0]:[1,0,0])),v=cross(dir,u);
    function point(p,i){const t=i/sides*2*Math.PI;return p.map((x,k)=>x+r*(u[k]*Math.cos(t)+v[k]*Math.sin(t)));}
    for(let i=0;i<sides;i++)face([point(a,i),point(a,i+1),point(b,i+1),point(b,i)],c,mat);
  }
  function ramp(x,z,w,d,front,back){
    stairs.push({x:tx+x*cs+z*sn,z:tz+z*cs-x*sn,hx:w/2,hz:d/2,c:cs,s:sn,front,back});
  }
  function label(x,y,z,w,h,layer){
    face([[x-w/2,y,z],[x+w/2,y,z],[x+w/2,y+h,z],[x-w/2,y+h,z]],0xffffff,layer,[[0,1],[1,1],[1,0],[0,0]]);
  }
  return {data,indices,blocks,stairs,frame,box,wall,block,post,face,beam,ramp,label};
}
