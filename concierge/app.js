/* Mey Society · Ibiza — illustrated island map, StaggeredMenu + BranchedMenu, services, client area. */
import { ICONS } from "./icons.js";
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(hover: hover) and (pointer: fine)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* =====================================================================
   STAGGERED MENU — React Bits <StaggeredMenu /> ported to vanilla JS + GSAP
   (same DOM, CSS and timelines as the component; no React needed)
   ===================================================================== */
const SM = (() => {
  const root = document.getElementById("sm"), panel = root.querySelector(".staggered-menu-panel");
  const layers = [...root.querySelectorAll(".sm-prelayer")], btn = document.getElementById("smToggle");
  const icon = document.getElementById("smIcon"), plusH = document.getElementById("smH"), plusV = document.getElementById("smV"), textInner = document.getElementById("smText");
  const position = root.dataset.position || "right", offscreen = position === "left" ? -100 : 100;
  const menuButtonColor = "#ffffff", openMenuButtonColor = "#0d0a38";
  let open = false, busy = false, openTl = null, closeTween = null, spin = null, colorTw = null, textTw = null;
  gsap.set([panel, ...layers], { xPercent: offscreen, opacity: 1 });
  gsap.set(root.querySelector(".sm-prelayers"), { xPercent: 0, opacity: 1 });
  gsap.set(plusH, { transformOrigin: "50% 50%", rotate: 0 }); gsap.set(plusV, { transformOrigin: "50% 50%", rotate: 90 });
  gsap.set(icon, { rotate: 0, transformOrigin: "50% 50%" }); gsap.set(textInner, { yPercent: 0 }); gsap.set(btn, { color: menuButtonColor });
  function buildOpen() {
    openTl?.kill(); closeTween?.kill(); closeTween = null;
    const items = [...panel.querySelectorAll(".sm-panel-itemLabel")], nums = [...panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")];
    const sTitle = panel.querySelector(".sm-socials-title"), sLinks = [...panel.querySelectorAll(".sm-socials-link")];
    gsap.set(items, { yPercent: 140, rotate: 10 }); gsap.set(nums, { "--sm-num-opacity": 0 }); if (sTitle) gsap.set(sTitle, { opacity: 0 }); gsap.set(sLinks, { y: 25, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    layers.forEach((el, i) => tl.fromTo(el, { xPercent: offscreen }, { xPercent: 0, duration: .5, ease: "power4.out" }, i * .07));
    const panelAt = (layers.length - 1) * .07 + (layers.length ? .08 : 0), panelDur = .65;
    tl.fromTo(panel, { xPercent: offscreen }, { xPercent: 0, duration: panelDur, ease: "power4.out" }, panelAt);
    const itemsAt = panelAt + panelDur * .15;
    tl.to(items, { yPercent: 0, rotate: 0, duration: 1, ease: "power4.out", stagger: { each: .1, from: "start" } }, itemsAt);
    tl.to(nums, { duration: .6, ease: "power2.out", "--sm-num-opacity": 1, stagger: { each: .08, from: "start" } }, itemsAt + .1);
    const socAt = panelAt + panelDur * .4;
    if (sTitle) tl.to(sTitle, { opacity: 1, duration: .5, ease: "power2.out" }, socAt);
    tl.to(sLinks, { y: 0, opacity: 1, duration: .55, ease: "power3.out", stagger: { each: .08, from: "start" }, onComplete: () => gsap.set(sLinks, { clearProps: "opacity" }) }, socAt + .04);
    return (openTl = tl);
  }
  function playOpen() { if (busy) return; busy = true; const tl = buildOpen(); tl.eventCallback("onComplete", () => { busy = false; }); tl.play(0); }
  function playClose() {
    openTl?.kill(); openTl = null; closeTween?.kill();
    closeTween = gsap.to([...layers, panel], { xPercent: offscreen, duration: .32, ease: "power3.in", overwrite: "auto", onComplete: () => {
      gsap.set(panel.querySelectorAll(".sm-panel-itemLabel"), { yPercent: 140, rotate: 10 });
      gsap.set(panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item"), { "--sm-num-opacity": 0 });
      busy = false;
    } });
  }
  function animateIcon(o) { spin?.kill(); spin = o ? gsap.to(icon, { rotate: 225, duration: .8, ease: "power4.out", overwrite: "auto" }) : gsap.to(icon, { rotate: 0, duration: .35, ease: "power3.inOut", overwrite: "auto" }); }
  function animateColor(o) { colorTw?.kill(); colorTw = gsap.to(btn, { color: o ? openMenuButtonColor : (onLight ? "#0d0a38" : menuButtonColor), delay: .18, duration: .3, ease: "power2.out" }); }
  function animateText(o) {
    textTw?.kill(); const cur = o ? "Menú" : "Cerrar", target = o ? "Cerrar" : "Menú"; const seq = [cur]; let last = cur;
    for (let i = 0; i < 3; i++) { last = last === "Menú" ? "Cerrar" : "Menú"; seq.push(last); } if (last !== target) seq.push(target); seq.push(target);
    textInner.innerHTML = seq.map(l => `<span class="sm-toggle-line">${l}</span>`).join("");
    gsap.set(textInner, { yPercent: 0 }); const n = seq.length;
    textTw = gsap.to(textInner, { yPercent: -((n - 1) / n) * 100, duration: .5 + n * .07, ease: "power4.out" });
  }
  function set(o) {
    if (o === open) return; open = o;
    root.toggleAttribute("data-open", o); btn.setAttribute("aria-expanded", o); btn.setAttribute("aria-label", o ? "Cerrar menú" : "Abrir menú"); panel.setAttribute("aria-hidden", !o);
    o ? playOpen() : playClose(); animateIcon(o); animateColor(o); animateText(o);
  }
  btn.addEventListener("click", () => set(!open));
  // over light sections the closed button and wordmark switch to midnight
  let onLight = false;
  function checkGround() {
    const el = document.elementsFromPoint(innerWidth / 2, 44).find(n => n.matches?.("section"));
    const light = !!el && !el.classList.contains("sec--night");
    if (light === onLight) return; onLight = light; root.classList.toggle("sm-on-light", light);
    if (!open) gsap.to(btn, { color: light ? "#0d0a38" : "#ffffff", duration: .3, overwrite: "auto" });
  }
  addEventListener("scroll", checkGround, { passive: true }); checkGround();
  document.addEventListener("mousedown", e => { if (open && !panel.contains(e.target) && !btn.contains(e.target)) set(false); });
  addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
  panel.addEventListener("click", e => {
    const a = e.target.closest("a"); if (!a) return;
    if (a.hasAttribute("data-login")) { e.preventDefault(); set(false); openLogin(); return; }
    const h = a.getAttribute("href"); if (h && h.startsWith("#")) { e.preventDefault(); set(false); setTimeout(() => document.querySelector(h)?.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" }), 250); }
  });
  return { set };
})();

/* =====================================================================
   DATA + PROJECTION (same as the baked map: equirectangular, cos-lat corrected)
   ===================================================================== */
const [MAP, VENUES] = await Promise.all([fetch("data/map.json").then(r => r.json()), fetch("data/places.json").then(r => r.json())]);
const [LON0, LON1, LAT0, LAT1] = MAP.bbox, KX = Math.cos(38.88 * Math.PI / 180), SX = MAP.w / ((LON1 - LON0) * KX);
const toSVG = ([lon, lat]) => [(lon - LON0) * KX * SX, (LAT1 - lat) * SX];
const PLACES = {
  eivissa: { name: "Eivissa · Dalt Vila", ll: [1.4363, 38.9067] }, botafoch: { name: "Marina Botafoch", ll: [1.4475, 38.9165] },
  cubells: { name: "Es Cubells · Cala Jondal", ll: [1.33, 38.864] }, bassa: { name: "Cala Bassa", ll: [1.241, 38.968] },
  hort: { name: "Cala d'Hort", ll: [1.223, 38.889] }, bossa: { name: "Platja d'en Bossa", ll: [1.41, 38.883] },
  airport: { name: "Aeropuerto de Ibiza", ll: [1.373, 38.873] }, salines: { name: "Ses Salines", ll: [1.396, 38.84] },
  santantoni: { name: "Sant Antoni", ll: [1.303, 38.981] }, savina: { name: "Formentera · La Savina", ll: [1.416, 38.735] },
};
const KIND = { club: "Club", beachclub: "Beach club", beach: "Playa" };
const NS = "http://www.w3.org/2000/svg";

/* =====================================================================
   HERO MAP — illustrated, pannable, zoomable, every point clickable
   ===================================================================== */
let active = null;
const mapEl = document.getElementById("map"), svg = document.getElementById("mapSvg"), pop = document.getElementById("pop");
const LABELS = [["EIVISSA", 1.432, 38.926], ["SANT ANTONI", 1.31, 38.992], ["SANT JOSEP", 1.29, 38.925], ["SANTA EULÀRIA", 1.52, 38.995], ["SANT JOAN", 1.5, 39.065], ["FORMENTERA", 1.47, 38.69]];
{
  const grid = []; for (let x = 0; x <= MAP.w; x += 50) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${MAP.h}"/>`); for (let y = 0; y <= MAP.h; y += 50) grid.push(`<line x1="0" y1="${y}" x2="${MAP.w}" y2="${y}"/>`);
  const coast = MAP.coast.join("");
  const cont = Object.entries(MAP.contours).map(([lv, ps]) => `<path class="contour${+lv % 100 === 0 ? " major" : ""}" d="${ps.join("")}"/>`).join("");
  svg.innerHTML = `<defs>
      <linearGradient id="landFill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3592"/><stop offset=".55" stop-color="#292467"/><stop offset="1" stop-color="#1e1c5c"/></linearGradient>
      <clipPath id="landClip"><path d="${coast}"/></clipPath></defs>
    <g class="sea-grid">${grid.join("")}</g>
    <text class="label label--sea" x="80" y="1120">Mar Mediterráneo</text>
    <path class="shore" d="${coast}"/><path class="land" d="${coast}"/>
    <g clip-path="url(#landClip)">${cont}</g>
    ${LABELS.map(([t, lo, la]) => { const [x, y] = toSVG([lo, la]); return `<text class="label" x="${x}" y="${y}" text-anchor="middle">${t}</text>`; }).join("")}
    <g id="pins"></g>`;
}
const pinsG = svg.querySelector("#pins"), pins = [];
const counts = { club: 0, beachclub: 0, beach: 0 };
for (const v of VENUES) {
  const [x, y] = toSVG([v.lon, v.lat]); counts[v.type]++;
  const g = document.createElementNS(NS, "g"); g.setAttribute("class", `pin pin--${v.type}`); g.setAttribute("tabindex", "0"); g.setAttribute("role", "button");
  g.setAttribute("aria-label", `${KIND[v.type]}: ${v.name}, ${v.area}`);
  g.innerHTML = `<g class="pin__s"><circle class="hit" r="14"/><circle class="halo" r="7"/><circle class="core" r="7"/><text x="12" y="4">${v.name}</text></g>`;
  g.setAttribute("transform", `translate(${x} ${y})`); pinsG.append(g); pins.push({ v, g, x, y });
  g.addEventListener("click", e => { e.stopPropagation(); openPop(pins.find(p => p.g === g)); });
  g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPop(pins.find(p => p.g === g)); } });
}
document.querySelectorAll("[data-count]").forEach(b => b.textContent = counts[b.dataset.count]);
document.querySelectorAll(".filter").forEach(b => b.addEventListener("click", () => {
  const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on);
  pins.forEach(p => { if (p.v.type === b.dataset.kind) p.g.classList.toggle("is-hidden", !on); });
  if (!on && active && active.v.type === b.dataset.kind) closePop();
}));

// view box: fit, pan, zoom (wheel, pinch, buttons, preset areas)
const FULL = { x: -40, y: -20, w: MAP.w + 80, h: MAP.h + 40 };
const vb = { ...FULL };
function fit(box) { // keep the container aspect so pins stay round
  const r = mapEl.clientWidth / mapEl.clientHeight, cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  let w = box.w, h = box.h; if (w / h < r) w = h * r; else h = w / r; return { x: cx - w / 2, y: cy - h / 2, w, h };
}
function apply() {
  svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  const k = vb.w / mapEl.clientWidth; pins.forEach(p => p.g.firstChild.setAttribute("transform", `scale(${k})`));
  mapEl.classList.toggle("is-zoomed", vb.w < 420);
  if (active) placePop();
}
function goTo(box, dur = .9) {
  const t = fit(box);
  if (REDUCED || !dur) { Object.assign(vb, t); apply(); return; }
  gsap.to(vb, { ...t, duration: dur, ease: "power3.inOut", onUpdate: apply });
}
function zoomAt(f, sx, sy) { // f < 1 zooms in, around screen point (sx, sy) in container px
  const nw = clamp(vb.w * f, 120, FULL.w * 1.6), k = nw / vb.w;
  const px = vb.x + (sx / mapEl.clientWidth) * vb.w, py = vb.y + (sy / mapEl.clientHeight) * vb.h;
  vb.x = px - (px - vb.x) * k; vb.y = py - (py - vb.y) * k; vb.w = nw; vb.h = vb.h * k; apply();
}
mapEl.addEventListener("wheel", e => { e.preventDefault(); const r = mapEl.getBoundingClientRect(); zoomAt(Math.exp(e.deltaY * .0015), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
const ptrs = new Map(); let lastDist = 0, moved = 0;
mapEl.addEventListener("pointerdown", e => { if (e.target.closest(".pop, .map__zoom, .map__areas")) return; ptrs.set(e.pointerId, e); if (!e.target.closest(".pin")) mapEl.setPointerCapture?.(e.pointerId); moved = 0; mapEl.classList.add("is-dragging"); });
mapEl.addEventListener("pointermove", e => {
  if (!ptrs.has(e.pointerId)) return; const prev = ptrs.get(e.pointerId); ptrs.set(e.pointerId, e);
  if (ptrs.size === 1) { const dx = e.clientX - prev.clientX, dy = e.clientY - prev.clientY; moved += Math.abs(dx) + Math.abs(dy); vb.x -= dx * vb.w / mapEl.clientWidth; vb.y -= dy * vb.h / mapEl.clientHeight; apply(); }
  else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); const r = mapEl.getBoundingClientRect();
    if (lastDist) zoomAt(lastDist / d, (a.clientX + b.clientX) / 2 - r.left, (a.clientY + b.clientY) / 2 - r.top); lastDist = d; moved = 99; }
});
const endPtr = e => { ptrs.delete(e.pointerId); if (ptrs.size < 2) lastDist = 0; if (!ptrs.size) mapEl.classList.remove("is-dragging"); };
mapEl.addEventListener("pointerup", endPtr); mapEl.addEventListener("pointercancel", endPtr);
mapEl.addEventListener("click", e => { if (moved < 6 && !e.target.closest(".pin, .pop, .map__zoom, .map__areas")) closePop(); }, true);
mapEl.querySelector(".map__zoom").addEventListener("click", e => {
  const z = e.target.closest("button")?.dataset.zoom; if (!z) return;
  if (z === "reset") return goTo(FULL);
  const t = { ...vb }; const f = z === "in" ? .6 : 1 / .6; const cx = t.x + t.w / 2, cy = t.y + t.h / 2; t.w = clamp(t.w * f, 120, FULL.w * 1.6); t.h = t.w * vb.h / vb.w; t.x = cx - t.w / 2; t.y = cy - t.h / 2; goTo(t, .5);
});
const AREAS = { sur: [1.30, 1.45, 38.82, 38.92], eivissa: [1.395, 1.475, 38.87, 38.94], oeste: [1.19, 1.31, 38.86, 38.99], santantoni: [1.27, 1.33, 38.955, 39.0], formentera: [1.36, 1.6, 38.63, 38.78] };
mapEl.querySelector(".map__areas").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return; const [lo0, lo1, la0, la1] = AREAS[b.dataset.area];
  const [x0, y0] = toSVG([lo0, la1]), [x1, y1] = toSVG([lo1, la0]);
  mapEl.querySelectorAll(".map__areas button").forEach(x => x.classList.toggle("is-on", x === b)); closePop(); goTo({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
});
new ResizeObserver(() => { Object.assign(vb, fit(vb)); apply(); }).observe(mapEl);
Object.assign(vb, fit(FULL)); apply();

// popup
const popImg = document.getElementById("popImg");
function openPop(p) {
  if (active) active.g.classList.remove("is-active");
  active = p; p.g.classList.add("is-active");
  document.getElementById("popKind").innerHTML = `<i class="dot dot--${p.v.type}"></i>${KIND[p.v.type]} · ${p.v.area}`;
  document.getElementById("popTitle").textContent = p.v.name;
  document.getElementById("popInfo").textContent = p.v.info;
  document.getElementById("popCoord").textContent = `${p.v.lat.toFixed(4)}° N · ${p.v.lon.toFixed(4)}° E`;
  popImg.src = p.v.photo; popImg.alt = `Vista aérea de ${p.v.name}`;
  const book = document.getElementById("popBook"); book.textContent = p.v.type === "beach" ? "Organizar un día aquí" : "Reservar con Mey Society";
  pop.hidden = false; placePop();
  if (!REDUCED) gsap.fromTo(pop, { opacity: 0, scale: .92, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: .45, ease: "back.out(1.6)" });
}
function placePop() {
  if (!active || matchMedia("(max-width: 900px)").matches) return;
  const sx = (active.x - vb.x) / vb.w * mapEl.clientWidth, sy = (active.y - vb.y) / vb.h * mapEl.clientHeight;
  const w = pop.offsetWidth, h = pop.offsetHeight, W = mapEl.clientWidth, H = mapEl.clientHeight;
  let left = sx + 22, top = sy - h / 2; if (left + w > W - 12) left = sx - w - 22;
  pop.style.left = clamp(left, 12, W - w - 12) + "px"; pop.style.top = clamp(top, 12, H - h - 12) + "px";
  pop.style.setProperty("--ox", (left < sx ? "100%" : "0%")); pop.style.setProperty("--oy", "50%");
}
function closePop() { if (!active) return; active.g.classList.remove("is-active"); active = null; pop.hidden = true; }
pop.querySelector(".pop__x").addEventListener("click", closePop);
addEventListener("keydown", e => { if (e.key === "Escape") closePop(); });
document.getElementById("popBook").addEventListener("click", () => {
  if (!active) return; const v = active.v; select(v.type === "club" ? "noche" : "beach", true);
  document.getElementById("f-notes").value = `Me interesa ${v.name} (${v.area}).`; closePop();
  document.getElementById("contacto").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
});

/* =====================================================================
   SIGNAL TYPE — the name flickers on like a neon sign, then idles
   ===================================================================== */
{
  const h = document.getElementById("signal"), intro = h.closest(".intro"), text = h.textContent;
  h.innerHTML = [...text].map(c => c === " " ? '<span class="sp"> </span>' : `<span class="ch" aria-hidden="true">${c}</span>`).join("");
  const chars = [...h.querySelectorAll(".ch")];
  const lit = () => intro.classList.add("is-lit");
  if (REDUCED) { chars.forEach(c => c.classList.add("on")); lit(); }
  else {
    // each letter strikes on at its own moment, stutters 2-4 times, then holds
    let done = 0;
    chars.forEach((c, i) => {
      const start = 250 + Math.random() * 1100 + (i === chars.length - 1 ? 500 : 0); let t = start;
      const flips = 2 + Math.floor(Math.random() * 3);
      for (let k = 0; k < flips; k++) {
        setTimeout(() => { c.classList.add("on"); c.classList.remove("dim"); }, t); t += 40 + Math.random() * 90;
        setTimeout(() => { c.classList.remove("on"); c.classList.add("dim"); }, t); t += 50 + Math.random() * 140;
      }
      setTimeout(() => { c.classList.add("on"); c.classList.remove("dim"); if (++done === chars.length) lit(); }, t);
    });
    // a tube that hiccups now and then
    (function idle() {
      setTimeout(() => {
        if (!document.hidden && intro.getBoundingClientRect().bottom > 0) {
          const c = chars[Math.floor(Math.random() * chars.length)];
          c.classList.remove("on"); c.classList.add("dim");
          setTimeout(() => { c.classList.add("on"); c.classList.remove("dim"); }, 70);
          setTimeout(() => { c.classList.remove("on"); }, 140);
          setTimeout(() => { c.classList.add("on"); c.classList.remove("dim"); }, 210);
        }
        idle();
      }, 2600 + Math.random() * 3600);
    })();
  }
}

/* =====================================================================
   SPECTRAL DRAPE — a sheet of glowing dots folding in 3D (page background)
   ===================================================================== */
{
  const cv = document.getElementById("drape"), cx = cv.getContext("2d");
  const small = matchMedia("(max-width: 900px)").matches;
  const COLS = small ? 56 : 96, ROWS = small ? 34 : 54;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  let W = 0, H = 0;
  function size() { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  size(); addEventListener("resize", size);
  // soft dots in the brand colours, drawn normally so they read on white
  const sprite = col => { const c = document.createElement("canvas"); c.width = c.height = 32; const g = c.getContext("2d"); const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    r.addColorStop(0, col); r.addColorStop(.45, col); r.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return c; };
  // the six colours sampled from the logo, dark to light along the fold
  const SPR = ["#0d0a38", "#292467", "#1e24bb", "#515c9f", "#78c7e4", "#ab50db"].map(sprite);
  let mx = 0, my = 0, tmx = 0, tmy = 0, t0 = performance.now();
  addEventListener("pointermove", e => { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }, { passive: true });
  // pressing anywhere sends a ripple through the drape from that point
  const ripples = [];
  addEventListener("pointerdown", e => {
    if (e.target.closest("a, button, input, textarea, .map, .pop, .staggered-menu-panel, .modal, .dash")) return;
    ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() }); if (ripples.length > 5) ripples.shift();
    if (REDUCED) draw(performance.now());
  }, { passive: true });
  function draw(now) {
    const t = (now - t0) / 1000, sc = scrollY / Math.max(1, innerHeight);
    mx += (tmx - mx) * .04; my += (tmy - my) * .04;
    for (let r = ripples.length - 1; r >= 0; r--) if (now - ripples[r].t > 2600) ripples.splice(r, 1);
    cx.clearRect(0, 0, W, H);
    const ry = .5 + mx * .5 + Math.sin(t * .07) * .25, rx = 1.05 + my * .25, cy = Math.cos(ry), sy = Math.sin(ry), cxr = Math.cos(rx), sxr = Math.sin(rx);
    const F = Math.min(W, H) * 1.25, scale = Math.max(W, H) * .62, R = Math.max(W, H);
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
        const depth = clamp((4.4 - z2) / 2.4), s = (1.1 + depth * 3.6 + boost * 2.5) * (F / 1000);
        const k = clamp((z + .7) / 1.4); const spr = SPR[Math.min(5, Math.floor(k * 6))];
        cx.globalAlpha = Math.min(1, .1 + depth * .45 + boost * .5);
        cx.drawImage(spr, px - s, py - s, s * 2, s * 2);
      }
    }
    cx.globalAlpha = 1;
  }
  if (REDUCED) draw(performance.now());
  else (function loop(now) { if (!document.hidden) draw(now); requestAnimationFrame(loop); })(performance.now());
}

