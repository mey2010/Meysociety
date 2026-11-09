/* Photoreal 3D map of Ibiza & Formentera, floating on the page.
   IGN MDT25 relief (25 m) draped with the IGN PNOA aerial photo, per-pixel relief lighting, real sun
   shadows and atmospheric haze; the sea feathers out into the page, so there is no frame around it.
   Mouse: drag to turn, right-drag to move, Ctrl/⌘ + wheel or trackpad pinch to zoom.
   Touch: one finger scrolls the page, two fingers move, pinch-zoom and turn the island. */
import * as THREE from "./vendor/three.module.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

const BB = { lon0: 1.17, lon1: 1.65, lat0: 38.63, lat1: 39.13 };
const C = { lon: 1.405, lat: 38.875 };                       // scene origin (between Ibiza and Formentera)
const KX = 111.32 * Math.cos(38.88 * Math.PI / 180), KZ = 110.57;
export const toXZ = (lon, lat) => ({ x: (lon - C.lon) * KX, z: -(lat - C.lat) * KZ });
const EXAG = 2.4;                                            // relief x2.4: readable hills, still natural
const A = toXZ(BB.lon0, BB.lat1), B = toXZ(BB.lon1, BB.lat0); // world extent of the data (A = NW, B = SE)
const LIMIT = { x0: toXZ(1.2, 0).x, x1: toXZ(1.63, 0).x, z0: toXZ(0, 39.12).z, z1: toXZ(0, 38.64).z };
const ISLE = { cx: .6, cz: -1, ax: 24, az: 31 };              // ellipse around both islands; the sea fades out beyond it
const PAGE = new THREE.Color("#f3f4fa");                       // the page behind the map (haze colour)
const PAGE_NOW = new THREE.Color(document.documentElement.dataset.theme === "dark" ? "#0b0930" : "#f3f4fa");

