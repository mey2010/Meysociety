/* Mey Society · Ibiza — illustrated island map, StaggeredMenu + BranchedMenu, services, client area. */
import { ICONS } from "./icons.js";
import { createCircularCarousel } from "./circular-carousel.js";
import { createDepthRibbon } from "./depth-ribbon.js";
import { initMap3D } from "./map3d.js";
import { LANGS, t, msg, venueInfo, translateTree, setLang, getLang, watchI18n } from "./i18n.js";
import { TEMPLATES, fromTemplate, newCode, loadAll, saveAll, findForClient, timeline } from "./itineraries.js";
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
    textInner.innerHTML = seq.map(l => `<span class="sm-toggle-line">${t(l)}</span>`).join("");
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
    const light = !!el && !el.classList.contains("sec--night") && document.documentElement.dataset.theme !== "dark";
    if (light === onLight) return; onLight = light; root.classList.toggle("sm-on-light", light);
    if (!open) gsap.to(btn, { color: light ? "#0d0a38" : "#ffffff", duration: .3, overwrite: "auto" });
  }
  const band = () => root.classList.toggle("sm-scrolled", scrollY > 40);
  addEventListener("scroll", () => { checkGround(); band(); }, { passive: true }); checkGround(); band();
  document.addEventListener("themechange", () => { onLight = null; checkGround(); });
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
   HERO MAP — cartoon 3D island: orbit, pan, zoom; every place tappable
   ===================================================================== */
