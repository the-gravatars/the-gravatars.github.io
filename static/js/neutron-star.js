/* Animated, scientifically inspired pulsating neutron star and schematic GW strain. */
(() => {
  const canvas = document.getElementById('neutron-star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = 760, H = 760, cx = 380, cy = 378, R = 119;
  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { reduced = e.matches; });
  // Mobile browsers can struggle with a 760px canvas at full resolution.
  // Keep logical coordinates unchanged while reducing the backing buffer on phones.
  const mobile = window.matchMedia('(max-width: 650px)').matches;
  const renderScale = mobile ? 0.63 : 1;
  canvas.width = Math.round(W * renderScale);
  canvas.height = Math.round(H * renderScale);
  const start = performance.now();
  let rafId = null;
  const TAU = Math.PI * 2;
  function frame(now) {
    const t = reduced ? 0 : (now - start) / 1000;
    ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // Subtle warped-coordinate contours: a visualization, not a numerical GR solution.
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.37);
    for (let k = 0; k < 8; k++) {
      const a = 168 + k * 36;
      const phase = k * 0.48 - t * 1.65;
      ctx.beginPath();
      for (let j = 0; j <= 240; j++) {
        const q = j / 240 * TAU;
        const strain = 5.5 * Math.sin(2 * q - phase) * Math.exp(-k * 0.17);
        const x = (a + strain) * Math.cos(q);
        const y = (a * .73 - strain) * Math.sin(q);
        if (!j) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(124,167,255,' + (0.24 - k * .019) + ')';
      ctx.lineWidth = k < 2 ? 1.6 : 1;
      ctx.stroke();
    }
    // Propagating quadrupolar wavefronts.
    for (let k = 0; k < 3; k++) {
      const cycle = ((t * 0.22 + k / 3) % 1);
      const a = 155 + cycle * 220;
      ctx.beginPath();
      for (let j = 0; j <= 240; j++) {
        const q = j / 240 * TAU;
        const mod = 8 * Math.cos(2 * q - t * 2);
        const x = (a + mod) * Math.cos(q);
        const y = (a * .73 - mod) * Math.sin(q);
        if (!j) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(133,192,255,' + (0.2 * (1 - cycle)) + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
    // Extended atmosphere / magnetic glow.
    let glow = ctx.createRadialGradient(cx, cy, 75, cx, cy, 240);
    glow.addColorStop(0, 'rgba(71,148,248,.27)');
    glow.addColorStop(.45, 'rgba(55,99,213,.10)');
    glow.addColorStop(1, 'rgba(35,69,150,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, 240, 0, TAU); ctx.fill();
    // Pulsar beams from the magnetic poles, inclined to the rotation axis.
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-.56 + .17 * Math.sin(t * 1.5));
    for (const sign of [-1, 1]) {
      const beam = ctx.createLinearGradient(0, sign * 68, 0, sign * 330);
      beam.addColorStop(0, 'rgba(133,221,255,.30)');
      beam.addColorStop(1, 'rgba(104,175,255,0)');
      ctx.fillStyle = beam;
      ctx.beginPath(); ctx.moveTo(-28, sign * 70); ctx.lineTo(-90, sign * 335); ctx.lineTo(90, sign * 335); ctx.lineTo(28, sign * 70); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // The star: atmospheric limb, luminous surface, gravitational limb darkening.
    const pulse = 1 + .017 * Math.sin(t * 4.6);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(pulse, pulse);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
    const surface = ctx.createRadialGradient(-42, -48, 7, 16, 12, 157);
    surface.addColorStop(0, '#d5f4ff');
    surface.addColorStop(.21, '#8ed1f0');
    surface.addColorStop(.43, '#4e8cc5');
    surface.addColorStop(.73, '#1b437f');
    surface.addColorStop(1, '#050d2d');
    ctx.fillStyle = surface; ctx.fillRect(-R,-R,2*R,2*R);
    // Rotating surface bands, with curvature from projected spherical coordinates.
    const spin = t * 3.75;
    for (let band = -8; band <= 8; band++) {
      const lat = band / 9 * Math.PI / 2;
      ctx.beginPath();
      for (let j = 0; j <= 120; j++) {
        const longitude = -Math.PI/2 + j/120 * Math.PI;
        const x = R * Math.cos(lat) * Math.sin(longitude);
        const y = R * Math.sin(lat) * .86 + 8 * Math.sin(longitude * 3 + spin + band) * Math.cos(lat);
        if (!j) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = band % 2 ? 'rgba(7,38,95,.20)' : 'rgba(205,241,255,.18)';
      ctx.lineWidth = 4 + 2 * Math.sin(spin + band);
      ctx.stroke();
    }
    // Advecting bright and dark plasma structures across the visible hemisphere.
    for (let i = 0; i < 26; i++) {
      const lat = Math.sin(i * 2.41) * 1.18;
      const lon = spin + i * 2.399;
      const front = Math.cos(lon);
      if (front < 0) continue;
      const x = R * Math.cos(lat) * Math.sin(lon);
      const y = R * Math.sin(lat) * .9;
      const size = (4 + (i % 5) * 2) * (.3 + front * .7);
      ctx.beginPath(); ctx.ellipse(x,y,size,size*.5,-.4,0,TAU);
      ctx.fillStyle = i%3===0 ? 'rgba(219,248,255,.23)' : 'rgba(8,38,90,.19)';
      ctx.fill();
    }
    // Fixed illumination keeps the rotating texture legible.
    const shade = ctx.createLinearGradient(-R,-R,R,R);
    shade.addColorStop(0,'rgba(229,250,255,.16)');
    shade.addColorStop(.5,'rgba(5,17,55,0)');
    shade.addColorStop(1,'rgba(1,5,23,.63)');
    ctx.fillStyle=shade; ctx.fillRect(-R,-R,2*R,2*R);
    ctx.restore();
    ctx.beginPath();ctx.arc(cx,cy,R*pulse,0,TAU);
    ctx.strokeStyle='rgba(160,222,255,.46)';ctx.lineWidth=1.5;ctx.stroke();
    if (!reduced && !document.hidden) rafId = requestAnimationFrame(frame);
    else rafId = null;
  }
  rafId = requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    } else if (rafId === null) {
      rafId = requestAnimationFrame(frame);
    }
  });
})();