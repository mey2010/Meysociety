/* Mey Society · Ibiza — illustrated island map, StaggeredMenu, services, client area. */
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
    const light = !!el && (el.classList.contains("sec--light") || el.classList.contains("sec--mist"));
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
   SERVICES STAGE — map and cards follow the pointer at different depths
   ===================================================================== */
const SERVICES = [
  { id: "motos", name: "Motos de agua", line: "Rutas guiadas autorizadas", place: "bassa", photo: "cala-bassa", col: 0, row: 0 },
  { id: "coches", name: "Coches", line: "Entregados en tu villa", place: "hort", photo: "cala-d-hort", col: 0, row: 1 },
  { id: "transfers", name: "Transfers", line: "Chófer privado con licencia", place: "airport", photo: "aeropuerto", col: 0, row: 2 },
  { id: "villas", name: "Villas", line: "Con licencia y vistas al mar", place: "cubells", photo: "cala-jondal", col: 0, row: 3 },
  { id: "yates", name: "Yates", line: "Con patrón y tripulación", place: "botafoch", photo: "marina-botafoch", col: 1, row: 0 },
  { id: "dining", name: "Fine dining", line: "Mesas y chef privado", place: "eivissa", photo: "dalt-vila", col: 1, row: 1 },
  { id: "noche", name: "Clubs y VIP", line: "Mesas, entradas y listas", place: "bossa", photo: "hi-ibiza", col: 1, row: 2 },
  { id: "beach", name: "Beach clubs", line: "Hamacas y camas reservadas", place: "salines", photo: "sa-trinxa", col: 1, row: 3 },
];
{
  const stage = document.getElementById("stage"), stageMap = document.getElementById("stageMap"), cards = document.getElementById("stageCards");
  stageMap.setAttribute("viewBox", `0 0 ${MAP.w} ${MAP.h}`); stageMap.innerHTML = `<path d="${MAP.coast.join("")}"/>`;
  const box = document.createElement("div"); box.className = "stage__box"; cards.append(box);
  const lines = document.createElementNS(NS, "svg"); lines.setAttribute("viewBox", "0 0 100 100"); lines.setAttribute("preserveAspectRatio", "none"); lines.setAttribute("class", "stage__lines"); box.append(lines);
  const COLX = [-24, 124], ROWY = [11, 37, 63, 89];
  for (const s of SERVICES) {
    const [mx, my] = toSVG(PLACES[s.place].ll), x = mx / MAP.w * 100, y = my / MAP.h * 100, cx = COLX[s.col], cy = ROWY[s.row];
    const a = document.createElement("a"); a.className = "svc"; a.href = "#contacto"; a.style.left = cx + "%"; a.style.top = cy + "%";
    a.innerHTML = `<div class="svc__card"><div class="svc__img"><img src="data/photos/${s.photo}.jpg" alt="" loading="lazy"><small>${PLACES[s.place].name}</small></div><h3>${s.name}</h3><p>${s.line}</p></div>`;
    a.addEventListener("click", e => { e.preventDefault(); select(s.id, true); document.getElementById("contacto").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" }); });
    box.append(a);
    const ex = s.col ? cx - 16 : cx + 16;
    lines.insertAdjacentHTML("beforeend", `<path d="M${ex},${cy} C${(ex + x) / 2},${cy} ${(ex + x) / 2},${y} ${x},${y}"/><circle cx="${x}" cy="${y}" r=".7"/>`);
  }
  const layers = [...stage.querySelectorAll(".stage__layer")]; let tx = 0, ty = 0, x = 0, y = 0, live = false;
  stage.addEventListener("pointermove", e => { const r = stage.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; stage.style.setProperty("--gx", (tx + .5) * 100 + "%"); stage.style.setProperty("--gy", (ty + .5) * 100 + "%"); });
  stage.addEventListener("pointerleave", () => { tx = ty = 0; });
  new IntersectionObserver(([e]) => { live = e.isIntersecting; }).observe(stage);
  (function loop() {
    if (live && FINE && !REDUCED) { x += (tx - x) * .09; y += (ty - y) * .09;
      for (const l of layers) { const d = +l.dataset.depth; l.style.transform = `translate3d(${(-x * 90 * d).toFixed(2)}px, ${(-y * 70 * d).toFixed(2)}px, 0) rotateX(${(y * 4 * d).toFixed(2)}deg) rotateY(${(-x * 6 * d).toFixed(2)}deg)`; } }
    requestAnimationFrame(loop);
  })();
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

