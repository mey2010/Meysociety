import * as THREE from "./vendor/three.module.js";

/* =====================================================================
   DATA
   Coastline: Natural Earth 1:10m (public domain), Ibiza and Formentera.
   Places: approximate coordinates, to be confirmed on Google 3D Tiles.
   ===================================================================== */
const COAST = [[[1.5246,38.6774],[1.5642,38.6909],[1.5822,38.6757],[1.5822,38.6538],[1.557,38.6487],[1.5246,38.6487],[1.4742,38.674],[1.4598,38.6808],[1.4382,38.6707],[1.4274,38.6656],[1.413,38.647],[1.3986,38.6386],[1.3842,38.642],[1.3878,38.6622],[1.3842,38.6707],[1.3842,38.6808],[1.3878,38.6876],[1.395,38.696],[1.395,38.7044],[1.3878,38.7078],[1.3842,38.7112],[1.3878,38.7196],[1.4022,38.7298],[1.4094,38.7247],[1.4166,38.7281],[1.4274,38.7399],[1.431,38.7551],[1.4346,38.7551],[1.4382,38.7534],[1.4382,38.75],[1.485,38.6943],[1.5246,38.6774]],[[1.6074,39.0911],[1.6002,39.0827],[1.6074,39.0624],[1.6218,39.0286],[1.6074,39.0286],[1.593,39.0202],[1.5858,39.0067],[1.5822,38.9915],[1.575,38.9864],[1.5426,38.9679],[1.5102,38.9307],[1.4958,38.9223],[1.4706,38.9104],[1.4598,38.9003],[1.4562,38.9037],[1.449,38.9088],[1.4454,38.9138],[1.4274,38.8969],[1.413,38.8902],[1.4058,38.8564],[1.4022,38.8328],[1.3698,38.8311],[1.3626,38.8513],[1.3446,38.8632],[1.3302,38.8581],[1.323,38.8581],[1.3194,38.8598],[1.3086,38.8581],[1.3014,38.8699],[1.2834,38.875],[1.2654,38.8699],[1.2582,38.8581],[1.2294,38.875],[1.215,38.8851],[1.2114,38.9037],[1.2258,38.9273],[1.2258,38.9425],[1.2186,38.9543],[1.2258,38.9594],[1.2366,38.9645],[1.2474,38.9662],[1.2582,38.9611],[1.269,38.9662],[1.2762,38.9679],[1.3014,38.9679],[1.2906,39.0101],[1.2942,39.0337],[1.305,39.0438],[1.3158,39.0472],[1.3338,39.0573],[1.3554,39.0776],[1.3626,39.0776],[1.3734,39.0709],[1.3914,39.0827],[1.4022,39.0776],[1.4238,39.0911],[1.449,39.1013],[1.4778,39.108],[1.4994,39.1046],[1.5102,39.1148],[1.521,39.1181],[1.5354,39.1181],[1.5534,39.108],[1.5606,39.1063],[1.5786,39.1046],[1.5894,39.1029],[1.5966,39.0979],[1.6074,39.0911]]];

const PLACES = {
  eivissa:   { name: "Eivissa · Dalt Vila",      ll: [1.4363, 38.9067] },
  botafoch:  { name: "Marina Botafoch",          ll: [1.4475, 38.9165] },
  cubells:   { name: "Es Cubells · Cala Jondal", ll: [1.3300, 38.8640] },
  bassa:     { name: "Cala Bassa",               ll: [1.2410, 38.9680] },
  hort:      { name: "Cala d'Hort",              ll: [1.2230, 38.8890] },
  vedra:     { name: "Es Vedrà",                 ll: [1.1983, 38.8677] },
  bossa:     { name: "Platja d'en Bossa",        ll: [1.4100, 38.8830] },
  airport:   { name: "Aeropuerto de Ibiza",      ll: [1.3730, 38.8730] },
  salines:   { name: "Ses Salines",              ll: [1.3960, 38.8400] },
  santantoni:{ name: "Sant Antoni",              ll: [1.3030, 38.9810] },
  santaeul:  { name: "Santa Eulària",            ll: [1.5340, 38.9850] },
  santjosep: { name: "Sant Josep",               ll: [1.2900, 38.9210] },
  santjoan:  { name: "Sant Joan",                ll: [1.5120, 39.0790] },
  savina:    { name: "Formentera · La Savina",   ll: [1.4160, 38.7350] },
};

const LON0 = 1.42, LAT0 = 38.88, KX = 111.32 * Math.cos(LAT0 * Math.PI / 180), KZ = 110.57;
const proj = ([lon, lat]) => ({ x: (lon - LON0) * KX, z: -(lat - LAT0) * KZ });
const P = k => proj(PLACES[k].ll);

