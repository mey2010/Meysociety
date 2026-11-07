/* Realistic 3D map of Ibiza & Formentera.
   IGN MDT25 relief draped with the IGN PNOA aerial photo (CC BY 4.0 scne.es), a living sea with sun glints,
   sky and haze. Orbit / pan / zoom with guard rails: the view always stays over the islands, never dips
   under the ground, and zooming in and out is smooth and predictable. Venues are declustered tap targets. */
import * as THREE from "./vendor/three.module.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

const BB = { lon0: 1.17, lon1: 1.65, lat0: 38.63, lat1: 39.13 };
const C = { lon: 1.405, lat: 38.875 };                       // scene origin (between Ibiza and Formentera)
const KX = 111.32 * Math.cos(38.88 * Math.PI / 180), KZ = 110.57;
export const toXZ = (lon, lat) => ({ x: (lon - C.lon) * KX, z: -(lat - C.lat) * KZ });
const EXAG = 2.6;                                            // relief x2.6: readable hills, still natural
const A = toXZ(BB.lon0, BB.lat1), B = toXZ(BB.lon1, BB.lat0); // world extent of the data (A = NW, B = SE)
const LIMIT = { x0: toXZ(1.2, 0).x, x1: toXZ(1.63, 0).x, z0: toXZ(0, 39.12).z, z1: toXZ(0, 38.64).z }; // where the view may look

async function loadHeights(url) {
  const bmp = await createImageBitmap(await (await fetch(url)).blob(), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  const n = bmp.width, c = document.createElement("canvas"); c.width = c.height = n; const cx = c.getContext("2d", { willReadFrequently: true });
  cx.drawImage(bmp, 0, 0); const d = cx.getImageData(0, 0, n, n).data, h = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) h[i] = ((d[i * 4] << 8) | d[i * 4 + 1]) / 10 - 100;
  return { n, h };
}
async function loadGray(url) {
  const bmp = await createImageBitmap(await (await fetch(url)).blob(), { colorSpaceConversion: "none" });
  const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height; const cx = c.getContext("2d", { willReadFrequently: true });
  cx.drawImage(bmp, 0, 0); const d = cx.getImageData(0, 0, c.width, c.height).data, g = new Float32Array(c.width * c.height);
  for (let i = 0; i < g.length; i++) g[i] = d[i * 4] / 255;
  return { w: c.width, h: c.height, g, canvas: c };
}
const bilinear = (arr, w, h, u, v, out = 0) => {
  if (u < 0 || v < 0 || u > 1 || v > 1) return out;
  const x = u * (w - 1), y = v * (h - 1), j = Math.min(w - 2, Math.floor(x)), i = Math.min(h - 2, Math.floor(y)), fx = x - j, fy = y - i;
  return (arr[i * w + j] * (1 - fx) + arr[i * w + j + 1] * fx) * (1 - fy) + (arr[(i + 1) * w + j] * (1 - fx) + arr[(i + 1) * w + j + 1] * fx) * fy;
};
const uvOf = (x, z) => [(x - A.x) / (B.x - A.x), (z - A.z) / (B.z - A.z)];   // v = 0 at the north edge