/* =====================================================================
   SCROLL STACK — each service card sticks, the next slides over it,
   and the ones underneath shrink and fade away
   ===================================================================== */
{
  const cards = [...document.querySelectorAll(".stack__card")];
  cards.forEach((c, i) => c.style.setProperty("--i", i));
  document.querySelectorAll(".stack__card [data-svc]").forEach(b => b.addEventListener("click", () => select(b.dataset.svc, true)));
  if (!REDUCED) {
    let ticking = false;
    function update() {
      ticking = false;
      const vh = innerHeight;
      const cover = cards.map((c, i) => { // how far card i has slid into its stuck position (0..1)
        const r = c.getBoundingClientRect(), stuckAt = parseFloat(getComputedStyle(c).top) || 0;
        return clamp((vh - r.top) / Math.max(1, vh - stuckAt));
      });
      cards.forEach((c, i) => {
        let k = 0; for (let j = i + 1; j < cards.length; j++) k += cover[j];
        const s = 1 - Math.min(k, 4) * .05, o = 1 - clamp(k * .55 - .1, 0, .95);
        c.style.transform = `scale(${s.toFixed(4)})`; c.style.opacity = o.toFixed(3);
        c.style.filter = k > .05 ? `brightness(${(1 - Math.min(k, 2) * .18).toFixed(3)})` : "";
      });
    }
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update); update();
  }
}