// fetch with progress, so the loader can show a real percentage
async function fetchBlob(url, onBytes) {
  const r = await fetch(url); const total = +r.headers.get("content-length") || 0;
  if (!r.body || !total) { const b = await r.blob(); onBytes?.(1); return b; }
  const reader = r.body.getReader(), parts = []; let got = 0;
  for (;;) { const { done, value } = await reader.read(); if (done) break; parts.push(value); got += value.length; onBytes?.(Math.min(1, got / total)); }
  return new Blob(parts, { type: r.headers.get("content-type") || "" });
}
const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
// cooperative time-slicing: heavy loops run in ~8 ms pieces and hand the thread back in between,
// so scrolling, the logo and the carousels never freeze while the map is being built
const yieldNow = () => globalThis.scheduler?.yield ? scheduler.yield() : new Promise(r => setTimeout(r, 0));
async function sliced(n, body, budget = 8) {
  let t = performance.now();
  for (let i = 0; i < n; i++) { body(i); if ((i & 63) === 63 && performance.now() - t > budget) { await yieldNow(); t = performance.now(); } }
}
async function loadHeights(url, onBytes) {
  const bmp = await createImageBitmap(await fetchBlob(url, onBytes), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
  const w = bmp.width, h = bmp.height, c = document.createElement("canvas"); c.width = w; c.height = h;
  const cx = c.getContext("2d", { willReadFrequently: true }); cx.drawImage(bmp, 0, 0);
  const d = cx.getImageData(0, 0, w, h).data, a = new Float32Array(w * h);
  await sliced(h, i => { for (let j = i * w, e = j + w; j < e; j++) a[j] = ((d[j * 4] << 8) | d[j * 4 + 1]) / 10 - 100; });
  return { w, h, a };
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
// per-pixel world-space normals from the relief, so ridges and gullies stay crisp at any zoom
async function normalTexture(H, scale) {
  const w = Math.max(2, Math.round(H.w * scale)), h = Math.max(2, Math.round(H.h * scale)), px = new Uint8Array(w * h * 4);
  const dx = (B.x - A.x) / (w - 1), dz = (B.z - A.z) / (h - 1), k = EXAG / 1000, at = (i, j) => bilinear(H.a, H.w, H.h, j / (w - 1), i / (h - 1), 0);
  const row = new Float32Array(w * h); await sliced(h, i => { for (let j = 0; j < w; j++) row[i * w + j] = Math.max(0, at(i, j)) * k; });
  await sliced(h, i => { for (let j = 0; j < w; j++) {
    const l = row[i * w + Math.max(0, j - 1)], r = row[i * w + Math.min(w - 1, j + 1)], u = row[Math.max(0, i - 1) * w + j], d = row[Math.min(h - 1, i + 1) * w + j];
    let nx = (l - r) / (2 * dx), nz = (u - d) / (2 * dz), ny = 1; const L = Math.hypot(nx, ny, nz); nx /= L; ny /= L; nz /= L;
    const o = ((h - 1 - i) * w + j) * 4; px[o] = (nx * .5 + .5) * 255; px[o + 1] = (ny * .5 + .5) * 255; px[o + 2] = (nz * .5 + .5) * 255; px[o + 3] = 255;
  } });
  const t = new THREE.DataTexture(px, w, h, THREE.RGBAFormat); t.colorSpace = THREE.NoColorSpace;
  t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.needsUpdate = true; return t;
}

export async function initMap3D(el, { venues, onPick, onList, onEmpty, onProgress }) {
  const prog = { h: 0, o: 0, build: 0 }, report = () => onProgress?.(Math.round(prog.h * 30 + prog.o * 45 + prog.build * 25));
  const small = matchMedia("(max-width: 900px)").matches, reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance", premultipliedAlpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); // sharp on retina, ~44% fewer pixels than 2x renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.12; renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // the sun and the island never move: the shadow map is drawn once, not on every frame
  renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
  el.prepend(renderer.domElement); renderer.domElement.className = "map3d__gl";
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(36, 1, .05, 420);
  scene.fog = new THREE.Fog(PAGE_NOW.clone(), 80, 210);
  scene.add(new THREE.HemisphereLight("#dcecff", "#6a5236", 1.15));
  // golden-hour sun from the west-south-west: long shadows carve the relief
  const sun = new THREE.DirectionalLight("#ffe2b8", 3.4); sun.position.set(-36, 22, 14); sun.target.position.set(0, 0, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(small ? 2048 : 4096, small ? 2048 : 4096);
  Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 120 }); sun.shadow.bias = -.0004; sun.shadow.normalBias = .02;
  scene.add(sun, sun.target);

  // the base photo: 3072x4096 is plenty for the whole-island view (the detail tiles take over when zooming in);
  // the 5120x6144 version cost a long freeze to upload for no visible gain at that distance
  const orthoUrl = renderer.capabilities.maxTextureSize >= 4096 && !small ? "data/ortho_hi.jpg" : "data/ortho_lo.jpg";
  const orthoBlob = fetchBlob(orthoUrl, f => { prog.o = f; report(); });     // downloads in parallel with the relief
  const [H, M] = await Promise.all([loadHeights("data/height_mdt25.png", f => { prog.h = f; report(); }), loadGray("data/mask1024.png")]);
  const hAt = (x, z) => { const [u, v] = uvOf(x, z); return bilinear(H.a, H.w, H.h, u, v, -30); };
  const maskAt = (x, z) => { const [u, v] = uvOf(x, z); return bilinear(M.g, M.w, M.h, u, v, 0); };
  const groundY = (x, z) => { const m = hAt(x, z); return m > .4 ? m * EXAG / 1000 : 0; };
  const maxTex = renderer.capabilities.maxTextureSize;
  const orthoObjUrl = URL.createObjectURL(await orthoBlob);
  const ortho = await new THREE.TextureLoader().loadAsync(orthoObjUrl); URL.revokeObjectURL(orthoObjUrl);
  try { await ortho.image.decode?.(); } catch {} // decoded off the main thread, not at upload time
  prog.build = .25; report(); await nextFrame();
  ortho.colorSpace = THREE.SRGBColorSpace; ortho.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
  const nrm = await normalTexture(H, small ? .45 : .62);
  // each big texture goes to the graphics card in its own moment, not all together on the first frame
  try { renderer.initTexture(ortho); await yieldNow(); renderer.initTexture(nrm); await yieldNow(); } catch {}
  prog.build = .6; report(); await nextFrame();
  const maskTex = new THREE.CanvasTexture(M.canvas); maskTex.colorSpace = THREE.NoColorSpace;
  const isleU = { uIsle: { value: new THREE.Vector4(ISLE.cx, ISLE.cz, ISLE.ax, ISLE.az) } };

  // ---- terrain ----
  {
    const NX = small ? 300 : 560, NZ = Math.round(NX * (B.z - A.z) / (B.x - A.x));
    const g = new THREE.PlaneGeometry(B.x - A.x, B.z - A.z, NX - 1, NZ - 1).rotateX(-Math.PI / 2);
    g.translate((A.x + B.x) / 2, 0, (A.z + B.z) / 2);
    const pos = g.attributes.position;
    await sliced(pos.count, i => {
      const x = pos.getX(i), z = pos.getZ(i), m = hAt(x, z);
      pos.setY(i, m > .4 ? m * EXAG / 1000 : -.02 - (1 - maskAt(x, z)) * .5);
    });
    await yieldNow(); g.computeVertexNormals(); await yieldNow();
    const mat = new THREE.MeshStandardMaterial({ map: ortho, roughness: .93, metalness: 0 });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uNrm = { value: nrm }; sh.uniforms.uIsle = isleU.uIsle; sh.uniforms.uMaskT = { value: maskTex };
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWp;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D uNrm, uMaskT; uniform vec4 uIsle; varying vec3 vWp;")
        .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>
          { if (vWp.y < -.005 && texture2D(uMaskT, vMapUv).r < .06) discard; }  // open-sea floor is never drawn: the water (or the page) is there`)
        .replace("#include <map_fragment>", `#include <map_fragment>
          { vec3 c = diffuseColor.rgb; float l = dot(c, vec3(.299, .587, .114));
            c = mix(vec3(l), c, 1.18); c = (c - .5) * 1.06 + .5; diffuseColor.rgb = clamp(c, 0., 1.); }`)  // a touch of grade: richer, crisper
        .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
          { vec3 wn = texture2D(uNrm, vMapUv).xyz * 2. - 1.; normal = normalize(mat3(viewMatrix) * vec3(wn.x, wn.y, wn.z)); }`);
    };
    const mesh = new THREE.Mesh(g, mat); mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh);
  }
  // ---- detail tiles: ~2.7 m/px aerial photo, loaded only around the focus when zoomed in ----
  const detail = { index: null, live: new Map(), last: 0, max: small ? 14 : 28 };
  fetch("data/tiles/index.json").then(r => r.ok ? r.json() : null).then(j => { detail.index = j; }).catch(() => {});
  const tileMat = tex => {
    const m = new THREE.MeshStandardMaterial({ map: tex, roughness: .93, metalness: 0, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    m.onBeforeCompile = sh => {
      sh.uniforms.uNrm = { value: nrm }; sh.uniforms.uMaskT = { value: maskTex }; sh.uniforms.uA2 = { value: new THREE.Vector4(A.x, A.z, B.x - A.x, B.z - A.z) };
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWp;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D uNrm, uMaskT; uniform vec4 uA2; varying vec3 vWp;")
        .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>
          vec2 wuv = vec2((vWp.x - uA2.x) / uA2.z, 1. - (vWp.z - uA2.y) / uA2.w);
          if (vWp.y < -.005 && texture2D(uMaskT, wuv).r < .06) discard;`)
        .replace("#include <map_fragment>", `#include <map_fragment>
          { vec3 c = diffuseColor.rgb; float l = dot(c, vec3(.299, .587, .114)); c = mix(vec3(l), c, 1.1); c = (c - .5) * 1.04 + .5; diffuseColor.rgb = clamp(c, 0., 1.); }`)
        .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
          { vec3 wn = texture2D(uNrm, wuv).xyz * 2. - 1.; normal = normalize(mat3(viewMatrix) * wn); }`);
    };
    return m;
  };
  function tileMesh(i, j, tex) {
    const ix = detail.index, a = ix.lon0 + ix.sx * i, b = a + ix.sx, top = ix.lat1 - ix.sy * j, bot = top - ix.sy;
    const p0 = toXZ(a, top), p1 = toXZ(b, bot), N = small ? 40 : 64;
    const g = new THREE.PlaneGeometry(p1.x - p0.x, p1.z - p0.z, N, N).rotateX(-Math.PI / 2); g.translate((p0.x + p1.x) / 2, 0, (p0.z + p1.z) / 2);
    const pos = g.attributes.position;
    for (let k = 0; k < pos.count; k++) { const x = pos.getX(k), z = pos.getZ(k), m = hAt(x, z); pos.setY(k, m > .4 ? m * EXAG / 1000 + .001 : -.025); }  // flat under the water: no walls at the shoreline
    const mesh = new THREE.Mesh(g, tileMat(tex)); mesh.receiveShadow = true; mesh.renderOrder = 0; return mesh;
  }
  function updateDetail(now) {
    if (!detail.index || now - detail.last < 250) return; detail.last = now;
    const tgt = controls.target, dist = camera.position.distanceTo(tgt), show = dist < 17;
    detail.live.forEach(t => { if (t.mesh) t.mesh.visible = show; });
    if (!show) return;
    const ix = detail.index, R = Math.max(2.6, dist * 1.35), want = [];
    for (const [i, j] of ix.tiles) {
      const c = toXZ(ix.lon0 + ix.sx * (i + .5), ix.lat1 - ix.sy * (j + .5)), d = Math.hypot(c.x - tgt.x, c.z - tgt.z);
      if (d < R) want.push({ key: i + "_" + j, i, j, d });
    }
    want.sort((x, y) => x.d - y.d);
    for (const w of want.slice(0, detail.max)) {
      if (detail.live.has(w.key)) { detail.live.get(w.key).used = now; continue; }
      const entry = { used: now, mesh: null, tex: null }; detail.live.set(w.key, entry);
      new THREE.TextureLoader().load(`data/tiles/${w.key}.jpg`, tex => {
        if (!detail.live.has(w.key)) { tex.dispose(); return; }
        tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
        entry.tex = tex; entry.mesh = tileMesh(w.i, w.j, tex); scene.add(entry.mesh);
      }, undefined, () => {});
    }
    // keep memory bounded: drop the tiles used longest ago
    if (detail.live.size > detail.max * 1.6) {
      [...detail.live.entries()].sort((x, y) => x[1].used - y[1].used).slice(0, detail.live.size - detail.max).forEach(([k, t]) => {
        if (t.mesh) { scene.remove(t.mesh); t.mesh.geometry.dispose(); t.mesh.material.dispose(); } t.tex?.dispose(); detail.live.delete(k);
      });
    }
  }
  // ---- the sea: sky reflections, sun glints, see-through shallows, feathered into the page ----
  const seaU = {
    uTime: { value: 0 }, uMask: { value: maskTex }, uA: { value: new THREE.Vector2(A.x, A.z) }, uB: { value: new THREE.Vector2(B.x, B.z) },
    uSun: { value: sun.position.clone().normalize() }, uFogColor: { value: PAGE_NOW }, uFogNear: { value: 80 }, uFogFar: { value: 210 }, uIsle: isleU.uIsle,
  };
  {
    const sea = new THREE.Mesh(new THREE.CircleGeometry(60, 160).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
      uniforms: seaU, transparent: true, depthWrite: false,
      vertexShader: `varying vec3 vW; varying float vDepth;
        void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; vec4 mv = viewMatrix * w; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uTime; uniform sampler2D uMask; uniform vec2 uA, uB; uniform vec3 uSun, uFogColor; uniform float uFogNear, uFogFar; uniform vec4 uIsle;
        varying vec3 vW; varying float vDepth;
        void main(){
          vec2 uv = (vW.xz - uA) / (uB - uA);
          float m = (uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) ? 0. : texture2D(uMask, vec2(uv.x, 1. - uv.y)).r;
          vec2 p = vW.xz, g = vec2(0.);
          g += vec2(.8, .6) * cos(dot(p, vec2(.8, .6)) * 3.1 + uTime * 1.3) * .5;
          g += vec2(-.5, .86) * cos(dot(p, vec2(-.5, .86)) * 5.3 + uTime * 1.9) * .32;
          g += vec2(.97, -.24) * cos(dot(p, vec2(.97, -.24)) * 9.7 + uTime * 2.6) * .18;
          g += vec2(.2, .98) * cos(dot(p, vec2(.2, .98)) * 17. + uTime * 3.4) * .1;
          vec3 n = normalize(vec3(-g.x * .14, 1., -g.y * .14)), V = normalize(cameraPosition - vW);
          float fres = pow(1. - max(dot(n, V), 0.), 4.);
          vec3 col = mix(vec3(.02, .14, .27), vec3(.05, .29, .45), smoothstep(0., 1., m * 2.));
          col = mix(col, vec3(.72, .83, .94), clamp(fres * .85, 0., .7));
          vec3 Hh = normalize(uSun + V); float spec = pow(max(dot(n, Hh), 0.), 300.) * 2.6;
          col += vec3(1., .88, .7) * spec;
          float alpha = mix(1., .55, smoothstep(.78, 1., m));
          alpha = max(alpha, min(1., spec));
          float fog = smoothstep(uFogNear, uFogFar, vDepth); col = mix(col, uFogColor, fog);
          float r = length((vW.xz - uIsle.xy) / uIsle.zw);
          alpha *= 1. - smoothstep(.86, 1.12, r);                      // no edge, no frame: the sea dissolves into the page
          gl_FragColor = vec4(col, alpha);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
    sea.renderOrder = 1; sea.receiveShadow = false; scene.add(sea);
  }

  // ---- venue pins: HTML markers anchored to the ground ----
  const pins = [], layer = document.createElement("div"); layer.className = "map3d__pins"; el.append(layer);
  for (const v of venues) {
    const p = toXZ(v.lon, v.lat), y = groundY(p.x, p.z) + .01;
    const btn = document.createElement("button"); btn.type = "button"; btn.className = `map3d__pin map3d__pin--${v.type}`;
    btn.setAttribute("aria-label", v.name); btn.innerHTML = `<span class="map3d__mark" aria-hidden="true"></span><span class="map3d__label">${v.name}</span>`;
    btn.addEventListener("click", e => { e.stopPropagation(); onPick(v, btn); });
    layer.append(btn); pins.push({ v, pos: new THREE.Vector3(p.x, y, p.z), btn, on: true });
  }
  const clusterEls = [];

  // ---- camera & mouse controls ----
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .09; controls.rotateSpeed = .55; controls.panSpeed = .9; controls.zoomSpeed = 1.1;
  controls.minDistance = 1.2; controls.maxDistance = 110; controls.maxPolarAngle = 1.2; controls.minPolarAngle = .05;
  controls.screenSpacePanning = false; controls.zoomToCursor = true; controls.autoRotate = !reduced; controls.autoRotateSpeed = .3;
  const HOME = { pos: new THREE.Vector3(-8, 40, 46), target: new THREE.Vector3(.5, 0, -2) };
  { const a = el.clientWidth / Math.max(1, el.clientHeight); if (a < 1.2) HOME.pos.sub(HOME.target).multiplyScalar(Math.min(1.9, Math.pow(1.2 / a, .9))).add(HOME.target); } // portrait screens see the whole island
  camera.position.copy(HOME.pos); controls.target.copy(HOME.target);
  let flight = null;
  const engage = () => { controls.autoRotate = false; flight = null; };
  const cvs = renderer.domElement;
  const hint = document.createElement("div"); hint.className = "map3d__hint"; hint.setAttribute("aria-hidden", "true"); el.append(hint);
  let hintT = 0; const showHint = key => { hint.textContent = el.dataset[key] || ""; if (!hint.textContent) return; hint.classList.add("is-on"); clearTimeout(hintT); hintT = setTimeout(() => hint.classList.remove("is-on"), 1500); };
  // the page keeps scrolling over the map; Ctrl/⌘ + wheel (or a trackpad pinch) zooms
  el.addEventListener("wheel", e => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); engage(); return; } e.stopImmediatePropagation(); showHint("wheelHint"); }, { capture: true, passive: false });
  cvs.addEventListener("pointerdown", e => { if (e.pointerType === "touch") { e.stopImmediatePropagation(); return; } engage(); }, { capture: true }); // touch is handled below, not by OrbitControls
  let downAt = null;
  cvs.addEventListener("pointerdown", e => { downAt = [e.clientX, e.clientY]; });
  cvs.addEventListener("click", e => { if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 6) onEmpty?.(); });
  const ray = new THREE.Raycaster(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ndc = new THREE.Vector2();
  const groundAt = (cx, cy, out = new THREE.Vector3()) => {
    const r = cvs.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1);
    camera.updateMatrixWorld(); ray.setFromCamera(ndc, camera); return ray.ray.intersectPlane(ground, out);
  };
  cvs.addEventListener("dblclick", e => { const hit = groundAt(e.clientX, e.clientY); if (!hit) return; const d = camera.position.distanceTo(controls.target); fly(hit.setY(groundY(hit.x, hit.z)), Math.max(controls.minDistance, d * .45), .8); });

  // ---- touch: one finger scrolls the page; two fingers grab the island (move, pinch-zoom, turn), like a real map app ----
  {
    let g = null;
    const mid = t => [(t[0].clientX + t[1].clientX) / 2, (t[0].clientY + t[1].clientY) / 2];
    const span = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const ang = t => Math.atan2(t[1].clientY - t[0].clientY, t[1].clientX - t[0].clientX);
    const rotY = (v, a) => { const c = Math.cos(a), s = Math.sin(a), x = v.x * c - v.z * s, z = v.x * s + v.z * c; v.x = x; v.z = z; return v; };
    const begin = t => { const [mx, my] = mid(t); const P = groundAt(mx, my); if (!P) { g = null; return; } g = { P, s: span(t), a: ang(t), cam: camera.position.clone(), tgt: controls.target.clone() }; };
    cvs.addEventListener("touchstart", e => {
      if (e.touches.length >= 2) { e.preventDefault(); engage(); begin(e.touches); }
    }, { passive: false });
    let oneMoved = 0;
    cvs.addEventListener("touchmove", e => {
      if (e.touches.length < 2) { if (++oneMoved === 6) showHint("touchHint"); return; } // single finger: the page scrolls
      e.preventDefault(); if (!g) begin(e.touches); if (!g) return;
      const t = e.touches, d0 = g.cam.distanceTo(g.tgt);
      let f = g.s / Math.max(20, span(t)); f = THREE.MathUtils.clamp(f, controls.minDistance / d0, controls.maxDistance / d0);
      const rot = ang(t) - g.a;
      const cam = rotY(g.cam.clone().sub(g.P), -rot).multiplyScalar(f).add(g.P);
      const tgt = rotY(g.tgt.clone().sub(g.P), -rot).multiplyScalar(f).add(g.P);
      camera.position.copy(cam); camera.lookAt(tgt); camera.updateMatrixWorld();
      const [mx, my] = mid(t), hit = groundAt(mx, my);
      if (hit) { const dlt = g.P.clone().sub(hit); dlt.y = 0; cam.add(dlt); tgt.add(dlt); }
      camera.position.copy(cam); controls.target.copy(tgt);
    }, { passive: false });
    cvs.addEventListener("touchend", e => { if (e.touches.length >= 2) begin(e.touches); else g = null; if (!e.touches.length) oneMoved = 0; });
    cvs.addEventListener("touchcancel", () => { g = null; oneMoved = 0; });
  }

  function fly(target, dist, dur = 1.1) {
    controls.autoRotate = false;
    const fromT = controls.target.clone(), fromP = camera.position.clone();
    const dir = fromP.clone().sub(fromT).normalize(); if (dir.y < .5) { dir.y = .62; dir.normalize(); }
    const toT = clampTarget(target.clone()), toP = toT.clone().add(dir.multiplyScalar(THREE.MathUtils.clamp(dist, controls.minDistance, controls.maxDistance)));
    if (reduced) { controls.target.copy(toT); camera.position.copy(toP); return; }
    flight = { fromT, fromP, toT, toP, t0: performance.now(), dur: dur * 1000 };
  }
  function clampTarget(t) { t.x = THREE.MathUtils.clamp(t.x, LIMIT.x0, LIMIT.x1); t.z = THREE.MathUtils.clamp(t.z, LIMIT.z0, LIMIT.z1); t.y = Math.max(0, groundY(t.x, t.z)); return t; }

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
      const x = (v3.x * .5 + .5) * W, y = (-v3.y * .5 + .5) * Hh, ex = (x - W / 2) / (W / 2), ey = (y - Hh / 2) / (Hh / 2), inView = v3.z < 1 && ex * ex + ey * ey < .64; // inside the visible, unfaded oval
      screen.set(p.v, { x, y: y - 30, inView }); if (inView) pts.push({ p, x, y, z: v3.z }); else p.btn.hidden = true;
    }
    pts.sort((a, b) => a.z - b.z);
    const R2 = 46 * 46, groups = []; // markers closer than 46 px share one bubble: two 44 px tap targets never overlap
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
      c.hidden = false; c._items = g.items.map(q => q.p);
      if (c.textContent !== String(g.items.length)) c.textContent = g.items.length;
      const lbl = `${g.items.length}: ${g.items.map(q => q.p.v.name).join(", ")}`; if (c.getAttribute("aria-label") !== lbl) c.setAttribute("aria-label", lbl);
      const kinds = new Set(g.items.map(q => q.p.v.type)); c.dataset.kind = kinds.size === 1 ? [...kinds][0] : "mix";
      c.style.transform = `translate(${g.x.toFixed(1)}px, ${g.y.toFixed(1)}px)`; ci++;
    }
    for (; ci < clusterEls.length; ci++) clusterEls[ci].hidden = true;
  }
  const off = new THREE.Vector3();
  // shaders compile in parallel (where the browser supports it) instead of stalling the first frame
  try { await renderer.compileAsync(scene, camera); } catch {}
  (function loop(now) {
    requestAnimationFrame(loop); if (!visible || document.hidden || document.documentElement.classList.contains("is-covered")) { last = now; return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt; seaU.uTime.value = t;
    if (flight) {
      const k = Math.min(1, (now - flight.t0) / flight.dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      controls.target.lerpVectors(flight.fromT, flight.toT, e); camera.position.lerpVectors(flight.fromP, flight.toP, e);
      if (k >= 1) flight = null;
    }
    controls.update();
    // guard rails: focus stays over the islands, eases home when zoomed far out, the camera never dips under the ground
    const tgt = controls.target, before = tgt.clone();
    clampTarget(tgt);
    const dist = camera.position.distanceTo(tgt);
    if (!flight && dist > 55) tgt.lerp(HOME.target, Math.min(1, (dist - 55) / 35) * .06);
    if (!tgt.equals(before)) { off.copy(tgt).sub(before); camera.position.add(off); }
    const floor = Math.max(0, groundY(camera.position.x, camera.position.z)) + .3;
    if (camera.position.y < floor) camera.position.y = floor;
    updateDetail(now); renderer.render(scene, camera); project();
  })(performance.now());

  prog.build = 1; report();
  const flyDist = () => flight ? flight.toP.distanceTo(flight.toT) : camera.position.distanceTo(controls.target);
  const flyTarget = () => flight ? flight.toT.clone() : controls.target.clone();
  return {
    screenOf: v => screen.get(v),
    setTheme(dark) { PAGE_NOW.set(dark ? "#0b0930" : "#f3f4fa"); scene.fog.color.copy(PAGE_NOW); },
    setFilter(type, on) { pins.forEach(p => { if (p.v.type === type) p.on = on; }); },
    setActive(v) { pins.forEach(p => p.btn.classList.toggle("is-active", p.v === v)); },
    flyToArea([lo0, lo1, la0, la1]) { const a = toXZ(lo0, la1), b = toXZ(lo1, la0); fly(new THREE.Vector3((a.x + b.x) / 2, 0, (a.z + b.z) / 2), Math.max(7, Math.hypot(b.x - a.x, b.z - a.z) * 1.1)); },
    flyToVenue(v) { const p = toXZ(v.lon, v.lat); fly(new THREE.Vector3(p.x, 0, p.z), 3); },
    reset() { fly(HOME.target.clone(), HOME.pos.distanceTo(HOME.target), 1.3); },
    zoom(f) { fly(flyTarget(), flyDist() * f, .45); },
  };
}
