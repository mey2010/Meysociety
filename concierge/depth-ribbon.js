/* Depth Ribbon — an original take on "a ribbon of images winding through 3D space".
   Cards ride a sinuous path that recedes into depth; a luminous band threads them together.
   Drag, flick, wheel, arrow keys or the buttons move along the ribbon; it springs onto the nearest card. */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const SPRING = 46, DAMP = 2 * Math.sqrt(SPRING);

export function createDepthRibbon(root, opts = {}) {
  const o = { items: [], onChange: null, onItemClick: null, autoplay: 4.5, label: "Galería", ...opts };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("ribbon"); root.tabIndex = 0;
  root.setAttribute("role", "region"); root.setAttribute("aria-roledescription", "carousel"); root.setAttribute("aria-label", o.label);
  const canvas = document.createElement("canvas"); canvas.className = "ribbon__band"; canvas.setAttribute("aria-hidden", "true");
  const stage = document.createElement("div"); stage.className = "ribbon__stage";
  const live = document.createElement("div"); live.className = "ribbon__live"; live.setAttribute("aria-live", "polite");
  root.append(stage, live); // the connecting band is no longer drawn
  const ctx = canvas.getContext("2d");

  let items = [], cards = [], N = 0, W = 0, H = 0, cw = 0, ch = 0, P = 1400, dpr = 1;
  const st = { pos: 0, vel: 0, target: 0, drag: null, hover: false, last: 0, idleAt: 0, active: -1, enter: 0 };
  let raf = 0, visible = true;

  // the path: u is a card's distance from the front (0 = in focus, positive = deeper)
  const path = u => {
    const x = Math.sin(u * .85 + .35) * cw * .95 - Math.sin(.35) * cw * .95;
    const y = -u * ch * .16 + (1 - Math.cos(u * .6)) * ch * .12;
    const z = -u * cw * 1.05;
    return { x, y, z };
  };
  const project = p => { const k = P / (P - p.z); return { x: W / 2 + p.x * k, y: H / 2 + p.y * k, k }; };

  function build(list) {
    items = list; N = items.length; stage.replaceChildren(); st.active = -1;
    cards = items.map((it, i) => {
      const c = document.createElement("button"); c.type = "button"; c.className = "ribbon__card"; c.dataset.i = i;
      c.setAttribute("aria-label", `${it.title}, ${i + 1} / ${N}`);
      c.innerHTML = `<img data-src="${it.src}" alt="" draggable="false" decoding="async"><span class="ribbon__shine"></span><span class="ribbon__tag">${it.tag || ""}</span>`;
      stage.appendChild(c); return c;
    });
    st.pos = st.target = 0; st.vel = 0; st.enter = reduced ? 1 : 0; st.enterAt = performance.now(); st.idleAt = performance.now() + 2200;
    measure(); wake();
  }
  function measure() {
    const r = root.getBoundingClientRect(); W = r.width; H = r.height; if (!W || !H) return;
    cw = Math.min(560, W * (W < 700 ? .78 : .44)); ch = cw * .75; P = Math.max(900, cw * 2.6);
    dpr = Math.min(2, devicePixelRatio || 1); canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    stage.style.perspective = P + "px";
    cards.forEach(c => { c.style.width = cw + "px"; c.style.height = ch + "px"; c.style.marginLeft = -cw / 2 + "px"; c.style.marginTop = -ch / 2 + "px"; });
  }
  const rel = i => { let u = (i - st.pos) % N; if (u < -1.5) u += N; if (u > N - 1.5) u -= N; return u; };

  function drawBand() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    if (!N) return;
    const pts = []; for (let u = -1.2; u <= Math.min(N - 1.5, 5.5); u += .05) { const p = path(u); const s = project({ ...p, y: p.y + ch * .56 }); pts.push({ ...s, u }); }
    for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1], b = pts[k], fade = clamp(1 - Math.abs(a.u - .4) / 5.2, 0, 1) * clamp((a.u + 1.2) / .9, 0, 1) * st.enter;
      ctx.strokeStyle = `rgba(200, 86, 230, ${(.5 * fade).toFixed(3)})`; ctx.lineWidth = 26 * a.k; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      ctx.strokeStyle = `rgba(120, 199, 228, ${(.85 * fade).toFixed(3)})`; ctx.lineWidth = 2.2 * a.k;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }
  function layout() {
    if (!N) return;
    cards.forEach((c, i) => {
      const u = rel(i), e = st.enter, uu = u + (1 - e) * 3.5; // entrance: cards glide forward along the ribbon
      const p = path(uu), d = .02, q = path(uu + d);
      const away = Math.min(1, Math.abs(uu) * 1.4); // the card in focus faces you squarely
      const yaw = Math.atan2(q.x - p.x, -(q.z - p.z)) * 180 / Math.PI * .55 * away;
      const roll = Math.sin(uu * .85 + .35) * 7 * away;
      // cards that have passed slide out to the side and fade instead of swelling toward the camera
      let x = p.x, y = p.y, z = p.z;
      if (uu < 0) { const k = -uu; x = -k * cw * .95; y = k * ch * .1; z = k * cw * .25; }
      const op = clamp((uu + .75) / .6, 0, 1) * clamp((N >= 4 ? N - 1.5 - uu : N - .6 - uu) / 1.1, 0, 1) * clamp(1.15 - uu * .12, 0, 1) * e;
      c.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${uu < 0 ? -uu * 28 : yaw}deg) rotateZ(${roll}deg)`;
      c.style.opacity = op.toFixed(3);
      c.style.zIndex = String(1000 - Math.round(uu * 100));
      c.style.setProperty("--dim", clamp(Math.abs(uu) * .22, 0, .6).toFixed(3));
      c.style.pointerEvents = op > .25 ? "auto" : "none";
      // photos load only for the cards near the front (a long fleet never decodes every image at once)
      if (uu > -1.5 && uu < 4.5) { const im = c.firstElementChild; if (im && !im.src && im.dataset.src) im.src = im.dataset.src; }
      c.tabIndex = Math.round(u) === 0 ? 0 : -1;
    });
    const a = ((Math.round(st.pos) % N) + N) % N;
    if (a !== st.active) { st.active = a; cards.forEach((c, i) => c.toggleAttribute("data-front", i === a)); live.textContent = `${items[a].title}, ${a + 1} / ${N}`; o.onChange?.(items[a], a); }
  }
  function frame(now) {
    raf = 0; const dt = st.last ? Math.min((now - st.last) / 1000, .1) : 1 / 60; st.last = now;
    let busy = false;
    if (st.enter < 1) { const k = clamp((now - st.enterAt) / 1100, 0, 1); st.enter = 1 - Math.pow(1 - k, 3); busy = true; }
    if (!st.drag) {
      const cruise = o.autoplay && N >= 4 && !reduced && !st.hover && now > st.idleAt;
      if (cruise) {
        // autoplay is one continuous glide along the ribbon (no stop-and-go steps); it eases in from rest
        const v = 1 / o.autoplay; st.vel += (v - st.vel) * (1 - Math.exp(-dt / .9)); st.pos += st.vel * dt; st.target = st.pos; st.cruising = true; busy = true;
      } else {
        if (st.cruising) { st.cruising = false; st.target = Math.ceil(st.pos + st.vel * .5 - .02); } // when it is stopped, it glides on to the next card
        let rem = dt; while (rem > 0) { const h = Math.min(rem, 1 / 240); st.vel += (SPRING * (st.target - st.pos) - DAMP * st.vel) * h; st.pos += st.vel * h; rem -= h; }
        if (Math.abs(st.target - st.pos) < .0005 && Math.abs(st.vel) < .001) { st.pos = st.target; st.vel = 0; } else busy = true;
      }
    } else busy = true;
    layout();
    if (o.autoplay && N >= 4 && !reduced) busy = true;
    if (busy && visible && !document.hidden) raf = requestAnimationFrame(frame); else st.last = 0;
  }
  const wake = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
  const goTo = i => { st.cruising = false; let t = Math.round(st.target), cur = ((t % N) + N) % N, d = i - cur; if (d > N / 2) d -= N; if (d < -N / 2) d += N; st.target = t + d; st.idleAt = performance.now() + 6000; wake(); };
  const by = d => { st.cruising = false; st.target = (st.vel > .05 ? Math.ceil(st.pos - .02) : Math.round(st.target)) + d - (st.vel > .05 && d > 0 ? 1 : 0); st.idleAt = performance.now() + 6000; wake(); };

  // input: drag along the ribbon (either axis), flick, wheel, keys
  root.addEventListener("pointerdown", e => { if (e.button !== 0) return; st.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, pos: st.pos, moved: false, t: performance.now(), samples: [] }; });
  root.addEventListener("pointermove", e => {
    const d = st.drag; if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved) { if (Math.hypot(dx, dy) < 6) return; if (e.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx) * 1.3) { st.drag = null; return; } d.moved = true; root.dataset.dragging = ""; try { root.setPointerCapture(e.pointerId); } catch {} }
    st.pos = d.pos - dx / (cw * .9); st.target = st.pos;
    const now = performance.now(); d.samples.push({ t: now, p: st.pos }); while (d.samples.length > 2 && now - d.samples[0].t > 100) d.samples.shift();
    wake();
  });
  const up = e => {
    const d = st.drag; if (!d || d.id !== e.pointerId) return; st.drag = null; delete root.dataset.dragging;
    if (!d.moved) { const c = e.target.closest?.(".ribbon__card"); if (c) { const i = +c.dataset.i; if (i === st.active && Math.abs(st.pos - Math.round(st.pos)) < .35) o.onItemClick?.(items[i], i); else goTo(i); } return; }
    const a = d.samples[0], b = d.samples[d.samples.length - 1], v = a && b && b.t > a.t ? (b.p - a.p) / ((b.t - a.t) / 1000) : 0;
    st.target = Math.round(st.pos + clamp(v, -6, 6) * .28); st.vel = v * .4; st.idleAt = performance.now() + 6000; wake();
  };
  root.addEventListener("pointerup", up); root.addEventListener("pointercancel", up);
  root.addEventListener("click", e => { if (e.detail === 0) { const c = e.target.closest?.(".ribbon__card"); if (c) { const i = +c.dataset.i; i === st.active ? o.onItemClick?.(items[i], i) : goTo(i); } } }); // keyboard activation
  let wheelLock = 0;
  root.addEventListener("wheel", e => { e.preventDefault(); const now = performance.now(); if (now < wheelLock) return; const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; if (Math.abs(d) < 4) return; by(Math.sign(d)); wheelLock = now + 520; }, { passive: false });
  root.addEventListener("keydown", e => { if (e.key === "ArrowRight" || e.key === "ArrowDown") by(1); else if (e.key === "ArrowLeft" || e.key === "ArrowUp") by(-1); else return; e.preventDefault(); });
  root.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") st.hover = true; });
  root.addEventListener("pointerleave", () => { st.hover = false; st.idleAt = performance.now() + 2500; wake(); });
  new ResizeObserver(() => { measure(); wake(); }).observe(root);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) wake(); else { cancelAnimationFrame(raf); raf = 0; st.last = 0; } }).observe(root);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(); });

  build(o.items);
  return { setItems: build, goTo, next: () => by(1), prev: () => by(-1), get active() { return st.active; } };
}
