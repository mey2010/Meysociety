/* Shatter Type — an original take on "a headline cut into glass shards that assemble, crack under the
   cursor and shatter on click". The headline is cut into Voronoi shards; every shard is a live copy of the
   text clipped to its polygon, so whatever the headline does (here: the neon Signal flicker) every shard
   does too. Shards fly in and assemble, shift and show their cracks around the pointer, and burst apart
   on click / tap before springing back into place. */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Voronoi cells of a rectangle by half-plane clipping (n is small, so O(n²) is fine)
function clipHalf(poly, p, q) { // keep the side of the bisector closer to p
  const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2, nx = q[0] - p[0], ny = q[1] - p[1];
  const side = v => (v[0] - mx) * nx + (v[1] - my) * ny; // < 0 → p's side
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], sa = side(a), sb = side(b);
    if (sa <= 0) out.push(a);
    if ((sa < 0 && sb > 0) || (sa > 0 && sb < 0)) { const t = sa / (sa - sb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  }
  return out;
}
function voronoi(w, h, cols, rows) {
  const sites = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) sites.push([(c + .2 + Math.random() * .6) / cols * w, (r + .2 + Math.random() * .6) / rows * h]);
  return sites.map((p, i) => { let poly = [[0, 0], [w, 0], [w, h], [0, h]]; sites.forEach((q, j) => { if (i !== j && poly.length) poly = clipHalf(poly, p, q); }); return poly; }).filter(p => p.length > 2);
}

