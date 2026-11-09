/* SPECTRAL DRAPE — a sheet of glowing dots folding in 3D (the page background).
   Pure drawing code with no DOM access, shared by the background worker (drape-worker.js) and by the
   in-page fallback. makeDrape(ctx, newCanvas) → { set(state), message(msg), draw(now) } */
(function (root) {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  root.makeDrape = function makeDrape(cx, newCanvas) {
    const S = { w: 1, h: 1, dpr: 1, scrollY: 0, theme: "light", small: false, reduced: false, visible: true };
    let COLS = 72, ROWS = 40;
    const sprite = col => { const c = newCanvas(32, 32); c.width = c.height = 32; const g = c.getContext("2d"); const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      r.addColorStop(0, col); r.addColorStop(.45, col); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return c; };
    // the six colours sampled from the logo, dark to light along the fold
    const SPR_LIGHT = ["#0d0a38", "#292467", "#1e24bb", "#515c9f", "#78c7e4", "#ab50db"].map(sprite), SPR_DARK = ["#c9cce8", "#9fa6ff", "#5a63ff", "#8f96d6", "#78c7e4", "#ab50db"].map(sprite);
    const MAG = ["#6a2f85", "#9242b3", "#ab50db", "#c856e6", "#c856e6"].map(sprite); // the logo's magenta/pink, light to bright
    let SPR = SPR_LIGHT, mx = 0, my = 0, tmx = 0, tmy = 0;
    const t0 = performance.now(), ripples = [];
    function size() {
      const c = cx.canvas; c.width = Math.round(S.w * S.dpr); c.height = Math.round(S.h * S.dpr); cx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
      // a little lighter than before: the fold reads the same, with ~45% fewer dots to paint
      COLS = S.small ? 46 : 72; ROWS = S.small ? 28 : 40;
    }
    function set(st) { const resize = st.w !== S.w || st.h !== S.h || st.dpr !== S.dpr || st.small !== S.small; Object.assign(S, st); SPR = S.theme === "dark" ? SPR_DARK : SPR_LIGHT; if (resize) size(); }
    function message(m) {
      if (m.type === "size") set(m);
      else if (m.type === "scroll") S.scrollY = m.scrollY;
      else if (m.type === "pointer") { tmx = m.x; tmy = m.y; }
      else if (m.type === "ripple") { ripples.push({ x: m.x, y: m.y, t: performance.now() }); if (ripples.length > 5) ripples.shift(); }
      else if (m.type === "theme") set({ theme: m.theme });
      else if (m.type === "visible") S.visible = m.visible;
    }
    function draw(now) {
      const W = S.w, H = S.h, t = (now - t0) / 1000, sc = S.scrollY / Math.max(1, H);
      mx += (tmx - mx) * .04; my += (tmy - my) * .04;
      for (let r = ripples.length - 1; r >= 0; r--) if (now - ripples[r].t > 2600) ripples.splice(r, 1);
      cx.clearRect(0, 0, W, H);
      const fadeOut = 1 - clamp(S.scrollY / Math.max(1, H * .8)) * .7; // quieter behind the content below the intro
      const ry = .5 + mx * .5 + Math.sin(t * .07) * .25, rx = 1.05 + my * .25, cy = Math.cos(ry), sy = Math.sin(ry), cxr = Math.cos(rx), sxr = Math.sin(rx);
      const F = Math.min(W, H) * 1.25, scale = Math.max(W, H) * .62, R = Math.max(W, H);
      // dots are a touch larger than before so the thinner grid still reads as a continuous sheet
      const grow = S.small ? 1.18 : 1.25;
      for (let j = 0; j < ROWS; j++) {
        const v = j / (ROWS - 1) * 2 - 1;
        for (let i = 0; i < COLS; i++) {
          const u = i / (COLS - 1) * 2 - 1;
          const z = Math.sin(u * 2.3 + t * .55 + sc * .6) * .32 + Math.sin(v * 3.1 - t * .7) * .22 + Math.sin((u + v) * 1.6 + t * .35) * .18 + Math.cos(u * v * 3 + sc * .4) * .1;
          const x = u * 1.5, y = v;
          const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
          const y2 = y * cxr - z1 * sxr, z2 = y * sxr + z1 * cxr + 3.2;
          let px = W / 2 + x1 * scale / z2 * 1.6, py = H * .52 + y2 * scale / z2 * 1.6, boost = 0;
          for (const rp of ripples) { // a ring travelling outward, fading as it goes
            const age = (now - rp.t) / 1000, dx = px - rp.x, dy = py - rp.y, d = Math.hypot(dx, dy) || 1;
            const front = age * R * .55, band = Math.exp(-((d - front) ** 2) / (2 * (60 + age * 50) ** 2)), fade = Math.exp(-age * 1.4);
            const w = Math.sin((d - front) * .045) * band * fade;
            px += dx / d * w * 26; py += dy / d * w * 26 - band * fade * 14; boost += band * fade;
          }
          if (px < -20 || px > W + 20 || py < -20 || py > H + 20) continue;
          const depth = clamp((4.4 - z2) / 2.4), s = (1.1 + depth * 3.6 + boost * 2.5) * (F / 1000) * grow;
          const k = clamp((z + .7) / 1.4), hsh = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
          const spr = hsh < .55 ? MAG[Math.min(4, Math.floor(k * 5))] : SPR[Math.min(5, Math.floor(k * 6))];
          cx.globalAlpha = Math.min(1, (.1 + depth * .45) * fadeOut + boost * .5);
          cx.drawImage(spr, px - s, py - s, s * 2, s * 2);
        }
      }
      cx.globalAlpha = 1;
    }
    return { set, message, draw, state: S };
  };
})(typeof self !== "undefined" ? self : globalThis);