let active = null;
const mapEl = document.getElementById("map"), pop = document.getElementById("pop"), pickList = document.getElementById("pickList");
const counts = { club: 0, beachclub: 0, beach: 0 }; VENUES.forEach(v => counts[v.type]++);
document.querySelectorAll("[data-count]").forEach(b => b.textContent = counts[b.dataset.count]);
const wheelHint = () => { mapEl.dataset.wheelHint = t(/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ + rueda para acercar" : "Ctrl + rueda para acercar"); mapEl.dataset.touchHint = t("Usa dos dedos para mover el mapa"); };
wheelHint(); document.addEventListener("langchange", wheelHint);
// The 3D island loads in the background, only once the visitor heads towards it (or the page is idle),
// so the rest of the page is ready at once. Calls made before it exists are queued.
let map3dReal = null; const mapQueue = [];
const map3d = new Proxy({}, { get: (_, k) => (...a) => map3dReal ? map3dReal[k](...a) : (k === "screenOf" ? undefined : void mapQueue.push([k, a])) });
const loader = document.createElement("div"); loader.className = "map3d__loader"; loader.setAttribute("role", "progressbar"); loader.setAttribute("aria-valuemin", "0"); loader.setAttribute("aria-valuemax", "100");
loader.innerHTML = `<div class="coin" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<span class="coin__edge" style="--z:${i}"></span>`).join("")}<img class="coin__face coin__face--front" src="assets/logo.png" alt=""><img class="coin__face coin__face--back" src="assets/logo.png" alt=""></div><div class="map3d__pct"><b>0</b>%</div>`;
mapEl.append(loader);
let mapStarted = false;
function startMap() {
  if (mapStarted) return; mapStarted = true;
  const pct = loader.querySelector("b");
  initMap3D(mapEl, {
    venues: VENUES, mapJson: MAP,
    onPick: (v) => { closeList(); openPop(v); },
    onList: (list, anchor) => openList(list, anchor),
    onEmpty: () => { closePop(); closeList(); },
    onProgress: p => { pct.textContent = p; loader.setAttribute("aria-valuenow", p); },
  }).then(m => {
    map3dReal = m; mapQueue.splice(0).forEach(([k, a]) => m[k](...a));
    pct.textContent = 100; loader.classList.add("is-done"); setTimeout(() => loader.remove(), 700);
  }).catch(err => { console.error(err); loader.classList.add("is-error"); });
}
new IntersectionObserver((es, io) => { if (es.some(e => e.isIntersecting)) { io.disconnect(); startMap(); } }, { rootMargin: "900px 0px" }).observe(mapEl);
(window.requestIdleCallback || (f => setTimeout(f, 2500)))(() => setTimeout(startMap, 1500), { timeout: 4000 });
document.querySelectorAll(".filter").forEach(b => b.addEventListener("click", () => {
  const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); map3d.setFilter(b.dataset.kind, on);
  if (!on && active && active.type === b.dataset.kind) closePop();
}));
mapEl.querySelector(".map__zoom").addEventListener("click", e => { const z = e.target.closest("button")?.dataset.zoom; if (!z) return; z === "reset" ? map3d.reset() : map3d.zoom(z === "in" ? .6 : 1.6); });
const AREAS = { sur: [1.30, 1.45, 38.82, 38.92], bossa: [1.398, 1.432, 38.868, 38.902], eivissa: [1.395, 1.475, 38.87, 38.94], oeste: [1.19, 1.31, 38.86, 38.99], santantoni: [1.27, 1.33, 38.955, 39.0], formentera: [1.36, 1.6, 38.63, 38.78] };
mapEl.querySelector(".map__areas").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return; mapEl.querySelectorAll(".map__areas button").forEach(x => x.classList.toggle("is-on", x === b)); closePop(); closeList(); map3d.flyToArea(AREAS[b.dataset.area]);
});
// list chooser for pins that sit on top of each other
function openList(list, anchor) {
  closePop();
  pickList.innerHTML = `<p>${t("Elige un lugar")}</p>` + list.map((v, i) => `<button type="button" data-i="${i}"><i class="dot dot--${v.type}"></i><span>${v.name}</span><small>${t(KIND[v.type])}</small></button>`).join("");
  pickList.hidden = false; pickList._list = list;
  const r = anchor.getBoundingClientRect(), m = mapEl.getBoundingClientRect();
  pickList.style.left = Math.min(m.width - pickList.offsetWidth - 12, Math.max(12, r.left - m.left - pickList.offsetWidth / 2)) + "px";
  pickList.style.top = Math.min(m.height - pickList.offsetHeight - 12, Math.max(12, r.top - m.top + 30)) + "px";
  pickList.querySelector("button").focus();
}
function closeList() { pickList.hidden = true; }
pickList.addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (!b) return; const v = pickList._list[+b.dataset.i]; closeList(); openPop(v); });

// popup
const popImg = document.getElementById("popImg");
function openPop(v) {
  active = v; map3d.setActive(v);
  document.getElementById("popKind").innerHTML = `<i class="dot dot--${v.type}"></i>${t(KIND[v.type])} · ${v.area}`;
  document.getElementById("popTitle").textContent = v.name;
  document.getElementById("popInfo").textContent = venueInfo(v);
  document.getElementById("popCoord").textContent = `${v.lat.toFixed(4)}° N · ${v.lon.toFixed(4)}° E`;
  popImg.src = v.photo; popImg.alt = `Vista aérea de ${v.name}`;
  document.getElementById("popBook").textContent = t(v.type === "beach" ? "Organizar un día aquí" : "Reservar con Mey Society");
  pop.hidden = false; placePop();
  if (!REDUCED) gsap.fromTo(pop, { opacity: 0, scale: .92, y: 8 }, { opacity: 1, scale: 1, y: 0, duration: .45, ease: "back.out(1.6)" });
}
function placePop() {
  if (!active || pop.hidden || matchMedia("(max-width: 900px)").matches) return;
  const s = map3d.screenOf(active); if (!s) return;
  const w = pop.offsetWidth, h = pop.offsetHeight, W = mapEl.clientWidth, H = mapEl.clientHeight;
  let left = s.x + 26, top = s.y - h / 2; if (left + w > W - 12) left = s.x - w - 26;
  pop.style.left = clamp(left, 12, W - w - 12) + "px"; pop.style.top = clamp(top, 12, H - h - 12) + "px";
}
(function follow() { placePop(); requestAnimationFrame(follow); })(); // the card follows its pin while the map turns
function closePop() { if (!active) return; active = null; map3d.setActive(null); pop.hidden = true; }
pop.querySelector(".pop__x").addEventListener("click", closePop);
addEventListener("keydown", e => { if (e.key === "Escape") { closePop(); closeList(); } });
document.getElementById("popBook").addEventListener("click", () => {
  if (!active) return; const v = active; select(v.type === "club" ? "noche" : "beach", true);
  document.getElementById("f-notes").value = `${t("Me interesa")}: ${v.name} (${v.area}).`; closePop();
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
          const pick = Math.random() < .35 ? 2 : 1;
          for (let k = 0; k < pick; k++) {
            const c = chars[Math.floor(Math.random() * chars.length)], d = k * 60;
            setTimeout(() => { c.classList.remove("on"); c.classList.add("dim"); }, d);
            setTimeout(() => { c.classList.add("on"); c.classList.remove("dim"); }, d + 60);
            setTimeout(() => { c.classList.remove("on"); }, d + 120);
            setTimeout(() => { c.classList.add("on"); c.classList.remove("dim"); }, d + 190);
            if (Math.random() < .3) { setTimeout(() => { c.classList.remove("on"); c.classList.add("dim"); }, d + 260); setTimeout(() => { c.classList.add("on"); c.classList.remove("dim"); }, d + 330); }
          }
        }
        idle();
      }, 650 + Math.random() * 1300);
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
  const SPR_LIGHT = ["#0d0a38", "#292467", "#1e24bb", "#515c9f", "#78c7e4", "#ab50db"].map(sprite), SPR_DARK = ["#c9cce8", "#9fa6ff", "#5a63ff", "#8f96d6", "#78c7e4", "#ab50db"].map(sprite);
  let SPR = document.documentElement.dataset.theme === "dark" ? SPR_DARK : SPR_LIGHT;
  document.addEventListener("themechange", e => { SPR = e.detail === "dark" ? SPR_DARK : SPR_LIGHT; if (REDUCED) draw(performance.now()); });
  const MAG = ["#6a2f85", "#9242b3", "#ab50db", "#c856e6", "#c856e6"].map(sprite); // the logo's magenta/pink, light to bright
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
    const fadeOut = 1 - clamp(scrollY / Math.max(1, innerHeight * .8)) * .7; // quieter behind the content below the intro
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
        const k = clamp((z + .7) / 1.4), hsh = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
        const spr = hsh < .55 ? MAG[Math.min(4, Math.floor(k * 5))] : SPR[Math.min(5, Math.floor(k * 6))];
        cx.globalAlpha = Math.min(1, (.1 + depth * .45) * fadeOut + boost * .5);
        cx.drawImage(spr, px - s, py - s, s * 2, s * 2);
      }
    }
    cx.globalAlpha = 1;
  }
  if (REDUCED) { draw(performance.now()); addEventListener("scroll", () => requestAnimationFrame(() => draw(performance.now())), { passive: true }); }
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
  { label: "Clubs", svc: "noche", children: [
    { value: "clubs-vip", label: "Mesas VIP", icon: "star" }, { value: "clubs-guestlist", label: "Guestlist", icon: "users" } ] },
  { label: "Chefs", value: "chefs", svc: "dining", icon: "chef" },
];
const svcMenu = BranchedMenu(document.getElementById("bm"), {
  items: SVC_TREE, defaultOpen: -1, defaultActive: "__none__",
  color: "#0d0a38", accentColor: "#ab50db", lineColor: "#c9cce8", width: 340, rowHeight: 38, fontSize: 15, indent: 42,
  onToggle: (i) => { if (i === 0) { SM.set(false); setTimeout(() => openFleet("all"), 260); } }, // Barcos → the fleet ribbon
  onSelect: (value, item) => {
    if (value.startsWith("barcos-")) { SM.set(false); setTimeout(() => openFleet(value.slice(7)), 260); return; }
    const sec = SVC_TREE.find(s => s.value === value || s.children?.some(k => k.value === value));
    select(sec.svc, true);
    if (value === "motos-scooter") select("moto", true);
    document.getElementById("f-notes").value = item && sec.children ? `${t("Me interesa")}: ${t(sec.label)} · ${t(item.label)}.` : `${t("Me interesa")}: ${t(sec.label)}.`;
    setTimeout(() => { SM.set(false); setTimeout(() => document.getElementById("contacto").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" }), 250); }, 380);
  },
});
{
  const t = document.getElementById("svcToggle"), tree = document.getElementById("svcTree");
  t.addEventListener("click", () => { const o = t.getAttribute("aria-expanded") !== "true"; t.setAttribute("aria-expanded", o); tree.toggleAttribute("data-closed", !o); });
}

/* =====================================================================
   LANGUAGE — a floating switcher beside the menu, names only, no flags
   ===================================================================== */
{
  const box = document.getElementById("lang"), btn = document.getElementById("langBtn"), list = document.getElementById("langList"), cur = document.getElementById("langCur");
  const opts = [...list.querySelectorAll("[data-lang]")];
  function show(o) {
    btn.setAttribute("aria-expanded", o); list.hidden = !o;
    if (o) { opts.forEach(x => x.tabIndex = -1); const a = opts.find(x => x.dataset.lang === getLang()); a.tabIndex = 0; a.focus();
      if (!REDUCED) gsap.fromTo(list, { opacity: 0, y: -6, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .28, ease: "power3.out" }); }
  }
  function choose(l) {
    setLang(l); cur.textContent = LANGS[l]; btn.setAttribute("aria-label", LANGS[l]);
    opts.forEach(x => x.setAttribute("aria-selected", x.dataset.lang === l)); show(false); btn.focus();
  }
  btn.addEventListener("click", () => show(list.hidden));
  list.addEventListener("click", e => { const o = e.target.closest("[data-lang]"); if (o) choose(o.dataset.lang); });
  list.addEventListener("keydown", e => {
    const i = opts.indexOf(document.activeElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const n = opts[(i + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length]; n.focus(); }
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (i >= 0) choose(opts[i].dataset.lang); }
    if (e.key === "Escape") { show(false); btn.focus(); }
  });
  opts.forEach(o => o.tabIndex = -1);
  document.addEventListener("mousedown", e => { if (!box.contains(e.target)) show(false); });
  cur.textContent = LANGS[getLang()]; opts.forEach(x => x.setAttribute("aria-selected", x.dataset.lang === getLang()));
  // translate once everything on the page has been built
  if (getLang() !== "es") { document.documentElement.lang = getLang(); setTimeout(() => translateTree(document.body), 0); }
  setTimeout(watchI18n, 0);
}

// glass highlight follows the pointer on primary buttons
addEventListener("pointermove", e => { const el = e.target.closest?.(".btn--primary"); if (!el) return; const r = el.getBoundingClientRect(); el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%"); }, { passive: true });
// smooth in-page anchors
document.querySelectorAll('a[href^="#"]').forEach(a => { if (a.closest("#sm")) return; a.addEventListener("click", e => { const t = a.getAttribute("href").length > 1 && document.querySelector(a.getAttribute("href")); if (!t) return; e.preventDefault(); t.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" }); }); });

/* =====================================================================
   CONTACT
   ===================================================================== */
const CONFIG = { whatsapp: "", email: "meysociety@protonmail.com" }; // whatsapp: international digits, no "+"
const CHOICES = { yates: "Barco", motos: "Moto de agua", coches: "Coche", moto: "Moto", villas: "Villa", noche: "Clubs", transfers: "Transfer", dining: "Chef privado", beach: "Beach clubs" };
const chips = document.getElementById("chips"), chosen = new Set();
for (const [id, n] of Object.entries(CHOICES)) chips.insertAdjacentHTML("beforeend", `<button type="button" class="chip" data-c="${id}" aria-pressed="false">${n}</button>`);
function select(id, on) { if (!CHOICES[id]) return; on ? chosen.add(id) : chosen.delete(id); chips.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", chosen.has(c.dataset.c))); }
// single-choice questions (first time on the island, accommodation booked)
const single = {};
document.querySelectorAll("[data-single]").forEach(g => g.addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return; const k = g.dataset.single, on = single[k] !== b.dataset.v;
  single[k] = on ? b.dataset.v : undefined; g.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-checked", on && c === b));
}));
// clubs: every club on the map, plus "all of them"
const CLUBS = VENUES.filter(v => v.type === "club").map(v => v.name), clubsChosen = new Set();
const clubChips = document.getElementById("clubChips");
clubChips.innerHTML = `<button type="button" class="chip chip--all" data-club="*" aria-pressed="false">Todos</button>` + CLUBS.map(n => `<button type="button" class="chip" data-club="${n}" aria-pressed="false">${n}</button>`).join("");
const paintClubs = () => { clubChips.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", c.dataset.club === "*" ? clubsChosen.size === CLUBS.length : clubsChosen.has(c.dataset.club))); };
clubChips.addEventListener("click", e => {
  const b = e.target.closest(".chip"); if (!b) return; const n = b.dataset.club;
  if (n === "*") { const all = clubsChosen.size === CLUBS.length; clubsChosen.clear(); if (!all) CLUBS.forEach(c => clubsChosen.add(c)); }
  else clubsChosen.has(n) ? clubsChosen.delete(n) : clubsChosen.add(n);
  if (clubsChosen.size) select("noche", true);
  paintClubs();
});
chips.addEventListener("click", e => { const c = e.target.closest(".chip"); if (c) select(c.dataset.c, !chosen.has(c.dataset.c)); });
document.querySelectorAll("[data-pack]").forEach(b => b.addEventListener("click", () => {
  const map = { "Arrival": ["transfers", "villas", "dining"], "Sea & Sun": ["yates", "motos", "beach", "dining"], "Night Edition": ["noche", "transfers"] };
  (map[b.dataset.pack] || []).forEach(id => select(id, true));
  document.getElementById("f-notes").value = `${t("Me interesa")}: ${t("plan")} ${b.dataset.pack}.`;
  const t = document.getElementById("contacto"); t.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
}));
document.getElementById("form").addEventListener("submit", e => {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim(); const status = document.getElementById("formStatus");
  if (!v("f-name")) { status.textContent = msg("name", "Escribe tu nombre para que sepamos a quién responder."); document.getElementById("f-name").focus(); return; }
  // the summary always reaches us in Spanish, whatever language the visitor reads the page in
  const fmt = d => d ? d.split("-").reverse().join("/") : "";
  const lines = [
    "*Solicitud de presupuesto · Mey Society*",
    `Nombre: ${v("f-name")}`,
    `Personas: ${v("f-people") || "por definir"}`,
    `Fechas: ${v("f-from") ? `${fmt(v("f-from"))} – ${fmt(v("f-to")) || "por definir"}` : "por definir"}`,
    `¿Primera vez en la isla?: ${single.first || "sin indicar"}`,
    `¿Alojamiento reservado?: ${single.stay || "sin indicar"}`,
    `Me interesa: ${chosen.size ? [...chosen].map(c => CHOICES[c]).join(", ") : "sin indicar"}`,
    `Clubs: ${clubsChosen.size ? (clubsChosen.size === CLUBS.length ? "Todos" : [...clubsChosen].join(", ")) : "sin indicar"}`,
    v("f-notes") ? `Notas: ${v("f-notes")}` : "",
    `Idioma del cliente: ${LANGS[getLang()]}`,
  ].filter(Boolean).join("\n");
  const url = CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(lines)}` : `mailto:${CONFIG.email}?subject=${encodeURIComponent("Mi estancia en Ibiza")}&body=${encodeURIComponent(lines)}`;
  window.open(url, "_blank", "noopener");
  status.textContent = CONFIG.whatsapp ? msg("booked", "Abriendo WhatsApp con tu mensaje.") : msg("mailed", "Abriendo tu correo con el mensaje preparado. Si no se abre, escríbenos a meysociety@protonmail.com.");
});

