/* Energetic pulsar / magnetar-inspired homepage illustration.
   Artistic visualization: GW ripples and magnetic structures are not to scale. */
(() => {
 const canvas=document.getElementById('neutron-star-canvas'); if(!canvas)return;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const N=760,C=380,TAU=Math.PI*2;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let active=true, last=0;
 canvas.width=canvas.height=N;
 const glow=(x,y,r,color)=>{const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill()};
 const curve=(pts,color,width,blur=0)=>{ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.shadowBlur=blur;ctx.shadowColor=color;ctx.stroke();ctx.shadowBlur=0};
 function render(ms){
  if(!active)return;
  const t=motion.matches?0:ms/1000;
  ctx.clearRect(0,0,N,N);
  ctx.save();ctx.translate(C,C);
  // Quadrupolar GW contours radiate from the central engine.
  for(let k=0;k<7;k++){
   const progress=((t*.29+k/7)%1),r=138+progress*270,alpha=(1-progress)*.36;
   ctx.beginPath();
   for(let i=0;i<=240;i++){const a=i/240*TAU;const mod=12*Math.cos(2*a-t*3.1)*(1-progress);
    const x=(r+mod)*Math.cos(a),y=(r*.68-mod)*Math.sin(a);
    i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
   ctx.closePath();ctx.strokeStyle='rgba(93,183,255,'+alpha+')';ctx.lineWidth=1.5+1.3*(1-progress);ctx.stroke();
  }
  // Diffuse energetic plasma halo.
  glow(0,0,238,'rgba(45,122,255,.30)');
  glow(0,0,165,'rgba(61,200,255,.25)');
  // Pulsar beam axis sweeps, with two opposing, luminous polar beams.
  const axis=-.58+.28*Math.sin(t*2.6);
  ctx.save();ctx.rotate(axis);
  for(const dir of [-1,1]){
   const beam=ctx.createLinearGradient(0,dir*68,0,dir*355);
   beam.addColorStop(0,'rgba(220,252,255,.88)');
   beam.addColorStop(.18,'rgba(90,220,255,.36)');
   beam.addColorStop(1,'rgba(67,118,255,0)');
   ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(-16,dir*72);ctx.lineTo(-85,dir*350);ctx.lineTo(85,dir*350);ctx.lineTo(16,dir*72);ctx.closePath();ctx.fill();
   curve([[0,dir*84],[0,dir*305]],'rgba(190,245,255,.48)',2,16);
  }
  ctx.restore();
  // Fast magnetic-field arcs: inclined, luminous, asymmetric, dynamic.
  for(let i=0;i<9;i++){
   const a=i*TAU/9+t*.38;
   const rad=140+i%3*24;
   const pts=[];
   for(let j=0;j<=100;j++){const q=j/100*TAU;const x=rad*Math.cos(q),y=(45+12*Math.sin(a))*Math.sin(q);
    const ca=Math.cos(a),sa=Math.sin(a);
    pts.push([x*ca-y*sa,x*sa+y*ca]);}
   curve(pts,'rgba('+(i%3===0?'145,235,255':'73,150,255')+','+(.15+(i%3)*.045)+')',i%3===0?2.2:1.2,i%3===0?9:0);
  }
  // Compact, white-hot neutron star, without planetary continents or stripes.
  const pulse=1+.022*Math.sin(t*7.2),R=91*pulse;
  glow(0,0,150,'rgba(96,198,255,.28)');
  ctx.save();ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.clip();
  const surface=ctx.createRadialGradient(-27,-33,2,8,8,R*1.13);
  surface.addColorStop(0,'#ffffff');surface.addColorStop(.23,'#e1fbff');
  surface.addColorStop(.49,'#a1e6ff');surface.addColorStop(.74,'#3b9fe4');
  surface.addColorStop(.92,'#15418e');surface.addColorStop(1,'#071536');
  ctx.fillStyle=surface;ctx.fillRect(-R,-R,2*R,2*R);
  // Turbulent thermal surface: luminous filaments, not planetary geography.
  for(let i=0;i<30;i++){
   const a=i*2.399+t*2.8,rr=R*Math.sqrt((i+.5)/30)*.9;
   const x=rr*Math.cos(a),y=rr*Math.sin(a);
   const g=ctx.createRadialGradient(x,y,0,x,y,9+(i%4)*4);
   g.addColorStop(0,i%3===0?'rgba(255,255,255,.34)':'rgba(96,224,255,.19)');
   g.addColorStop(1,'rgba(255,255,255,0)');
   ctx.fillStyle=g;ctx.fillRect(x-26,y-26,52,52);
  }
  ctx.restore();
  ctx.beginPath();ctx.arc(0,0,R,0,TAU);ctx.strokeStyle='rgba(216,251,255,.85)';ctx.lineWidth=2;ctx.shadowBlur=24;ctx.shadowColor='#7de6ff';ctx.stroke();ctx.shadowBlur=0;
  // Bright rotating hot spots near the magnetic poles.
  for(let i=0;i<2;i++){
   const phase=t*3.8+i*Math.PI;
   const x=R*.65*Math.sin(phase),y=R*.36*Math.cos(phase);
   if(Math.cos(phase)<-.15)continue;
   glow(x,y,25,'rgba(255,255,255,.48)');
  }
  // Magnetospheric sparks and charged particles.
  for(let i=0;i<65;i++){
   const a=i*2.399+t*(.36+(i%5)*.13);
   const r=110+(i*53%235),x=r*Math.cos(a),y=.76*r*Math.sin(a);
   const flick=.35+.65*Math.pow(Math.sin(t*3+i*4.1),2);
   ctx.fillStyle='rgba(151,225,255,'+(.16+.65*flick)+')';
   ctx.beginPath();ctx.arc(x,y,.7+(i%4)*.38,0,TAU);ctx.fill();
  }
  ctx.restore();
  if(!motion.matches)requestAnimationFrame(render);
 }
 motion.addEventListener('change',()=>{if(!motion.matches&&active)requestAnimationFrame(render);else render(0)});
 document.addEventListener('visibilitychange',()=>{active=!document.hidden;if(active)requestAnimationFrame(render)});
 requestAnimationFrame(render);
})();