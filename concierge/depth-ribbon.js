/* Depth Ribbon — an original take on "a ribbon of images winding through 3D space".
   Cards ride a sinuous path that recedes into depth; a luminous band threads them together.
   Drag, flick, wheel, arrow keys or the buttons move along the ribbon; it springs onto the nearest card. */

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const SPRING = 46, DAMP = 2 * Math.sqrt(SPRING);

export function createDepthRibbon(root, opts = {}) {
  const o = { items: [], onChange: null, onItemClick: null, back: null, autoplay: 4.5, label: "Galería", ...opts };
  const fine = matchMedia("(pointer: fine)").matches;
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
      const c = document.createElement("div"); c.setAttribute("role", "button"); c.className = "ribbon__card" + (it.whole ? " ribbon__card--whole" : "") + (it.gloss ? " ribbon__card--gloss" : ""); c.dataset.i = i;
      c.setAttribute("aria-label", `${it.title}, ${i + 1} / ${N}`);
      // float (CSS) > flip (tilt + turn, driven by a spring) > the two faces: the photo, and the details behind it
      c.innerHTML = `<div class="ribbon__float"><div class="ribbon__flip"><div class="ribbon__face"><img class="ribbon__img" data-src="${it.src}" alt="" draggable="false" decoding="async"><span class="ribbon__shine"></span><span class="ribbon__glare"></span>${it.tag ? `<span class="ribbon__tag">${it.tag}</span>` : (o.back ? '<span class="ribbon__tag"></span>' : "")}${it.html ? `<div class="ribbon__over">${it.html}</div>` : ""}${o.back ? '<span class="ribbon__turn" aria-hidden="true"></span>' : ""}</div>${o.back ? `<div class="ribbon__back" aria-hidden="true">${o.back(it, i)}</div>` : ""}</div></div>`;
      c._flip = c.querySelector(".ribbon__flip"); c._img = c.querySelector(".ribbon__img"); c._glare = c.querySelector(".ribbon__glare");
      c._last = {};
      stage.appendChild(c); return c;
    });
    st.pos = st.target = 0; st.vel = 0; st.enter = reduced ? 1 : 0; st.enterAt = performance.now(); st.idleAt = performance.now() + 2200;
    measure(); wake();
  }
  function measure() {
    const r = root.getBoundingClientRect(); W = r.width; H = r.height; if (!W || !H) return;
    cw = Math.min(o.maxW || 560, W * (W < 700 ? (o.phone || .78) : (o.wide || .44))); ch = cw * .75; P = Math.max(900, cw * 2.6);
    dpr = Math.min(2, devicePixelRatio || 1); canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    stage.style.perspective = P + "px";
    cards.forEach(c => { c.style.width = cw + "px"; c.style.height = ch + "px"; c.style.marginLeft = -cw / 2 + "px"; c.style.marginTop = -ch / 2 + "px"; });
  }
  const rel = i => { if (N < 2) return i - st.pos; let u = (((i - st.pos) % N) + N) % N; if (u > N / 2) u -= N; return u; };   // balanced: as many boats wait on the left as on the right   // (one boat: no wrap-around, it sits in front)

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
      const u = rel(i), e = st.enter, uu = u + (1 - e) * 1.2; // entrance: a short glide forward along the ribbon (the boat is there at once)
      // a centred coverflow: the boat in focus faces you in the middle of the screen, the next ones step back to the
      // right and the previous ones to the left, mirrored, so the gallery is balanced on both sides
      const k = Math.abs(uu), sgn = Math.sign(uu) || 0, kk = Math.min(k, 1);
      const x = sgn * (kk * cw * .58 + Math.max(0, k - 1) * cw * .26), y = k * ch * .015, z = -(kk * cw * .42 + Math.max(0, k - 1) * cw * .22);
      const yaw = -sgn * kk * 34, roll = 0;
      const op = clamp(1.35 - k * .42, 0, 1) * (N < 2 ? 1 : 1) * e;
      // only touch what changed, and take invisible cards out of compositing altogether
      const L = c._last, on = op > .002;
      if (L.on !== on) { c.style.visibility = on ? "" : "hidden"; L.on = on; }
      if (on) {
        c.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${yaw.toFixed(2)}deg)`;
        // depth dimming is folded into the card's own opacity (the fleet sits on a dark background): an opacity change is
        // done by the compositor, while a darkening layer inside the card had its photo repainted on every frame
        const o = (op * (1 - clamp(Math.abs(uu) * .22, 0, .6) * .75)).toFixed(2); if (L.o !== o) { c.style.opacity = o; L.o = o; }
        const zi = String(1000 - Math.round(Math.abs(uu) * 100)); if (L.z !== zi) { c.style.zIndex = zi; L.z = zi; }
      }
      const pe = op > .25 ? "auto" : "none"; if (L.pe !== pe) { c.style.pointerEvents = pe; L.pe = pe; }
      const ti = Math.round(u) === 0 ? 0 : -1; if (L.ti !== ti) { c.tabIndex = ti; L.ti = ti; }
      // photos are fetched and decoded off-screen a few cards ahead, then faded in: never an empty card, never a pop
      if (uu > -2 && uu < 5) { const im = c._img; if (im && !im._req && im.dataset.src) {
        im._req = true; const pre = new Image(); pre.decoding = "async"; pre.src = im.dataset.src;
        (pre.decode ? pre.decode() : Promise.resolve()).catch(() => {}).then(() => { im.src = im.dataset.src; im.classList.add("is-in"); });
      } }
    });
    const a = ((Math.round(st.pos) % N) + N) % N;
    if (a !== st.active) { settle(); st.active = a; cards.forEach((c, i) => c.toggleAttribute("data-front", i === a)); fx.card = cards[a]; live.textContent = `${items[a].title}, ${a + 1} / ${N}`; o.onChange?.(items[a], a); }
  }
  function frame(now) {
    raf = 0; const dt = st.last ? Math.min((now - st.last) / 1000, .1) : 1 / 60; st.last = now;
    let busy = false;
    if (st.enter < 1) { const k = clamp((now - st.enterAt) / 480, 0, 1); st.enter = 1 - Math.pow(1 - k, 3); busy = true; }
    if (N < 2) { st.pos = st.target = 0; st.vel = 0; }   // one boat: held still in front
    if (!st.drag) {
      const cruise = o.autoplay && N >= 4 && !reduced && !st.hover && !turned && now > st.idleAt;
      if (cruise) {
        // autoplay is one continuous glide along the ribbon (no stop-and-go steps); it eases in from rest
        const v = 1 / o.autoplay; st.vel += (v - st.vel) * (1 - Math.exp(-dt / .9)); st.pos += st.vel * dt; st.target = st.pos; st.cruising = true; busy = true;
      } else {
        // when it is stopped it glides on to the next card; but under the pointer it settles on the nearest one, so the
        // card the visitor is about to click never slides away from under the cursor
        if (st.cruising) { st.cruising = false; st.target = st.hover ? Math.round(st.pos) : Math.ceil(st.pos + st.vel * .5 - .02); }
        let rem = dt; while (rem > 0) { const h = Math.min(rem, 1 / 240); st.vel += (SPRING * (st.target - st.pos) - DAMP * st.vel) * h; st.pos += st.vel * h; rem -= h; }
        if (Math.abs(st.target - st.pos) < .0005 && Math.abs(st.vel) < .001) { st.pos = st.target; st.vel = 0; } else busy = true;
      }
    } else busy = true;
    layout();
    if (o.autoplay && N >= 4 && !reduced) busy = true;
    if (busy && visible && !document.hidden) raf = requestAnimationFrame(frame); else st.last = 0;
  }
  const wake = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
  const goTo = i => { if (N < 2) return; st.cruising = false; let t = Math.round(st.target), cur = ((t % N) + N) % N, d = i - cur; if (d > N / 2) d -= N; if (d < -N / 2) d += N; st.target = t + d; st.idleAt = performance.now() + 6000; wake(); };
  const by = d => { if (N < 2) return; st.cruising = false; st.target = (st.vel > .05 ? Math.ceil(st.pos - .02) : Math.round(st.target)) + d - (st.vel > .05 && d > 0 ? 1 : 0); st.idleAt = performance.now() + 6000; wake(); };

  // input: drag along the ribbon (either axis), flick, wheel, keys
  root.addEventListener("pointerdown", e => { if (e.button !== 0) return; st.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, pos: st.pos, moved: false, t: performance.now(), samples: [] }; });
  root.addEventListener("pointermove", e => {
    const d = st.drag; if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved) { if (Math.hypot(dx, dy) < 6) return; if (e.pointerType !== "mouse" && Math.abs(dy) > Math.abs(dx) * 1.8) { st.drag = null; return; } d.moved = true; root.dataset.dragging = ""; try { root.setPointerCapture(e.pointerId); } catch {} }
    if (N < 2) return;   // a single boat stays put in front: nothing to browse
    st.pos = d.pos - dx / (cw * .62); st.target = st.pos;   // more travel per pixel: a short swipe already moves the ribbon
    const now = performance.now(); d.samples.push({ t: now, p: st.pos }); while (d.samples.length > 2 && now - d.samples[0].t > 100) d.samples.shift();
    wake();
  });
  const up = e => {
    const d = st.drag; if (!d || d.id !== e.pointerId) return; st.drag = null; delete root.dataset.dragging;
    if (!d.moved) { const c = e.target.closest?.(".ribbon__card"); press(null); if (c) { const i = +c.dataset.i;
        if (e.target.closest("a, button")) return;   // a button on the back of the card: its own click does the rest
        const still = Math.abs(st.pos - Math.round(st.pos)) < .35;
        if (i === st.active && canTurn(i)) { goTo(i); turn(!turned); }   // even mid-glide: it settles on this card and turns it
        else if (i === st.active && still) o.onItemClick?.(items[i], i); else goTo(i); } return; }
    press(null);
    const a = d.samples[0], b = d.samples[d.samples.length - 1], v = a && b && b.t > a.t ? (b.p - a.p) / ((b.t - a.t) / 1000) : 0;
    // a light swipe is enough: once it has moved a little, it carries on to the next card (or further with a flick)
    const start = Math.round(d.pos), delta = st.pos + clamp(v, -8, 8) * .34 - start, steps = Math.sign(delta) * Math.max(Math.abs(st.pos - d.pos) > .08 || Math.abs(v) > .6 ? 1 : 0, Math.round(Math.abs(delta)));
    st.target = N < 2 ? 0 : start + steps; st.vel = N < 2 ? 0 : v * .5; st.idleAt = performance.now() + 6000; wake();
  };
  root.addEventListener("pointerup", up); root.addEventListener("pointercancel", up);
  const activate = c => { const i = +c.dataset.i; if (i !== st.active) return goTo(i); if (canTurn(i)) turn(!turned); else o.onItemClick?.(items[i], i); };
  root.addEventListener("click", e => { if (e.detail === 0 && !e.target.closest("a, button")) { const c = e.target.closest?.(".ribbon__card"); if (c) activate(c); } }); // keyboard activation
  let wheelLock = 0;
  root.addEventListener("wheel", e => { if (o.wheelX && Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;   // on the page: a vertical wheel scrolls the page, only a sideways one moves the ribbon
    e.preventDefault(); const now = performance.now(); if (now < wheelLock) return; const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; if (Math.abs(d) < 4) return; by(Math.sign(d)); wheelLock = now + 520; }, { passive: false });
  root.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && !e.target.closest("a, button")) { const c = cards[st.active]; if (c) { e.preventDefault(); activate(c); } return; }
    if (e.key === "Escape" && turned) { e.stopPropagation(); turn(false); return; }
    if (e.key === "ArrowRight" || e.key === "ArrowDown") by(1); else if (e.key === "ArrowLeft" || e.key === "ArrowUp") by(-1); else return; e.preventDefault(); });
  root.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") st.hover = true; });
  root.addEventListener("pointerleave", () => { press(null); st.hover = false; st.idleAt = performance.now() + 2500; wake(); });
  new ResizeObserver(() => { measure(); wake(); }).observe(root);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) wake(); else { cancelAnimationFrame(raf); raf = 0; st.last = 0; } }).observe(root);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(); });

  /* the card in front moves like a held ticket: it tilts toward the pointer (or the finger), the photo shifts a
     little the other way, a soft glare follows, and a tap turns it over to show the details. One spring drives it all. */
  const fx = { card: null, rx: 0, ry: 0, vx: 0, vy: 0, tx: 0, ty: 0, f: 0, vf: 0, tf: 0, gx: 50, gy: 30, raf: 0, last: 0 };
  let turned = false;
  // a gallery can keep some cards from turning over (jet skis, villas): a tap on those opens them instead
  const canTurn = i => !!o.back && (!o.canTurn || o.canTurn(items[i], i));
  const TILT = 9, K = 170, D = 2 * Math.sqrt(170) * .72, KF = 95, DF = 2 * Math.sqrt(95) * .8;
  function fxFrame(now) {
    fx.raf = 0; const dt = fx.last ? Math.min((now - fx.last) / 1000, .05) : 1 / 60; fx.last = now; const c = fx.card;
    let rem = dt; while (rem > 0) { const h = Math.min(rem, 1 / 240);
      fx.vx += (K * (fx.tx - fx.rx) - D * fx.vx) * h; fx.rx += fx.vx * h; fx.vy += (K * (fx.ty - fx.ry) - D * fx.vy) * h; fx.ry += fx.vy * h;
      fx.vf += (KF * (fx.tf - fx.f) - DF * fx.vf) * h; fx.f += fx.vf * h; rem -= h; }
    if (c) {
      c._flip.style.transform = `rotateX(${fx.rx.toFixed(2)}deg) rotateY(${(fx.ry + fx.f * 180).toFixed(2)}deg)`;
      if (c._img) c._img.style.transform = fx.f > .02 ? "" : `translate3d(${(-fx.ry * .9).toFixed(1)}px, ${(fx.rx * .9).toFixed(1)}px, 0) scale(1.06)`;   // no parallax while it turns
      if (c._glare) { c._glare.style.opacity = Math.min(1, (Math.abs(fx.rx) + Math.abs(fx.ry)) / TILT).toFixed(2); c._glare.style.background = `radial-gradient(circle at ${fx.gx}% ${fx.gy}%, rgb(255 255 255 / .32), transparent 55%)`; }
      c.classList.toggle("is-turned", fx.f > .5);
    }
    const busy = Math.abs(fx.tx - fx.rx) + Math.abs(fx.ty - fx.ry) + Math.abs(fx.vx) + Math.abs(fx.vy) + Math.abs(fx.tf - fx.f) * 60 + Math.abs(fx.vf) > .01;
    if (busy) fx.raf = requestAnimationFrame(fxFrame); else fx.last = 0;
  }
  const fxWake = () => { if (!fx.raf && !reduced) fx.raf = requestAnimationFrame(fxFrame); else if (reduced && fx.card) { fx.f = fx.tf; fx.card._flip.style.transform = fx.f ? "rotateY(180deg)" : ""; fx.card.classList.toggle("is-turned", !!fx.f); } };
  function aim(e) {   // tilt toward a point on the front card
    const c = fx.card; if (!c || reduced) return; const r = c.getBoundingClientRect(); if (!r.width) return;
    const px = clamp((e.clientX - r.left) / r.width, 0, 1), py = clamp((e.clientY - r.top) / r.height, 0, 1);
    fx.ty = (px - .5) * 2 * TILT; fx.tx = -(py - .5) * 2 * TILT * .8; fx.gx = Math.round(px * 100); fx.gy = Math.round(py * 100); fxWake();
  }
  function press(e) { if (!e) { fx.tx = fx.ty = 0; fxWake(); return; } aim(e); }
  function settle() {   // the card leaving the front is put back flat at once; the next one starts from rest
    const c = fx.card; if (c) { c._flip.style.transform = ""; if (c._img) c._img.style.transform = ""; if (c._glare) c._glare.style.opacity = 0; c.classList.remove("is-turned"); c.removeAttribute("aria-pressed"); c.querySelector(".ribbon__back")?.setAttribute("aria-hidden", "true"); }
    turned = false; Object.assign(fx, { rx: 0, ry: 0, vx: 0, vy: 0, tx: 0, ty: 0, f: 0, vf: 0, tf: 0 });
  }
  function turn(on) {
    turned = on && !!o.back && (!fx.card || canTurn(+fx.card.dataset.i)); fx.tf = turned ? 1 : 0; const c = fx.card;
    if (c) { c.querySelector(".ribbon__back")?.setAttribute("aria-hidden", String(!turned)); c.setAttribute("aria-pressed", String(turned)); }
    if (!turned) st.idleAt = performance.now() + 2500;
    fxWake(); wake();
  }
  root.addEventListener("pointermove", e => { if (st.drag?.moved) return; if (e.pointerType === "mouse" ? e.target.closest?.(".ribbon__card[data-front]") : st.drag) aim(e); else if (e.pointerType === "mouse") press(null); });
  root.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse" && e.target.closest?.(".ribbon__card[data-front]")) aim(e); });
  document.addEventListener("pointerdown", e => { if (turned && !root.contains(e.target)) turn(false); }, true);

  build(o.items);
  return { flip: turn, get turned() { return turned; }, get size() { return { w: cw, h: ch }; }, get moving() { return Math.abs(st.target - st.pos) > .02 || Math.abs(st.vel) > .02 || !!st.drag?.moved; }, setItems: build, goTo, next: () => by(1), prev: () => by(-1), get active() { return st.active; } };
}

/* InfiniteSpiral (React Bits), rewritten without React for the services. The cards climb a helix: each one's
   offset from the front sets its height, its side-to-side swing and its depth; the far ends fade and blur. The page
   scroll turns it, a sideways swipe (or a mouse drag) turns it, the arrows step it, and when nothing moves it settles
   with a card square in front. onFront(i) fires in the same frame the front card changes, so whatever rides with it
   (title, line, buttons) changes with the card, not after it. */
export function createInfiniteSpiral(root, opts = {}) {
  const o = { items: [], speed: .55, radius: 190, cardWidth: 230, cardHeight: 230, verticalSpacing: 78, perspective: 1000,
    cardsPerTurn: 7, cardRadius: 22, centerScale: 1.18, edgeFade: .3, edgeBlur: 5, scroll: true, autoplay: 0, onFront: null, onPick: null, ...opts };
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b), mod = (v, d) => ((v % d) + d) % d;
  const sstep = (a, b, v) => { const x = clamp((v - a) / (b - a || 1), 0, 1); return x * x * (3 - 2 * x); };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("infinite-spiral"); root.style.perspective = o.perspective + "px";
  const stage = document.createElement("div"); stage.className = "infinite-spiral__stage"; stage.setAttribute("role", "list"); root.appendChild(stage);
  let cards = [], N = 0, prog = 0, target = 0, front = -1, raf = 0, last = 0, visible = true, idleAt = 0, W = 1, H = 1, autoAt = 0, held = false, hover = false;
  const esc = v => String(v).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function setItems(list) {
    stage.replaceChildren(); N = list.length; front = -1;
    cards = list.map((it, i) => { const c = document.createElement("div"); c.className = "infinite-spiral__item" + (it.whole ? " is-whole" : ""); c.setAttribute("role", "listitem"); c.dataset.i = i;
      c.style.width = o.cardWidth + "px"; c.style.height = o.cardHeight + "px"; c.style.borderRadius = o.cardRadius + "px";
      c.innerHTML = `<img class="infinite-spiral__image" src="${esc(it.src)}" alt="${esc(it.alt || it.title || "")}" loading="${i < 4 ? "eager" : "lazy"}" decoding="async" draggable="false">${it.title ? `<span class="infinite-spiral__label">${esc(it.title)}</span>` : ""}`;
      stage.appendChild(c); return c; });
    wake();
  }
  const measure = () => { const r = root.getBoundingClientRect(); W = Math.max(r.width, 1); H = Math.max(r.height, 1); };
  function render(now) {
    raf = 0; const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 60; last = now;
    const dragging = !!drag?.moved;
    if (coast) {   // a flick keeps the wheel turning and it slows down by itself, landing square on a card
      const tau = (now - coast.t) / 1000;
      if (tau >= 5 / FRICTION) { target = coast.goal; coast = null; }
      else target = coast.from + (coast.goal - coast.from) * (1 - Math.exp(-FRICTION * tau));
    } else if (!dragging && now > idleAt) target += (Math.round(target) - target) * (1 - Math.exp(-dt * 6));   // settle square on a card
    // on its own, the spiral glides to the next service every few seconds while nobody touches it
    if (o.autoplay && !reduced && !drag && !coast && !held && N > 1) { if (!autoAt) autoAt = now + o.autoplay * 1000; else if (now >= autoAt) { target = Math.round(target) + 1; idleAt = 0; autoAt = now + o.autoplay * 1000; } } else autoAt = 0;
    prog += (target - prog) * (reduced ? 1 : 1 - Math.exp(-dt * (dragging || coast ? 24 : 11)));
    if (N) {
      const half = N / 2, fit = Math.min(1, W / (o.cardWidth * 2.6), H / (o.cardHeight * 2.1)), rr = Math.min(o.radius, Math.max(72, W * .36)) * fit;
      const fadeStart = clamp(1 - o.edgeFade, 0, .98), turn = Math.max(o.cardsPerTurn, 1);
      for (let i = 0; i < N; i++) { const c = cards[i];
        const off = mod(i - prog + half, N) - half, edge = Math.min(Math.abs(off) / Math.max(half, 1), 1);
        const op = 1 - sstep(fadeStart, 1, edge), focus = 1 - Math.min(Math.abs(off) / Math.max(turn * .65, 1), 1);
        const a = off * (360 / turn) * Math.PI / 180, x = Math.sin(a) * rr, z = Math.cos(a) * rr;
        const k = clamp(o.perspective / Math.max(o.perspective - z, 1), .72, 1.45), sc = (1 + (o.centerScale - 1) * focus) * fit * k;
        const blur = o.edgeBlur * sstep(.35, 1, edge);
        c.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${(off * o.verticalSpacing * fit).toFixed(1)}px, 0) scale(${sc.toFixed(4)})`;
        c.style.opacity = op.toFixed(3); c.style.filter = blur > .05 ? `blur(${blur.toFixed(1)}px)` : "none";
        c.style.zIndex = String(Math.round(((z / Math.max(rr, 1)) + 1) * 5000));
        c.style.pointerEvents = op > .25 ? "auto" : "none"; }
      const f = mod(Math.round(prog), N);
      if (f !== front) { if (cards[front]) cards[front].removeAttribute("data-front"); front = f; cards[f].setAttribute("data-front", ""); o.onFront?.(f); }
    }
    if (visible && (o.autoplay && !reduced && !held && N > 1 || Math.abs(target - prog) > .0005 || Math.abs(Math.round(target) - target) > .0005 || drag || coast)) raf = requestAnimationFrame(render); else last = 0;
  }
  const wake = () => { if (!raf && visible) raf = requestAnimationFrame(render); };
  new ResizeObserver(() => { measure(); wake(); }).observe(root);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) wake(); }, { threshold: .02 }).observe(root);
  // the page scroll turns the helix while it is on screen
  let lastY = scrollY;
  addEventListener("scroll", () => { const y = scrollY, d = y - lastY; lastY = y; if (!o.scroll || !visible || !d || drag?.moved || coast) return;
    target += clamp(d * (o.speed / .55) / Math.max(o.verticalSpacing * 2, 1), -1.5, 1.5); idleAt = performance.now() + 160; autoAt = performance.now() + 3000; wake(); }, { passive: true });
  /* Dragging: a sideways swipe on a phone (an angle up to ~55° from horizontal still counts as sideways, so a
     slightly slanted swipe never scrolls the page by mistake; a clearly vertical one scrolls the page as usual),
     any drag with a mouse. On release the wheel keeps the speed of the swipe and slows down by itself: a short
     flick moves one or two services, a long fast one spins through several, always landing square on a card. */
  const FRICTION = 2.4, PX = () => o.cardWidth * .55;
  let drag = null, coast = null, dragged = false;
  const grab = (x, y) => { coast = null; drag = { x, y, moved: false, samples: [], from: target }; dragged = false; };
  const moveBy = dx => { const d = drag; d.moved = true; dragged = true; target -= dx / PX();
    const now = performance.now(); d.samples.push([now, target]); while (d.samples.length > 2 && now - d.samples[0][0] > 110) d.samples.shift();
    idleAt = now + 120; autoAt = now + 6000; wake(); };
  const release = () => { const d = drag; drag = null; if (!d) return; idleAt = 0;
    if (d.moved) { const now = performance.now(), sm = d.samples.filter(q => now - q[0] < 120); let v = 0;
      if (sm.length > 1) { const [t0, p0] = sm[0], [t1, p1] = sm[sm.length - 1]; if (t1 > t0) v = (p1 - p0) / ((t1 - t0) / 1000); }
      v = clamp(v, -22, 22);
      let goal = Math.round(target + v / FRICTION); const moved = target - d.from;
      if (goal === Math.round(d.from) && Math.abs(moved) > .18) goal += Math.sign(moved);   // even a short, slow swipe moves on to the next one
      coast = { from: target, goal, t: now }; autoAt = now + 6000; }
    wake(); };
  // touch: the direction is decided on the first few pixels and kept for the whole gesture
  root.addEventListener("touchstart", e => { if (e.touches.length !== 1) { drag = null; return; } const t = e.touches[0]; grab(t.clientX, t.clientY); drag.axis = null; }, { passive: true });
  root.addEventListener("touchmove", e => { const d = drag; if (!d) return; const t = e.touches[0], dx = t.clientX - d.x, dy = t.clientY - d.y;
    if (!d.axis) { if (Math.hypot(dx, dy) < 6) return; d.axis = Math.abs(dx) >= Math.abs(dy) * .7 ? "x" : "y"; }
    if (d.axis === "y") { drag = null; return; }
    if (e.cancelable) e.preventDefault();
    moveBy(dx); d.x = t.clientX; d.y = t.clientY; }, { passive: false });
  root.addEventListener("touchend", release, { passive: true }); root.addEventListener("touchcancel", release, { passive: true });
  // mouse
  root.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse" || e.button !== 0) return; grab(e.clientX, e.clientY); drag.id = e.pointerId; });
  root.addEventListener("pointermove", e => { const d = drag; if (!d || d.id !== e.pointerId) return; const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved) { if (Math.hypot(dx, dy) < 5) return; root.dataset.dragging = ""; try { root.setPointerCapture(e.pointerId); } catch {} }
    moveBy(Math.abs(dx) >= Math.abs(dy) ? dx : dy * 1.4); d.x = e.clientX; d.y = e.clientY; });
  const mouseUp = e => { if (drag?.id === e.pointerId) { release(); setTimeout(() => delete root.dataset.dragging, 0); } };
  root.addEventListener("pointerup", mouseUp); root.addEventListener("pointercancel", mouseUp);
  // a tap (not a drag) on a card: the one in front is picked, another one is brought to the front
  root.addEventListener("click", e => { if (dragged) { dragged = false; e.preventDefault(); e.stopPropagation(); return; }
    const c = e.target.closest?.(".infinite-spiral__item"); if (!c) return; const i = +c.dataset.i; if (i === front) o.onPick?.(i); else goTo(i); }, true);
  const goTo = i => { if (!N) return; coast = null; const cur = Math.round(target), c = mod(cur, N); let d = i - c; if (d > N / 2) d -= N; if (d < -N / 2) d += N; target = cur + d; idleAt = 0; autoAt = performance.now() + 6000; wake(); };
  const by = d => { coast = null; target = Math.round(target) + d; idleAt = 0; autoAt = performance.now() + 6000; wake(); };
  root.tabIndex = 0; root.addEventListener("keydown", e => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); by(d); } });
  measure(); setItems(o.items);
  // hold(true) pauses the glide (a finger or the mouse on the buttons below); any touch on the spiral restarts its count
  const hold = v => { held = !!v; autoAt = 0; wake(); };
  return { setItems, goTo, hold, next: () => by(1), prev: () => by(-1), get active() { return front; } };
}