/* =====================================================================
   CLIENT AREA + ADMIN
   ===================================================================== */
const packName = k => k === "Arrival" ? t("Llegada") : k; // package names are brand names, except this one
const STEP_ICON = { car: "car", home: "home", boat: "boat", dish: "chef", wave: "jet", sun: "sun", star: "star" };
const modal = document.getElementById("login"), dash = document.getElementById("dash"), admin = document.getElementById("admin");
const fmtDate = (d, o) => d.toLocaleDateString(getLang() === "es" ? "es-ES" : getLang(), o);
let viewing = null, viewingDay = 0, fromAdmin = false;

// ---- login: client (email + booking code) or admin (user + password) ----
function closeModal() { modal.hidden = true; }
function openLogin() { modal.hidden = false; setTab("client"); document.getElementById("l-email").focus(); }
modal.addEventListener("click", e => { if (e.target === modal || e.target.closest("[data-close]")) closeModal(); });
function setTab(t) {
  const c = t === "client";
  document.getElementById("tabClient").setAttribute("aria-selected", c); document.getElementById("tabAdmin").setAttribute("aria-selected", !c);
  document.getElementById("loginForm").hidden = !c; document.getElementById("adminForm").hidden = c;
}
document.getElementById("tabClient").addEventListener("click", () => setTab("client"));
document.getElementById("tabAdmin").addEventListener("click", () => { setTab("admin"); document.getElementById("a-user").focus(); });
document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const rec = findForClient(document.getElementById("l-email").value, document.getElementById("l-code").value);
  const st = document.getElementById("loginStatus");
  if (!rec) { st.textContent = t("No encontramos ese itinerario. Revisa el email y el código de reserva."); return; }
  st.textContent = ""; closeModal(); fromAdmin = false; openDash(rec);
});
// Admin credentials. Only a SHA-256 hash is stored here; change the password before going live.
const ADMIN = { user: "admin", hash: "d9011c261d3d9fc3833cb64f4ff3178b1995bf6b3fc6bf04c59e3bf95a50f3c4" };
const sha256 = async txt => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)))].map(b => b.toString(16).padStart(2, "0")).join("");
document.getElementById("adminForm").addEventListener("submit", async e => {
  e.preventDefault(); const st = document.getElementById("adminStatus");
  const ok = document.getElementById("a-user").value.trim() === ADMIN.user && await sha256(document.getElementById("a-pass").value) === ADMIN.hash;
  if (!ok) { st.textContent = "Usuario o contraseña incorrectos."; return; }
  st.textContent = ""; document.getElementById("a-pass").value = ""; try { sessionStorage.setItem("mey-admin", "1"); } catch {}
  closeModal(); openAdmin();
});

