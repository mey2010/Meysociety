/* Elastic Lettering — an original take on "a headline you can grab, stretch and fling like an elastic band".
   Grab any letter: it follows the pointer and pulls its neighbours with it, fading along the line like a
   stretched band; let go and the whole line snaps back with a springy wobble that keeps the fling's speed. */

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function elasticLettering(el) {
  const text = el.textContent;
  el.textContent = "";
  el.classList.add("elastic");
  el.setAttribute("aria-label", text);
  const letters = [...text].map(ch => {
    const s = document.createElement("span"); s.className = ch === " " ? "elastic__ch elastic__ch--sp" : "elastic__ch"; s.textContent = ch === " " ? " " : ch;
    s.setAttribute("aria-hidden", "true"); el.appendChild(s);
    return { el: s, x: 0, y: 0, vx: 0, vy: 0 };
  });
  if (reduced) return;
  let drag = null, raf = 0, last = 0;
  const reach = 2.6; // how far along the band a pull is felt (in letters)

  function tick(now) {
    raf = 0; const dt = Math.min(.033, (now - last) / 1000 || .016); last = now; let busy = false;
    letters.forEach((L, i) => {
      let tx = 0, ty = 0, k = 170, c = 7.5; // free: a lively spring back home
      if (drag) {
        const f = Math.exp(-Math.abs(i - drag.i) / reach);
        tx = drag.dx * f; ty = drag.dy * f; k = 520; c = 32; // held: follows the hand closely
      }
      L.vx += ((tx - L.x) * k - L.vx * c) * dt; L.vy += ((ty - L.y) * k - L.vy * c) * dt;
      L.x += L.vx * dt; L.y += L.vy * dt;
      if (Math.abs(L.x - tx) + Math.abs(L.y - ty) + Math.abs(L.vx) + Math.abs(L.vy) > .05) busy = true;
    });
    // render: neighbours' offsets tilt and stretch each letter, so the line reads as one band
    letters.forEach((L, i) => {
      const a = letters[i - 1] || L, b = letters[i + 1] || L;
      const slope = (b.y - a.y) / 2, stretch = 1 + Math.min(.6, Math.abs(b.x - a.x) / 60);
      const rot = Math.max(-35, Math.min(35, Math.atan2(slope, 24) * 57.3));
      L.el.style.transform = `translate(${L.x.toFixed(2)}px, ${L.y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scaleX(${stretch.toFixed(3)})`;
    });
    if (busy || drag) raf = requestAnimationFrame(tick);
  }
  const wake = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };

  el.addEventListener("pointerdown", e => {
    const t = e.target.closest(".elastic__ch"); if (!t) return;
    const i = letters.findIndex(L => L.el === t); if (i < 0) return;
    e.preventDefault(); el.setPointerCapture(e.pointerId);
    drag = { i, id: e.pointerId, sx: e.clientX - letters[i].x, sy: e.clientY - letters[i].y, dx: letters[i].x, dy: letters[i].y };
    el.classList.add("is-grabbing"); wake();
  });
  el.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy, d = Math.hypot(dx, dy), max = 160; // a band only stretches so far
    const k = d > max ? (max + (d - max) * .25) / d : 1;
    drag.dx = dx * k; drag.dy = dy * k; wake();
  });
  const release = e => { if (!drag || (e && e.pointerId !== drag.id)) return; drag = null; el.classList.remove("is-grabbing"); wake(); };
  el.addEventListener("pointerup", release); el.addEventListener("pointercancel", release); el.addEventListener("lostpointercapture", release);
  // a little invitation: the line twangs once when it appears
  setTimeout(() => { letters.forEach((L, i) => { L.vy = Math.sin(i * .55) * 90; }); wake(); }, 2600);
}