/* PixelCard (React Bits), rewritten without React: a canvas of tiny pixels behind a card's content. On hover (or
   focus) a wave of pixels sweeps out from the pointer, twinkles and swells near the cursor under a soft glow; a tap
   sends a brighter ripple. The first time the card scrolls into view the wave plays once on its own (on phones,
   where there is no hover, that is how it shows). Pixels fade toward the middle so the text stays clean. */
export function attachPixelCard(card, opts = {}) {
  const s = { colors: ["#1e24bb", "#ab50db", "#78c7e4"], glowColor: "#78c7e4", gap: 6, pixelSize: 2.4, speed: 35, origin: "pointer",
    revealDuration: 600, spotlight: .5, glow: .5, opacity: .45, fade: .7, clickPulse: true, intro: true, introDelay: 0, ...opts };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b), sstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const easeOutBack = t => { const c = 1.9, u = t - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
  const canvas = document.createElement("canvas"); canvas.className = "pixel-card-canvas"; canvas.setAttribute("aria-hidden", "true");
  card.classList.add("pixel-card"); card.prepend(canvas);
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const rgb = (() => { const c = document.createElement("canvas").getContext("2d"); c.fillStyle = s.glowColor; const h = c.fillStyle.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); })();
  const st = { raf: 0, last: 0, time: 0, visible: false, w: 0, h: 0, ratio: 1, key: "", n: 0, active: false, changedAt: 0, ox: 0, oy: 0, px: 0, py: 0, sx: 0, sy: 0, svx: 0, svy: 0, spot: 0,
    hovering: false, pulses: [], dt: 1 / 60, releaseAt: -1, introAt: -1, maskKey: "" };
  let X, Y, T, S, PH, R, J, P = new Float32Array(0), D, M;
  function build() {
    const r = card.getBoundingClientRect(), w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height)), ratio = Math.min(devicePixelRatio || 1, 2);
    const key = `${w}|${h}|${ratio}`; if (key === st.key) return; st.key = key; st.w = w; st.h = h; st.ratio = ratio;
    canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
    const cols = Math.floor((w - 1) / s.gap) + 1, rows = Math.floor((h - 1) / s.gap) + 1, offX = (w - (cols - 1) * s.gap) / 2, offY = (h - (rows - 1) * s.gap) / 2, n = cols * rows, prev = P;
    st.n = n; X = new Float32Array(n); Y = new Float32Array(n); T = new Uint8Array(n); S = new Float32Array(n); PH = new Float32Array(n); R = new Float32Array(n); J = new Float32Array(n); P = new Float32Array(n); D = new Float32Array(n);
    let i = 0; for (let c = 0; c < cols; c++) for (let rw = 0; rw < rows; rw++) { X[i] = offX + c * s.gap; Y[i] = offY + rw * s.gap; T[i] = Math.floor(Math.random() * s.colors.length);
      S[i] = s.pixelSize * (.25 + Math.random() * .75); PH[i] = Math.random() * Math.PI * 2; R[i] = .55 + Math.random() * .9; J[i] = Math.random(); if (prev.length) P[i] = prev[Math.min(i, prev.length - 1)]; i++; }
    st.maskKey = ""; schedule();
  }
  function schedule() {
    const span = s.revealDuration / 1000; let far = 1;
    for (let i = 0; i < st.n; i++) far = Math.max(far, Math.hypot(X[i] - st.ox, Y[i] - st.oy)); st.far = far;
    for (let i = 0; i < st.n; i++) { const d = Math.hypot(X[i] - st.ox, Y[i] - st.oy) / far; D[i] = st.active ? d * span * .82 + J[i] * span * .18 : (1 - d) * span * .45 + J[i] * span * .1; }
  }
  function setActive(v, x, y) { if (st.active === v) return; st.active = v; st.changedAt = st.time;
    if (v) { const p = s.origin === "pointer" && x !== undefined; st.ox = p ? x : st.w / 2; st.oy = p ? y : st.h / 2; }
    schedule(); card.toggleAttribute("data-active", v); wake(); }
  function draw() {
    const { w, h, ratio } = st; ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, w, h);
    const mk = `${st.n}|${w}|${h}`; if (st.maskKey !== mk) { st.maskKey = mk; M = new Float32Array(st.n); const near = Math.min(w, h) * .05, far = Math.min(w, h) * .42;
      for (let i = 0; i < st.n; i++) { const e = Math.min(X[i], w - X[i], Y[i], h - Y[i]), t = clamp((e - near) / (far - near), 0, 1); M[i] = 1 - s.fade * t * t * t * (t * (t * 6 - 15) + 10); } }
    let sum = 0; const el = st.time - st.changedAt, up = st.dt / .26, dn = st.dt / .22;
    for (let i = 0; i < st.n; i++) { const c = P[i], ready = el >= D[i] || reduce, tg = st.active ? (ready ? 1 : 0) : ready ? 0 : c;
      if (reduce) P[i] = tg; else if (tg > c) P[i] = Math.min(1, c + up); else if (tg < c) P[i] = Math.max(0, c - dn); sum += P[i]; }
    const avg = st.n ? sum / st.n : 0;
    if (s.glow > 0 && avg > .001) { const cx = st.spot > .01 ? st.sx : st.ox, cy = st.spot > .01 ? st.sy : st.oy, reach = Math.max(w, h) * .85;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach), k = s.glow * s.opacity * .32 * Math.min(1, avg * 1.4);
      g.addColorStop(0, `rgba(${rgb},${k})`); g.addColorStop(.45, `rgba(${rgb},${k * .35})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); }
    const sr = Math.min(w, h) * .38 + 30, ss = s.spotlight * st.spot, freq = (s.speed / 35) * 1.35, tw = reduce || !s.speed ? 0 : 1;
    for (let col = 0; col < s.colors.length; col++) { ctx.fillStyle = s.colors[col];
      for (let i = 0; i < st.n; i++) { if (T[i] !== col) continue; const pr = P[i]; if (pr <= .002) continue; const x = X[i], y = Y[i];
        let size = S[i], a = .5 + pr * .38;
        if (tw) { const wv = Math.sin(PH[i] + st.time * freq * R[i]); size *= .62 + .38 * wv; a += .12 * wv + (J[i] > .92 ? .35 * Math.max(0, wv) : 0); }
        size *= easeOutBack(pr); const fl = pr < 1 && st.active ? Math.sin(pr * Math.PI) : 0; size *= 1 + fl * .9; a += fl * .6;
        if (ss > .001) { const nr = sstep(sr, 0, Math.hypot(x - st.sx, y - st.sy)); size *= 1 + ss * nr * nr * 2.4; a += ss * nr * .45; }
        a = Math.min(1, a) * M[i] * s.opacity; if (a <= .004) continue;
        for (const p of st.pulses) { const b = (Math.hypot(x - p.x, y - p.y) - p.r) / 26, wv = Math.exp(-b * b) * p.pow; size *= 1 + wv * 1.4; a = Math.min(1, a + wv * .5); }
        if (size <= .05) continue; ctx.globalAlpha = a; ctx.fillRect(x - size / 2, y - size / 2, size, size); } }
    ctx.globalAlpha = 1; return sum;
  }
  function frame(now) {
    st.raf = 0; const dt = st.last ? Math.min(.05, (now - st.last) / 1000) : 1 / 60; st.last = now; st.dt = dt; st.time += dt; build();
    if (st.introAt >= 0 && st.time >= st.introAt) { st.introAt = -1; if (!st.active) { setActive(true); st.releaseAt = st.time + s.revealDuration / 1000 + .7; } }
    if (st.releaseAt >= 0 && st.time >= st.releaseAt && !st.hovering) { st.releaseAt = -1; setActive(false); }
    const want = st.hovering && !reduce ? 1 : 0; st.spot += (want - st.spot) * (1 - Math.exp(-(want ? 6 : 3) * dt));
    const K = 120, Dm = 2 * Math.sqrt(K) * .9; st.svx += (K * (st.px - st.sx) - Dm * st.svx) * dt; st.svy += (K * (st.py - st.sy) - Dm * st.svy) * dt; st.sx += st.svx * dt; st.sy += st.svy * dt;
    const ps = (st.far || 1) / Math.max(.35, s.revealDuration / 1000 * .9);
    st.pulses = st.pulses.filter(p => { p.r += ps * dt; p.pow = Math.max(0, 1 - p.r / ((st.far || 1) + 40)); return p.pow > 0; });
    const pr = draw();
    if ((st.active || st.introAt >= 0 || pr > 0 || st.pulses.length || st.spot > .002 || Math.abs(st.svx) + Math.abs(st.svy) > .5) && st.visible) st.raf = requestAnimationFrame(frame); else st.last = 0;
  }
  const wake = () => { if (!st.raf && st.visible) st.raf = requestAnimationFrame(frame); };
  const local = e => { const r = card.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  card.addEventListener("pointerenter", e => { const [x, y] = local(e); st.hovering = e.pointerType !== "touch"; st.px = x; st.py = y;
    if (st.spot < .01) { st.sx = x; st.sy = y; st.svx = st.svy = 0; } st.releaseAt = -1; st.introAt = -1; setActive(true, x, y); wake(); });
  card.addEventListener("pointermove", e => { const [x, y] = local(e); st.px = x; st.py = y; wake(); });
  card.addEventListener("pointerleave", e => { st.hovering = false; if (e.pointerType === "touch") st.releaseAt = st.time + 1.2; else setActive(false); wake(); });
  card.addEventListener("pointerdown", e => { const [x, y] = local(e); if (!st.active) setActive(true, x, y); if (s.clickPulse && !reduce) st.pulses.push({ x, y, r: 0, pow: 1 }); wake(); });
  card.addEventListener("focusin", e => { if (!card.contains(e.relatedTarget)) setActive(true); });
  card.addEventListener("focusout", e => { if (!card.contains(e.relatedTarget) && !st.hovering) setActive(false); });
  new ResizeObserver(() => { build(); wake(); }).observe(card);
  let introDone = false;
  new IntersectionObserver(es => { st.visible = es.some(x => x.isIntersecting);
    if (st.visible && !introDone && s.intro && !reduce) { introDone = true; build(); st.introAt = st.time + s.introDelay / 1000; }
    if (st.visible) wake(); }).observe(card);
}