/* =====================================================================
   BRANCHED MENU — React Bits <BranchedMenu /> ported to vanilla JS
   (same DOM, CSS variables, branch geometry and draw/fold timing)
   ===================================================================== */
function BranchedMenu(nav, { items, defaultOpen = 0, defaultActive = "", onSelect, onToggle, color = "#f5f5f5", accentColor = "#f5f5f5", lineColor = "#3f3f46",
  width = 240, rowHeight = 36, indent = 40, trunk = 14, radius = 10, lineWidth = 1.5, fontSize = 14, drawDuration = 400, foldDuration = 300 }) {
  const PAD = 6, MARK = 16;
  const toSet = o => new Set(Array.isArray(o) ? o : o >= 0 ? [o] : []);
  const open = toSet(defaultOpen);
  let active = defaultActive || (items.find((it, i) => it.children && open.has(i))?.children?.[0]?.value ?? "");
  Object.entries({ "--bm-w": width + "px", "--bm-ink": color, "--bm-accent": accentColor, "--bm-line": lineColor, "--bm-font": fontSize + "px", "--bm-row": rowHeight + "px",
    "--bm-indent": indent + "px", "--bm-line-w": lineWidth, "--bm-draw": drawDuration + "ms", "--bm-fold": foldDuration + "ms" }).forEach(([k, v]) => nav.style.setProperty(k, v));
  const r = Math.min(radius, rowHeight / 2 - 2), endX = indent - 8;
  const rowY = k => PAD + k * rowHeight + rowHeight / 2;
  const branch = k => `M ${trunk} ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const reach = k => `M ${trunk} 0 V ${rowY(k) - r} A ${r} ${r} 0 0 0 ${trunk + r} ${rowY(k)} H ${endX}`;
  const length = k => rowY(k) - r + (Math.PI * r) / 2 + (endX - trunk - r);
  const icon = name => name && ICONS[name] ? `<span class="branched-menu__icon" aria-hidden="true">${ICONS[name]}</span>` : "";
  nav.innerHTML = `<span class="branched-menu__marker" aria-hidden="true"></span>` + items.map((it, i) => {
    const kids = it.children;
    if (!kids) return `<div class="branched-menu__section"><button type="button" class="branched-menu__head" data-leaf="${it.value ?? it.label}">${icon(it.icon)}${it.label}</button></div>`;
    const h = PAD * 2 + kids.length * rowHeight;
    return `<div class="branched-menu__section" data-i="${i}"><button type="button" class="branched-menu__head" data-sec="${i}">${it.label}</button>
      <div class="branched-menu__body"><div class="branched-menu__fold"><div class="branched-menu__tree" style="height:${h}px">
        <svg class="branched-menu__lines" width="${indent}" height="${h}" aria-hidden="true"><path class="branched-menu__base" d="M ${trunk} 0 V ${rowY(kids.length - 1) - r}"/>${kids.map((k, j) => `<path class="branched-menu__base" d="${branch(j)}"/>`).join("")}${kids.map((k, j) => `<path class="branched-menu__reach" data-v="${k.value}" d="${reach(j)}" style="stroke-dasharray:${length(j)};stroke-dashoffset:${length(j)}"/>`).join("")}</svg>
        ${kids.map(k => `<button type="button" class="branched-menu__item" data-v="${k.value}" data-sec-of="${i}">${icon(k.icon)}<span class="branched-menu__label">${k.label}</span></button>`).join("")}
      </div></div></div></div>`;
  }).join("");
  const marker = nav.querySelector(".branched-menu__marker"), heads = [...nav.children].filter(e => e.classList.contains("branched-menu__section")).map(s => s.querySelector(".branched-menu__head"));
  const flat = items.flatMap(it => it.children ? it.children : [{ ...it, value: it.value ?? it.label }]);
  function render(glide = true) {
    nav.querySelectorAll(".branched-menu__section").forEach((sec, i) => {
      const isOpen = open.has(i) && !!items[i].children; sec.toggleAttribute("data-open", isOpen);
      const head = sec.querySelector(".branched-menu__head"); if (items[i].children) head.setAttribute("aria-expanded", isOpen);
      const leaf = !items[i].children && (items[i].value ?? items[i].label) === active; head.toggleAttribute("data-active", leaf); leaf ? head.setAttribute("aria-current", "true") : head.removeAttribute("aria-current");
      sec.querySelectorAll(".branched-menu__item").forEach(b => { const on = b.dataset.v === active; b.toggleAttribute("data-active", on); on ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current"); b.tabIndex = isOpen ? 0 : -1; });
      sec.querySelectorAll(".branched-menu__reach").forEach(p => { p.style.strokeDashoffset = p.dataset.v === active ? 0 : p.style.strokeDasharray; });
    });
    const as = items.findIndex(it => it.children?.some(k => k.value === active)), el = heads[as], on = as >= 0 && open.has(as) && el;
    if (!glide) marker.style.transition = "none";
    if (on) marker.style.top = `${el.offsetTop + (el.offsetHeight - MARK) / 2}px`;
    marker.toggleAttribute("data-on", !!on);
    if (!glide) { void marker.offsetHeight; marker.style.transition = ""; }
  }
  nav.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.sec != null) { const i = +b.dataset.sec; const o = !open.has(i); o ? open.add(i) : open.delete(i); onToggle?.(i, o); render(); setTimeout(() => render(false), foldDuration + 20); return; }
    const v = b.dataset.v ?? b.dataset.leaf; if (v == null) return; active = v; render(); onSelect?.(v, flat.find(f => f.value === v));
  });
  new ResizeObserver(() => render(false)).observe(nav);
  render(false);
  return { reset() { active = ""; render(false); } };
}

// The services tree inside the main menu.
const SVC_TREE = [
  { label: "Barcos", svc: "yates", children: [
    { value: "barcos-sin-licencia", label: "Sin licencia", icon: "badge" }, { value: "barcos-con-patron", label: "Con patrón", icon: "helm" },
    { value: "barcos-lancha", label: "Lancha", icon: "boat" }, { value: "barcos-yate", label: "Yate", icon: "ship" } ] },
  { label: "Motos de agua", svc: "motos", children: [
    { value: "motos-sin-licencia", label: "Sin licencia", icon: "badge" }, { value: "motos-seadoo", label: "Sea-Doo", icon: "jet" }, { value: "motos-yamaha", label: "Yamaha", icon: "jet" } ] },
  { label: "Villas", svc: "villas", children: [
    { value: "villa-aura", label: "Villa Aura", icon: "villa" }, { value: "villa-moli", label: "Villa Molí", icon: "villa2" } ] },
  { label: "Coches y motos", svc: "coches", children: [
    { value: "coches-150", label: "Hasta 150 €/día", icon: "car" }, { value: "coches-300", label: "150 – 300 €/día", icon: "car2" },
    { value: "coches-600", label: "300 – 600 €/día", icon: "car3" }, { value: "coches-lujo", label: "Más de 600 €/día", icon: "crown" },
    { value: "motos-scooter", label: "Motos y scooters", icon: "moto" } ] },
  { label: "Transfers", svc: "transfers", children: [
    { value: "transfer-2-4", label: "2 – 4 personas", icon: "users" }, { value: "transfer-6-7", label: "6 – 7 personas", icon: "van" },
    { value: "transfer-8-9", label: "8 – 9 personas", icon: "bus" }, { value: "transfer-10-13", label: "10 – 13 personas", icon: "bus2" } ] },
  { label: "Chefs", value: "chefs", svc: "dining", icon: "chef" },
];
const svcMenu = BranchedMenu(document.getElementById("bm"), {
  items: SVC_TREE, defaultOpen: 0, defaultActive: "__none__",
  color: "#0d0a38", accentColor: "#ab50db", lineColor: "#c9cce8", width: 340, rowHeight: 38, fontSize: 15, indent: 42,
  onSelect: (value, item) => {
    const sec = SVC_TREE.find(s => s.value === value || s.children?.some(k => k.value === value));
    select(sec.svc, true);
    document.getElementById("f-notes").value = item && sec.children ? `Me interesa: ${sec.label} · ${item.label}.` : `Me interesa: ${sec.label}.`;
    setTimeout(() => { SM.set(false); setTimeout(() => document.getElementById("contacto").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" }), 250); }, 380);
  },
});
{
  const t = document.getElementById("svcToggle"), tree = document.getElementById("svcTree");
  t.addEventListener("click", () => { const o = t.getAttribute("aria-expanded") !== "true"; t.setAttribute("aria-expanded", o); tree.toggleAttribute("data-closed", !o); });
}

// glass highlight follows the pointer on primary buttons
addEventListener("pointermove", e => { const el = e.target.closest?.(".btn--primary"); if (!el) return; const r = el.getBoundingClientRect(); el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); }, { passive: true });
// smooth in-page anchors
document.querySelectorAll('a[href^="#"]').forEach(a => { if (a.closest("#sm")) return; a.addEventListener("click", e => { const t = a.getAttribute("href").length > 1 && document.querySelector(a.getAttribute("href")); if (!t) return; e.preventDefault(); t.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" }); }); });

/* =====================================================================
   CONTACT
   ===================================================================== */
const CONFIG = { whatsapp: "", email: "meysociety@protonmail.com" }; // whatsapp: international digits, no "+"
const CHOICES = { villas: "Villas", yates: "Yates y barcos", motos: "Motos de agua", coches: "Coches", transfers: "Transfers", dining: "Restaurantes y chef", beach: "Beach clubs", noche: "Clubs y VIP" };
const chips = document.getElementById("chips"), chosen = new Set();
for (const [id, n] of Object.entries(CHOICES)) chips.insertAdjacentHTML("beforeend", `<button type="button" class="chip" data-c="${id}" aria-pressed="false">${n}</button>`);
function select(id, on) { if (!CHOICES[id]) return; on ? chosen.add(id) : chosen.delete(id); chips.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", chosen.has(c.dataset.c))); }
chips.addEventListener("click", e => { const c = e.target.closest(".chip"); if (c) select(c.dataset.c, !chosen.has(c.dataset.c)); });
document.querySelectorAll("[data-pack]").forEach(b => b.addEventListener("click", () => {
  const map = { "Arrival": ["transfers", "villas", "dining"], "Sea & Sun": ["yates", "motos", "beach", "dining"], "Night Edition": ["noche", "transfers"] };
  (map[b.dataset.pack] || []).forEach(id => select(id, true));
  document.getElementById("f-notes").value = `Me interesa el plan ${b.dataset.pack}.`;
  const t = document.getElementById("contacto"); t.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
}));
document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim(); const status = document.getElementById("formStatus");
  if (!v("f-name")) { status.textContent = "Escribe tu nombre para que sepamos a quién responder."; document.getElementById("f-name").focus(); return; }
  const lines = [`Hola Mey Society, soy ${v("f-name")}.`, chosen.size ? "Me interesa: " + [...chosen].map(c => CHOICES[c]).join(", ") + "." : "", v("f-from") ? `Fechas: ${v("f-from")} a ${v("f-to") || "por definir"}.` : "", `Personas: ${v("f-people") || "por definir"}.`, v("f-notes")].filter(Boolean).join("\n");
  const url = CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines)}` : `mailto:${CONFIG.email}?subject=${encodeURIComponent("Mi estancia en Ibiza")}&body=${encodeURIComponent(lines)}`;
  window.open(url, "_blank", "noopener");
  status.textContent = CONFIG.whatsapp ? "Abriendo WhatsApp con tu mensaje." : "Abriendo tu correo con el mensaje preparado. Si no se abre, escríbenos a meysociety@protonmail.com.";
});