// ---- client dashboard ----
let openDash = function (rec) {
  viewing = rec; dash.hidden = false; admin.hidden = true; document.body.style.overflow = "hidden";
  document.getElementById("dashBack").hidden = !fromAdmin;
  const name = rec.demo ? (document.getElementById("l-email").value.split("@")[0] || t(rec.name)) : rec.name.split(" ")[0];
  document.getElementById("dashHello").textContent = `${msg("hello", "Hola")}, ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  document.getElementById("dashPack").textContent = `${packName(rec.pack)} · ${rec.guests} ${t("personas")}`;
  const s = new Date(rec.start + "T12:00:00"), e = new Date(s); e.setDate(s.getDate() + rec.days.length - 1);
  document.getElementById("dashDates").textContent = `${fmtDate(s, { day: "numeric", month: "long" })} – ${fmtDate(e, { day: "numeric", month: "long", year: "numeric" })}`;
  renderDash(true);
}
function renderDash(first) {
  renderBell();
  const rec = viewing, tl = timeline(rec);
  if (first) viewingDay = tl.state === "upcoming" ? 0 : tl.state === "finished" ? rec.days.length - 1 : tl.today;
  document.getElementById("ringPct").textContent = tl.pct + "%";
  requestAnimationFrame(() => { document.getElementById("ring").style.strokeDashoffset = (327 * (1 - tl.pct / 100)).toFixed(1); });
  const days = document.getElementById("days"); days.innerHTML = "";
  rec.days.forEach((d, i) => {
    const date = new Date(rec.start + "T12:00:00"); date.setDate(date.getDate() + i);
    const evs = tl.flat.filter(x => x.d === i), f = evs.filter(x => x.status === "done").length / Math.max(1, evs.length);
    days.insertAdjacentHTML("beforeend", `<button class="day${i === tl.today && tl.state === "active" ? " is-today" : ""}" data-d="${i}" aria-current="${i === viewingDay}"><small>${fmtDate(date, { weekday: "short", day: "numeric", month: "short" })}</small><b>${t(d.title)}</b><span class="bar"><i style="width:${(f * 100).toFixed(0)}%"></i></span></button>`);
  });
  days.onclick = e => { const b = e.target.closest(".day"); if (!b) return; viewingDay = +b.dataset.d; renderDash(false); };
  renderFlow(tl); renderRoute(tl);
  translateTree(dash);
}
// MagicBento "automation" process: trigger tile + steps that wait, run and complete, on a filling rail
function renderFlow(tl) {
  const rec = viewing, d = viewingDay, evs = tl.flat.filter(x => x.d === d);
  const date = new Date(rec.start + "T12:00:00"); date.setDate(date.getDate() + d);
  const doneN = evs.filter(e => e.status === "done").length + (evs.some(e => e.status === "now") ? .5 : 0);
  const now = evs.find(e => e.status === "now");
  const flow = document.getElementById("flow");
  flow.innerHTML = `<div class="mb-header"><span class="mb-dot"></span><span>${t("Día")} ${d + 1} · ${fmtDate(date, { weekday: "long", day: "numeric", month: "long" })}</span></div>
    <div class="mb-flow" style="--n:${evs.length};--fill:${(evs.length > 1 ? Math.min(1, doneN / (evs.length - 1)) : doneN ? 1 : 0).toFixed(3)}">
      <div class="mb-trigger mb-tile"><span class="mb-glyph">${ICONS[d === 0 ? "plane" : "calendar"]}</span>
        <span class="mb-flow-copy"><span class="mb-flow-name">${t(rec.days[d].title)}</span><span class="mb-flow-meta">${now ? `${t("Ahora")}: ${t(now.title)} · ${t(PLACES[now.place].name)}` : evs.length ? `${evs.filter(e => e.status === "done").length}/${evs.length} ${t("completados")}` : ""}</span></span></div>
      <ol class="mb-steps mb-well"><span class="mb-rail" aria-hidden="true"><span class="mb-rail-fill"></span></span>
        ${evs.map((e, i) => `<li class="mb-step mb-step--${e.status}" style="--i:${i}">
          <span class="mb-status" aria-label="${e.status === "done" ? "Completado" : e.status === "now" ? "En curso" : "Pendiente"}"><span class="mb-pending"></span><span class="mb-spinner"></span><span class="mb-done">${ICONS.tick}</span></span>
          <span class="mb-step-icon" aria-hidden="true">${ICONS[STEP_ICON[e.icon]] || ""}</span>
          <span class="mb-step-copy"><b>${t(e.title)}</b><small>${ICONS.pin}${t(PLACES[e.place].name)}</small></span>
          <span class="mb-step-time">${e.time}</span>${fromAdmin ? `<button class="mb-edit" type="button" data-edit="${e.i}" aria-label="${t("Editar")}">${ICONS.pencil}</button>` : ""}</li>`).join("")}
      </ol>${fromAdmin ? `<button class="mb-add" type="button" data-add>${ICONS.plus}<span>${t("Añadir actividad")}</span></button>` : ""}</div>`;
  flow.closest(".mb-card").classList.remove("is-in"); void flow.offsetWidth; flow.closest(".mb-card").classList.add("is-in");
}
// Route of the whole stay, starting at the airport; travelled legs solid, upcoming legs dashed, current position pulsing
function renderRoute(tl) {
  const map = document.getElementById("dashMap"), pts = [];
  const push = (place, status, d) => { const prev = pts[pts.length - 1]; if (prev && prev.place === place) { prev.status = status === "done" || prev.status === "done" ? (status === "now" ? "now" : prev.status === "now" ? "now" : status) : prev.status; prev.days.add(d); return; } const [x, y] = toSVG(PLACES[place].ll); pts.push({ place, x, y, status, days: new Set([d]) }); };
  push("airport", tl.state === "upcoming" ? "next" : "done", 0);
  tl.flat.forEach(e => push(e.place, e.status, e.d));
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y), pad = 70;
  let x0 = Math.min(...xs) - pad, x1 = Math.max(...xs) + pad, y0 = Math.min(...ys) - pad, y1 = Math.max(...ys) + pad;
  const w = x1 - x0, h = y1 - y0, side = Math.max(w, h * 1.1); x0 -= (side - w) / 2; x1 = x0 + side; const sh = side / 1.1; y0 -= (sh - h) / 2;
  map.setAttribute("viewBox", `${x0.toFixed(0)} ${y0.toFixed(0)} ${side.toFixed(0)} ${sh.toFixed(0)}`);
  const legs = pts.slice(1).map((p, i) => {
    const a = pts[i], mx = (a.x + p.x) / 2, my = (a.y + p.y) / 2, dx = p.x - a.x, dy = p.y - a.y, k = .22;
    const c = `${(mx - dy * k).toFixed(1)},${(my + dx * k).toFixed(1)}`;
    const travelled = p.status === "done" || p.status === "now";
    const today = p.days.has(viewingDay);
    return `<path class="leg ${travelled ? "leg--done" : "leg--next"}${today ? " leg--today" : ""}" d="M${a.x.toFixed(1)},${a.y.toFixed(1)} Q${c} ${p.x.toFixed(1)},${p.y.toFixed(1)}" pathLength="1" style="--i:${i}"/>`;
  }).join("");
  const nowIdx = pts.findIndex(p => p.status === "now"), lastDone = pts.map(p => p.status).lastIndexOf("done");
  const here = nowIdx >= 0 ? nowIdx : lastDone;
  map.innerHTML = `<path class="land" d="${MAP.coast.join("")}"/>${legs}` + pts.map((p, i) => {
    const cls = i === 0 ? "start" : i === here ? "now" : p.status;
    return `<g class="stop stop--${cls}${p.days.has(viewingDay) ? " stop--today" : ""}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})">${i === here ? '<circle class="pulse" r="10"/>' : ""}<circle r="${i === 0 ? 9 : 7}"/>${i === 0 ? `<g class="stop__ico" transform="translate(-6 -6) scale(.5)">${ICONS.plane.replace('width="16" height="16"', 'width="24" height="24"')}</g>` : `<text class="stop__n" y="3.5">${i}</text>`}<text class="stop__label" x="13" y="4">${t(PLACES[p.place].name).split(" · ")[0]}</text></g>`;
  }).join("");
  if (!REDUCED) map.querySelectorAll(".leg").forEach((l, i) => gsap.fromTo(l, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .5, delay: .15 + i * .12, ease: "power2.out", clearProps: "strokeDashoffset" }));
}
// spotlight + border glow follow the pointer on the bento cards
document.addEventListener("pointermove", e => { if (dash.hidden) return; document.querySelectorAll(".mb-card").forEach(c => { const r = c.getBoundingClientRect(); c.style.setProperty("--mb-x", (e.clientX - r.left).toFixed(0) + "px"); c.style.setProperty("--mb-y", (e.clientY - r.top).toFixed(0) + "px"); }); }, { passive: true });
document.getElementById("logout").addEventListener("click", () => { dash.hidden = true; if (fromAdmin) { openAdmin(); return; } document.body.style.overflow = ""; });
document.getElementById("dashBack").addEventListener("click", () => { dash.hidden = true; openAdmin(); });
setInterval(() => { if (!dash.hidden && viewing) renderDash(false); }, 60000); // statuses follow the clock

/* ---------------- client area: full itinerary as a PDF ---------------- */
document.querySelector("#dashPdf .dash__pdfIco").innerHTML = ICONS.download;
let jspdfReady = null;
// inside claude.ai the page cannot trigger a download itself: it hands the file to the viewer, who confirms.
// On an ordinary website window.claude does not exist and the browser download is used.
const dlCap = window.claude?.use ? window.claude.use("downloads").catch(() => null) : Promise.resolve(null);
async function savePDF(doc, filename) {
  const dl = await Promise.race([dlCap, new Promise(r => setTimeout(() => r(null), 2500))]);
  if (dl) {
    try { await dl.save({ filename, data: doc.output("blob") }); return; }
    catch (err) {
      if (err?.code === "declined") return;
      if (err?.code === "rate_limited") { alert(t("Ya hay una descarga pendiente de confirmar.")); return; }
      if (!["unavailable", "not_granted", "capability_disabled", "capability_removed"].includes(err?.code)) throw err;
    }
  }
  doc.save(filename);
}
const loadJsPDF = () => jspdfReady ||= new Promise((res, rej) => { if (window.jspdf) return res(window.jspdf); const s = document.createElement("script"); s.src = "vendor/jspdf.umd.min.js"; s.onload = () => res(window.jspdf); s.onerror = rej; document.head.appendChild(s); });
const imgData = src => new Promise(res => { const im = new Image(); im.onload = () => { const c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext("2d").drawImage(im, 0, 0); try { res(c.toDataURL("image/png")); } catch { res(null); } }; im.onerror = () => res(null); im.src = src; });
// jsPDF's built-in Helvetica speaks WinAnsi: keep accents, swap anything outside it
const pdfTxt = s => String(s ?? "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[ΞΣ]/g, "E").replace(/[^\x00-\xFF–—•€…]/g, "");
async function downloadPDF() {
  const btn = document.getElementById("dashPdf"); btn.disabled = true; btn.setAttribute("aria-busy", "true");
  try {
    const [{ jsPDF }, logo] = await Promise.all([loadJsPDF(), imgData("assets/logo.png")]);
    const rec = viewing, tl = timeline(rec), doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210, H = 297, M = 16, INK = [13, 10, 56], MID = [41, 36, 103], ROYAL = [30, 36, 187], MAG = [171, 80, 219], SOFT = [96, 100, 140], LINE = [217, 220, 239];
    const st = { done: t("Completado"), now: t("En curso"), next: t("Pendiente") };
    const start = new Date(rec.start + "T12:00:00"), end = new Date(start); end.setDate(start.getDate() + rec.days.length - 1);
    let y = 0, page = 1;
    const footer = () => {
      doc.setDrawColor(...LINE); doc.setLineWidth(.3); doc.line(M, H - 14, W - M, H - 14);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...SOFT);
      doc.text(pdfTxt(`Mey Society · Private concierge Ibiza · meysociety@protonmail.com`), M, H - 9);
      doc.text(pdfTxt(`${rec.code} · ${page}`), W - M, H - 9, { align: "right" });
    };
    const header = (big) => {
      doc.setFillColor(...INK); doc.rect(0, 0, W, big ? 62 : 22, "F");
      doc.setFillColor(...MAG); doc.rect(0, big ? 62 : 22, W, 1.2, "F");
      if (logo) doc.addImage(logo, "PNG", M, big ? 12 : 5, big ? 16 : 12, big ? 16 : 12);
      doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(big ? 15 : 11);
      doc.text("MEY SOCIETY.", M + (big ? 21 : 16), big ? 19 : 10.5);
      doc.setFont("helvetica", "normal"); doc.setFontSize(big ? 9 : 8); doc.setTextColor(200, 196, 240);
      doc.text(pdfTxt(t("Itinerario privado")), M + (big ? 21 : 16), big ? 25 : 15);
      if (big) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(255, 255, 255);
        doc.text(pdfTxt(t(rec.name)), M, 44);
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(200, 196, 240);
        doc.text(pdfTxt(`${packName(rec.pack)} · ${rec.guests} ${t("personas")} · ${fmtDate(start, { day: "numeric", month: "long" })} – ${fmtDate(end, { day: "numeric", month: "long", year: "numeric" })}`), M, 52);
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
        doc.text(pdfTxt(`${t("Código de reserva")}: ${rec.code}`), W - M, 19, { align: "right" });
        doc.setFont("helvetica", "normal"); doc.setTextColor(200, 196, 240);
        doc.text(pdfTxt(`${tl.pct}% ${t("completado")}`), W - M, 25, { align: "right" });
      }
      y = big ? 74 : 34;
    };
    const room = h => { if (y + h > H - 20) { footer(); doc.addPage(); page++; header(false); } };
    header(true);
    // route summary from the airport
    const stops = [t("Aeropuerto de Ibiza")]; tl.flat.forEach(e => { const n = t(PLACES[e.place].name).split(" · ")[0]; if (stops[stops.length - 1] !== n) stops.push(n); });
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...ROYAL); doc.text(pdfTxt(t("Tu ruta desde el aeropuerto").toUpperCase()), M, y); y += 6;
    doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...INK);
    const route = doc.splitTextToSize(pdfTxt(stops.join("  →  ").replace(/→/g, ">")), W - 2 * M); doc.text(route, M, y); y += route.length * 4.6 + 6;
    rec.days.forEach((day, d) => {
      const date = new Date(start); date.setDate(start.getDate() + d);
      const evs = tl.flat.filter(e => e.d === d);
      room(22 + evs.length * 13);
      doc.setFillColor(244, 245, 251); doc.roundedRect(M, y - 5.5, W - 2 * M, 11, 2.5, 2.5, "F");
      doc.setFillColor(...MAG); doc.circle(M + 5, y - .1, 1.4, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(11.5); doc.setTextColor(...INK);
      doc.text(pdfTxt(`${t("Día")} ${d + 1} · ${t(day.title)}`), M + 9, y + 1.3);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...SOFT);
      doc.text(pdfTxt(fmtDate(date, { weekday: "long", day: "numeric", month: "long" })), W - M - 4, y + 1.2, { align: "right" });
      y += 12;
      evs.forEach((e, i) => {
        const done = e.status === "done", now = e.status === "now";
        doc.setDrawColor(...(done || now ? MAG : LINE)); doc.setLineWidth(.6);
        if (i < evs.length - 1) doc.line(M + 5, y + 1, M + 5, y + 12);
        if (done) { doc.setFillColor(...MAG); doc.circle(M + 5, y, 2, "F"); doc.setDrawColor(255, 255, 255); doc.setLineWidth(.5); doc.line(M + 4.1, y, M + 4.8, y + .8); doc.line(M + 4.8, y + .8, M + 6.1, y - .8); }
        else { doc.setFillColor(255, 255, 255); doc.setDrawColor(...(now ? MAG : SOFT)); doc.setLineWidth(.5); doc.circle(M + 5, y, 2, "FD"); if (now) { doc.setFillColor(...MAG); doc.circle(M + 5, y, .9, "F"); } }
        doc.setFont("helvetica", "bold"); doc.setFontSize(10.5); doc.setTextColor(...INK);
        doc.text(e.time, M + 11, y + 1.2);
        doc.text(pdfTxt(t(e.title)), M + 26, y + 1.2);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.8); doc.setTextColor(...SOFT);
        doc.text(pdfTxt(PLACES[e.place].name), M + 26, y + 5.6);
        doc.setFontSize(8); doc.setTextColor(...(done ? MAG : now ? ROYAL : SOFT));
        doc.text(pdfTxt(st[e.status]), W - M - 4, y + 1.2, { align: "right" });
        y += 13;
      });
      y += 4;
    });
    if (rec.notes) {
      const lines = doc.splitTextToSize(pdfTxt(rec.notes), W - 2 * M - 8); room(16 + lines.length * 4.6);
      doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(...ROYAL); doc.text(pdfTxt(t("Notas").toUpperCase()), M, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...INK); doc.text(lines, M, y); y += lines.length * 4.6 + 4;
    }
    room(18);
    doc.setFont("helvetica", "italic"); doc.setFontSize(8.5); doc.setTextColor(...SOFT);
    doc.text(doc.splitTextToSize(pdfTxt(t("Horarios orientativos. Tu concierge confirma cada servicio y te avisa de cualquier cambio.")), W - 2 * M), M, y + 2);
    footer();
    await savePDF(doc, `Mey-Society-${rec.code}.pdf`);
  } catch (err) { console.error(err); alert(t("No se pudo generar el PDF. Inténtalo de nuevo.")); }
  finally { btn.disabled = false; btn.removeAttribute("aria-busy"); }
}
document.getElementById("dashPdf").addEventListener("click", downloadPDF);

/* ---------------- HOME: personalised itinerary previews (MagicBento automation, live) ---------------- */
const EXAMPLES = [
  { name: "Ana & Marc", who: "Aniversario · 2 personas", pack: "Sea & Sun", day: "Día 2 · Mar", glyph: "boat", accent: "200 86 230", ini: "AM",
    touches: [["star", "Champán y flores a bordo"], ["sun", "Mesa frente a Es Vedrà al atardecer"]],
    steps: [["10:30", "Salida en barco", "botafoch", "boat"], ["12:00", "Baño en Cala d'Hort", "hort", "wave"], ["13:30", "Comida a bordo", "savina", "dish"], ["20:00", "Cena frente a Es Vedrà", "hort", "dish"]] },
  { name: "Grupo de Daniel", who: "Cumpleaños · 8 personas", pack: "Night Edition", day: "Día 2 · Noche", glyph: "star", accent: "171 80 219", ini: "D",
    touches: [["users", "Furgoneta de 8 plazas toda la noche"], ["chef", "Tarta sorpresa en la mesa VIP"]],
    steps: [["17:00", "Beach club", "bossa", "sun"], ["20:30", "Chef privado en la villa", "cubells", "dish"], ["23:30", "Mesa VIP", "bossa", "star"], ["04:00", "Chófer de vuelta", "cubells", "car"]] },
  { name: "Familia Weber", who: "Familia · 5 personas", pack: "Completo", day: "Día 1 · Llegada", glyph: "plane", accent: "120 199 228", ini: "W",
    touches: [["car", "Sillas infantiles en el transfer"], ["home", "Nevera llena antes de llegar"]],
    steps: [["14:30", "Transfer privado", "airport", "car"], ["16:00", "Check-in en la villa", "cubells", "home"], ["17:30", "Piscina lista y toallas", "cubells", "sun"], ["21:00", "Menú infantil del chef", "cubells", "dish"]] },
];
const exRoot = document.getElementById("examples");
exRoot.innerHTML = EXAMPLES.map((x, k) => `<article class="ex__item">
  <div class="ex__who"><span class="ex__avatar" style="--a:${x.accent}">${x.ini}</span>
    <div><h3>${x.name}</h3><p>${x.who} · ${x.pack}</p></div></div>
  <ul class="ex__touches">${x.touches.map(([i, s]) => `<li>${ICONS[i] || ""}<span>${s}</span></li>`).join("")}</ul>
  <div class="mb-card mb-card--live" style="--mb-accent:${x.accent};--mb-glow:${x.accent}" data-k="${k}"><span class="mb-light" aria-hidden="true"></span><div class="mb-content">
    <div class="mb-header"><span class="mb-dot"></span><span>${x.day}</span><span class="ex__live">En directo</span></div>
    <div class="mb-flow" style="--n:${x.steps.length};--fill:0">
      <div class="mb-trigger mb-tile"><span class="mb-glyph">${ICONS[x.glyph]}</span>
        <span class="mb-flow-copy"><span class="mb-flow-name">${x.day.split(" · ")[1]}</span><span class="mb-flow-meta" data-meta></span></span></div>
      <ol class="mb-steps mb-well"><span class="mb-rail" aria-hidden="true"><span class="mb-rail-fill"></span></span>
        ${x.steps.map(([time, title, place, icon], i) => `<li class="mb-step mb-step--next" style="--i:${i}">
          <span class="mb-status"><span class="mb-pending"></span><span class="mb-spinner"></span><span class="mb-done">${ICONS.tick}</span></span>
          <span class="mb-step-icon" aria-hidden="true">${ICONS[STEP_ICON[icon]] || ""}</span>
          <span class="mb-step-copy"><b>${title}</b><small>${ICONS.pin}${t(PLACES[place].name)}</small></span>
          <span class="mb-step-time">${time}</span></li>`).join("")}
      </ol></div></div><span class="mb-rim" aria-hidden="true"></span><span class="mb-border" aria-hidden="true"></span></div>
</article>`).join("");
// each card runs its own loop: step k goes pending → in progress → done, the rail fills, then the day starts over
const exCards = [...exRoot.querySelectorAll(".mb-card--live")].map((card, k) => ({ card, x: EXAMPLES[k], cur: -1, t: 0, steps: [...card.querySelectorAll(".mb-step")], flow: card.querySelector(".mb-flow"), meta: card.querySelector("[data-meta]") }));
function exPaint(c) {
  const n = c.steps.length, cur = c.cur;
  c.steps.forEach((s, i) => { s.className = "mb-step mb-step--" + (i < cur ? "done" : i === cur ? "now" : "next"); });
  c.flow.style.setProperty("--fill", (n > 1 ? Math.min(1, Math.max(0, cur) / (n - 1)) : 0).toFixed(3));
  const st = c.x.steps[cur];
  c.meta.textContent = cur >= n ? `${n}/${n} ${t("completados")}` : st ? `${t("Ahora")}: ${t(st[1])} · ${t(PLACES[st[2]].name)}` : `0/${n} ${t("completados")}`;
}
exCards.forEach((c, k) => { c.cur = REDUCED ? c.steps.length : k % c.steps.length; exPaint(c); });
let exVisible = false;
new IntersectionObserver(es => { exVisible = es.some(e => e.isIntersecting); }, { threshold: .15 }).observe(exRoot);
if (!REDUCED) setInterval(() => {
  if (!exVisible || document.hidden) return;
  exCards.forEach((c, k) => {
    if (++c.t < (c.cur >= c.steps.length ? 3 : 2)) return; // ~2.4 s per step, a longer hold when the day is complete
    c.t = 0; c.cur = c.cur >= c.steps.length ? -1 : c.cur + 1;
    if (c.cur === -1) { c.steps.forEach(s => s.className = "mb-step mb-step--next"); c.card.classList.remove("is-in"); void c.card.offsetWidth; c.card.classList.add("is-in"); c.cur = 0; }
    exPaint(c);
  });
}, 1200);
document.addEventListener("langchange", () => exCards.forEach(exPaint));
document.addEventListener("pointermove", e => { if (!exVisible || !FINE) return; exCards.forEach(({ card }) => { const r = card.getBoundingClientRect(); card.style.setProperty("--mb-x", (e.clientX - r.left).toFixed(0) + "px"); card.style.setProperty("--mb-y", (e.clientY - r.top).toFixed(0) + "px"); }); }, { passive: true });
document.getElementById("exDemo").addEventListener("click", e => { e.preventDefault(); const rec = findForClient("", "MEY-DEMO"); if (rec) { fromAdmin = false; openDash(rec); } });

// ---- admin: register of every client's itinerary ----
let filter = "all";
const STATE = { active: "En curso", upcoming: "Próximo", finished: "Finalizado" };
function openAdmin() {
  admin.hidden = false; dash.hidden = true; document.body.style.overflow = "hidden"; renderAdmin();
}
function renderAdmin() {
  const all = loadAll().filter(r => !r.demo), rows = all.map(r => ({ r, tl: timeline(r) }));
  const c = k => rows.filter(x => x.tl.state === k).length;
  const nextUp = rows.flatMap(x => x.tl.state !== "finished" && x.tl.next ? [{ r: x.r, e: x.tl.next }] : []).sort((a, b) => a.e.at - b.e.at)[0];
  document.getElementById("stats").innerHTML = [
    ["En curso", c("active"), "Clientes en la isla ahora"], ["Próximos", c("upcoming"), "Llegadas confirmadas"], ["Finalizados", c("finished"), "Estancias completadas"],
    ["Siguiente", nextUp ? nextUp.e.time : "—", nextUp ? `${nextUp.r.name} · ${nextUp.e.title} · ${PLACES[nextUp.e.place].name}` : "Sin eventos pendientes"],
  ].map(([k, v, s]) => `<div class="mb-card mb-card--stat"><span class="mb-light"></span><div class="mb-content"><span class="stat__k">${k}</span><strong class="stat__v">${v}</strong><span class="stat__s">${s}</span></div><span class="mb-rim"></span><span class="mb-border"></span></div>`).join("");
  const q = document.getElementById("adminSearch").value.trim().toLowerCase();
  const list = rows.filter(x => (filter === "all" || x.tl.state === filter) && (!q || [x.r.name, x.r.email, x.r.code, x.r.pack].join(" ").toLowerCase().includes(q)))
    .sort((a, b) => ({ active: 0, upcoming: 1, finished: 2 }[a.tl.state] - { active: 0, upcoming: 1, finished: 2 }[b.tl.state]) || a.r.start.localeCompare(b.r.start));
  const el = document.getElementById("adminList");
  el.innerHTML = list.length ? list.map(({ r, tl }) => {
    const s = new Date(r.start + "T12:00:00"), e = new Date(s); e.setDate(s.getDate() + r.days.length - 1);
    const focus = tl.current && tl.current.status === "now" ? ["Ahora", tl.current] : tl.next ? ["Siguiente", tl.next] : null;
    return `<div class="arow" role="listitem" data-id="${r.id}">
      <div class="arow__who"><b>${r.name}</b><small>${r.email} · ${r.code}</small></div>
      <div class="arow__pack"><span>${packName(r.pack)}</span><small>${r.guests} pers. · ${fmtDate(s, { day: "numeric", month: "short" })} – ${fmtDate(e, { day: "numeric", month: "short" })}</small></div>
      <div class="arow__prog"><span class="pbar"><i style="width:${tl.pct}%"></i></span><small>${tl.pct}% · ${tl.done}/${tl.total}</small></div>
      <div class="arow__next">${focus ? `<small>${focus[0]}</small><b>${focus[1].time} · ${focus[1].title}</b><small>${t(PLACES[focus[1].place].name)} · ${fmtDate(focus[1].at, { weekday: "short", day: "numeric" })}</small>` : "<small>Estancia completada</small>"}</div>
      <span class="pill pill--${tl.state}">${STATE[tl.state]}</span>
      <div class="arow__act"><button class="btn btn--glass btn--sm btn--onDark" type="button" data-view>Ver itinerario</button><button class="arow__del" type="button" data-del aria-label="${t("Eliminar")} ${r.name}">×</button></div>
    </div>`;
  }).join("") : `<p class="admin__empty">No hay itinerarios con este filtro.</p>`;
}
document.querySelector(".admin__filters").addEventListener("click", e => { const b = e.target.closest("[data-f]"); if (!b) return; filter = b.dataset.f; document.querySelectorAll(".admin__filters .chip").forEach(x => x.setAttribute("aria-pressed", x === b)); renderAdmin(); });
document.getElementById("adminSearch").addEventListener("input", renderAdmin);
document.getElementById("adminList").addEventListener("click", e => {
  const row = e.target.closest(".arow"); if (!row) return; const id = row.dataset.id;
  if (e.target.closest("[data-del]")) { const r = loadAll().find(x => x.id === id); if (r && row.classList.contains("is-confirm")) { saveAll(loadAll().filter(x => x.id !== id)); renderAdmin(); } else { row.classList.add("is-confirm"); e.target.closest("[data-del]").textContent = "¿Borrar?"; setTimeout(() => { row.classList.remove("is-confirm"); const d = row.querySelector("[data-del]"); if (d) d.textContent = "×"; }, 3000); } return; }
  if (e.target.closest("[data-view]")) { fromAdmin = true; openDash(loadAll().find(x => x.id === id)); }
});
const newForm = document.getElementById("newForm");
document.getElementById("n-pack").innerHTML = Object.keys(TEMPLATES).map(k => `<option value="${k}">${packName(k)}</option>`).join("");
document.getElementById("newItin").addEventListener("click", () => { newForm.hidden = !newForm.hidden; if (!newForm.hidden) { document.getElementById("n-code").value = newCode(); const d = new Date(); d.setDate(d.getDate() + 7); document.getElementById("n-start").value = d.toISOString().slice(0, 10); document.getElementById("n-name").focus(); } });
document.getElementById("newCancel").addEventListener("click", () => { newForm.hidden = true; });
newForm.addEventListener("submit", e => {
  e.preventDefault(); const v = id => document.getElementById(id).value.trim();
  const rec = { id: "c" + Date.now().toString(36), name: v("n-name"), email: v("n-email").toLowerCase(), code: v("n-code"), guests: +v("n-guests") || 2, pack: v("n-pack"), start: v("n-start"), days: fromTemplate(v("n-pack")), notes: v("n-notes") };
  saveAll([...loadAll(), rec]); newForm.reset(); newForm.hidden = true; renderAdmin();
});
document.getElementById("exportItin").addEventListener("click", async () => {
  const txt = JSON.stringify(loadAll().filter(r => !r.demo), null, 2);
  try { await navigator.clipboard.writeText(txt); document.getElementById("exportItin").textContent = "Copiado al portapapeles"; } catch { document.getElementById("exportItin").textContent = "No se pudo copiar"; }
  setTimeout(() => { document.getElementById("exportItin").textContent = "Exportar copia"; }, 2500);
});
document.getElementById("adminOut").addEventListener("click", () => { try { sessionStorage.removeItem("mey-admin"); } catch {} admin.hidden = true; document.body.style.overflow = ""; });

/* ---------------- REVIEWS: CircularCarousel of client photos and videos ---------------- */
// Swap these for real client media: { src, title, subtitle } for a photo, { type: "video", src, poster, title, subtitle } for a video.
const REVIEWS = [
  { src: "data/reviews/brindis-a-bordo.jpg", title: "Atardecer a bordo", subtitle: "Foto de ejemplo" },
  { type: "video", src: "data/reviews/video-yate.mp4", poster: "data/reviews/video-yate.jpg", title: "Día de yate", subtitle: "Vídeo de ejemplo" },
  { src: "data/reviews/cena-villa.jpg", title: "Cena en la villa", subtitle: "Foto de ejemplo" },
  { src: "data/reviews/motos-de-agua.jpg", title: "Motos de agua", subtitle: "Foto de ejemplo" },
  { src: "data/reviews/villa-piscina.jpg", title: "Mañana en la villa", subtitle: "Foto de ejemplo" },
  { type: "video", src: "data/reviews/video-lancha.mp4", poster: "data/reviews/video-lancha.jpg", title: "Ruta en lancha", subtitle: "Vídeo de ejemplo" },
  { src: "data/reviews/chef-privado.jpg", title: "Chef privado", subtitle: "Foto de ejemplo" },
  { src: "data/boats/velero-clasico.jpg", title: "Velero al atardecer", subtitle: "Foto de ejemplo" },
  { src: "data/boats/cruiser-12m.jpg", title: "Fondeo en Es Vedrà", subtitle: "Foto de ejemplo" },
  { src: "data/photos/cala-d-hort.jpg", title: "Cala d'Hort", subtitle: "Foto de ejemplo" },
];
const lb = document.getElementById("lightbox"), lbMedia = document.getElementById("lbMedia"), lbCap = document.getElementById("lbCap");
document.getElementById("lbClose").innerHTML = ICONS.close;
function openLightbox(it) {
  lbMedia.innerHTML = it.type === "video"
    ? `<video class="lightbox__media" src="${it.src}" poster="${it.poster || ""}" controls autoplay playsinline loop></video>`
    : `<img class="lightbox__media" src="${it.src}" alt="${t(it.title)}">`;
  lbCap.innerHTML = `${t(it.title)}<small>${t(it.subtitle || "")}</small>`;
  lb.hidden = false; document.body.style.overflow = "hidden"; document.getElementById("lbClose").focus();
}
function closeLightbox() { lb.hidden = true; lbMedia.innerHTML = ""; document.body.style.overflow = ""; }
document.getElementById("lbClose").addEventListener("click", closeLightbox);
lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !lb.hidden) closeLightbox(); });
const reviewsItems = () => REVIEWS.map(r => ({ ...r, title: t(r.title), subtitle: t(r.subtitle), alt: t(r.title) }));
const ringEl = document.getElementById("reviewsRing");
const mountReviews = () => {
  ringEl.replaceChildren();
  createCircularCarousel(ringEl, {
    items: reviewsItems(), preset: "cylinder", intro: "rise", cardWidth: innerWidth < 600 ? 170 : 230, aspectRatio: 1, speed: 34, captions: true, tilt: -7,
    interval: 7.5, parallax: .36, cornerRadius: 19, fadeColor: "#1d1a5c", label: "Reviews",
    onItemClick: (it, i, front) => { if (front) openLightbox(REVIEWS[i]); },
  });
};
mountReviews();
document.addEventListener("langchange", mountReviews);

/* ---------------- FLEET: Depth Ribbon of boats (Barcos / Yates) ---------------- */
// Illustrative examples. Replace src/specs with the real boats each charter operator offers.
const FLEET = [
  { src: "data/boats/sin-licencia.jpg", cat: "sin-licencia", title: "Lancha sin licencia", len: "5 m", pax: 5, extra: "15 CV · sin titulación" },
  { src: "data/boats/lancha-8m.jpg", cat: "lancha", title: "Lancha abierta", len: "8 m", pax: 8, extra: "Solárium de proa" },
  { src: "data/boats/cruiser-12m.jpg", cat: "con-patron", title: "Crucero de día", len: "12 m", pax: 10, extra: "Patrón incluido" },
  { src: "data/boats/catamaran-14m.jpg", cat: "con-patron", title: "Catamarán a vela", len: "—", pax: 6, extra: "Patrón incluido" },
  { src: "data/boats/velero-clasico.jpg", cat: "con-patron", title: "Goleta clásica", len: "24 m", pax: 12, extra: "Tripulación incluida" },
  { src: "data/boats/yate-deportivo-18m.jpg", cat: "yate", title: "Yate deportivo", len: "18 m", pax: 12, extra: "Patrón y marinero" },
  { src: "data/boats/superyate-25m.jpg", cat: "yate", title: "Superyate", len: "25 m", pax: 12, extra: "Tripulación de 4" },
];
const FLEET_CATS = [["all", "Todos"], ["sin-licencia", "Sin licencia"], ["con-patron", "Con patrón"], ["lancha", "Lancha"], ["yate", "Yate"]];
const CAT_LABEL = Object.fromEntries(FLEET_CATS);
const fleet = document.getElementById("fleet"), fleetInfo = document.getElementById("fleetInfo"), fleetChips = document.getElementById("fleetChips");
document.getElementById("fleetClose").innerHTML = ICONS.close;
document.getElementById("fleetPrev").innerHTML = ICONS.left; document.getElementById("fleetNext").innerHTML = ICONS.right;
let ribbon = null, fleetCat = "all", fleetList = FLEET;
const fleetItems = () => fleetList.map(b => ({ ...b, title: t(b.title), tag: t(CAT_LABEL[b.cat]) }));
function renderFleetInfo(b, i) {
  if (!b) return;
  fleetInfo.innerHTML = `<h3>${t(b.title)}</h3>
    <ul class="fleet__specs"><li>${ICONS.boat}${t(CAT_LABEL[b.cat])}</li>${b.len !== "—" ? `<li>${ICONS.ruler}${b.len}</li>` : ""}<li>${ICONS.users2}${t("Hasta")} ${b.pax} ${t("personas")}</li><li>${ICONS.star}${t(b.extra)}</li></ul>
    <button class="btn btn--primary btn--sm" type="button" data-ask>${t("Pedir disponibilidad")}</button>`;
  fleetInfo.classList.remove("is-swap"); void fleetInfo.offsetWidth; fleetInfo.classList.add("is-swap");
  document.getElementById("fleetCount").textContent = `${String(i + 1).padStart(2, "0")} / ${String(fleetList.length).padStart(2, "0")}`;
}
function setFleetCat(cat) {
  fleetCat = cat; fleetList = cat === "all" ? FLEET : FLEET.filter(b => b.cat === cat);
  fleetChips.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.cat === cat));
  ribbon.setItems(fleetItems());
}
function openFleet(cat = "all") {
  fleet.hidden = false; document.body.style.overflow = "hidden";
  fleetChips.innerHTML = FLEET_CATS.map(([k, l]) => `<button type="button" data-cat="${k}" aria-pressed="${k === cat}">${t(l)}</button>`).join("");
  if (!ribbon) ribbon = createDepthRibbon(document.getElementById("fleetRibbon").appendChild(document.createElement("div")), {
    items: [], label: t("Nuestra flota"),
    onChange: (b, i) => renderFleetInfo(fleetList[i], i),
    onItemClick: (b, i) => askFleet(fleetList[i]),
  });
  setFleetCat(cat);
  requestAnimationFrame(() => document.querySelector("#fleetRibbon .ribbon").focus({ preventScroll: true }));
}
function closeFleet() { fleet.hidden = true; document.body.style.overflow = ""; }
function askFleet(b) {
  closeFleet(); select("yates", true);
  document.getElementById("f-notes").value = `${t("Me interesa")}: ${t(b.title)}${b.len !== "—" ? " " + b.len : ""} (${t(CAT_LABEL[b.cat])}).`;
  document.getElementById("contacto").scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
}
fleetChips.addEventListener("click", e => { const b = e.target.closest("button[data-cat]"); if (b) setFleetCat(b.dataset.cat); });
fleetInfo.addEventListener("click", e => { if (e.target.closest("[data-ask]")) askFleet(fleetList[ribbon.active]); });
document.getElementById("fleetPrev").addEventListener("click", () => ribbon.prev());
document.getElementById("fleetNext").addEventListener("click", () => ribbon.next());
document.getElementById("fleetClose").addEventListener("click", closeFleet);
document.addEventListener("keydown", e => { if (e.key === "Escape" && !fleet.hidden) closeFleet(); });
document.addEventListener("click", e => { const b = e.target.closest("[data-fleet]"); if (b) { e.preventDefault(); openFleet(b.dataset.fleet); } });
document.addEventListener("langchange", () => { if (!fleet.hidden) openFleet(fleetCat); });


/* ---------------- itinerary changes: admin edits create them, the client's bell announces them ---------------- */
const nightKey = tm => { const [h, m] = tm.split(":").map(Number); return (h < 6 ? h + 24 : h) * 60 + m; };
const iconFor = title => /barco|yate|velero|catamar/i.test(title) ? "boat" : /cena|comida|chef|almuerzo|desayuno/i.test(title) ? "dish" : /transfer|chófer|coche|recogida/i.test(title) ? "car" : /moto de agua|jet/i.test(title) ? "wave" : /villa|check/i.test(title) ? "home" : /playa|beach|atardecer/i.test(title) ? "sun" : "star";
function changeText(c) {
  const day = `${t("Día")} ${c.day + 1}`, before = x => `<span class="was">${t("antes")} ${x}</span>`;
  if (c.kind === "time") return `${day} · ${t(c.title)}: ${t("nueva hora")} <b>${c.to}</b> ${before(c.from)}`;
  if (c.kind === "place") return `${day} · ${t(c.title)}: <b>${t(PLACES[c.to]?.name || c.to)}</b> ${before(t(PLACES[c.from]?.name || c.from))}`;
  if (c.kind === "title") return `${day} · ${c.time}: <b>${t(c.to)}</b> ${before(t(c.from))}`;
  if (c.kind === "add") return `${day} · ${t("Nueva actividad")}: <b>${t(c.title)}</b> · ${c.time}`;
  if (c.kind === "remove") return `${day} · ${t("Cancelada")}: <b>${t(c.title)}</b> · ${c.time}`;
  return "";
}
const plain = html => { const d = document.createElement("div"); d.innerHTML = html; return d.textContent; };
// save a change to the stored record, logging what changed for the client
function commitChange(mutate) {
  const all = loadAll(), r = all.find(x => x.id === viewing.id); if (!r) return;
  const log = []; mutate(r, log); if (!log.length) return;
  r.days.forEach(d => d.events.sort((a, b) => nightKey(a.time) - nightKey(b.time)));
  r.rev = (r.rev || 0) + 1; r.changes = [...(r.changes || []), ...log.map(c => ({ ...c, rev: r.rev, at: new Date().toISOString() }))].slice(-60);
  saveAll(all); viewing = r; renderDash(false);
}
const flowEl = document.getElementById("flow");
function editForm(ev) {
  const opts = Object.entries(PLACES).map(([k, p]) => `<option value="${k}" ${ev && ev.place === k ? "selected" : ""}>${t(p.name)}</option>`).join("");
  return `<form class="mb-form">
    <label>${t("Hora")}<input type="time" name="time" required value="${ev ? ev.time : "12:00"}"></label>
    <label>${t("Actividad")}<input type="text" name="title" required value="${ev ? ev.title.replace(/"/g, "&quot;") : ""}"></label>
    <label>${t("Lugar")}<select name="place">${opts}</select></label>
    <div class="mb-form__act"><button class="btn btn--primary btn--sm" type="submit">${t("Guardar")}</button>${ev ? `<button class="btn btn--glass btn--sm btn--onDark" type="button" data-remove>${t("Eliminar")}</button>` : ""}<button class="btn btn--glass btn--sm btn--onDark" type="button" data-cancel>${t("Cancelar")}</button></div>
  </form>`;
}
flowEl.addEventListener("click", e => {
  if (!fromAdmin) return;
  const ed = e.target.closest("[data-edit]"), add = e.target.closest("[data-add]");
  if (ed) { const i = +ed.dataset.edit, ev = viewing.days[viewingDay].events[i], li = ed.closest("li"); li.classList.add("is-editing"); li.innerHTML = editForm(ev); li.dataset.i = i; li.querySelector("input[name=time]").focus(); return; }
  if (add) { add.insertAdjacentHTML("beforebegin", `<div class="mb-step is-editing" data-new>${editForm(null)}</div>`); add.hidden = true; flowEl.querySelector("[data-new] input[name=title]").focus(); return; }
  if (e.target.closest("[data-cancel]")) { renderDash(false); return; }
  if (e.target.closest("[data-remove]")) {
    const i = +e.target.closest("li").dataset.i, d = viewingDay;
    commitChange((r, log) => { const ev = r.days[d].events[i]; if (!ev) return; r.days[d].events.splice(i, 1); log.push({ kind: "remove", day: d, title: ev.title, time: ev.time }); });
  }
});
flowEl.addEventListener("submit", e => {
  e.preventDefault(); if (!fromAdmin) return;
  const f = e.target, v = { time: f.time.value, title: f.title.value.trim(), place: f.place.value }, d = viewingDay;
  if (!v.time || !v.title) return;
  const li = f.closest("li");
  if (li) { const i = +li.dataset.i; commitChange((r, log) => {
    const ev = r.days[d].events[i]; if (!ev) return;
    if (ev.time !== v.time) log.push({ kind: "time", day: d, title: v.title, from: ev.time, to: v.time });
    if (ev.place !== v.place) log.push({ kind: "place", day: d, title: v.title, from: ev.place, to: v.place });
    if (ev.title !== v.title) log.push({ kind: "title", day: d, time: v.time, from: ev.title, to: v.title });
    Object.assign(ev, v, ev.title !== v.title ? { icon: iconFor(v.title) } : {});
  }); }
  else commitChange((r, log) => { r.days[d].events.push({ ...v, icon: iconFor(v.title) }); log.push({ kind: "add", day: d, title: v.title, time: v.time }); });
});

// the client's bell
const NKEY = code => "mey-notify-" + code;
const nGet = code => { try { return JSON.parse(localStorage.getItem(NKEY(code))) || { on: false, seen: 0 }; } catch { return { on: false, seen: 0 }; } };
const nSet = (code, v) => { try { localStorage.setItem(NKEY(code), JSON.stringify(v)); } catch {} };
const bellWrap = document.getElementById("bellWrap"), bellBtn = document.getElementById("bellBtn"), bellPanel = document.getElementById("bellPanel"), bellBadge = document.getElementById("bellBadge"), toastEl = document.getElementById("toast");
let toastT = 0;
function toast(html) { toastEl.innerHTML = `<span class="toast__ico">${ICONS.bellOn}</span><span>${html}</span>`; toastEl.hidden = false; toastEl.classList.remove("is-in"); void toastEl.offsetWidth; toastEl.classList.add("is-in"); clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, 6500); }
function renderBell() {
  bellWrap.hidden = fromAdmin || !viewing; if (bellWrap.hidden) return;
  const rec = viewing, st = nGet(rec.code), log = rec.changes || [], unseen = st.on ? log.filter(c => c.rev > st.seen).length : 0;
  bellBtn.classList.toggle("is-on", st.on); bellBadge.hidden = !unseen; bellBadge.textContent = unseen;
  document.getElementById("bellIco").innerHTML = st.on ? ICONS.bellOn : ICONS.bell;
  const when = c => { const d = new Date(c.at); return `${fmtDate(d, { day: "numeric", month: "short" })} · ${d.toLocaleTimeString(getLang() === "es" ? "es-ES" : getLang(), { hour: "2-digit", minute: "2-digit" })}`; };
  bellPanel.innerHTML = `<header class="bell__head"><b>${t("Avisos de tu itinerario")}</b>
      <label class="switch"><input type="checkbox" id="bellToggle" ${st.on ? "checked" : ""}><span class="switch__track" aria-hidden="true"></span><span>${t(st.on ? "Activados" : "Desactivados")}</span></label></header>
    ${st.on ? (log.length ? `<ol class="bell__list">${log.slice().reverse().slice(0, 15).map(c => `<li class="${c.rev > st.seen ? "is-new" : ""}"><small>${when(c)}</small><span>${changeText(c)}</span></li>`).join("")}</ol>`
      : `<p class="bell__empty">${t("Sin cambios por ahora. Si algo cambia en tu itinerario, te avisaremos aquí al momento.")}</p>`)
      : `<p class="bell__empty">${t("Activa los avisos y te diremos al momento cualquier cambio en tu itinerario: horas, lugares o actividades nuevas.")}</p>`}`;
}
const markSeen = () => { if (!viewing) return; const st = nGet(viewing.code); if (!st.on) return; st.seen = Math.max(st.seen, viewing.rev || 0); nSet(viewing.code, st); };
bellBtn.addEventListener("click", e => {
  e.stopPropagation(); const open = bellPanel.hidden; bellPanel.hidden = !open; bellBtn.setAttribute("aria-expanded", open);
  if (!open) { markSeen(); renderBell(); }
});
bellPanel.addEventListener("change", async e => {
  if (e.target.id !== "bellToggle" || !viewing) return;
  const st = nGet(viewing.code); st.on = e.target.checked; if (st.on) st.seen = viewing.rev || 0; nSet(viewing.code, st);
  if (st.on && "Notification" in window && Notification.permission === "default") { try { await Notification.requestPermission(); } catch {} }
  renderBell(); if (st.on) toast(t("Avisos activados. Te avisaremos de cualquier cambio en tu itinerario."));
});
document.addEventListener("click", e => { if (!bellPanel.hidden && !bellWrap.contains(e.target)) { bellPanel.hidden = true; bellBtn.setAttribute("aria-expanded", "false"); markSeen(); renderBell(); } });
// watch for changes while the client area is open (another tab, or the concierge's device once a backend is connected)
function checkChanges() {
  if (dash.hidden || fromAdmin || !viewing) return;
  const fresh = loadAll().find(x => x.id === viewing.id); if (!fresh || (fresh.rev || 0) === (viewing.rev || 0)) return;
  const prev = viewing.rev || 0, news = (fresh.changes || []).filter(c => c.rev > prev);
  viewing = fresh; renderDash(false);
  const st = nGet(fresh.code); if (!st.on || !news.length) return;
  const msgTxt = news.length === 1 ? changeText(news[0]) : `${news.length} ${t("cambios nuevos")}`;
  toast(`<b>${t("Tu itinerario ha cambiado")}</b><br>${msgTxt}`);
  if ("Notification" in window && Notification.permission === "granted") { try { new Notification("Mey Society", { body: `${t("Tu itinerario ha cambiado")}: ${plain(msgTxt)}`, icon: "assets/logo.png", tag: "mey-" + fresh.code }); } catch {} }
}
window.addEventListener("storage", e => { if (e.key === "mey-itineraries-v1") checkChanges(); });
setInterval(checkChanges, 15000);
// on opening the client area, tell them about anything that changed since their last visit
const _openDash = openDash;
openDash = function (rec) {
  _openDash(rec); bellPanel.hidden = true;
  if (!fromAdmin) { const st = nGet(rec.code), unseen = st.on ? (rec.changes || []).filter(c => c.rev > st.seen).length : 0;
    if (unseen) setTimeout(() => toast(`<b>${unseen === 1 ? t("Tienes 1 cambio nuevo en tu itinerario") : `${t("Cambios nuevos en tu itinerario")}: ${unseen}`}</b>`), 600); }
};


/* ---------------- light / dark theme switch (menu, above Contacto) ---------------- */
{
  const btn = document.getElementById("themeToggle"), ico = btn.querySelector(".theme-toggle__ico");
  const paint = () => { const dark = document.documentElement.dataset.theme === "dark"; btn.setAttribute("aria-checked", dark); ico.innerHTML = dark ? ICONS.moon : ICONS.sun; };
  const apply = theme => {
    document.documentElement.dataset.theme = theme; try { localStorage.setItem("mey-theme", theme); } catch {}
    paint(); map3d.setTheme(theme === "dark");
    document.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  };
  btn.addEventListener("click", () => apply(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  paint(); if (document.documentElement.dataset.theme === "dark") map3d.setTheme(true);
}
