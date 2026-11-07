/* Cartoon 3D map of Ibiza & Formentera.
   Real coastline and relief (IGN MDT25), stylised: toon shading, ink outlines,
   a diorama sea, clouds and boats. Orbit / pan / zoom, and big, declustered tap
   targets so neighbouring clubs can always be picked. */
import * as THREE from "./vendor/three.module.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

const BB = { lon0: 1.17, lon1: 1.65, lat0: 38.63, lat1: 39.13 };
const C = { lon: 1.405, lat: 38.875 };                       // scene origin (between Ibiza and Formentera)
const KX = 111.32 * Math.cos(38.88 * Math.PI / 180), KZ = 110.57;
export const toXZ = (lon, lat) => ({ x: (lon - C.lon) * KX, z: -(lat - C.lat) * KZ });
const EXAG = 4, INK = "#0d0a38";
const KIND_COL = { club: "#ab50db", beachclub: "#78c7e4", beach: "#ffd76a" };

function toonRamp() {
  const d = new Uint8Array([70, 70, 70, 255, 160, 160, 160, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
}
// ink outline: an inverted hull pushed out along the normals
function outline(geo, width, color = INK) {
  const m = new THREE.MeshBasicMaterial({ color, side: THREE.BackSide });
  m.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", `vec3 transformed = position + normal * ${width.toFixed(3)};`); };
  return new THREE.Mesh(geo, m);
}
async function loadHeights(url) {
  const bmp = await createImageBitmap(await (await fetch(url)).blob(), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  const n = bmp.width, c = document.createElement("canvas"); c.width = c.height = n; const cx = c.getContext("2d", { willReadFrequently: true });
  cx.drawImage(bmp, 0, 0); const d = cx.getImageData(0, 0, n, n).data, h = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) h[i] = ((d[i * 4] << 8) | d[i * 4 + 1]) / 10 - 100;
  return { n, h };
}
function sampler(H) {
  return (lon, lat) => {
    const u = (lon - BB.lon0) / (BB.lon1 - BB.lon0) * (H.n - 1), v = (BB.lat1 - lat) / (BB.lat1 - BB.lat0) * (H.n - 1);
    if (u < 0 || v < 0 || u > H.n - 1 || v > H.n - 1) return -20;
    const j = Math.min(H.n - 2, Math.floor(u)), i = Math.min(H.n - 2, Math.floor(v)), fu = u - j, fv = v - i, a = H.h, n = H.n;
    return (a[i * n + j] * (1 - fu) + a[i * n + j + 1] * fu) * (1 - fv) + (a[(i + 1) * n + j] * (1 - fu) + a[(i + 1) * n + j + 1] * fu) * fv;
  };
}

export async function initMap3D(el, { venues, mapJson, onPick, onList, onEmpty }) {
  const small = matchMedia("(max-width: 900px)").matches, reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.6 : 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.prepend(renderer.domElement); renderer.domElement.className = "map3d__gl";
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(34, 1, .5, 600);
  const ramp = toonRamp();
  scene.add(new THREE.HemisphereLight("#ffffff", "#7a6bd0", 1.1));
  const sun = new THREE.DirectionalLight("#fff6e0", 2.4); sun.position.set(30, 60, 25); scene.add(sun);

  const H = await loadHeights("data/height1024.png"), hAt = sampler(H);
  const yAt = (lon, lat) => { const m = hAt(lon, lat); return m > .4 ? Math.max(m, 2) * EXAG / 1000 + .06 : -.9; };

  // ---- the island: real relief, cartoon colours, ink silhouette ----
  {
    const N = small ? 170 : 240, lonSpan = BB.lon1 - BB.lon0, latSpan = BB.lat1 - BB.lat0;
    const a = toXZ(BB.lon0, BB.lat1), b = toXZ(BB.lon1, BB.lat0);
    const g = new THREE.PlaneGeometry(b.x - a.x, b.z - a.z, N - 1, N - 1).rotateX(-Math.PI / 2); g.translate((a.x + b.x) / 2, 0, (a.z + b.z) / 2);
    const pos = g.attributes.position, uv = g.attributes.uv, col = new Float32Array(pos.count * 3);
    const SAND = new THREE.Color("#ffd98a"), GRASS = new THREE.Color("#63d36a"), FOREST = new THREE.Color("#2fa25c"), ROCK = new THREE.Color("#c08f63"), PEAK = new THREE.Color("#f3e3cf"), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const lon = BB.lon0 + uv.getX(i) * lonSpan, lat = BB.lat0 + uv.getY(i) * latSpan, m = hAt(lon, lat);
      pos.setY(i, yAt(lon, lat));
      if (m < 14) c.copy(SAND); else if (m < 110) c.copy(GRASS).lerp(FOREST, (m - 14) / 96 * .6); else if (m < 260) c.copy(FOREST); else if (m < 380) c.copy(ROCK); else c.copy(PEAK);
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    scene.add(new THREE.Mesh(g, new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: ramp })));
    scene.add(outline(g, .12));
  }
  // ---- coastline ink + foam, from the same real coast ----
  {
    const W = mapJson.w, SX = W / ((BB.lon1 - BB.lon0) * Math.cos(38.88 * Math.PI / 180));
    const toLL = (x, y) => [BB.lon0 + x / (Math.cos(38.88 * Math.PI / 180) * SX), BB.lat1 - y / SX];
    const ribbon = (pts, w, y, color) => {
      const p = [], idx = [];
      for (let i = 0; i < pts.length; i++) {
        const A = pts[Math.max(0, i - 1)], B = pts[Math.min(pts.length - 1, i + 1)], dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz) || 1, nx = -dz / L * w, nz = dx / L * w;
        p.push(pts[i].x - nx, y, pts[i].z - nz, pts[i].x + nx, y, pts[i].z + nz);
        if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
      }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.setIndex(idx);
      return new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: color === "#ffffff", opacity: color === "#ffffff" ? .85 : 1 }));
    };
    for (const d of mapJson.coast) {
      const pts = d.replace(/Z$/, "").slice(1).split("L").map(s => { const [x, y] = s.split(",").map(Number); const [lon, lat] = toLL(x, y); return toXZ(lon, lat); });
      if (pts.length < 8) continue; pts.push(pts[0]);
      const foam = ribbon(pts, .32, .015, "#ffffff"); foam.renderOrder = 1; scene.add(foam);
      scene.add(ribbon(pts, .07, .04, INK));
    }
  }
  // ---- the sea: a round diorama plate with cartoon waves ----
  const R = 40;
  const seaU = { uTime: { value: 0 } };
  {
    const top = new THREE.Mesh(new THREE.CircleGeometry(R, 96).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: seaU,
      vertexShader: `varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
      fragmentShader: `uniform float uTime; varying vec2 vP;
        void main(){ float r = length(vP); vec3 deep = vec3(.10,.55,.86), light = vec3(.33,.80,.96);
          vec3 c = mix(light, deep, smoothstep(6., 36., r));
          float w = sin(vP.x * .9 + uTime * 1.2) * sin(vP.y * .7 - uTime * .9) + sin((vP.x + vP.y) * .5 + uTime * .6);
          c += vec3(.9) * step(1.55, w) * .22;                                   // little cartoon wave crests
          c = mix(c, vec3(1.), smoothstep(R_IN, ${(R - .2).toFixed(1)}, r) * .5);  // rim highlight
          gl_FragColor = vec4(c, 1.); }`.replace("R_IN", (R - 1.6).toFixed(1)) }));
    scene.add(top);
    const side = new THREE.Mesh(new THREE.CylinderGeometry(R, R * .97, 3.2, 96, 1, true), new THREE.MeshToonMaterial({ color: "#1e24bb", gradientMap: ramp, side: THREE.DoubleSide }));
    side.position.y = -1.6; scene.add(side);
    const base = new THREE.Mesh(new THREE.CircleGeometry(R * .97, 96).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#292467" })); base.position.y = -3.2; scene.add(base);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, .18, 8, 128).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: INK })); scene.add(ring);
    const ring2 = ring.clone(); ring2.position.y = -3.2; ring2.scale.setScalar(.97); scene.add(ring2);
  }
  // ---- clouds and boats ----
  const toon = col => new THREE.MeshToonMaterial({ color: col, gradientMap: ramp });
  const clouds = [];
  for (let i = 0; i < (small ? 4 : 7); i++) {
    const g = new THREE.Group(), sph = new THREE.SphereGeometry(1, 16, 12);
    [[0, 0, 0, 1.4], [1.3, -.2, .2, 1], [-1.2, -.25, -.1, 1.05], [.4, .5, -.3, .95]].forEach(([x, y, z, s]) => { const m = new THREE.Mesh(sph, toon("#ffffff")); m.position.set(x, y, z); m.scale.setScalar(s); g.add(m); const o = outline(sph, .07); o.position.copy(m.position); o.scale.copy(m.scale); g.add(o); });
    const a = i / 7 * Math.PI * 2; g.position.set(Math.cos(a) * (14 + i * 2.5), 9 + (i % 3) * 1.6, Math.sin(a) * (14 + i * 2.5)); g.userData = { a, r: 14 + i * 2.5, v: .015 + (i % 3) * .006 };
    scene.add(g); clouds.push(g);
  }
  const boats = [];
  for (const [r, v, phase] of [[19, .05, 0], [24, -.035, 2], [15.5, .045, 4]]) {
    const g = new THREE.Group(), hull = new THREE.BoxGeometry(1.4, .38, .6), cab = new THREE.BoxGeometry(.6, .36, .44);
    const h = new THREE.Mesh(hull, toon("#ffffff")); h.position.y = .2; g.add(h); const ho = outline(hull, .05); ho.position.y = .2; g.add(ho);
    const k = new THREE.Mesh(cab, toon("#c856e6")); k.position.set(-.15, .55, 0); g.add(k); const ko = outline(cab, .04); ko.position.copy(k.position); g.add(ko);
    g.userData = { r, v, a: phase }; scene.add(g); boats.push(g);
  }

  // ---- pins ----
  const pins = [], head = new THREE.SphereGeometry(.42, 20, 14), stem = new THREE.CylinderGeometry(.07, .07, 1, 8);
  const layer = document.createElement("div"); layer.className = "map3d__pins"; el.append(layer);
  for (const v of venues) {
    const p = toXZ(v.lon, v.lat), y = Math.max(.05, yAt(v.lon, v.lat));
    const g = new THREE.Group(); g.position.set(p.x, y, p.z);
    const s = new THREE.Mesh(stem, toon("#ffffff")); s.scale.y = 1.4; s.position.y = .7; g.add(s);
    const hm = new THREE.Mesh(head, toon(KIND_COL[v.type])); hm.position.y = 1.55; g.add(hm);
    const ho = outline(head, .08); ho.position.y = 1.55; g.add(ho);
    scene.add(g);
    const btn = document.createElement("button"); btn.type = "button"; btn.className = `map3d__pin map3d__pin--${v.type}`;
    btn.setAttribute("aria-label", v.name); btn.innerHTML = `<span class="map3d__label">${v.name}</span>`;
    btn.addEventListener("click", e => { e.stopPropagation(); onPick(v, btn); });
    layer.append(btn);
    pins.push({ v, g, btn, head: hm, on: true, base: y });
  }
  const clusterEls = [];

  // ---- camera & controls ----
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .08; controls.minDistance = 2.2; controls.maxDistance = 110;
  controls.maxPolarAngle = 1.32; controls.minPolarAngle = .15; controls.screenSpacePanning = false; controls.zoomToCursor = true;
  controls.enableZoom = false; controls.autoRotate = !reduced; controls.autoRotateSpeed = .45;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  const HOME = { pos: new THREE.Vector3(10, 44, 48), target: new THREE.Vector3(0, 0, -3) };
  camera.position.copy(HOME.pos); controls.target.copy(HOME.target);
  // wheel zoom only once the visitor engages the map, so the page still scrolls past it
  const engage = () => { controls.enableZoom = true; controls.autoRotate = false; };
  renderer.domElement.addEventListener("pointerdown", engage);
  el.addEventListener("pointerleave", () => { controls.enableZoom = false; });
  renderer.domElement.addEventListener("click", () => onEmpty?.());

  function fly(target, dist, dur = 1.1) {
    controls.autoRotate = false;
    const dir = camera.position.clone().sub(controls.target).normalize();
    if (dir.y < .45) { dir.y = .62; dir.normalize(); }
    const to = target.clone().add(dir.multiplyScalar(dist)), from = camera.position.clone(), t0 = controls.target.clone(), start = performance.now();
    const step = now => { const k = Math.min(1, (now - start) / (dur * 1000)), e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(from, to, e); controls.target.lerpVectors(t0, target, e); if (k < 1) requestAnimationFrame(step); };
    reduced ? (camera.position.copy(to), controls.target.copy(target)) : requestAnimationFrame(step);
  }

  // ---- loop: render, project pins, declutter into clusters ----
  const v3 = new THREE.Vector3(); let W = 1, Hh = 1, visible = true, t = 0, last = performance.now();
  const resize = () => { W = el.clientWidth; Hh = el.clientHeight; renderer.setSize(W, Hh, false); camera.aspect = W / Hh; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(el); resize();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(el);
  const screen = new Map();
  function project() {
    const pts = [];
    for (const p of pins) {
      if (!p.on) { p.btn.hidden = true; continue; }
      v3.set(p.g.position.x, p.g.position.y + 1.55 * p.g.scale.y, p.g.position.z).project(camera);
      const x = (v3.x * .5 + .5) * W, y = (-v3.y * .5 + .5) * Hh, inView = v3.z < 1 && x > -20 && x < W + 20 && y > -20 && y < Hh + 20;
      screen.set(p.v, { x, y, inView }); if (inView) pts.push({ p, x, y, z: v3.z }); else p.btn.hidden = true;
    }
    // greedy clustering: pins closer than 38 px on screen share one bubble
    const R2 = 46 * 46, groups = []; // 46 px apart = two 44 px tap targets never overlap pts.sort((a, b) => a.z - b.z);
    for (const q of pts) { const g = groups.find(g => (g.x - q.x) ** 2 + (g.y - q.y) ** 2 < R2); if (g) { g.items.push(q); g.x = (g.x * (g.items.length - 1) + q.x) / g.items.length; g.y = (g.y * (g.items.length - 1) + q.y) / g.items.length; } else groups.push({ x: q.x, y: q.y, items: [q] }); }
    const near = camera.position.distanceTo(controls.target) < 18;
    let ci = 0;
    for (const g of groups) {
      if (g.items.length === 1) { const { p, x, y } = g.items[0]; p.btn.hidden = false; p.btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; p.btn.classList.toggle("is-named", near); continue; }
      g.items.forEach(q => { q.p.btn.hidden = true; });
      let c = clusterEls[ci]; if (!c) { c = document.createElement("button"); c.type = "button"; c.className = "map3d__cluster"; layer.append(c); clusterEls.push(c);
        c.addEventListener("click", e => { e.stopPropagation(); const items = c._items; const target = new THREE.Vector3(); items.forEach(q => target.add(q.g.position)); target.divideScalar(items.length);
          const d = camera.position.distanceTo(controls.target); if (d > controls.minDistance * 1.5) fly(target, Math.max(controls.minDistance, d * .35)); else onList(items.map(q => q.v), c); }); }
      c.hidden = false; c._items = g.items.map(q => q.p); c.textContent = g.items.length;
      c.setAttribute("aria-label", `${g.items.length} lugares: ${g.items.map(q => q.p.v.name).join(", ")}`);
      const kinds = new Set(g.items.map(q => q.p.v.type)); c.dataset.kind = kinds.size === 1 ? [...kinds][0] : "mix";
      c.style.transform = `translate(${g.x.toFixed(1)}px, ${g.y.toFixed(1)}px)`; ci++;
    }
    for (; ci < clusterEls.length; ci++) clusterEls[ci].hidden = true;
  }
  let activeV = null;
  (function loop(now) {
    requestAnimationFrame(loop); if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; seaU.uTime.value = t;
    if (!reduced) {
      clouds.forEach(c => { c.userData.a += c.userData.v * dt; c.position.x = Math.cos(c.userData.a) * c.userData.r; c.position.z = Math.sin(c.userData.a) * c.userData.r; });
      boats.forEach(b => { const u = b.userData; u.a += u.v * dt * 6; b.position.set(Math.cos(u.a) * u.r, Math.sin(t * 2 + u.r) * .06, Math.sin(u.a) * u.r); b.rotation.y = -u.a + (u.v > 0 ? 0 : Math.PI); });
    }
    // pins keep roughly the same size on screen, so zooming in really separates neighbours
    const dist = camera.position.distanceTo(controls.target), ps = Math.min(1.15, Math.max(.16, dist / 46));
    pins.forEach(p => { const k = p.v === activeV ? 1 : 0; p.g.scale.setScalar(ps * (1 + k * .3)); p.g.position.y = p.base + (reduced ? 0 : k * ps * (.35 + Math.sin(t * 5) * .15)); });
    // clouds drift away as the camera comes down
    const cv = Math.min(1, Math.max(0, (dist - 26) / 14)); clouds.forEach(c => { c.visible = cv > .02; c.scale.setScalar(cv); });
    controls.update(); renderer.render(scene, camera); project();
  })(performance.now());

  return {
    screenOf: v => screen.get(v),
    setFilter(type, on) { pins.forEach(p => { if (p.v.type === type) { p.on = on; p.g.visible = on; } }); },
    setActive(v) { activeV = v; pins.forEach(p => p.btn.classList.toggle("is-active", p.v === v)); },
    flyToArea([lo0, lo1, la0, la1]) { const a = toXZ(lo0, la1), b = toXZ(lo1, la0); fly(new THREE.Vector3((a.x + b.x) / 2, 0, (a.z + b.z) / 2), Math.max(9, Math.hypot(b.x - a.x, b.z - a.z) * 1.15)); },
    flyToVenue(v) { const p = toXZ(v.lon, v.lat); fly(new THREE.Vector3(p.x, 0, p.z), 5); },
    reset() { fly(HOME.target.clone(), HOME.pos.distanceTo(HOME.target)); },
    zoom(f) { const d = camera.position.distanceTo(controls.target); fly(controls.target.clone(), Math.min(controls.maxDistance, Math.max(controls.minDistance, d * f)), .5); },
  };
}