export async function initMap3D(el, { venues, onPick, onList, onEmpty }) {
  const small = matchMedia("(max-width: 900px)").matches, reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.75 : 2)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.05;
  el.prepend(renderer.domElement); renderer.domElement.className = "map3d__gl";
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, .05, 420);
  const HORIZON = new THREE.Color("#d7e6f4");
  { // sky: deep blue overhead fading into a pale hazy horizon
    const c = document.createElement("canvas"); c.width = 2; c.height = 256; const g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#4f8fd6"); gr.addColorStop(.55, "#9cc4ea"); gr.addColorStop(1, "#e3edf6"); g.fillStyle = gr; g.fillRect(0, 0, 2, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t;
  }
  scene.fog = new THREE.Fog(HORIZON, 70, 230);
  scene.add(new THREE.HemisphereLight("#e4f0ff", "#5a4a36", 1.7));
  const sun = new THREE.DirectionalLight("#fff0d8", 2.1); sun.position.set(-38, 34, 22); scene.add(sun);   // late-afternoon sun from the west

  const [H, M] = await Promise.all([loadHeights("data/height1024.png"), loadGray("data/mask1024.png")]);
  const hAt = (x, z) => { const [u, v] = uvOf(x, z); return bilinear(H.h, H.n, H.n, u, v, -30); };
  const maskAt = (x, z) => { const [u, v] = uvOf(x, z); return bilinear(M.g, M.w, M.h, u, v, 0); };
  const groundY = (x, z) => { const m = hAt(x, z); return m > .4 ? m * EXAG / 1000 : 0; };   // sea level = 0
  const tl = new THREE.TextureLoader();
  const ortho = await tl.loadAsync(small ? "data/ortho_lo.jpg" : "data/ortho_hi.jpg");
  ortho.colorSpace = THREE.SRGBColorSpace; ortho.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); ortho.generateMipmaps = true;
  const maskTex = new THREE.CanvasTexture(M.canvas); maskTex.colorSpace = THREE.NoColorSpace; maskTex.wrapS = maskTex.wrapT = THREE.ClampToEdgeWrapping;

  // ---- terrain: real relief, aerial photo; the sea floor slopes away under the water ----
  {
    const NX = small ? 230 : 380, NZ = Math.round(NX * (B.z - A.z) / (B.x - A.x));
    const g = new THREE.PlaneGeometry(B.x - A.x, B.z - A.z, NX - 1, NZ - 1).rotateX(-Math.PI / 2);
    g.translate((A.x + B.x) / 2, 0, (A.z + B.z) / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), m = hAt(x, z);
      pos.setY(i, m > .4 ? m * EXAG / 1000 : -.02 - (1 - maskAt(x, z)) * .5);
    }
    g.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ map: ortho, roughness: .96, metalness: 0 });
    scene.add(new THREE.Mesh(g, mat));
  }
  // ---- the sea: deep blue, sky reflections at grazing angles, moving sun glints, see-through shallows ----
  const seaU = {
    uTime: { value: 0 }, uMask: { value: maskTex }, uA: { value: new THREE.Vector2(A.x, A.z) }, uB: { value: new THREE.Vector2(B.x, B.z) },
    uSun: { value: sun.position.clone().normalize() }, uFogColor: { value: HORIZON }, uFogNear: { value: 70 }, uFogFar: { value: 230 },
  };
  {
    const sea = new THREE.Mesh(new THREE.CircleGeometry(260, 128).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
      uniforms: seaU, transparent: true, depthWrite: false,
      vertexShader: `varying vec3 vW; varying float vDepth;
        void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; vec4 mv = viewMatrix * w; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uTime; uniform sampler2D uMask; uniform vec2 uA, uB; uniform vec3 uSun, uFogColor; uniform float uFogNear, uFogFar;
        varying vec3 vW; varying float vDepth;
        float wave(vec2 p, vec2 d, float f, float s){ return sin(dot(p, d) * f + uTime * s); }
        void main(){
          vec2 uv = (vW.xz - uA) / (uB - uA);
          float m = (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) ? 0. : texture2D(uMask, vec2(uv.x, 1. - uv.y)).r;
          vec2 p = vW.xz;
          // small-scale wave normal from a few travelling sines
          vec2 g = vec2(0.);
          g += vec2(.8, .6) * cos(dot(p, vec2(.8, .6)) * 3.1 + uTime * 1.3) * .5;
          g += vec2(-.5, .86) * cos(dot(p, vec2(-.5, .86)) * 5.3 + uTime * 1.9) * .32;
          g += vec2(.97, -.24) * cos(dot(p, vec2(.97, -.24)) * 9.7 + uTime * 2.6) * .18;
          g += vec2(.2, .98) * cos(dot(p, vec2(.2, .98)) * 17. + uTime * 3.4) * .1;
          vec3 n = normalize(vec3(-g.x * .16, 1., -g.y * .16));
          vec3 V = normalize(cameraPosition - vW);
          float fres = pow(1. - max(dot(n, V), 0.), 4.);
          vec3 deep = vec3(.035, .16, .29), open = vec3(.06, .26, .43);
          vec3 col = mix(deep, open, smoothstep(0., 1., m * 2.));
          col = mix(col, vec3(.70, .82, .93), clamp(fres * .9, 0., .75));                 // sky reflection
          vec3 Hh = normalize(uSun + V); float spec = pow(max(dot(n, Hh), 0.), 260.) * 2.2;
          col += vec3(1., .93, .8) * spec;                                                     // sun glints
          float alpha = mix(1., .4, smoothstep(.6, 1., m));                                  // shallows let the photo show through
          alpha = max(alpha, spec * .8);
          float fog = smoothstep(uFogNear, uFogFar, vDepth);
          col = mix(col, uFogColor, fog); alpha = mix(alpha, 1., fog);
          gl_FragColor = vec4(col, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    sea.renderOrder = 1; scene.add(sea);
  }

  // ---- venue pins: HTML markers anchored to the ground ----
  const pins = [];
  const layer = document.createElement("div"); layer.className = "map3d__pins"; el.append(layer);
  for (const v of venues) {
    const p = toXZ(v.lon, v.lat), y = groundY(p.x, p.z) + .01;
    const btn = document.createElement("button"); btn.type = "button"; btn.className = `map3d__pin map3d__pin--${v.type}`;
    btn.setAttribute("aria-label", v.name); btn.innerHTML = `<span class="map3d__mark" aria-hidden="true"></span><span class="map3d__label">${v.name}</span>`;
    btn.addEventListener("click", e => { e.stopPropagation(); onPick(v, btn); });
    layer.append(btn);
    pins.push({ v, pos: new THREE.Vector3(p.x, y, p.z), btn, on: true });
  }
  const clusterEls = [];

  // ---- camera & controls with guard rails ----
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .09; controls.rotateSpeed = .55; controls.panSpeed = .9; controls.zoomSpeed = 1.1;
  controls.minDistance = 1.4; controls.maxDistance = 95; controls.maxPolarAngle = 1.22; controls.minPolarAngle = .05;
  controls.screenSpacePanning = false; controls.zoomToCursor = true;
  controls.autoRotate = !reduced; controls.autoRotateSpeed = .35;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  const HOME = { pos: new THREE.Vector3(-4, 46, 44), target: new THREE.Vector3(.5, 0, -4) };
  camera.position.copy(HOME.pos); controls.target.copy(HOME.target);
  let flight = null;
  const stopFlight = () => { flight = null; };
  const engage = () => { controls.autoRotate = false; stopFlight(); };
  renderer.domElement.addEventListener("pointerdown", engage);
  // the page keeps scrolling over the map; Ctrl/⌘ + wheel (or a trackpad pinch) zooms, like any web map
  const hint = document.createElement("div"); hint.className = "map3d__hint"; hint.setAttribute("aria-hidden", "true"); el.append(hint);
  let hintT = 0;
  el.addEventListener("wheel", e => {
    if (e.ctrlKey || e.metaKey) { e.preventDefault(); engage(); return; }
    e.stopImmediatePropagation(); // let the page scroll; OrbitControls never sees it
    hint.textContent = el.dataset.wheelHint || "Ctrl + rueda para acercar"; hint.classList.add("is-on"); clearTimeout(hintT); hintT = setTimeout(() => hint.classList.remove("is-on"), 1400);
  }, { capture: true, passive: false });
  let downAt = null;
  renderer.domElement.addEventListener("pointerdown", e => { downAt = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener("click", e => { if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 6) onEmpty?.(); });
  renderer.domElement.addEventListener("dblclick", e => { // double-click: glide in toward that spot
    const r = renderer.domElement.getBoundingClientRect(), ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), camera);
    const hit = new THREE.Vector3(); if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit)) return;
    const d = camera.position.distanceTo(controls.target); fly(hit.setY(groundY(hit.x, hit.z)), Math.max(controls.minDistance, d * .45), .8);
  });

  // a single, interruptible flight; zoom buttons chain from where the current flight is heading
  function fly(target, dist, dur = 1.1) {
    controls.autoRotate = false;
    const fromT = controls.target.clone(), fromP = camera.position.clone();
    const dir = fromP.clone().sub(fromT).normalize(); if (dir.y < .5) { dir.y = .62; dir.normalize(); }
    const toT = clampTarget(target.clone()), toP = toT.clone().add(dir.multiplyScalar(THREE.MathUtils.clamp(dist, controls.minDistance, controls.maxDistance)));
    if (reduced) { controls.target.copy(toT); camera.position.copy(toP); return; }
    flight = { fromT, fromP, toT, toP, t0: performance.now(), dur: dur * 1000 };
  }
  function clampTarget(t) {
    t.x = THREE.MathUtils.clamp(t.x, LIMIT.x0, LIMIT.x1); t.z = THREE.MathUtils.clamp(t.z, LIMIT.z0, LIMIT.z1);
    t.y = Math.max(0, groundY(t.x, t.z)); return t;
  }

  // ---- loop ----
  const v3 = new THREE.Vector3(); let W = 1, Hh = 1, visible = true, t = 0, last = performance.now();
  const resize = () => { W = el.clientWidth; Hh = el.clientHeight; renderer.setSize(W, Hh, false); camera.aspect = W / Hh; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(el); resize();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(el);
  const screen = new Map();
  function project() {
    const pts = [];
    for (const p of pins) {
      if (!p.on) { p.btn.hidden = true; continue; }
      v3.copy(p.pos).project(camera);
      const x = (v3.x * .5 + .5) * W, y = (-v3.y * .5 + .5) * Hh, inView = v3.z < 1 && x > -20 && x < W + 20 && y > -20 && y < Hh + 20;
      screen.set(p.v, { x, y: y - 30, inView }); if (inView) pts.push({ p, x, y, z: v3.z }); else p.btn.hidden = true;
    }
    pts.sort((a, b) => a.z - b.z);
    // greedy clustering: markers closer than 46 px share one bubble, so two 44 px tap targets never overlap
    const R2 = 46 * 46, groups = [];
    for (const q of pts) { const g = groups.find(g => (g.x - q.x) ** 2 + (g.y - q.y) ** 2 < R2); if (g) { g.items.push(q); g.x = (g.x * (g.items.length - 1) + q.x) / g.items.length; g.y = (g.y * (g.items.length - 1) + q.y) / g.items.length; } else groups.push({ x: q.x, y: q.y, items: [q] }); }
    const near = camera.position.distanceTo(controls.target) < 12;
    let ci = 0;
    for (const g of groups) {
      if (g.items.length === 1) { const { p, x, y } = g.items[0]; p.btn.hidden = false; p.btn.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`; p.btn.classList.toggle("is-named", near); continue; }
      g.items.forEach(q => { q.p.btn.hidden = true; });
      let c = clusterEls[ci]; if (!c) { c = document.createElement("button"); c.type = "button"; c.className = "map3d__cluster"; layer.append(c); clusterEls.push(c);
        c.addEventListener("click", e => { e.stopPropagation(); const items = c._items, target = new THREE.Vector3(); items.forEach(q => target.add(q.pos)); target.divideScalar(items.length);
          let spread = 0; items.forEach(q => { spread = Math.max(spread, q.pos.distanceTo(target)); });
          const d = camera.position.distanceTo(controls.target), want = Math.max(controls.minDistance, spread * 4.5, 1.6);
          if (d > want * 1.25) fly(target, Math.max(want, d * .3)); else onList(items.map(q => q.v), c); }); }
      c.hidden = false; c._items = g.items.map(q => q.p); c.textContent = g.items.length;
      c.setAttribute("aria-label", `${g.items.length}: ${g.items.map(q => q.p.v.name).join(", ")}`);
      const kinds = new Set(g.items.map(q => q.p.v.type)); c.dataset.kind = kinds.size === 1 ? [...kinds][0] : "mix";
      c.style.transform = `translate(${g.x.toFixed(1)}px, ${g.y.toFixed(1)}px)`; ci++;
    }
    for (; ci < clusterEls.length; ci++) clusterEls[ci].hidden = true;
  }
  const off = new THREE.Vector3();
  (function loop(now) {
    requestAnimationFrame(loop); if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; seaU.uTime.value = t;
    if (flight) {
      const k = Math.min(1, (now - flight.t0) / flight.dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      controls.target.lerpVectors(flight.fromT, flight.toT, e); camera.position.lerpVectors(flight.fromP, flight.toP, e);
      if (k >= 1) flight = null;
    }
    controls.update();
    // guard rails: keep the focus over the islands, ease it home when zoomed far out, never under the ground
    const tgt = controls.target, before = tgt.clone();
    clampTarget(tgt);
    const dist = camera.position.distanceTo(tgt);
    if (!flight && dist > 55) tgt.lerp(HOME.target, Math.min(1, (dist - 55) / 40) * .06);
    if (!tgt.equals(before)) { off.copy(tgt).sub(before); camera.position.add(off); }
    const floor = Math.max(0, groundY(camera.position.x, camera.position.z)) + .35;
    if (camera.position.y < floor) camera.position.y = floor;
    renderer.render(scene, camera); project();
  })(performance.now());

  const flyDist = () => flight ? flight.toP.distanceTo(flight.toT) : camera.position.distanceTo(controls.target);
  const flyTarget = () => flight ? flight.toT.clone() : controls.target.clone();
  return {
    screenOf: v => screen.get(v),
    setFilter(type, on) { pins.forEach(p => { if (p.v.type === type) p.on = on; }); },
    setActive(v) { pins.forEach(p => p.btn.classList.toggle("is-active", p.v === v)); },
    flyToArea([lo0, lo1, la0, la1]) { const a = toXZ(lo0, la1), b = toXZ(lo1, la0); fly(new THREE.Vector3((a.x + b.x) / 2, 0, (a.z + b.z) / 2), Math.max(7, Math.hypot(b.x - a.x, b.z - a.z) * 1.1)); },
    flyToVenue(v) { const p = toXZ(v.lon, v.lat); fly(new THREE.Vector3(p.x, 0, p.z), 3.2); },
    reset() { fly(HOME.target.clone(), HOME.pos.distanceTo(HOME.target), 1.3); },
    zoom(f) { fly(flyTarget(), flyDist() * f, .45); },
  };
}