/* =====================================================================
   CLIENT AREA (demo data, clearly labelled)
   ===================================================================== */
const ICON = {
  car: '<path d="M3 13l2-5h14l2 5v5h-3v-2H6v2H3z M6 13h12" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  home: '<path d="M4 11l8-6 8 6v8H4z M10 19v-5h4v5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  boat: '<path d="M3 15h18l-3 4H6z M12 4v10 M12 5l6 8H12" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  dish: '<path d="M4 15a8 8 0 0116 0z M2 17h20 M12 5v2" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  wave: '<path d="M2 14c3-3 5 3 8 0s5 3 8 0 3 0 4 0 M2 18c3-3 5 3 8 0s5 3 8 0" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  sun: '<circle cx="12" cy="13" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 4v3M4 13h3M17 13h3M6 7l2 2M18 7l-2 2" stroke="currentColor" stroke-width="1.6"/>',
  star: '<path d="M12 3l2.6 5.6 6 .6-4.5 4 1.3 6L12 16l-5.4 3.2 1.3-6-4.5-4 6-.6z" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  check: '<path d="M5 12l4 4 10-10" fill="none" stroke="currentColor" stroke-width="2.2"/>',
};
const PLAN = [
  { t: "Llegada", ev: [["14:30", "Transfer privado", "Aeropuerto a tu villa", "airport", "car"], ["16:00", "Check-in en la villa", "Es Cubells", "cubells", "home"], ["21:00", "Cena del chef privado", "En la villa", "cubells", "dish"]] },
  { t: "Mar", ev: [["10:30", "Salida en barco", "Marina Botafoch", "botafoch", "boat"], ["13:30", "Comida a bordo", "Formentera", "savina", "dish"], ["19:30", "Regreso a puerto", "Marina Botafoch", "botafoch", "boat"]] },
  { t: "Costa oeste", ev: [["11:00", "Ruta en moto de agua", "Cala Bassa", "bassa", "wave"], ["15:00", "Beach club", "Ses Salines", "salines", "sun"], ["20:00", "Atardecer", "Sant Antoni", "santantoni", "sun"]] },
  { t: "Interior", ev: [["10:00", "Coche descapotable", "Entregado en la villa", "cubells", "car"], ["12:30", "Mirador de Es Vedrà", "Cala d'Hort", "hort", "sun"], ["21:00", "Cena al atardecer", "Dalt Vila", "eivissa", "dish"]] },
  { t: "Noche", ev: [["17:00", "Beach club", "Platja d'en Bossa", "bossa", "sun"], ["23:30", "Mesa VIP", "Platja d'en Bossa", "bossa", "star"], ["04:00", "Chófer de vuelta", "A tu villa", "cubells", "car"]] },
  { t: "Salida", ev: [["11:00", "Check-out", "Es Cubells", "cubells", "home"], ["13:00", "Transfer al aeropuerto", "Aeropuerto", "airport", "car"]] },
];
const TODAY = 2; // demo: the guest is on day 3
const modal = document.getElementById("login"), dash = document.getElementById("dash");
function closeModal() { modal.hidden = true; }
function openLogin() { modal.hidden = false; document.getElementById("l-email").focus(); }
modal.addEventListener("click", e => { if (e.target === modal || e.target.closest("[data-close]")) closeModal(); });
document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault(); const em = document.getElementById("l-email").value.trim();
  closeModal(); openDash(em.split("@")[0] || "invitado");
});
document.getElementById("logout").addEventListener("click", () => { dash.hidden = true; document.body.style.overflow = ""; });
function status(d, i) {
  if (d < TODAY) return "done"; if (d > TODAY) return "next";
  const h = new Date().getHours() + new Date().getMinutes() / 60; const [eh, em] = PLAN[d].ev[i][0].split(":").map(Number); const t = eh + em / 60;
  const nxt = PLAN[d].ev.findIndex(x => { const [a, b] = x[0].split(":").map(Number); return a + b / 60 > h; });
  return t <= h ? (i === nxt - 1 || (nxt === -1 && i === PLAN[d].ev.length - 1) ? "now" : "done") : "next";
}
function openDash(name) {
  dash.hidden = false; document.body.style.overflow = "hidden";
  document.getElementById("dashHello").textContent = `Hola, ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  const start = new Date(); start.setDate(start.getDate() - TODAY);
  const days = document.getElementById("days"); days.innerHTML = "";
  let total = 0, done = 0;
  PLAN.forEach((d, i) => {
    const date = new Date(start); date.setDate(start.getDate() + i);
    const st = d.ev.map((_, j) => status(i, j)); const f = st.filter(s => s === "done").length / st.length;
    total += st.length; done += st.filter(s => s === "done").length;
    days.insertAdjacentHTML("beforeend", `<button class="day${i === TODAY ? " is-today" : ""}" data-d="${i}" aria-current="${i === TODAY}"><small>${date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}</small><b>${d.t}</b><span class="bar"><i style="width:${(f * 100).toFixed(0)}%"></i></span></button>`);
  });
  const pct = Math.round(done / total * 100);
  document.getElementById("ringPct").textContent = pct + "%";
  requestAnimationFrame(() => { document.getElementById("ring").style.strokeDashoffset = (327 * (1 - pct / 100)).toFixed(1); });
  showDay(TODAY);
  days.onclick = e => { const b = e.target.closest(".day"); if (!b) return; days.querySelectorAll(".day").forEach(x => x.setAttribute("aria-current", x === b)); showDay(+b.dataset.d); };
}
function showDay(d) {
  const ol = document.getElementById("events"); ol.innerHTML = "";
  const map = document.getElementById("dashMap"); map.setAttribute("viewBox", `0 0 ${MAP.w} ${MAP.h}`); map.innerHTML = `<path class="land" d="${MAP.coast.join("")}"/>`;
  const pts = [];
  PLAN[d].ev.forEach(([time, title, where, place, icon], j) => {
    const s = status(d, j);
    ol.insertAdjacentHTML("beforeend", `<li class="ev ev--${s}" style="--i:${j}"><span class="ev__dot"><svg viewBox="0 0 24 24" aria-hidden="true">${s === "done" ? ICON.check : ICON[icon]}</svg></span><div class="ev__card"><div class="ev__meta"><span>${time}</span><span>${PLACES[place].name}</span><span class="ev__state">${s === "done" ? "Completado" : s === "now" ? "En curso" : "Confirmado"}</span></div><h4>${title}</h4><p>${where}</p></div></li>`);
    pts.push([...toSVG(PLACES[place].ll), s, PLACES[place].name]);
  });
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("class", "route"); path.setAttribute("d", "M" + pts.map(p => p[0].toFixed(2) + "," + p[1].toFixed(2)).join("L")); map.append(path);
  pts.forEach(([x, y, s, n], i) => map.insertAdjacentHTML("beforeend", `<circle class="mk mk--${s}" cx="${x}" cy="${y}" r="9"/><text x="${x + 14}" y="${y + 5 + (i % 2) * 16}">${n}</text>`));
  if (!REDUCED) gsap.fromTo(path, { strokeDashoffset: 60 }, { strokeDashoffset: 0, duration: 2, ease: "power2.out" });
}

