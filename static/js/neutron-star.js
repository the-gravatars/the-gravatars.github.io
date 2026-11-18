/* Animated, scientifically inspired pulsating neutron star and schematic GW strain. */
(() => {
  const canvas = document.getElementById('neutron-star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = 760, H = 760, cx = 380, cy = 378, R = 119;
  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => { reduced = e.matches; });
  let start = performance.now();
  const TAU = Math.PI * 2;
  function frame(now) {
    const t = reduced ? 0 : (now - start) / 1000;
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
    // Dipolar magnetospheric field lines behind the star, sweeping with the magnetic axis.
    ctx.save();
    ctx.translate(cx, cy);
    const magneticTilt = -.48 + .22 * Math.sin(t * 3.5);
    ctx.rotate(magneticTilt);
    for (const side of [-1, 1]) {
      for (let k = 0; k < 11; k++) {
        const extent = 150 + k * 19;
        const polar = 28 + k * 2.5;
        ctx.beginPath();
        ctx.moveTo(side * polar, -R * .83);
        ctx.bezierCurveTo(side * extent, -extent * .95,
                          side * extent * 1.12, extent * .9,
                          side * polar, R * .83);
        const alpha = .31 - k * .015;
        ctx.strokeStyle = 'rgba(105,192,255,' + alpha + ')';
        ctx.lineWidth = k % 4 === 0 ? 1.6 : .85;
        ctx.stroke();
      }
    }
    ctx.restore();
    // Pulsar beams from the magnetic poles, inclined to the rotation axis.
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-.48 + .22 * Math.sin(t * 3.5));
    for (const sign of [-1, 1]) {
      const beam = ctx.createLinearGradient(0, sign * 68, 0, sign * 330);
      beam.addColorStop(0, 'rgba(133,221,255,.30)');
      beam.addColorStop(1, 'rgba(104,175,255,0)');
      ctx.fillStyle = beam;
      ctx.beginPath(); ctx.moveTo(-28, sign * 70); ctx.lineTo(-90, sign * 335); ctx.lineTo(90, sign * 335); ctx.lineTo(28, sign * 70); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // The star: atmospheric limb, luminous surface, gravitational limb darkening.
    const pulse = 1 + .009 * Math.sin(t * 9.2);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(pulse, pulse);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
    const surface = ctx.createRadialGradient(-42, -48, 7, 16, 12, 157);
    surface.addColorStop(0, '#fff0f3');
    surface.addColorStop(.21, '#f7b4ce');
    surface.addColorStop(.43, '#b95098');
    surface.addColorStop(.73, '#572467');
    surface.addColorStop(1, '#050d2d');
    ctx.fillStyle = surface; ctx.fillRect(-R,-R,2*R,2*R);
    // Rotating surface bands, with curvature from projected spherical coordinates.
    const spin = t * 5.0;
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
    // Fine-grained luminous crustal texture, inspired by the reference.
    for (let i = 0; i < 190; i++) {
      const lat = Math.asin(2 * ((i * .61803398875) % 1) - 1);
      const lon = spin + i * 2.3999632297;
      const visibility = Math.cos(lon);
      if (visibility <= 0) continue;
      const x = R * Math.cos(lat) * Math.sin(lon);
      const y = R * Math.sin(lat) * .93;
      const rr = .6 + (i % 5) * .32;
      ctx.beginPath();ctx.arc(x,y,rr,0,TAU);
      ctx.fillStyle = i%4===0 ? 'rgba(255,240,195,.8)' : i%3===0 ? 'rgba(255,187,232,.65)' : 'rgba(37,9,70,.45)';
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
    if (!reduced) requestAnimationFrame(frame);
  }
  canvas.width=W; canvas.height=H;
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !reduced) requestAnimationFrame(frame); });
})();