export function shatterType(h) {
  const M = 40; // room around the text for the neon glow
  const wrap = document.createElement("span"); wrap.className = "shatter"; h.parentNode.insertBefore(wrap, h); wrap.appendChild(h);
  const layer = document.createElement("span"); layer.className = "shatter__layer"; layer.setAttribute("aria-hidden", "true"); wrap.appendChild(layer);
  const svgNS = "http://www.w3.org/2000/svg", cracks = document.createElementNS(svgNS, "svg"); cracks.setAttribute("class", "shatter__cracks"); layer.appendChild(cracks);
  let shards = [], W = 0, H = 0, raf = 0, last = 0, pointer = null, burstAt = 0;

  function build() {
    const r = h.getBoundingClientRect(); W = r.width; H = r.height; if (!W || !H) return;
    layer.querySelectorAll(".shatter__shard").forEach(s => s.remove());
    const fw = W + 2 * M, fh = H + 2 * M, cols = Math.max(5, Math.round(W / 70)), rows = W < 500 ? 2 : 3;
    const cells = voronoi(fw, fh, cols, rows);
    Object.assign(layer.style, { left: -M + "px", top: -M + "px", width: fw + "px", height: fh + "px" });
    cracks.setAttribute("viewBox", `0 0 ${fw} ${fh}`);
    cracks.innerHTML = cells.map(p => `<polygon points="${p.map(v => v.map(n => n.toFixed(1)).join(",")).join(" ")}"/>`).join("");
    const prev = shards; shards = cells.map((poly, i) => {
      const el = document.createElement("span"); el.className = "shatter__shard";
      const copy = h.cloneNode(true); copy.removeAttribute("id"); copy.setAttribute("aria-hidden", "true"); copy.classList.add("shatter__copy");
      copy.style.padding = M + "px"; copy.style.margin = "0"; el.appendChild(copy);
      el.style.clipPath = `polygon(${poly.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
      const cx = poly.reduce((s, v) => s + v[0], 0) / poly.length, cy = poly.reduce((s, v) => s + v[1], 0) / poly.length;
      el.style.transformOrigin = `${cx.toFixed(1)}px ${cy.toFixed(1)}px`;
      layer.insertBefore(el, cracks);
      const old = prev[i];
      return { el, cx, cy, x: old?.x ?? 0, y: old?.y ?? 0, r: old?.r ?? 0, o: old?.o ?? 1, vx: 0, vy: 0, vr: 0, vo: 0, free: 0 };
    });
    wrap.classList.add("is-cut");
  }
  // keep every copy in step with the real headline (the neon flicker toggles classes on its letters)
  new MutationObserver(recs => {
    for (const rec of recs) {
      const t = rec.target; if (!t.classList?.contains("ch")) continue;
      const idx = [...h.querySelectorAll(".ch")].indexOf(t); if (idx < 0) continue;
      shards.forEach(s => { const c = s.el.querySelectorAll(".ch")[idx]; if (c) c.className = t.className; });
    }
  }).observe(h, { subtree: true, attributes: true, attributeFilter: ["class"] });

  function assemble() { // shards fly in from all around and settle into the word
    shards.forEach((s, i) => {
      const a = Math.atan2(s.cy - (H / 2 + M), s.cx - (W / 2 + M)) + (Math.random() - .5) * .8, d = 160 + Math.random() * 260;
      s.x = Math.cos(a) * d; s.y = Math.sin(a) * d; s.r = (Math.random() - .5) * 120; s.o = 0; s.vx = s.vy = s.vr = 0;
      s.delay = .05 + Math.random() * .55;
    });
    wake();
  }
  function burst(px, py) { // a hard tap: every shard flies away from the point of impact
    burstAt = performance.now();
    shards.forEach(s => {
      const dx = s.cx - px, dy = s.cy - py, d = Math.hypot(dx, dy) || 1, k = 1 - clamp(d / (W + 2 * M), 0, .8);
      const sp = (520 + Math.random() * 520) * k;
      s.vx = dx / d * sp + (Math.random() - .5) * 120; s.vy = dy / d * sp - 200 * Math.random(); s.vr = (Math.random() - .5) * 760; s.free = .32 + Math.random() * .22;
    });
    wrap.classList.add("is-burst"); wake();
  }
  function tick(now) {
    raf = 0; const dt = Math.min(.033, (now - last) / 1000 || .016); last = now; let busy = false;
    const local = pointer && !reduced ? pointer : null;
    for (const s of shards) {
      if (s.delay > 0) { s.delay -= dt; busy = true; continue; }
      if (s.free > 0) { // flying
        s.free -= dt; s.vy += 900 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt; s.vx *= .985; s.vr *= .985; busy = true;
      } else {
        // crack under the cursor: nearby shards shift a hair away from it
        let tx = 0, ty = 0, tr = 0;
        if (local) { const dx = s.cx - local.x, dy = s.cy - local.y, d = Math.hypot(dx, dy), R = 150; if (d < R) { const f = (1 - d / R) ** 2; tx = dx / (d || 1) * 7 * f; ty = dy / (d || 1) * 7 * f; tr = (s.cx > local.x ? 1 : -1) * 2.2 * f; } }
        const k = 170, c = 19;
        s.vx += ((tx - s.x) * k - s.vx * c) * dt; s.vy += ((ty - s.y) * k - s.vy * c) * dt; s.vr += ((tr - s.r) * k - s.vr * c) * dt;
        s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt;
        if (Math.abs(s.x - tx) + Math.abs(s.y - ty) + Math.abs(s.r - tr) + Math.abs(s.vx) + Math.abs(s.vy) > .05) busy = true;
      }
      s.o += (1 - s.o) * Math.min(1, dt * 6); if (s.o < .995) busy = true;
      s.el.style.transform = `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px) rotate(${s.r.toFixed(2)}deg)`;
      s.el.style.opacity = s.o.toFixed(3);
    }
    if (performance.now() - burstAt > 1100) wrap.classList.remove("is-burst");
    if (busy || local) raf = requestAnimationFrame(tick);
    // at rest the shards sit exactly on the real heading: show that instead, so a neon flicker repaints one
    // heading rather than every shard copy
    else wrap.classList.add("is-rest");
  }
  const wake = () => { wrap.classList.remove("is-rest"); if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  const toLocal = e => { const r = layer.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  wrap.addEventListener("pointermove", e => { if (e.pointerType === "touch") return; pointer = toLocal(e); const p = pointer; wrap.style.setProperty("--crack-x", p.x + "px"); wrap.style.setProperty("--crack-y", p.y + "px"); wrap.classList.add("is-near"); wake(); });
  wrap.addEventListener("pointerleave", () => { pointer = null; wrap.classList.remove("is-near"); wake(); });
  wrap.addEventListener("click", e => { if (reduced) return; const p = toLocal(e); burst(p.x, p.y); });

  let rt = 0;
  const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(build, 120); });
  document.fonts?.ready.then(() => { build(); if (!reduced) assemble(); ro.observe(h); });
  return { burst: () => burst(W / 2 + M, H / 2 + M) };
}
