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
  fly.innerHTML = `<span class="flylogo__spin"><span class="flylogo__coin"><img src="${src}" alt="" draggable="false" decoding="async"><span class="flylogo__shine" aria-hidden="true"></span><span class="flylogo__glint" aria-hidden="true"></span></span><span class="flylogo__back" aria-hidden="true"><img src="${src}" alt="" draggable="false" decoding="async"></span></span>`;
  document.body.appendChild(fly);
  const spinEl = fly.querySelector(".flylogo__spin"), coin = fly.querySelector(".flylogo__coin");
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
    sizeCanvas(); wake(true);
  }

  // ---- motion state ----
  // p: raw progress (scroll, or the menu tween); kd: what is shown, a critically damped follower of p
  // (so a wheel notch never makes the coin jump); spin: coin angle, rolled by the motion, at rest face-on
  const S = { kd: 0, kv: 0, spin: 0, spinV: 0, spinTo: 0, still: 0, last: 0, trail: [], lastPt: null };
  let forced = 0, fFrom = 0, fTo = 0, fT0 = 0, raf = 0;
  const FDUR = 820;
  const rawP = now => {
    if (fT0) { const e = clamp01((now - fT0) / FDUR); forced = fFrom + (fTo - fFrom) * ease(e); if (e >= 1) fT0 = 0; }
    return Math.max(clamp01(scrollY / travel), forced);
  };

  // the arc: from wherever the page holds the resting spot, bowing up and out (a toss), down onto the header logo
  function at(k) {
    const ax = start.x, ay = start.y - scrollY, bx = end.x, by = end.y;
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, bow = Math.min(len * .24, 220, innerWidth * .2);
    const cx = (ax + bx) / 2 - (dy / len) * bow, cy = (ay + by) / 2 + (dx / len) * bow, u = 1 - k;
    return { x: u * u * ax + 2 * u * k * cx + k * k * bx, y: u * u * ay + 2 * u * k * cy + k * k * by, size: start.size + (end.size - start.size) * k };
  }
  function frame(now) {
    raf = 0; if (!start) return;
    const dt = S.last ? Math.min(.1, (now - S.last) / 1000) : 1 / 60; S.last = now;
    const p = rawP(now);
    let busy = !!fT0;
    if (reduced) { S.kd = p > .5 ? 1 : 0; S.kv = 0; }
    else {
      const w = 15, prev = S.kd; let rem = dt;
      while (rem > 0) { const h = Math.min(rem, 1 / 240); S.kv += (w * w * (p - S.kd) - 2 * w * S.kv) * h; S.kd += S.kv * h; rem -= h; }
      if (Math.abs(p - S.kd) < 1e-4 && Math.abs(S.kv) < 1e-3) { S.kd = p; S.kv = 0; } else busy = true;
      // the coin rolls with the travel: one and a half turns across the whole flight, then settles face-on
      const dk = S.kd - prev; S.spinTo += dk * 540;
      if (Math.abs(dk) < 2e-4) { if ((S.still += dt) > .12) S.spinTo = Math.round(S.spinTo / 180) * 180; } else S.still = 0;
      const ws = 11; for (let rem = dt; rem > 0; rem -= 1 / 240) { const h = Math.min(rem, 1 / 240); S.spinV += (ws * ws * (S.spinTo - S.spin) - 2 * ws * S.spinV) * h; S.spin += S.spinV * h; }
      if (Math.abs(S.spinTo - S.spin) > .05 || Math.abs(S.spinV) > .05) busy = true; else { S.spin = S.spinTo; S.spinV = 0; }
    }
    const kd = clamp01(S.kd), k = ease(kd), { x, y, size } = at(k), sc = size / start.size;
    fly.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${sc.toFixed(4)})`;
    spinEl.style.transform = S.spin ? `rotateY(${S.spin.toFixed(2)}deg)` : "";
    const docked = clamp01(S.kd) > .995 && p > .995;
    fly.classList.toggle("is-docked", docked);
    fly.style.setProperty("--fly-p", clamp01(S.kd).toFixed(3));

    // trail + letters only while it is actually travelling
    const mx = x + size / 2, my = y + size / 2, lp = S.lastPt, speed = lp ? Math.hypot(mx - lp.x, my - lp.y) / Math.max(dt, 1e-3) : 0;
    if (!reduced && lp && speed > 40 && (k > .002 && k < .998 || lp.k > .002 && lp.k < .998)) {
      // fill in the curve between frames so the trail stays a smooth ribbon even on a slow device
      const n = Math.min(10, Math.ceil(Math.hypot(mx - lp.x, my - lp.y) / 14)), a = Math.min(1, speed / 900);
      const added = [];
      for (let i = 1; i <= n; i++) { const q = at(lp.k + (k - lp.k) * i / n); added.push({ x: q.x + q.size / 2, y: q.y + q.size / 2, r: q.size / 2, t: lp.t + (now - lp.t) * i / n, a }); }
      S.trail.push(...added); lightLetters(added);
    }
    S.lastPt = { x: mx, y: my, k, t: now };
    if (drawTrail(now)) busy = true;
    if (busy) raf = requestAnimationFrame(frame); else S.last = 0;
  }
  const wake = force => { if (!raf) raf = requestAnimationFrame(frame); if (force) S.lastPt = null; };

  const LIFE = 460;
  function drawTrail(now) {
    const pts = S.trail; while (pts.length && now - pts[0].t > LIFE) pts.shift();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (pts.length < 2) { if (pts.length === 0) return false; return true; }
    ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], age = clamp01((now - b.t) / LIFE), life = (1 - age) ** 1.6, along = i / pts.length;
      const col = TRAIL[Math.min(TRAIL.length - 1, Math.floor((1 - along) * TRAIL.length))];
      // a soft wide glow and a fine bright core, both thinning to nothing
      ctx.strokeStyle = `rgba(${col}, ${(.16 * life * b.a).toFixed(3)})`; ctx.lineWidth = b.r * .5 * life + 1;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = `rgba(${col}, ${(.7 * life * b.a).toFixed(3)})`; ctx.lineWidth = b.r * .1 * life + .5;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    return true;
  }

  // the name's letters strike on and stutter as the coin flies over them
  const chars = letters ? [...letters.querySelectorAll(".ch")] : [], timers = new Map();
  function lightLetters(pts) {
    for (const c of chars) {
      const b = c.getBoundingClientRect(); if (!b.width) continue;
      const lx = b.left + b.width / 2, ly = b.top + b.height / 2;
      if (!pts.some(q => Math.hypot(lx - q.x, ly - q.y) < q.r + b.width * .45)) continue;
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
  S.kd = rawP(performance.now()); S.spin = S.spinTo = 0;

  // 3D tilt + silver glare (no colour), stronger while it is big
  holo(coin, { tiltMax: 14, hoverScale: 1.04, glare: .8, intensity: 0, edgeSparkle: 0, frame: 0 });
  // a press sends a fine reflection across the face
  const shine = () => { coin.classList.remove("is-shining"); void coin.offsetWidth; coin.classList.add("is-shining"); };
  fly.addEventListener("pointerdown", shine);
  fly.addEventListener("click", e => { if (!fly.classList.contains("is-docked")) e.preventDefault(); }); // only the docked logo navigates
  return { measure };
}