// Scene keyframes: camera position, look-at target (km), time of day 0 = morning, 1 = night
const SCENES = [
  { where: "Ibiza",                    place: null,       pos: [5, 56, 44],        look: [-2, 0, -4],      tod: .10 },
  { where: "Es Cubells · Cala Jondal", place: "cubells",  pos: [-6.2, 1.25, 5.4],  look: [-9.2, .05, 1.1], tod: .22 },
  { where: "Marina Botafoch",          place: "botafoch", pos: [5.6, .95, -.4],    look: [1.9, .02, -3.6], tod: .32 },
  { where: "Cala Bassa",               place: "bassa",    pos: [-12.4, .85, -6.2], look: [-15.5, 0, -9.7], tod: .42 },
  { where: "Cala d'Hort · Es Vedrà",   place: "vedra",    pos: [-14.4, 1.05, -3.8],look: [-19, .15, 1],    tod: .56 },
  { where: "Dalt Vila",                place: "eivissa",  pos: [-2.4, 1.35, -6.6],  look: [1.4, .05, -2.9], tod: .72 },
  { where: "Platja d'en Bossa",        place: "bossa",    pos: [3.6, 2.3, 4.4],    look: [-1.4, 0, -.6],   tod: .9 },
  { where: "Ibiza y Formentera",       place: null,       pos: [-6, 40, 34],       look: [-2, 0, -5],      tod: 1 },
];

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const NARROW = matchMedia("(max-width: 900px)").matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

/* =====================================================================
   WORLD
   ===================================================================== */
const canvas = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, NARROW ? 1.5 : 1.75));
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.02, 4000);

const U = {
  uTime: { value: 0 }, uSun: { value: new THREE.Vector3(0, 1, 0) },
  uZenith: { value: new THREE.Color() }, uHorizon: { value: new THREE.Color() }, uSunCol: { value: new THREE.Color() },
  uNight: { value: 0 }, uGold: { value: 0 },
};

