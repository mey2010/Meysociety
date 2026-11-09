/* CircularCarousel (React Bits), ported to vanilla JS.
   Same ring geometry, intro, drift / step autoplay, drag with momentum and snap, hover pause,
   parallax, stretch, depth fade and caption reels as the original component.
   Addition: items with { type: "video", src, poster } play muted inside the curved card. */

const PRESETS = {
  cylinder: { axis: "y", tilt: -5, perspective: 2500, curve: 1, spread: 1, inward: false, billboard: false, backfaces: true, window: 0 },
  orbit: { axis: "y", tilt: -16, perspective: 1500, curve: 0, spread: 1.45, inward: false, billboard: true, backfaces: false, window: 0 },
  wheel: { axis: "x", tilt: 0, perspective: 1800, curve: 0, spread: 1, inward: false, billboard: false, backfaces: true, window: 1.7 },
  panorama: { axis: "y", tilt: 0, perspective: 0, curve: 1, spread: 1, inward: true, billboard: false, backfaces: false, window: 0 },
};
const INTRO_LENGTH = { assemble: 1500, rise: 1400, spin: 1800, none: 0 };
const TILES = innerWidth < 700 ? 4 : 6, OVERLAP = 2.5, DRAG_THRESHOLD = 5, SPRING = 52, SETTLE_SPEED = 9, CAPTION_SPACE = 76, TO_RAD = Math.PI / 180;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const wrap = d => ((((d + 180) % 360) + 360) % 360) - 180;
const easeOut = t => 1 - Math.pow(1 - t, 4);
const easeOutQuint = t => 1 - Math.pow(1 - t, 5);
const rotateX = (p, d) => { const r = d * TO_RAD, c = Math.cos(r), s = Math.sin(r); return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c]; };
const rotateY = (p, d) => { const r = d * TO_RAD, c = Math.cos(r), s = Math.sin(r); return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c]; };
const el = (tag, cls, attrs) => { const e = document.createElement(tag); if (cls) e.className = cls; if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

export function createCircularCarousel(root, opts = {}) {
  const o = {
    items: [], preset: "cylinder", intro: "rise", cardWidth: 220, aspectRatio: 1, gap: 25, curve: undefined, tilt: undefined, perspective: undefined,
    autoplay: "drift", speed: 14, interval: 3, direction: "left", draggable: true, momentum: .6, snap: true, pauseOnHover: true, focusOnClick: true,
    parallax: .3, stretch: .5, depthFade: .55, fadeColor: "#000000", innerShade: .6, cornerRadius: 12, captions: false, onChange: null, onItemClick: null, label: "Carrusel", ...opts,
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const list = o.items, count = list.length;
  const layout = PRESETS[o.preset] || PRESETS.cylinder, axis = layout.axis;
  const tilt = o.tilt ?? layout.tilt;
  const curve = layout.billboard ? 0 : clamp(o.curve ?? layout.curve, 0, 1);
  const cardW = Math.max(40, o.cardWidth), cardH = cardW / clamp(o.aspectRatio, .2, 5);
  const along = axis === "x" ? cardH : cardW, step = 360 / count;
  const radius = (() => { const n = Math.max(count, 3), pitch = (along + o.gap) * layout.spread, chord = pitch / (2 * Math.sin(Math.PI / n)), arc = (n * pitch) / (2 * Math.PI); return Math.max(chord + (arc - chord) * curve, along * .6); })();
  const S = {
    count, step, radius, layout, axis, tilt, perspective: layout.inward ? radius : (o.perspective ?? layout.perspective), cardW, cardH,
    intro: reduced ? "none" : o.intro in INTRO_LENGTH ? o.intro : "rise", autoplay: reduced ? "off" : o.autoplay, speed: o.speed, interval: Math.max(.5, o.interval),
    draggable: o.draggable, momentum: clamp(o.momentum, 0, 1), snap: o.snap, pauseOnHover: o.pauseOnHover, parallax: reduced ? 0 : clamp(o.parallax, 0, 1),
    stretch: reduced ? 0 : clamp(o.stretch, 0, 1), depthFade: clamp(o.depthFade, 0, 1), captions: o.captions,
  };
  const dragSign = layout.inward ? -1 : 1;

  // curved strips that make one card bend around the ring
  const tiles = (() => {
    const total = curve > .001 ? TILES : 1, len = along / total, bend = curve > .001 ? radius / curve : 0;
    return Array.from({ length: total }, (_, i) => {
      const start = i * len - (i > 0 ? OVERLAP / 2 : 0), end = (i + 1) * len + (i < total - 1 ? OVERLAP / 2 : 0);
      const center = (start + end) / 2 - along / 2, alpha = bend ? center / bend : 0;
      const shift = bend ? bend * Math.sin(alpha) : center, sink = bend ? bend * (1 - Math.cos(alpha)) : 0;
      const depth = layout.inward ? sink : -sink, turn = ((layout.inward ? -alpha : alpha) * 180) / Math.PI;
      const move = axis === "x" ? `translate3d(0px, ${shift}px, ${depth}px) rotateX(${-turn}deg)` : `translate3d(${shift}px, 0px, ${depth}px) rotateY(${turn}deg)`;
      return { index: i, total, start, end, size: end - start, move };
    });
  })();

  // ---- DOM ----
  root.classList.add("circular-carousel");
  Object.assign(root.dataset, { axis, shape: PRESETS[o.preset] ? o.preset : "cylinder" });
  if (o.draggable) root.dataset.draggable = "";
  root.style.setProperty("--cc-fade", o.fadeColor); root.style.setProperty("--cc-radius", Math.max(0, o.cornerRadius) + "px"); root.style.setProperty("--cc-inner", (1 - clamp(o.innerShade, 0, 1)).toFixed(3));
  root.setAttribute("role", "region"); root.setAttribute("aria-roledescription", "carousel"); root.setAttribute("aria-label", o.label); root.tabIndex = 0;
  const view = el("div", "circular-carousel__view"), stage = el("div", "circular-carousel__stage"), camera = el("div", "circular-carousel__camera"), ring = el("div", "circular-carousel__ring");
  stage.appendChild(camera); camera.appendChild(ring); view.appendChild(stage); root.appendChild(view);
  const videos = []; // { video, canvases: [{ctx, tile}], card }
  const cards = list.map((item, index) => {
    const card = el("div", "circular-carousel__card", { "data-cc-index": index, role: "group", "aria-roledescription": "slide", "aria-label": `${item.title || item.alt || "Imagen " + (index + 1)}, ${index + 1} / ${count}` });
    const isVideo = item.type === "video";
    const vid = isVideo ? Object.assign(document.createElement("video"), { muted: true, loop: true, playsInline: true, preload: "auto", src: item.src, poster: item.poster || "" }) : null;
    if (vid) { vid.setAttribute("muted", ""); vid.setAttribute("playsinline", ""); }
    const entry = vid ? { video: vid, canvases: [], card, index } : null;
    const tile = (t, back) => {
      const strip = back ? t.total - 1 - t.index : t.index, first = strip === 0, last = strip === t.total - 1, r = "var(--cc-radius)";
      const frameRadius = axis === "x" ? `${first ? r : 0} ${first ? r : 0} ${last ? r : 0} ${last ? r : 0}` : `${first ? r : 0} ${last ? r : 0} ${last ? r : 0} ${first ? r : 0}`;
      const offset = back ? along - t.end : t.start, size = t.size;
      const wrapEl = el("div", "circular-carousel__tile", { "aria-hidden": "true" });
      Object.assign(wrapEl.style, axis === "x" ? { left: -cardW / 2 + "px", top: -size / 2 + "px", width: cardW + "px", height: size + "px" } : { left: -size / 2 + "px", top: -cardH / 2 + "px", width: size + "px", height: cardH + "px" });
      wrapEl.style.transform = t.move + (back ? (axis === "x" ? " rotateX(180deg)" : " rotateY(180deg)") : "");
      const frame = el("div", "circular-carousel__frame"); frame.style.height = (axis === "x" ? size : cardH) + "px"; frame.style.borderRadius = frameRadius;
      const ps = axis === "x" ? { left: "0px", top: -offset + "px", width: cardW + "px", height: cardH + "px" } : { left: -offset + "px", top: "0px", width: cardW + "px", height: cardH + "px" };
      if (vid && !back) {
        const cv = el("canvas", "circular-carousel__photo"); Object.assign(cv.style, ps);
        const dpr = Math.min(1.5, devicePixelRatio || 1); cv.width = Math.round(cardW * dpr); cv.height = Math.round(cardH * dpr);
        entry.canvases.push({ ctx: cv.getContext("2d"), w: cv.width, h: cv.height, poster: null });
        frame.appendChild(cv);
      } else {
        const img = el("img", "circular-carousel__photo", { alt: "", draggable: "false", decoding: "async" }); img.src = isVideo ? (item.poster || "") : item.src; Object.assign(img.style, ps);
        frame.appendChild(img);
      }
      if (back) frame.appendChild(el("div", "circular-carousel__inner"));
      frame.appendChild(el("div", "circular-carousel__shade"));
      wrapEl.appendChild(frame); return wrapEl;
    };
    tiles.forEach(t => card.appendChild(tile(t, false)));
    if (layout.backfaces) tiles.forEach(t => card.appendChild(tile(t, true)));
    if (isVideo) { const b = el("span", "circular-carousel__badge", { "aria-hidden": "true" }); b.style.transform = `translate3d(${cardW / 2 - 26}px, ${-cardH / 2 + 26}px, 2px) translate(-50%, -50%)`; b.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8 5.5v13c0 .8.87 1.29 1.55.87l10.4-6.5a1 1 0 0 0 0-1.74L9.55 4.63A1 1 0 0 0 8 5.5Z"/></svg>'; card.appendChild(b); }
    ring.appendChild(card);
    if (entry) videos.push(entry);
    return card;
  });
  // video frames: cover-crop once per frame into every front strip canvas (they are already offset by their strip)
  const paintVideo = (v, src) => {
    const sw = src.videoWidth || src.naturalWidth, sh = src.videoHeight || src.naturalHeight; if (!sw || !sh) return;
    for (const c of v.canvases) {
      const k = Math.max(c.w / sw, c.h / sh), dw = sw * k, dh = sh * k;
      c.ctx.drawImage(src, (c.w - dw) / 2, (c.h - dh) / 2, dw, dh);
    }
  };
  videos.forEach(v => {
    const poster = list[v.index].poster;
    if (poster) { const im = new Image(); im.onload = () => paintVideo(v, im); im.src = poster; }
    const loop = () => { if (!v.video.paused && v.video.readyState >= 2) paintVideo(v, v.video); v.raf = v.video.requestVideoFrameCallback ? v.video.requestVideoFrameCallback(loop) : requestAnimationFrame(loop); };
    v.video.addEventListener("playing", () => { if (!v.looping) { v.looping = true; loop(); } }, { once: true });
  });

  let caption = null, titleEl = null, reels = null, live;
  if (S.captions) {
    caption = el("div", "circular-carousel__caption", { "aria-hidden": "true" });
    titleEl = el("span", "circular-carousel__title");
    const cnt = el("span", "circular-carousel__count"), digits = el("span", "circular-carousel__digits");
    reels = [0, 1].map(() => { const d = el("span", "circular-carousel__digit"), r = el("span", "circular-carousel__reel"); r.innerHTML = "0123456789".split("").map(n => `<span>${n}</span>`).join(""); d.appendChild(r); digits.appendChild(d); return r; });
    const slash = el("span", "circular-carousel__slash"); slash.textContent = "/"; const tot = el("span"); tot.textContent = String(count).padStart(2, "0");
    cnt.append(digits, slash, tot); caption.append(titleEl, cnt); root.appendChild(caption);
  }
  live = el("div", "circular-carousel__live", { "aria-live": "polite", "aria-atomic": "true" }); root.appendChild(live);
  let active = -1;
  const setActive = i => {
    if (i === active) return; active = i; const it = list[i];
    if (titleEl) {
      const t2 = el("span", "circular-carousel__title"); t2.textContent = it.title || it.alt || "";
      if (it.subtitle) { const s = el("span", "circular-carousel__subtitle"); s.textContent = it.subtitle; t2.appendChild(s); }
      titleEl.replaceWith(t2); titleEl = t2;
      String(i + 1).padStart(2, "0").split("").forEach((d, k) => reels[k].style.transform = `translateY(${-Number(d) * 10}%)`);
    }
    live.textContent = `${it.title || it.alt || ""}, ${i + 1} / ${count}`;
    videos.forEach(v => { const near = Math.abs(wrap(v.index * step + state.angle)) < 100; if (near && visible) v.video.play().catch(() => {}); else v.video.pause(); });
    o.onChange?.(i);
  };

  // ---- motion ----
  const state = { angle: 0, velocity: 0, target: null, dir: (o.direction === "right" ? 1 : -1) * dragSign, press: null, drag: false, hover: false, pointer: { inside: false, x: 0, y: 0 }, yaw: 0, pitch: 0, intro: null, introDone: false, holdUntil: 0, stepAt: 0, suppressClick: false, wheelTimer: 0, fit: 1, shift: 0, drop: 0, last: 0 };
  let raf = 0, visible = true, ready = false;
  const nearest = a => Math.round(a / S.step) * S.step;
  const measure = () => {
    const rect = root.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    const room = S.captions ? CAPTION_SPACE : 0, width = rect.width * .94, height = (rect.height - room) * .92, P = S.perspective;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    if (S.layout.inward) { minX = -width / 2; maxX = width / 2; minY = -S.cardH / 2; maxY = S.cardH / 2; }
    else {
      const corners = [[-S.cardW / 2, -S.cardH / 2], [S.cardW / 2, -S.cardH / 2], [-S.cardW / 2, S.cardH / 2], [S.cardW / 2, S.cardH / 2]];
      const limit = S.layout.window ? S.layout.window * S.step : 180;
      for (let a = -limit; a <= limit; a += limit / 24) for (const [cx, cy] of corners) {
        let p;
        if (S.axis === "x") p = rotateY(rotateX([cx, cy, S.radius], -a), S.tilt);
        else if (S.layout.billboard) { const c = rotateY([0, 0, S.radius], a); p = rotateX([c[0] + cx, cy, c[2]], S.tilt); }
        else p = rotateX(rotateY([cx, cy, S.radius], a), S.tilt);
        p = [p[0], p[1], p[2] - S.radius]; if (p[2] >= P * .95) continue;
        const k = P / (P - p[2]); minX = Math.min(minX, p[0] * k); maxX = Math.max(maxX, p[0] * k); minY = Math.min(minY, p[1] * k); maxY = Math.max(maxY, p[1] * k);
      }
    }
    const fit = Math.min(1, width / Math.max(maxX - minX, 1), height / Math.max(maxY - minY, 1));
    state.fit = fit; state.shift = -((minY + maxY) / 2) * fit - room / 2;
    state.drop = S.axis === "x" ? (rect.width / fit) * .55 + S.cardW : (rect.height / fit) * .55 + S.cardH;
    stage.style.perspective = `${P}px`; stage.style.transform = `translate3d(0, ${state.shift}px, 0) scale(${fit})`;
  };
  const introCard = (elapsed, landing) => {
    if (!state.intro) return { radius: 1, lift: 0 };
    const type = state.intro.type, reach = Math.abs(wrap(landing + state.angle));
    if (type === "assemble") { const p = easeOut(clamp((elapsed - (reach / 180) * 420) / 1080, 0, 1)); return { radius: 1 + .6 * (1 - p), lift: 0 }; }
    if (type === "rise") { const p = easeOutQuint(clamp((elapsed - (reach / 180) * 480) / 900, 0, 1)); return { radius: 1, lift: (1 - p) * state.drop }; }
    if (type === "spin") { const p = easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1)); return { radius: 1 + .28 * (1 - p), lift: 0 }; }
    return { radius: 1, lift: 0 };
  };
  const advance = (dt, now) => {
    if (!state.introDone && ready) {
      if (!state.intro) { if (S.intro === "none") state.introDone = true; else state.intro = { type: S.intro, start: now }; }
      if (state.intro && now - state.intro.start >= INTRO_LENGTH[state.intro.type]) { state.intro = null; state.introDone = true; }
    }
    const paused = (S.pauseOnHover && state.hover) || state.drag || now < state.holdUntil;
    const cruise = S.autoplay === "drift" && !paused && !state.intro ? S.speed * state.dir : 0;
    let busy = Boolean(state.intro) || state.drag;
    if (state.drag || state.intro) state.velocity = state.drag ? state.velocity : 0;
    else if (state.target !== null) {
      let rem = dt; const damp = 2 * Math.sqrt(SPRING);
      while (rem > 0) { const h = Math.min(rem, 1 / 240); state.velocity += (SPRING * (state.target - state.angle) - damp * state.velocity) * h; state.angle += state.velocity * h; rem -= h; }
      if (Math.abs(state.target - state.angle) < .004 && Math.abs(state.velocity) < .03) { state.angle = state.target; state.velocity = 0; state.target = null; }
      busy = true;
    } else {
      // hovering a drifting ring just eases it to a standstill (no snap, no jump); everything else settles on a card
      const softStop = S.autoplay === "drift" && state.hover && !state.drag;
      const tau = cruise ? 1.1 : softStop ? .5 : .18 + S.momentum * 1.5;
      state.velocity += (cruise - state.velocity) * (1 - Math.exp(-dt / tau)); state.angle += state.velocity * dt;
      if (cruise === 0 && S.snap && !softStop && Math.abs(state.velocity) < SETTLE_SPEED) state.target = nearest(state.angle);
      busy = busy || cruise !== 0 || Math.abs(state.velocity) > .01 || state.target !== null;
    }
    if (S.autoplay === "step" && !paused && !state.intro && state.introDone) {
      if (!state.stepAt) state.stepAt = now + S.interval * 1000;
      if (now >= state.stepAt) { state.target = (state.target ?? nearest(state.angle)) + S.step * state.dir; state.stepAt = now + S.interval * 1000; }
      busy = true;
    } else state.stepAt = 0;
    if (now < state.holdUntil) busy = true;
    const ease = 1 - Math.exp(-dt / .35);
    const aimYaw = state.pointer.inside ? state.pointer.x * S.parallax * 9 : 0, aimPitch = state.pointer.inside ? -state.pointer.y * S.parallax * 6 : 0;
    state.yaw += (aimYaw - state.yaw) * ease; state.pitch += (aimPitch - state.pitch) * ease;
    if (Math.abs(aimYaw - state.yaw) > .01 || Math.abs(aimPitch - state.pitch) > .01) busy = true;
    return busy;
  };
  const render = now => {
    const elapsed = state.intro ? now - state.intro.start : 0;
    const swell = 1 + S.stretch * .12 * Math.min(1, Math.abs(state.velocity) / 420);
    let spin = 0;
    if (state.intro?.type === "spin") spin = -300 * state.dir * (1 - easeOut(clamp(elapsed / INTRO_LENGTH.spin, 0, 1)));
    else if (state.intro?.type === "assemble") spin = -32 * state.dir * (1 - easeOut(clamp(elapsed / INTRO_LENGTH.assemble, 0, 1)));
    const angle = state.angle + spin, R = S.radius * swell;
    if (S.axis === "x") { camera.style.transform = `translate3d(0, 0, ${-R}px) rotateY(${S.tilt + state.yaw}deg) rotateX(${state.pitch}deg)`; ring.style.transform = `rotateX(${-angle}deg)`; }
    else if (S.layout.inward) { camera.style.transform = `translate3d(0, 0, ${S.perspective - 1}px) rotateX(${S.tilt + state.pitch}deg) rotateY(${state.yaw}deg)`; ring.style.transform = `rotateY(${angle}deg)`; }
    else { camera.style.transform = `translate3d(0, 0, ${-R}px) rotateX(${S.tilt + state.pitch}deg) rotateY(${state.yaw}deg)`; ring.style.transform = `rotateY(${angle}deg)`; }
    for (let i = 0; i < S.count; i++) {
      const card = cards[i], base = i * S.step, mod = introCard(elapsed, base), r = R * mod.radius;
      let tr;
      if (S.axis === "x") tr = `rotateX(${-base}deg) translateZ(${r}px)`;
      else if (S.layout.inward) tr = `rotateY(${base}deg) translateZ(${-r}px)`;
      else { tr = `rotateY(${base}deg) translateZ(${r}px)`; if (S.layout.billboard) tr += ` rotateY(${-(base + angle)}deg)`; }
      if (mod.lift) tr += S.axis === "x" ? ` translateX(${mod.lift}px)` : ` translateY(${mod.lift}px)`;
      if (card._tr !== tr) { card.style.transform = tr; card._tr = tr; }
      const world = wrap(base + angle), facing = Math.cos(world * TO_RAD);
      if (S.layout.inward) card.style.visibility = Math.abs(world) > 86 ? "hidden" : "";
      const dep = (Math.round(S.depthFade * Math.pow((1 - facing) / 2, 1.25) * 200) / 200).toFixed(3);
      if (card._dep !== dep) { card.style.setProperty("--cc-depth", dep); card._dep = dep; }
    }
    setActive(((Math.round(-state.angle / S.step) % S.count) + S.count) % S.count || 0);
  };
  const frame = now => {
    raf = 0; if (document.documentElement.classList.contains("is-covered")) { state.last = 0; return; } // a full-screen panel is open
    const dt = state.last ? Math.min((now - state.last) / 1000, .1) : 1 / 60; state.last = now;
    const busy = advance(dt, now); render(now);
    if (busy && visible && !document.hidden) raf = requestAnimationFrame(frame); else state.last = 0;
  };
  const wake = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
  const focusIndex = i => { let target = -i * S.step; target += 360 * Math.round((state.angle - target) / 360); state.target = target; state.holdUntil = performance.now() + 2800; wake(); };
  const stepBy = d => { const base = state.target ?? nearest(state.angle); state.target = base - d * S.step * (S.layout.inward ? -1 : 1); state.holdUntil = performance.now() + 2800; wake(); };

  // ---- input ----
  root.addEventListener("pointerdown", e => {
    state.suppressClick = false; if (!S.draggable || e.button !== 0) return;
    state.press = { id: e.pointerId, x: e.clientX, y: e.clientY, angle: state.angle, moved: false, origin: 0, samples: [{ time: performance.now(), angle: state.angle }] };
  });
  root.addEventListener("pointermove", e => {
    if (e.pointerType === "mouse") { state.pointer.inside = true; const r = root.getBoundingClientRect(); state.pointer.x = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1); state.pointer.y = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1); }
    const p = state.press; if (!p || p.id !== e.pointerId) { wake(); return; }
    const delta = S.axis === "x" ? e.clientY - p.y : e.clientX - p.x, cross = S.axis === "x" ? e.clientX - p.x : e.clientY - p.y;
    if (!p.moved) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      if (Math.abs(cross) > Math.abs(delta) * 1.2 && e.pointerType !== "mouse") { state.press = null; return; }
      p.moved = true; p.origin = delta; state.drag = true; state.target = null; state.velocity = 0; root.dataset.dragging = "";
      try { root.setPointerCapture(e.pointerId); } catch {}
    }
    const per = 180 / (Math.PI * S.radius * state.fit);
    state.angle = p.angle + (delta - p.origin) * per * (S.layout.inward ? -1 : 1);
    const now = performance.now(); p.samples.push({ time: now, angle: state.angle });
    while (p.samples.length > 2 && now - p.samples[0].time > 110) p.samples.shift();
    wake();
  });
  const release = e => {
    const p = state.press; if (!p || p.id !== e.pointerId) return; state.press = null; if (!p.moved) return;
    state.drag = false; delete root.dataset.dragging; state.suppressClick = true;
    const a = p.samples[0], b = p.samples[p.samples.length - 1], span = (b.time - a.time) / 1000;
    const v = span > .008 ? clamp((b.angle - a.angle) / span, -1400, 1400) : 0;
    state.velocity = v; if (Math.abs(v) > 60) state.dir = Math.sign(v);
    const coasting = S.autoplay === "drift" && !(S.pauseOnHover && state.hover && e.pointerType === "mouse");
    if (S.snap && !coasting) state.target = Math.round((state.angle + v * (.18 + S.momentum * 1.5) * .55) / S.step) * S.step;
    wake();
  };
  root.addEventListener("pointerup", release); root.addEventListener("pointercancel", release);
  root.addEventListener("pointerenter", e => { if (e.pointerType !== "mouse") return; state.hover = true; wake(); });
  root.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") { state.hover = false; state.pointer.inside = false; } wake(); });
  root.addEventListener("click", e => {
    if (state.suppressClick) { state.suppressClick = false; return; }
    const card = e.target.closest?.("[data-cc-index]"); if (!card) return;
    const i = Number(card.getAttribute("data-cc-index"));
    const front = i === active;
    if (o.focusOnClick) focusIndex(i);
    o.onItemClick?.(list[i], i, front);
  });
  root.addEventListener("keydown", e => {
    const fw = axis === "x" ? "ArrowDown" : "ArrowRight", bw = axis === "x" ? "ArrowUp" : "ArrowLeft";
    if (e.key === fw) stepBy(1); else if (e.key === bw) stepBy(-1); else if (e.key === "Home") focusIndex(0); else if (e.key === "End") focusIndex(count - 1);
    else if (e.key === "Enter" || e.key === " ") o.onItemClick?.(list[active], active, true); else return;
    e.preventDefault();
  });
  root.addEventListener("wheel", e => {
    if (!S.draggable) return; const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0; if (!d) return;
    e.preventDefault(); const per = 180 / (Math.PI * S.radius * state.fit), sg = S.layout.inward ? -1 : 1;
    state.target = null; state.angle -= d * per * sg; state.velocity = -d * per * sg * 30; state.holdUntil = performance.now() + 1600;
    clearTimeout(state.wheelTimer); state.wheelTimer = setTimeout(() => { if (S.snap) state.target = nearest(state.angle + state.velocity * .12); wake(); }, 140); wake();
  }, { passive: false });
  document.addEventListener("coverchange", e => { if (!e.detail) wake(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; state.last = 0; videos.forEach(v => v.video.pause()); } else { wake(); active = -1; } });
  new ResizeObserver(() => { measure(); wake(); }).observe(root);
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) { wake(); const a = active; active = -1; if (a >= 0) setActive(a); }
    else { cancelAnimationFrame(raf); raf = 0; state.last = 0; videos.forEach(v => v.video.pause()); }
  }).observe(root);

  // start as soon as the cards facing the viewer are decoded (max .7 s); the rest keep loading as they rise
  const srcOf = it => it.type === "video" ? it.poster : it.src, front = [0, 1, count - 1, 2, count - 2].filter((v, k, a) => v >= 0 && v < count && a.indexOf(v) === k);
  const load = src => new Promise(r => { const im = new Image(); im.decoding = "async"; im.onload = () => (im.decode ? im.decode().then(r, r) : r()); im.onerror = r; im.src = src; });
  list.forEach(it => { const s = srcOf(it); if (s) load(s); });
  Promise.race([Promise.all(front.map(i => srcOf(list[i])).filter(Boolean).map(load)), new Promise(r => setTimeout(r, 700))]).then(() => { ready = true; root.dataset.ready = ""; state.introDone = false; state.intro = null; wake(); });
  measure(); render(performance.now()); wake();
  return { focus: focusIndex, step: stepBy, get active() { return active; } };
}
