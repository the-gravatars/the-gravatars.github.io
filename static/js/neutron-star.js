/* Rapidly rotating, equatorially non-axisymmetric neutron star.
   Schematic CW emission at twice the spin frequency; deformation exaggerated for visibility. */
(() => {
 const canvas=document.getElementById('neutron-star-canvas');if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const N=760,C=380,TAU=Math.PI*2;
 canvas.width=canvas.height=N;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
 let running=true;
 function draw(ms){
  if(!running)return;
  const t=reduce.matches?0:ms/1000;
  const spin=t*2.9,phase=2*spin;
  ctx.clearRect(0,0,N,N);ctx.save();ctx.translate(C,C);
  // Weak quadrupolar strain illustrated by smoothly distorted wavefronts.
  // Wave phase rotates at twice the stellar spin rate.
  for(let k=0;k<7;k++){
   const distance=165+k*39;
   const delay=k*.64;
   ctx.beginPath();
   for(let j=0;j<=240;j++){
    const a=j/240*TAU;
    const r=distance+6.5*Math.cos(2*a-phase+delay);
    const x=r*Math.cos(a),y=.77*r*Math.sin(a);
    j?ctx.lineTo(x,y):ctx.moveTo(x,y);
   }
   ctx.closePath();
   ctx.strokeStyle='rgba(118,178,255,'+(.29-k*.028)+')';
   ctx.lineWidth=1.25;ctx.stroke();
  }
  // Smooth radial GW fronts, avoiding petal-shaped magnetic-field loops.
  for(let k=0;k<3;k++){
   const u=(t*.27+k/3)%1,r=155+u*240;
   ctx.beginPath();
   for(let j=0;j<=180;j++){
    const a=j/180*TAU;
    const radius=r+4.5*Math.cos(2*a-phase+u*5);
    j?ctx.lineTo(radius*Math.cos(a),.77*radius*Math.sin(a)):ctx.moveTo(radius*Math.cos(a),.77*radius*Math.sin(a));
   }
   ctx.closePath();ctx.strokeStyle='rgba(151,202,255,'+(.2*(1-u))+')';ctx.lineWidth=1.5;ctx.stroke();
  }
  // Subtle blue halo around a compact, hot neutron star.
  const halo=ctx.createRadialGradient(0,0,65,0,0,215);
  halo.addColorStop(0,'rgba(110,197,255,.25)');
  halo.addColorStop(.55,'rgba(63,120,221,.09)');
  halo.addColorStop(1,'rgba(20,40,110,0)');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,215,0,TAU);ctx.fill();
  // Triaxial equatorial shape: a!=b. Its projected ellipticity oscillates at 2 f_spin.
  // Keep the angular size fixed; no radial pulsation is implied by CW emission.
  const major=119,minor=104;
  const rx=Math.sqrt(major*major*Math.cos(spin)**2+minor*minor*Math.sin(spin)**2);
  const ry=Math.sqrt(major*major*Math.sin(spin)**2+minor*minor*Math.cos(spin)**2);
  const tilt=.12*Math.sin(phase);
  ctx.save();ctx.rotate(tilt);
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,TAU);ctx.clip();
  const light=ctx.createRadialGradient(-34,-39,6,15,17,148);
  light.addColorStop(0,'#e5f7ff');light.addColorStop(.24,'#99cdec');
  light.addColorStop(.53,'#4c83bd');light.addColorStop(.78,'#1b437c');
  light.addColorStop(1,'#07112f');
  ctx.fillStyle=light;ctx.fillRect(-135,-135,270,270);
  // Very faint surface structure rotates with the crust; not planet-like bands.
  for(let i=0;i<12;i++){
   const lon=spin+i*2.399,lat=Math.sin(i*1.73)*.75;
   if(Math.cos(lon)<0)continue;
   const x=rx*.8*Math.sin(lon)*Math.cos(lat),y=ry*.8*Math.sin(lat);
   const g=ctx.createRadialGradient(x,y,0,x,y,11+i%3*5);
   g.addColorStop(0,i%2?'rgba(210,240,255,.16)':'rgba(12,48,105,.18)');
   g.addColorStop(1,'rgba(30,65,130,0)');
   ctx.fillStyle=g;ctx.fillRect(x-30,y-30,60,60);
  }
  ctx.restore();
  ctx.beginPath();ctx.ellipse(0,0,rx,ry,tilt,0,TAU);
  ctx.strokeStyle='rgba(170,222,255,.52)';ctx.lineWidth=1.5;ctx.stroke();
  ctx.restore();
  if(!reduce.matches)requestAnimationFrame(draw);
 }
 reduce.addEventListener('change',()=>{if(reduce.matches)draw(0);else if(running)requestAnimationFrame(draw)});
 document.addEventListener('visibilitychange',()=>{running=!document.hidden;if(running)requestAnimationFrame(draw)});
 requestAnimationFrame(draw);
})();