// ---- sky
const sky = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 24), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, uniforms: U,
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * p; }`,
  fragmentShader: `
    uniform vec3 uSun, uZenith, uHorizon, uSunCol; uniform float uNight, uGold; varying vec3 vDir;
    float hash(vec3 p){ p = fract(p*.3183099+.1); p *= 17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    void main(){
      vec3 d = normalize(vDir); float h = max(d.y, 0.);
      vec3 col = mix(uHorizon, uZenith, pow(h, .45));
      float s = max(dot(d, uSun), 0.);
      col += uSunCol * (pow(s, 3200.) * 7. + pow(s, 90.) * .12 + pow(s, 8.) * .08 * (1. + uGold));
      col += uSunCol * pow(1. - h, 8.) * .25 * uGold;
      vec3 c = floor(d * 380.); float st = step(.9975, hash(c)) * smoothstep(.05, .3, d.y);
      col += vec3(st) * uNight * .9;
      if (d.y < 0.) col = mix(uHorizon, uHorizon * .6, clamp(-d.y * 4., 0., 1.));
      gl_FragColor = vec4(col, 1.);
    }`,
}));
scene.add(sky);

// ---- real terrain: Copernicus DEM GLO-30 heights + Sentinel-2 true colour (22 Jun 2025)
const BB = { lon0: 1.17, lon1: 1.65, lat0: 38.63, lat1: 39.13 };
const TB = { x0: (BB.lon0 - LON0) * KX, x1: (BB.lon1 - LON0) * KX, z0: -(BB.lat1 - LAT0) * KZ, z1: -(BB.lat0 - LAT0) * KZ };
const loader = new THREE.TextureLoader();
const MAXANI = renderer.capabilities.getMaxAnisotropy();
// PNOA aerial orthophoto (IGN), baked at ~14 m for the whole island
const satTex = loader.load("data/pnoa_base.jpg", t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = MAXANI; t.needsUpdate = true; });
const shallowTex = loader.load("data/shallow.png", t => { t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true; });
const HN = 640; let HGT = null;
function heightAt(x, z) { // km → metres from the DEM, bilinear
  if (!HGT) return 0; const u = (x - TB.x0) / (TB.x1 - TB.x0) * (HN - 1), v = (z - TB.z0) / (TB.z1 - TB.z0) * (HN - 1);
  if (u < 0 || u > HN - 1 || v < 0 || v > HN - 1) return -50;
  const j = Math.min(HN - 2, Math.floor(u)), i = Math.min(HN - 2, Math.floor(v)), fu = u - j, fv = v - i;
  const h = (a, b) => HGT[a * HN + b] / 10 - 100;
  return (h(i, j) * (1 - fu) + h(i, j + 1) * fu) * (1 - fv) + (h(i + 1, j) * (1 - fu) + h(i + 1, j + 1) * fu) * fv;
}
// high-resolution PNOA patches (~2 m) around each scene, blended into the base at their edges
function fadeMask() {
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d"), d = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const e = Math.min(x, y, 255 - x, 255 - y) / 255; const a = Math.min(1, Math.max(0, (e - .02) / .16)); const v = Math.round(a * a * (3 - 2 * a) * 255); const k = (y * 256 + x) * 4; d.data[k] = d.data[k + 1] = d.data[k + 2] = v; d.data[k + 3] = 255; }
  g.putImageData(d, 0, 0); return new THREE.CanvasTexture(c);
}
const SEA_CLIP = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)];
function addPatches() {
  return fetch("data/pnoa_patches.json").then(r => r.json()).then(meta => {
    const mask = fadeMask(); const jobs = [];
    for (const [k, [lo0, lo1, la0, la1]] of Object.entries(meta)) {
      const a = proj([lo0, la1]), b = proj([lo1, la0]), w = b.x - a.x, d = b.z - a.z, n = NARROW ? 96 : 192;
      const g = new THREE.PlaneGeometry(w, d, n - 1, n - 1).rotateX(-Math.PI / 2); g.translate(a.x + w / 2, 0, a.z + d / 2);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const m = heightAt(p.getX(i), p.getZ(i)); p.setY(i, m > .15 ? Math.max(m, 1) / 1000 + .0045 : -.02); }
      g.computeVertexNormals();
      jobs.push(new Promise(res => loader.load(`data/pnoa_${k}.jpg`, t => {
        t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = MAXANI;
        const mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: t, alphaMap: mask, transparent: true, depthWrite: false, clippingPlanes: SEA_CLIP, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
        mesh.renderOrder = 1; scene.add(mesh); res();
      }, undefined, () => res())));
    }
    return Promise.all(jobs);
  });
}
const terrainReady = fetch("data/height640.png").then(r => r.blob()).then(b => createImageBitmap(b, { colorSpaceConversion: "none", premultiplyAlpha: "none" })).then(bmp => {
  // heights are packed in a lossless PNG: R = high byte, G = low byte (decimetres + 100 m)
  const c = document.createElement("canvas"); c.width = c.height = HN; const cx = c.getContext("2d", { willReadFrequently: true, colorSpace: "srgb" });
  cx.drawImage(bmp, 0, 0); const d = cx.getImageData(0, 0, HN, HN).data;
  HGT = new Uint16Array(HN * HN); for (let i = 0; i < HN * HN; i++) HGT[i] = (d[i * 4] << 8) | d[i * 4 + 1];
  const step = NARROW ? 2 : 1, n = HN / step;
  const g = new THREE.PlaneGeometry(TB.x1 - TB.x0, TB.z1 - TB.z0, n - 1, n - 1).rotateX(-Math.PI / 2);
  g.translate((TB.x0 + TB.x1) / 2, 0, (TB.z0 + TB.z1) / 2);
  const pos = g.attributes.position;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const m = HGT[(i * step) * HN + j * step] / 10 - 100;
    pos.setY(i * n + j, m > .15 ? Math.max(m, 1) / 1000 + .003 : -.02);
  }
  g.computeVertexNormals();
  const terrain = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ map: satTex, clippingPlanes: SEA_CLIP }));
  scene.add(terrain); placeLights();
  return addPatches();
}).then(() => thumbsReady());

// ---- ocean: real-scale waves over the satellite's own shallows
const ocean = new THREE.Mesh(new THREE.PlaneGeometry(3600, 3600, 1, 1).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
    uniforms: { ...U, uSat: { value: loader.load("data/sat_2k.jpg", t => { t.colorSpace = THREE.SRGBColorSpace; }) }, uShallow: { value: shallowTex }, uB: { value: new THREE.Vector4(TB.x0, TB.x1, TB.z0, TB.z1) } },
  vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `
    uniform vec3 uSun, uZenith, uHorizon, uSunCol; uniform float uTime, uNight, uGold; uniform sampler2D uSat, uShallow; uniform vec4 uB; varying vec3 vW;
    vec2 g = vec2(0.); float fpm;
    void wave(vec2 p, vec2 d, float lambda, float slope, float speed){
      float k = 6.2831 / lambda; float att = 1. - smoothstep(.05, .28, fpm / lambda);
      g += d * cos(dot(p, d) * k + uTime * speed) * slope * att;
    }
    void main(){
      vec2 p = vW.xz * 1000.;
      fpm = length(fwidth(vW.xz)) * 1000.;
      float slick = .55 + .45 * sin(vW.x * .9 + sin(vW.z * .7) * 2.) * sin(vW.z * 1.3 + 1.7);
      wave(p, normalize(vec2(1., .3)), 74., .10, .9);
      wave(p, normalize(vec2(-.4, 1.)), 41., .08, 1.3);
      wave(p, normalize(vec2(.7, -.8)), 23., .07, 1.8);
      wave(p, normalize(vec2(-.9, -.2)), 12., .05, 2.6);
      wave(p, normalize(vec2(.2, .9)), 6.5, .04, 3.4);
      g *= slick;
      vec3 n = normalize(vec3(-g.x, 1., -g.y));
      vec3 V = normalize(cameraPosition - vW);
      float dist = length(cameraPosition - vW);
      float fres = .02 + .98 * pow(1. - max(dot(n, V), 0.), 5.);
      vec3 R = reflect(-V, n);
      vec3 skyc = mix(uHorizon, uZenith, pow(max(R.y, 0.), .45));
      vec2 uv = vec2((vW.x - uB.x) / (uB.y - uB.x), 1. - (vW.z - uB.z) / (uB.w - uB.z));
      bool inside = uv.x > 0. && uv.x < 1. && uv.y > 0. && uv.y < 1.;
      float sh = inside ? texture2D(uShallow, uv).r : 0.;
      vec3 sat = inside ? texture2D(uSat, uv).rgb : vec3(0.);
      vec3 deep = mix(vec3(.015, .09, .16), vec3(.01, .025, .06), uNight);
      vec3 body = mix(deep, sat * mix(1.08, .25, uNight), smoothstep(.1, .8, sh) * .85);
      body *= mix(1., .8, uGold);
      vec3 col = mix(body, skyc, fres * .8);
      float spec = pow(max(dot(R, uSun), 0.), 240.) * 4. + pow(max(dot(R, uSun), 0.), 24.) * .3 * uGold;
      col += uSunCol * spec * (1. - uNight * .9);
      col = mix(col, uHorizon, smoothstep(40., 700., dist));
      gl_FragColor = vec4(col, 1.);
    }`,
}));
scene.add(ocean);

// ---- town lights for the night, sitting on the real terrain
const TOWNS = ["eivissa", "botafoch", "bossa", "santantoni", "santaeul", "santjosep", "santjoan", "savina", "cubells", "airport"];
const lightsMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: U,
  vertexShader: `attribute float s; uniform float uNight; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); gl_PointSize = s * 70. / -mv.z + 1.5; vA = uNight; gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, 0., d); gl_FragColor = vec4(1., .78, .5, a * vA); }` });
function placeLights() {
  const pos = [], size = [];
  for (const k of TOWNS) { const c = P(k); const n = k === "eivissa" || k === "santantoni" ? 110 : 40; for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, r = Math.random() ** .6 * (n > 60 ? 1.3 : .6); const x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r * .8, h = heightAt(x, z); if (h < 1) continue; pos.push(x, h / 1000 + .012, z); size.push(.6 + Math.random()); } }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("s", new THREE.Float32BufferAttribute(size, 1));
  scene.add(new THREE.Points(g, lightsMat));
}

const sun = new THREE.DirectionalLight("#fff", 1.1); scene.add(sun);
const hemi = new THREE.HemisphereLight("#ffffff", "#8a7a60", 1.6); scene.add(hemi);

// ---- time of day
const C = (h) => new THREE.Color(h);
const PAL = {
  day:   { z: C("#2f6fa6"), h: C("#cfe2ea"), s: C("#fff4df") },
  gold:  { z: C("#334f7a"), h: C("#f0b07a"), s: C("#ffb26b") },
  night: { z: C("#030812"), h: C("#0c1a2c"), s: C("#ff8a4a") },
};
const tmp = new THREE.Color();
function setTime(t) {
  const gold = smooth(.45, .66, t) * (1 - smooth(.8, .95, t)), night = smooth(.78, .97, t);
  const el = THREE.MathUtils.degToRad(60 * Math.pow(1 - t, 1.25) - 6), az = THREE.MathUtils.degToRad(lerp(50, -100, t));
  U.uSun.value.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize();
  const mix3 = (k, out) => out.copy(PAL.day[k]).lerp(PAL.gold[k], gold).lerp(PAL.night[k], night);
  mix3("z", U.uZenith.value); mix3("h", U.uHorizon.value); mix3("s", U.uSunCol.value);
  U.uGold.value = gold; U.uNight.value = night;
  sun.position.copy(U.uSun.value).multiplyScalar(100); sun.color.copy(U.uSunCol.value); sun.intensity = lerp(1.1, .02, night) * (1 + .4 * gold);
  hemi.color.set("#ffffff").lerp(U.uHorizon.value, .35 + .4 * gold); hemi.intensity = lerp(1.6, .09, night) * (1 - .25 * gold);
  renderer.toneMappingExposure = lerp(1, .85, night);
}

/* =====================================================================
   CAMERA PATH: Catmull-Rom through the keyframes, with holds on each scene
   ===================================================================== */
const N = SCENES.length;
const posCurve = new THREE.CatmullRomCurve3(SCENES.map(s => new THREE.Vector3(...s.pos)), false, "centripetal", .5);
const lookCurve = new THREE.CatmullRomCurve3(SCENES.map(s => new THREE.Vector3(...s.look)), false, "centripetal", .5);
const HOLD = .3; // fraction of each leg where the camera rests so the copy can be read
function warp(u) { const i = Math.min(N - 2, Math.floor(u)), f = u - i; const e = f < HOLD / 2 ? 0 : f > 1 - HOLD / 2 ? 1 : smooth(0, 1, (f - HOLD / 2) / (1 - HOLD)); return i + e; }
const cam = { p: new THREE.Vector3(...SCENES[0].pos), l: new THREE.Vector3(...SCENES[0].look) };
const want = { p: new THREE.Vector3(), l: new THREE.Vector3() };
let progress = 0, shown = 0, todNow = SCENES[0].tod;
function sampleAt(prog, outP, outL) {
  const u = warp(clamp(prog) * (N - 1)), t = u / (N - 1);
  posCurve.getPoint(t, outP); lookCurve.getPoint(t, outL);
  const i = Math.min(N - 2, Math.floor(u)); return lerp(SCENES[i].tod, SCENES[i + 1].tod, u - i);
}

/* =====================================================================
   SCROLL
   ===================================================================== */
const journey = document.getElementById("journey");
let lenis = null;
gsap.registerPlugin(ScrollTrigger);
if (!REDUCED && window.Lenis) {
  lenis = new Lenis({ lerp: .085, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
}
ScrollTrigger.create({ trigger: journey, start: "top top", end: "bottom bottom", onUpdate: s => { progress = s.progress; } });
const scrollToScene = (k) => {
  const top = journey.offsetTop, len = journey.offsetHeight - innerHeight;
  const y = top + len * (k / (N - 1));
  lenis ? lenis.scrollTo(y, { duration: 2.2 }) : scrollTo({ top: y, behavior: REDUCED ? "auto" : "smooth" });
};

/* ---- panels, pin, nav label, progress rail ---- */
const panels = [...document.querySelectorAll(".panel")];
const navWhere = document.getElementById("navWhere"), rail = document.getElementById("railFill");
const pinsEl = document.getElementById("pins");
const pin = document.createElement("div"); pin.className = "pin"; pin.innerHTML = "<b></b><i></i><s></s>"; pinsEl.append(pin);
let activeScene = -1;
function updateUI() {
  const u = clamp(progress) * (N - 1), k = Math.round(u), near = Math.abs(u - k) < HOLD * .62 || progress < .02;
  const scene = near ? k : -1;
  if (scene !== activeScene) {
    activeScene = scene;
    panels.forEach(p => p.classList.toggle("is-on", +p.dataset.scene === scene));
    if (scene >= 0) navWhere.textContent = SCENES[scene].where;
    const pl = scene >= 0 && SCENES[scene].place;
    pin.classList.toggle("is-on", !!pl); if (pl) pin.querySelector("b").textContent = PLACES[pl].name;
    document.querySelectorAll(".menu__list ol a, .menu__mapPins a").forEach(a => a.classList.toggle("is-hot", +a.dataset.scene === scene));
  }
  rail.style.height = (clamp(progress) * 100).toFixed(2) + "%";
}
const v3 = new THREE.Vector3();
function placePin() {
  if (activeScene < 0 || !SCENES[activeScene].place) return;
  const q = P(SCENES[activeScene].place); v3.set(q.x, .12, q.z).project(camera);
  pin.style.transform = `translate(${(v3.x * .5 + .5) * innerWidth}px, ${(-v3.y * .5 + .5) * innerHeight}px) translate(-50%, -100%)`;
  pin.style.visibility = v3.z < 1 ? "visible" : "hidden";
}

/* ---- venues: real clubs, beach clubs and beaches pinned on the terrain ---- */
const KIND = { club: "Club", beachclub: "Beach club", beach: "Playa" };
const venues = []; const show = { club: true, beachclub: true, beach: true };
const venueLayer = document.createElement("div"); venueLayer.className = "venues"; document.body.append(venueLayer);
const pop = document.getElementById("venuePop");
fetch("data/places.json").then(r => r.json()).then(list => {
  for (const v of list) {
    const q = proj([v.lon, v.lat]); const el = document.createElement("button");
    el.type = "button"; el.className = `venue venue--${v.type}`; el.innerHTML = `<i></i><span>${v.name}</span>`; el.setAttribute("aria-label", `${KIND[v.type]}: ${v.name}, ${v.area}`);
    el.addEventListener("click", () => openVenue(v, el)); venueLayer.append(el);
    venues.push({ v, el, p: new THREE.Vector3(q.x, (v.alt || 2) / 1000 + .01, q.z) });
  }
});
document.querySelectorAll(".legend [data-kind]").forEach(b => b.addEventListener("click", () => { const k = b.dataset.kind; show[k] = !show[k]; b.setAttribute("aria-pressed", show[k]); }));
const vv = new THREE.Vector3(); const legendEl = document.querySelector(".legend");
function placeVenues() {
  const inJourney = journey.getBoundingClientRect().bottom > innerHeight * .5;
  venueLayer.classList.toggle("is-off", !inJourney || !document.getElementById("dash").hidden);
  legendEl.classList.toggle("is-off", !inJourney || !document.getElementById("dash").hidden);
  if (!inJourney) return;
  for (const o of venues) {
    vv.copy(o.p).project(camera);
    const d = camera.position.distanceTo(o.p);
    const ok = show[o.v.type] && vv.z < 1 && Math.abs(vv.x) < 1.1 && Math.abs(vv.y) < 1.1 && d < 26;
    o.el.style.display = ok ? "" : "none"; if (!ok) continue;
    o.el.style.transform = `translate(${((vv.x * .5 + .5) * innerWidth).toFixed(1)}px, ${((-vv.y * .5 + .5) * innerHeight).toFixed(1)}px)`;
    o.el.classList.toggle("is-near", d < 7.5);
    o.el.style.zIndex = String(1000 - Math.round(d * 10));
  }
}
function openVenue(v, el) {
  pop.hidden = false;
  pop.querySelector("[data-k]").textContent = KIND[v.type] + " · " + v.area;
  pop.querySelector("h3").textContent = v.name;
  pop.querySelector("[data-c]").textContent = `${Math.abs(v.lat).toFixed(4)}°N · ${v.lon.toFixed(4)}°E`;
  const svc = v.type === "club" ? "noche" : v.type === "beachclub" ? "beach" : null;
  const b = pop.querySelector("[data-book]"); b.hidden = !svc;
  b.onclick = () => { pop.hidden = true; if (svc) select(svc, true); document.getElementById("f-notes").value = `Me interesa ${v.name} (${v.area}).`; const t = document.getElementById("contacto"); lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView(); };
  const r = el.getBoundingClientRect(); pop.style.left = Math.min(innerWidth - 300, Math.max(12, r.left - 20)) + "px"; pop.style.top = Math.max(80, r.top - 170) + "px";
}
document.addEventListener("pointerdown", e => { if (!pop.hidden && !e.target.closest("#venuePop, .venue")) pop.hidden = true; });

/* ---- render loop ---- */
const clock = new THREE.Clock();
let worldVisible = true;
new IntersectionObserver(([e]) => { worldVisible = e.isIntersecting; }, { rootMargin: "0px 0px 0px 0px" }).observe(journey);
function frame() {
  const dt = Math.min(clock.getDelta(), .05);
  U.uTime.value += dt;
  const k = REDUCED ? 1 : 1 - Math.pow(.0015, dt);
  shown = lerp(shown, progress, k);
  const tod = sampleAt(shown, want.p, want.l);
  cam.p.lerp(want.p, REDUCED ? 1 : 1 - Math.pow(.02, dt)); cam.l.lerp(want.l, REDUCED ? 1 : 1 - Math.pow(.02, dt));
  // a breath of handheld drift so the shot never feels frozen
  const br = REDUCED ? 0 : 1;
  const ang = br * Math.sin(U.uTime.value * .045) * .16, ox = cam.p.x - cam.l.x, oz = cam.p.z - cam.l.z;
  camera.position.set(cam.l.x + ox * Math.cos(ang) - oz * Math.sin(ang), cam.p.y + Math.sin(U.uTime.value * .3) * .006 * br * cam.p.y, cam.l.z + ox * Math.sin(ang) + oz * Math.cos(ang));
  camera.lookAt(cam.l);
  const near = clamp(camera.position.y * .15, .02, 8); if (Math.abs(near - camera.near) > .005) { camera.near = near; camera.updateProjectionMatrix(); }
  todNow = lerp(todNow, tod, k); setTime(todNow);
  updateUI(); placePin(); placeVenues();
  if (worldVisible || document.getElementById("dash").hidden === false) renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
addEventListener("resize", () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight, false); ScrollTrigger.refresh(); });

/* =====================================================================
   2D MAPS (menu, services stage, client area) from the same coastline
   ===================================================================== */
const MB = { lon0: 1.17, lon1: 1.66, lat0: 38.62, lat1: 39.14 };
function svgXY([lon, lat]) {
  const w = (MB.lon1 - MB.lon0) * KX, h = (MB.lat1 - MB.lat0) * KZ, s = 100 / Math.max(w, h);
  return [(100 - w * s) / 2 + (lon - MB.lon0) * KX * s, (100 - h * s) / 2 + (MB.lat1 - lat) * KZ * s];
}
const coastPath = () => COAST.map(r => "M" + r.map(ll => svgXY(ll).map(n => n.toFixed(2)).join(",")).join("L") + "Z").join("");
for (const id of ["menuMap", "stageMap", "dashMap"]) { const s = document.getElementById(id); s.innerHTML = `<path class="land" d="${coastPath()}"/>`; }

/* ---- menu: pill unfolds into the island ---- */
const menu = document.getElementById("menu"), menuBtn = document.getElementById("menuBtn"), sheet = menu.querySelector(".menu__sheet");
const menuPins = document.getElementById("menuPins");
SCENES.forEach((s, i) => { if (!s.place) return; const [x, y] = svgXY(PLACES[s.place].ll); const a = document.createElement("a"); a.href = "#top"; a.dataset.scene = i; a.style.left = x + "%"; a.style.top = y + "%"; a.setAttribute("aria-label", PLACES[s.place].name); menuPins.append(a); });
function openMenu(open) {
  menuBtn.setAttribute("aria-expanded", open); menuBtn.querySelector(".nav__label").textContent = open ? "Cerrar" : "Menú";
  if (open) {
    menu.hidden = false; lenis?.stop();
    gsap.fromTo(sheet, { clipPath: "inset(0% 30% 92% 30% round 40px)", opacity: .4 }, { clipPath: "inset(0% 0% 0% 0% round 34px)", opacity: 1, duration: REDUCED ? 0 : .9, ease: "expo.out" });
    gsap.fromTo(sheet.querySelectorAll(".menu__list li, .menu__more > *, .menu__map"), { y: 18, opacity: 0 }, { y: 0, opacity: 1, stagger: .04, duration: REDUCED ? 0 : .7, ease: "expo.out", delay: .12 });
  } else {
    lenis?.start();
    gsap.to(sheet, { clipPath: "inset(0% 30% 92% 30% round 40px)", opacity: 0, duration: REDUCED ? 0 : .5, ease: "expo.in", onComplete: () => { menu.hidden = true; } });
  }
}
menuBtn.addEventListener("click", () => openMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
menu.addEventListener("click", e => {
  const a = e.target.closest("a"); if (e.target === menu) return openMenu(false);
  if (!a) return;
  if (a.dataset.scene != null) { e.preventDefault(); openMenu(false); scrollToScene(+a.dataset.scene); }
  else { e.preventDefault(); openMenu(false); const t = document.querySelector(a.getAttribute("href")); lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView(); }
});
addEventListener("keydown", e => { if (e.key === "Escape") { if (!menu.hidden) openMenu(false); closeModal(); } });
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
  if (a.closest(".menu")) return; const id = a.getAttribute("href"); if (id === "#top" && a.dataset.scene == null) { e.preventDefault(); scrollToScene(0); return; }
  const t = id.length > 1 && document.querySelector(id); if (!t) return; e.preventDefault(); lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
  if (a.dataset.svc) select(a.dataset.svc, true);
}));
// dock: the wide bar tightens into a pill once you start travelling
const nav = document.getElementById("nav");
document.querySelectorAll(".sec--ivory, .sec--sand").forEach(sec => ScrollTrigger.create({ trigger: sec, start: "top 40px", end: "bottom 40px", toggleClass: { targets: nav, className: "nav--light" } }));
ScrollTrigger.create({ start: 80, end: "max", onToggle: s => nav.classList.toggle("is-docked", s.isActive) });

/* ---- liquid glass highlight follows the pointer ---- */
addEventListener("pointermove", e => {
  const el = e.target.closest?.(".btn--glass, .lg"); if (!el) return;
  const r = el.getBoundingClientRect(); el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%"); el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
}, { passive: true });

/* =====================================================================
   SERVICES STAGE: cards pinned to real places, moving with the pointer
   ===================================================================== */
const SERVICES = [
  { id: "motos",    name: "Motos de agua", line: "Rutas guiadas autorizadas",    place: "bassa",    col: 0, row: 0, scene: 3 },
  { id: "coches",   name: "Coches",        line: "Entregados en tu villa",       place: "hort",     col: 0, row: 1, scene: 4 },
  { id: "transfers",name: "Transfers",     line: "Chófer privado con licencia",  place: "airport",  col: 0, row: 2, scene: 6 },
  { id: "villas",   name: "Villas",        line: "Con licencia y vistas al mar", place: "cubells",  col: 0, row: 3, scene: 1 },
  { id: "yates",    name: "Yates",         line: "Con patrón y tripulación",     place: "botafoch", col: 1, row: 0, scene: 2 },
  { id: "dining",   name: "Fine dining",   line: "Mesas y chef privado",         place: "eivissa",  col: 1, row: 1, scene: 5 },
  { id: "noche",    name: "Clubs y VIP",   line: "Mesas, entradas y listas",     place: "bossa",    col: 1, row: 2, scene: 6 },
  { id: "beach",    name: "Beach clubs",   line: "Hamacas y camas reservadas",   place: "salines",  col: 1, row: 3, scene: 6 },
];
const stage = document.getElementById("stage"), cardsLayer = document.getElementById("stageCards");
const box = document.createElement("div"); box.className = "stage__box"; cardsLayer.append(box);
const lines = document.createElementNS("http://www.w3.org/2000/svg", "svg"); lines.setAttribute("viewBox", "0 0 100 100"); lines.setAttribute("class", "stage__lines"); box.append(lines);
const COLX = [-22, 122], ROWY = [11, 37, 63, 89];
for (const s of SERVICES) {
  const [x, y] = svgXY(PLACES[s.place].ll), cx = COLX[s.col], cy = ROWY[s.row];
  const a = document.createElement("a"); a.className = "svc"; a.href = "#contacto"; a.dataset.svc = s.id;
  a.style.left = cx + "%"; a.style.top = cy + "%";
  a.innerHTML = `<div class="svc__card"><div class="svc__img" data-scene="${s.scene}"><small>${PLACES[s.place].name}</small></div><h3>${s.name}</h3><p>${s.line}</p></div>`;
  box.append(a);
  const ex = s.col ? cx - 14 : cx + 14;
  lines.insertAdjacentHTML("beforeend", `<path d="M${ex},${cy} C${(ex + x) / 2},${cy} ${(ex + x) / 2},${y} ${x},${y}" /><circle cx="${x}" cy="${y}" r=".9"/>`);
  a.addEventListener("click", () => select(s.id, true));
}
{ // pointer-follow: every layer eases toward the cursor at its own depth
  const layers = [...stage.querySelectorAll(".stage__layer")]; let tx = 0, ty = 0, x = 0, y = 0, live = false;
  stage.addEventListener("pointermove", e => { const r = stage.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5; stage.style.setProperty("--gx", (tx + .5) * 100 + "%"); stage.style.setProperty("--gy", (ty + .5) * 100 + "%"); });
  stage.addEventListener("pointerleave", () => { tx = ty = 0; });
  new IntersectionObserver(([e]) => { live = e.isIntersecting; }).observe(stage);
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  (function loop() {
    if (live && fine && !REDUCED) {
      x += (tx - x) * .09; y += (ty - y) * .09;
      for (const l of layers) { const d = +l.dataset.depth; l.style.transform = `translate3d(${(-x * 90 * d).toFixed(2)}px, ${(-y * 70 * d).toFixed(2)}px, 0) rotateX(${(y * 4 * d).toFixed(2)}deg) rotateY(${(-x * 6 * d).toFixed(2)}deg)`; }
    }
    requestAnimationFrame(loop);
  })();
}
// thumbnails rendered from the real map at each service's place (until your own photos replace them)
function renderThumbs() {
  const saved = { p: camera.position.clone(), q: camera.quaternion.clone(), t: todNow };
  const w = 480, h = 360, o = new THREE.Vector3(), l = new THREE.Vector3();
  const rt = new THREE.WebGLRenderTarget(w, h, { samples: 4 }); const px = new Uint8Array(w * h * 4);
  const cA = camera.aspect; camera.aspect = w / h; camera.updateProjectionMatrix();
  document.querySelectorAll(".svc__img[data-scene]").forEach(box => {
    const sc = SCENES[+box.dataset.scene]; o.set(...sc.pos); l.set(...sc.look);
    camera.position.copy(o); camera.lookAt(l); setTime(sc.tod);
    renderer.setRenderTarget(rt); renderer.render(scene, camera); renderer.readRenderTargetPixels(rt, 0, 0, w, h, px); renderer.setRenderTarget(null);
    const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); const id = g.createImageData(w, h);
    for (let yy = 0; yy < h; yy++) id.data.set(px.subarray((h - 1 - yy) * w * 4, (h - yy) * w * 4), yy * w * 4);
    g.putImageData(id, 0, 0); box.prepend(c);
  });
  rt.dispose(); camera.aspect = cA; camera.updateProjectionMatrix(); camera.position.copy(saved.p); camera.quaternion.copy(saved.q); setTime(saved.t);
}

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
  const t = document.getElementById("contacto"); lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView();
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
document.getElementById("loginOpen").addEventListener("click", () => { openMenu(false); modal.hidden = false; document.getElementById("l-email").focus(); });
modal.addEventListener("click", e => { if (e.target === modal || e.target.closest("[data-close]")) closeModal(); });
document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault(); const em = document.getElementById("l-email").value.trim();
  closeModal(); openDash(em.split("@")[0] || "invitado");
});
document.getElementById("logout").addEventListener("click", () => { dash.hidden = true; lenis?.start(); document.body.style.overflow = ""; });
function status(d, i) {
  if (d < TODAY) return "done"; if (d > TODAY) return "next";
  const h = new Date().getHours() + new Date().getMinutes() / 60; const [eh, em] = PLAN[d].ev[i][0].split(":").map(Number); const t = eh + em / 60;
  const nxt = PLAN[d].ev.findIndex(x => { const [a, b] = x[0].split(":").map(Number); return a + b / 60 > h; });
  return t <= h ? (i === nxt - 1 || (nxt === -1 && i === PLAN[d].ev.length - 1) ? "now" : "done") : "next";
}
function openDash(name) {
  dash.hidden = false; lenis?.stop(); document.body.style.overflow = "hidden";
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
  const map = document.getElementById("dashMap"); map.innerHTML = `<path class="land" d="${coastPath()}"/>`;
  const pts = [];
  PLAN[d].ev.forEach(([time, title, where, place, icon], j) => {
    const s = status(d, j);
    ol.insertAdjacentHTML("beforeend", `<li class="ev ev--${s}" style="--i:${j}"><span class="ev__dot"><svg viewBox="0 0 24 24" aria-hidden="true">${s === "done" ? ICON.check : ICON[icon]}</svg></span><div class="ev__card"><div class="ev__meta"><span>${time}</span><span>${PLACES[place].name}</span><span class="ev__state">${s === "done" ? "Completado" : s === "now" ? "En curso" : "Confirmado"}</span></div><h4>${title}</h4><p>${where}</p></div></li>`);
    pts.push([...svgXY(PLACES[place].ll), s, PLACES[place].name]);
  });
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("class", "route"); path.setAttribute("d", "M" + pts.map(p => p[0].toFixed(2) + "," + p[1].toFixed(2)).join("L")); map.append(path);
  pts.forEach(([x, y, s, n], i) => map.insertAdjacentHTML("beforeend", `<circle class="mk mk--${s}" cx="${x}" cy="${y}" r="1.4"/><text x="${x + 2.2}" y="${y + 1 + (i % 2) * 2.4}">${n}</text>`));
  if (!REDUCED) gsap.fromTo(path, { strokeDashoffset: 60 }, { strokeDashoffset: 0, duration: 2, ease: "power2.out" });
}

/* ---- go ---- */
setTime(SCENES[0].tod);
renderer.compile(scene, camera);
requestAnimationFrame(frame);
let thumbsDone = false;
function thumbsReady() { Promise.resolve().then(() => { if (thumbsDone) return; thumbsDone = true; setTimeout(() => { try { renderThumbs(); } catch (err) { console.warn(err); } }, 300); }); }
