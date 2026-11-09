/* The flying logo: it rests large under the intro buttons, and as the page scrolls (or the menu opens)
   it is tossed along an arc to the header corner, spinning like a coin and landing face-on, with a neon
   trail in the logo's own colours that fades as it arrives. The letters of the name light up and flicker
   as the coin passes over them. A press sends a fine reflection across the face (clipped to the coin). */
import { holo } from "./holo.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = v => Math.min(1, Math.max(0, v));
const TRAIL = ["120,199,228", "171,80,219", "200,86,230", "106,47,133"]; // cyan → violet → magenta → plum

export function logoFlight({ slot, headerImg, headerLink, src, menu, letters }) {
  const fly = document.createElement("a");
  fly.className = "flylogo"; fly.href = headerLink.getAttribute("href") || "#top";
  fly.setAttribute("aria-label", headerLink.getAttribute("aria-label") || "Mey Society");
  const EDGES = 12; // discs stacked through the coin's thickness: they are its edge when it tilts or spins
  fly.innerHTML = `<span class="flylogo__shadow" aria-hidden="true"></span><span class="flylogo__spin">${'<span class="flylogo__edge" aria-hidden="true"></span>'.repeat(EDGES)}<span class="flylogo__coin"><img src="${src}" alt="" draggable="false" decoding="async"><span class="flylogo__socket" aria-hidden="true"></span><span class="flylogo__shine" aria-hidden="true"></span><span class="flylogo__glint" aria-hidden="true"></span></span>${'<span class="flylogo__core-edge" aria-hidden="true"></span>'.repeat(4)}<span class="flylogo__core" aria-hidden="true"><span class="flylogo__core-drop"></span><img src="${src}" alt="" draggable="false" decoding="async"><span class="flylogo__core-bevel"></span><span class="flylogo__shine"></span><span class="flylogo__glint"></span></span><span class="flylogo__back" aria-hidden="true"><img src="${src}" alt="" draggable="false" decoding="async"></span></span>`;
  document.body.appendChild(fly);
  const spinEl = fly.querySelector(".flylogo__spin"), coin = fly.querySelector(".flylogo__coin"), core = fly.querySelector(".flylogo__core");
  headerImg.classList.add("is-flown"); // the flying coin takes its place

  // the neon trail is drawn on one fixed canvas under the coin
  const cv = document.createElement("canvas"); cv.className = "flylogo__trail"; cv.setAttribute("aria-hidden", "true"); document.body.appendChild(cv);
  const ctx = cv.getContext("2d"); let dpr = 1;
  const sizeCanvas = () => { dpr = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(innerWidth * dpr); cv.height = Math.round(innerHeight * dpr); };
  sizeCanvas();

  let start = null, end = null, travel = 1;
  function measure() {
    const s = slot.getBoundingClientRect(), e = headerImg.getBoundingClientRect();
    start = { x: s.left, y: s.top + scrollY, size: s.width };              // page coordinates of the resting spot
    end = { x: e.left, y: e.top, size: e.width };                         // viewport coordinates of the header logo
    travel = Math.max(1, start.y - end.y);                                // scrolling this far brings the spot up to the header row
    fly.style.width = fly.style.height = start.size + "px";
    const t = start.size * .034; fly.style.setProperty("--t", t.toFixed(2) + "px");
    fly.querySelectorAll(".flylogo__edge").forEach((e, i, all) => { e.style.transform = `translateZ(${(-t + 2 * t * (i + .5) / all.length).toFixed(2)}px)`; });
    // the centre is its own piece, seated proud of the ring
    const d = start.size * .032; fly.style.setProperty("--d", d.toFixed(2) + "px");
    fly.querySelectorAll(".flylogo__core-edge").forEach((e, i, all) => { e.style.transform = `translateZ(${(t + d * (i + .5) / all.length).toFixed(2)}px)`; });
    sizeCanvas(); measureChars(); wake(true);
  }

  // ---- motion state ----
  // p: raw progress (scroll, or the menu tween); kd: what is shown, a critically damped follower of p
  // (so a wheel notch never makes the coin jump); spin: coin angle, rolled by the motion, at rest face-on
  // sy: a smoothed copy of the scroll position. The whole flight is drawn from it (never from the raw value, which
  // the browser updates on its own thread), and it follows harder the faster you scroll: gentle on a slow scroll,
  // tight on a flick, never a jump.
  const S = { kd: 0, kv: 0, sy: scrollY, sv: 0, spin: 0, spinV: 0, spinTo: 0, still: 0, last: 0, trail: [], lastPt: null, box: null };
  let forced = 0, fFrom = 0, fTo = 0, fT0 = 0, raf = 0;
  const FDUR = 820;
  const rawP = now => {
    if (fT0) { const e = clamp01((now - fT0) / FDUR); forced = fFrom + (fTo - fFrom) * ease(e); if (e >= 1) fT0 = 0; }
    return Math.max(clamp01(S.sy / travel), forced);
  };

  // the arc: from wherever the page holds the resting spot, bowing up and out (a toss), down onto the header logo
  function at(k) {
    // the resting spot rides up with the page, easing into the header row instead of racing past it on a flick
    const x0 = S.sy / travel, lim = .5, ride = travel * (x0 <= lim ? x0 : lim + (1 - lim) * Math.tanh((x0 - lim) / (1 - lim)));
    const ax = start.x, ay = start.y - ride, bx = end.x, by = end.y;
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, bow = Math.min(len * .24, 220, innerWidth * .2);
    const cx = (ax + bx) / 2 - (dy / len) * bow, cy = (ay + by) / 2 + (dx / len) * bow, u = 1 - k;
    return { x: u * u * ax + 2 * u * k * cx + k * k * bx, y: u * u * ay + 2 * u * k * cy + k * k * by, size: start.size + (end.size - start.size) * k };
  }
  function frame(now) {
    raf = 0; if (!start) return;
    const dt = S.last ? Math.min(.1, (now - S.last) / 1000) : 1 / 60; S.last = now;
    let busy = !!fT0;
    if (reduced) S.sy = scrollY;
    else {
      // adaptive follow: the further the page has run ahead (a fast scroll), the stiffer the spring
      for (let rem = dt; rem > 0; rem -= 1 / 240) {
        const h = Math.min(rem, 1 / 240), gap = scrollY - S.sy, w = 12 + Math.min(14, Math.abs(gap) / 60);
        S.sv += (w * w * gap - 2 * w * S.sv) * h; S.sy += S.sv * h;
      }
      if (Math.abs(scrollY - S.sy) < .25 && Math.abs(S.sv) < 2) { S.sy = scrollY; S.sv = 0; } else busy = true;
    }
    const p = rawP(now);
    if (reduced) S.kd = p > .5 ? 1 : 0;
    else {
      // the flight itself has a top speed and a bounded acceleration, so even a violent flick plays out as one
      // clean toss (about 0.7 s at most speed) instead of a jump; slow scrolls stay 1:1 under the finger
      const prev = S.kd, wk = 10, VMAX = 2.2, AMAX = 16;
      for (let rem = dt; rem > 0; rem -= 1 / 240) {
        const h = Math.min(rem, 1 / 240), acc = Math.max(-AMAX, Math.min(AMAX, wk * wk * (p - S.kd) - 2 * wk * S.kv));
        S.kv = Math.max(-VMAX, Math.min(VMAX, S.kv + acc * h)); S.kd += S.kv * h;
      }
      if (Math.abs(p - S.kd) < 1e-4 && Math.abs(S.kv) < 1e-3) { S.kd = p; S.kv = 0; } else busy = true;
      // the coin rolls with the travel: one and a half turns across the whole flight, then settles face-on
      const dk = S.kd - prev; S.spinTo += dk * 540;
      if (Math.abs(dk) < 2e-4) { if ((S.still += dt) > .12) S.spinTo = Math.round(S.spinTo / 180) * 180; } else S.still = 0;
      const ws = 11; for (let rem = dt; rem > 0; rem -= 1 / 240) { const h = Math.min(rem, 1 / 240); S.spinV += (ws * ws * (S.spinTo - S.spin) - 2 * ws * S.spinV) * h; S.spin += S.spinV * h; }
      if (Math.abs(S.spinTo - S.spin) > .05 || Math.abs(S.spinV) > .05) busy = true; else { S.spin = S.spinTo; S.spinV = 0; }
    }
    const kd = clamp01(S.kd), k = ease(kd), { x, y, size } = at(k), sc = size / start.size;
    const docked = clamp01(S.kd) > .995 && p > .995;
    if (docked !== S.docked) { S.docked = docked; fly.classList.toggle("is-docked", docked); }
    fly.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${sc.toFixed(4)})`;
    spinEl.style.transform = S.spin ? `rotateY(${S.spin.toFixed(2)}deg)` : "";
    const fp = (Math.round(clamp01(S.kd) * 50) / 50).toFixed(2); // coarse steps: the halo restyles rarely
    if (fp !== S.fp) { S.fp = fp; fly.style.setProperty("--fly-p", fp); }

    // trail + letters only while it is actually travelling
    const mx = x + size / 2, my = y + size / 2, lp = S.lastPt, speed = lp ? Math.hypot(mx - lp.x, my - lp.y) / Math.max(dt, 1e-3) : 0;
    if (!reduced && lp && speed > 40 && (k > .002 && k < .998 || lp.k > .002 && lp.k < .998)) {
      // fill in the curve between frames so the trail stays a smooth ribbon even on a slow device
      const n = Math.min(48, Math.ceil(Math.hypot(mx - lp.x, my - lp.y) / 3.5)), a = Math.min(1, speed / 700);
      const added = [];
      for (let i = 1; i <= n; i++) { const q = at(lp.k + (k - lp.k) * i / n); added.push({ x: q.x + q.size / 2, y: q.y + q.size / 2, r: q.size / 2, t: lp.t + (now - lp.t) * i / n, a }); }
      S.trail.push(...added); lightLetters(added);
    }
    S.lastPt = { x: mx, y: my, k, t: now };
    if (drawTrail(now)) busy = true;
    if (busy) raf = requestAnimationFrame(frame); else S.last = 0;
  }
  const wake = force => { if (!raf) raf = requestAnimationFrame(frame); if (force) S.lastPt = null; };

  const LIFE = 520;
  // pre-rendered soft glow dots, one per colour: stamping them densely along the path gives a seamless ribbon
  const sprite = col => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, `rgba(${col},1)`); r.addColorStop(.35, `rgba(${col},.55)`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return c; };
  const SPR = TRAIL.map(sprite), CORE = sprite("255,255,255");
  function drawTrail(now) {
    const pts = S.trail; while (pts.length && now - pts[0].t > LIFE) pts.shift();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (S.box) { const b = S.box; ctx.clearRect(b[0] - 2, b[1] - 2, b[2] - b[0] + 4, b[3] - b[1] + 4); S.box = null; } // only what was painted
    if (!pts.length) return false;
    const box = S.box = [1e9, 1e9, -1e9, -1e9];
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const q = pts[i], life = (1 - clamp01((now - q.t) / LIFE)) ** 1.5; if (life <= 0) continue;
      const f = (1 - i / n) * (TRAIL.length - 1), k0 = Math.floor(f), mix = f - k0, k1 = Math.min(TRAIL.length - 1, k0 + 1);
      // dots overlap by about R / spacing, so each one is faint: the ribbon keeps its colour instead of burning to white
      const R = q.r * (.22 + .4 * life); box[0] = Math.min(box[0], q.x - R); box[1] = Math.min(box[1], q.y - R); box[2] = Math.max(box[2], q.x + R); box[3] = Math.max(box[3], q.y + R);
      const A = Math.min(.28, 2.3 * 3.5 / R) * life * q.a;
      ctx.globalAlpha = A * (1 - mix); ctx.drawImage(SPR[k0], q.x - R, q.y - R, 2 * R, 2 * R);
      ctx.globalAlpha = A * mix; ctx.drawImage(SPR[k1], q.x - R, q.y - R, 2 * R, 2 * R);
      const r2 = q.r * .09 * life + 1; ctx.globalAlpha = Math.min(.25, 1.2 * 3.5 / r2) * life * life * q.a; ctx.drawImage(CORE, q.x - r2, q.y - r2, 2 * r2, 2 * r2);
    }
    ctx.globalAlpha = 1;
    return true;
  }

  // the name's letters strike on and stutter as the coin flies over them
  const chars = letters ? [...letters.querySelectorAll(".ch")] : [], timers = new Map();
  let charBoxes = [];
  const measureChars = () => { charBoxes = chars.map(c => { const b = c.getBoundingClientRect(); return { c, x: b.left + b.width / 2, y: b.top + b.height / 2 + scrollY, w: b.width }; }).filter(b => b.w); };
  function lightLetters(pts) {
    for (const { c, x, y: py, w } of charBoxes) {
      const lx = x, ly = py - S.sy; // same smoothed frame as the coin's scroll
      if (!pts.some(q => Math.hypot(lx - q.x, ly - q.y) < q.r + w * .45)) continue;
      if (!c.classList.contains("pass")) c.classList.add("pass");
      clearTimeout(timers.get(c)); timers.set(c, setTimeout(() => c.classList.remove("pass"), 760));
    }
  }

  addEventListener("scroll", () => wake(), { passive: true });
  // opening the menu tosses the logo to its corner too; closing it lets it return to where the scroll had it
  function force(to) { fFrom = forced; fTo = to; fT0 = performance.now(); wake(); }
  if (menu) new MutationObserver(() => force(menu.hasAttribute("data-open") ? 1 : 0)).observe(menu, { attributes: true, attributeFilter: ["data-open"] });
  new ResizeObserver(measure).observe(document.documentElement);
  addEventListener("load", measure); measure();
  document.fonts?.ready.then(measure);
  // start where the page already is (a reload halfway down must not fly in from the top)
  S.sy = scrollY; S.kd = rawP(performance.now()); S.spin = S.spinTo = 0;

  // 3D tilt + silver glare (no colour), stronger while it is big
  // (the whole coin tilts, so its thickness shows; the glare is painted on the face)
  holo(spinEl, { media: coin, tiltMax: 16, hoverScale: 1.04, glare: .8, intensity: 0, edgeSparkle: 0, frame: 0 });
  // a press sends a fine reflection across the face
  const shine = () => { [coin, core].forEach(el => el.classList.remove("is-shining")); void coin.offsetWidth; [coin, core].forEach(el => el.classList.add("is-shining")); };
  fly.addEventListener("pointerdown", shine);
  fly.addEventListener("click", e => { if (!fly.classList.contains("is-docked")) e.preventDefault(); }); // only the docked logo navigates
  return { measure };
}
