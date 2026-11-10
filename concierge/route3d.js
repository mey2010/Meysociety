/* The client's route in 3D: the island in relief, in the client area's own night palette (indigo land,
   no aerial photo), with the stay drawn as arcs over the terrain — travelled legs in magenta, upcoming
   ones dashed, today's highlighted — and numbered stops. It turns, zooms and pans like the home map:
   mouse drag / Ctrl+wheel on desktop, two fingers on phones (one finger keeps scrolling the page).
   No frame: the sea glow dissolves into the card. Renders only when something moves. */
import * as THREE from "./vendor/three.module.js";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { MAPDATA } from "./map3d.js";

const { A, B, EXAG, ISLE, LIMIT, toXZ, uvOf, bilinear, normalTexture, sharedHeights, sharedMask, sliced, yieldNow } = MAPDATA;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const C_DONE = new THREE.Color("#c856e6"), C_NEXT = new THREE.Color("#b9bde0"), C_TODAY = new THREE.Color("#78c7e4");

export async function initRoute3D(el, { planeIcon = "" } = {}) {
  const small = matchMedia("(max-width: 900px)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0, 0);
  renderer.domElement.className = "route3d__gl"; el.prepend(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, .05, 400);
  scene.add(new THREE.HemisphereLight("#b9c4ff", "#120f40", 1.1));
  const key = new THREE.DirectionalLight("#e9e4ff", 2.2); key.position.set(-30, 26, 18); scene.add(key);

  const [H, M] = await Promise.all([sharedHeights(), sharedMask()]);
  const hAt = (x, z) => { const [u, v] = uvOf(x, z); return bilinear(H.a, H.w, H.h, u, v, -30); };
  const maskAt = (x, z) => { const [u, v] = uvOf(x, z); return bilinear(M.g, M.w, M.h, u, v, 0); };
  const groundY = (x, z) => { const m = hAt(x, z); return m > .4 ? m * EXAG / 1000 : 0; };
  const nrm = await normalTexture(H, small ? .35 : .5);
  const maskTex = new THREE.CanvasTexture(M.canvas); maskTex.colorSpace = THREE.NoColorSpace;

  // ---- land: indigo, lit by its own relief, a soft cyan rim along the coast ----
  {
    const NX = small ? 220 : 340, NZ = Math.round(NX * (B.z - A.z) / (B.x - A.x));
    const g = new THREE.PlaneGeometry(B.x - A.x, B.z - A.z, NX - 1, NZ - 1).rotateX(-Math.PI / 2);
    g.translate((A.x + B.x) / 2, 0, (A.z + B.z) / 2);
    const pos = g.attributes.position;
    await sliced(pos.count, i => { const x = pos.getX(i), z = pos.getZ(i), m = hAt(x, z); pos.setY(i, m > .4 ? m * EXAG / 1000 : -.02 - (1 - maskAt(x, z)) * .5); });
    await yieldNow(); g.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: "#4a4aa8", roughness: .85, metalness: 0, emissive: "#14104a", emissiveIntensity: 1 });
    mat.onBeforeCompile = sh => {
      sh.uniforms.uNrm = { value: nrm }; sh.uniforms.uMaskT = { value: maskTex }; sh.uniforms.uA2 = { value: new THREE.Vector4(A.x, A.z, B.x - A.x, B.z - A.z) };
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWp;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D uNrm, uMaskT; uniform vec4 uA2; varying vec3 vWp;")
        .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>
          vec2 vUv2 = vec2((vWp.x - uA2.x) / uA2.z, 1. - (vWp.z - uA2.y) / uA2.w); // texture coords from the world position
          float land = texture2D(uMaskT, vUv2).r;
          if (vWp.y < -.005 && land < .5) discard;`)
        .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
          { vec2 vUv2 = vec2((vWp.x - uA2.x) / uA2.z, 1. - (vWp.z - uA2.y) / uA2.w); vec3 wn = texture2D(uNrm, vUv2).xyz * 2. - 1.; normal = normalize(mat3(viewMatrix) * wn); }`)
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
          totalEmissiveRadiance += vec3(.35, .65, .85) * smoothstep(.05, 0., vWp.y) * .55;`); // the shoreline glows faintly
    };
    scene.add(new THREE.Mesh(g, mat));
  }
  // ---- sea: a dark glow that fades out on every side (no square, no frame) ----
  {
    const sea = new THREE.Mesh(new THREE.CircleGeometry(60, 96).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, uniforms: { uIsle: { value: new THREE.Vector4(ISLE.cx, ISLE.cz, ISLE.ax, ISLE.az) } },
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform vec4 uIsle; varying vec3 vW;
        void main(){ float r = length((vW.xz - uIsle.xy) / uIsle.zw);
          gl_FragColor = vec4(mix(vec3(.13, .11, .40), vec3(.08, .06, .26), smoothstep(.2, 1., r)), .55 * (1. - smoothstep(.45, .95, r)));
          #include <colorspace_fragment>
        }`,
    }));
    sea.position.y = -.03; sea.renderOrder = -1; scene.add(sea);
  }

  // ---- camera & controls (same feel as the home map) ----
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .1; controls.rotateSpeed = .55; controls.panSpeed = .9; controls.zoomSpeed = 1.1;
  controls.minDistance = 1.2; controls.maxDistance = 90; controls.maxPolarAngle = 1.2; controls.minPolarAngle = .05;
  controls.screenSpacePanning = false; controls.zoomToCursor = true;
  camera.position.set(-6, 34, 40); controls.target.set(.5, 0, -2);
  const cvs = renderer.domElement;
  let dirty = true, raf = 0, flight = null;
  const wake = () => { dirty = true; if (!raf) raf = requestAnimationFrame(loop); };
  controls.addEventListener("change", wake);
  // the page keeps scrolling over the map; Ctrl/⌘ + wheel (or a trackpad pinch) zooms
  el.addEventListener("wheel", e => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); flight = null; return; } e.stopImmediatePropagation(); }, { capture: true, passive: false });
  cvs.addEventListener("pointerdown", e => { if (e.pointerType === "touch") { e.stopImmediatePropagation(); return; } flight = null; }, { capture: true });
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ndc = new THREE.Vector2();
  const groundAt = (cx, cy, out = new THREE.Vector3()) => { const r = cvs.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -(cy - r.top) / r.height * 2 + 1); camera.updateMatrixWorld(); ray.setFromCamera(ndc, camera); return ray.ray.intersectPlane(plane, out); };
  { // two fingers move, pinch and turn the island; one finger scrolls the page
    let g = null;
    const mid = t => [(t[0].clientX + t[1].clientX) / 2, (t[0].clientY + t[1].clientY) / 2], span = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY), ang = t => Math.atan2(t[1].clientY - t[0].clientY, t[1].clientX - t[0].clientX);
    const rotY = (v, a) => { const c = Math.cos(a), s = Math.sin(a), x = v.x * c - v.z * s, z = v.x * s + v.z * c; v.x = x; v.z = z; return v; };
    const begin = t => { const [mx, my] = mid(t), P = groundAt(mx, my); g = P ? { P, s: span(t), a: ang(t), cam: camera.position.clone(), tgt: controls.target.clone() } : null; };
    cvs.addEventListener("touchstart", e => { if (e.touches.length >= 2) { e.preventDefault(); flight = null; begin(e.touches); } }, { passive: false });
    cvs.addEventListener("touchmove", e => {
      if (e.touches.length < 2) return; e.preventDefault(); if (!g) begin(e.touches); if (!g) return;
      const t = e.touches, d0 = g.cam.distanceTo(g.tgt); let f = THREE.MathUtils.clamp(g.s / Math.max(20, span(t)), controls.minDistance / d0, controls.maxDistance / d0);
      const rot = ang(t) - g.a, cam = rotY(g.cam.clone().sub(g.P), -rot).multiplyScalar(f).add(g.P), tgt = rotY(g.tgt.clone().sub(g.P), -rot).multiplyScalar(f).add(g.P);
      camera.position.copy(cam); camera.lookAt(tgt); camera.updateMatrixWorld();
      const [mx, my] = mid(t), hit = groundAt(mx, my); if (hit) { const d = g.P.clone().sub(hit); d.y = 0; cam.add(d); tgt.add(d); }
      camera.position.copy(cam); controls.target.copy(tgt); wake();
    }, { passive: false });
    cvs.addEventListener("touchend", e => { if (e.touches.length >= 2) begin(e.touches); else g = null; });
  }
  const clampTarget = t => { t.x = THREE.MathUtils.clamp(t.x, LIMIT.x0, LIMIT.x1); t.z = THREE.MathUtils.clamp(t.z, LIMIT.z0, LIMIT.z1); t.y = Math.max(0, groundY(t.x, t.z)); return t; };
  function fly(target, dist, dur = 1) {
    const fromT = controls.target.clone(), fromP = camera.position.clone();
    let dir = fromP.clone().sub(fromT).normalize(); if (dir.y < .55) { dir.y = .7; dir.normalize(); }
    const toT = clampTarget(target.clone()), toP = toT.clone().add(dir.multiplyScalar(THREE.MathUtils.clamp(dist, controls.minDistance, controls.maxDistance)));
    if (reduced) { controls.target.copy(toT); camera.position.copy(toP); wake(); return; }
    flight = { fromT, fromP, toT, toP, t0: performance.now(), dur: dur * 1000 }; wake();
  }

  // ---- the route ----
  const routeGroup = new THREE.Group(); scene.add(routeGroup);
  const layer = document.createElement("div"); layer.className = "route3d__stops"; el.append(layer);
  let stops = [], fitBox = null;
  const arc = (a, b) => { // a raised curve between two stops, its height growing with the distance
    const mid = a.clone().add(b).multiplyScalar(.5); mid.y = Math.max(a.y, b.y) + .35 + a.distanceTo(b) * .18;
    return new THREE.QuadraticBezierCurve3(a, mid, b);
  };
  function clearRoute() {
    routeGroup.children.slice().forEach(m => { routeGroup.remove(m); m.geometry.dispose(); m.material.dispose(); });
    layer.replaceChildren(); stops = [];
  }
  function setRoute(pts, { today = -1, here = -1 } = {}) {
    clearRoute(); if (!pts.length) { wake(); return; }
    const P = pts.map(p => { const q = toXZ(p.ll[0], p.ll[1]); return new THREE.Vector3(q.x, groundY(q.x, q.z) + .03, q.z); });
    for (let i = 1; i < P.length; i++) {
      const p = pts[i], travelled = p.status === "done" || p.status === "now", isToday = p.days.has(today);
      const curve = arc(P[i - 1], P[i]), r = isToday ? .07 : .045;
      const color = travelled ? C_DONE : isToday ? C_TODAY : C_NEXT;
      if (travelled) {
        routeGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 8), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .95 })));
      } else { // upcoming: a dashed tube
        const n = Math.max(6, Math.round(P[i - 1].distanceTo(P[i]) * 3));
        for (let k = 0; k < n; k++) {
          const t0 = k / n, t1 = (k + .55) / n, seg = new THREE.CatmullRomCurve3([0, .5, 1].map(s => curve.getPoint(t0 + (t1 - t0) * s)));
          routeGroup.add(new THREE.Mesh(new THREE.TubeGeometry(seg, 4, r * .85, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: isToday ? .95 : .6 })));
        }
      }
    }
    // stops: HTML markers that follow the terrain on screen
    pts.forEach((p, i) => {
      const cls = i === 0 ? "start" : i === here ? "now" : p.status;
      const d = document.createElement("div"); d.className = `route3d__stop route3d__stop--${cls}${p.days.has(today) ? " is-today" : ""}`;
      d.innerHTML = `${i === here ? '<span class="route3d__pulse"></span>' : ""}<span class="route3d__dot">${i === 0 ? planeIcon : i}</span><span class="route3d__label">${p.label}</span>`;
      layer.append(d); stops.push({ el: d, lab: d.querySelector(".route3d__label"), pos: P[i].clone().setY(P[i].y + .02), pri: i === here ? 0 : i === 0 ? 1 : p.days.has(today) ? 2 : 3, w: 0 });
    });
    // frame the whole route
    stops.forEach(s => { s.w = s.lab.offsetWidth || s.lab.textContent.length * 7; });
    const box = new THREE.Box3().setFromPoints(P); fitBox = box;
    fitRoute(false);
  }
  function fitRoute(animate = true) {
    if (!fitBox) return;
    const c = fitBox.getCenter(new THREE.Vector3()), size = fitBox.getSize(new THREE.Vector3());
    const dist = Math.max(6, Math.max(size.x, size.z) * 1.55 + 5);
    if (!animate) { const dir = new THREE.Vector3(-.25, .78, .58).normalize(); controls.target.copy(clampTarget(c.clone())); camera.position.copy(controls.target.clone().add(dir.multiplyScalar(dist))); wake(); }
    else fly(c, dist, 1);
  }

  // ---- loop: only when something changes ----
  const v3 = new THREE.Vector3(); let W = 1, Hh = 1, visible = true;
  const resize = () => { W = el.clientWidth; Hh = el.clientHeight; renderer.setSize(W, Hh, false); camera.aspect = W / Math.max(1, Hh); camera.updateProjectionMatrix(); wake(); };
  new ResizeObserver(resize).observe(el); resize();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }).observe(el);
  function loop(now) {
    raf = 0; if (!visible || document.hidden) return;
    let moving = false;
    if (flight) {
      const k = Math.min(1, (now - flight.t0) / flight.dur), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      controls.target.lerpVectors(flight.fromT, flight.toT, e); camera.position.lerpVectors(flight.fromP, flight.toP, e); moving = true;
      if (k >= 1) flight = null;
    }
    const damping = controls.update();
    const floor = Math.max(0, groundY(camera.position.x, camera.position.z)) + .3; if (camera.position.y < floor) camera.position.y = floor;
    if (dirty || moving || damping) {
      renderer.render(scene, camera);
      for (const s of stops) {
        v3.copy(s.pos).project(camera); const x = (v3.x * .5 + .5) * W, y = (-v3.y * .5 + .5) * Hh; s.x = x; s.y = y;
        s.el.hidden = v3.z > 1 || x < -20 || y < -20 || x > W + 20 || y > Hh + 20;
        if (!s.el.hidden) s.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      }
      // names never pile up: the most important stops keep theirs (now, the airport, today), others hide on overlap
      const placed = [];
      stops.filter(s => !s.el.hidden).sort((a, b) => a.pri - b.pri).forEach(s => {
        const r = { x0: s.x - 11, x1: s.x + 17 + s.w, y0: s.y - 11, y1: s.y + 11 };
        const clash = placed.some(q => r.x0 < q.x1 && r.x1 > q.x0 && r.y0 < q.y1 && r.y1 > q.y0);
        s.lab.classList.toggle("is-hidden", clash); if (!clash) placed.push(r); else placed.push({ x0: s.x - 11, x1: s.x + 11, y0: s.y - 11, y1: s.y + 11 });
      });
    }
    dirty = false;
    if (moving || damping) raf = requestAnimationFrame(loop);
  }
  try { await renderer.compileAsync(scene, camera); } catch {}
  wake();
  return {
    setRoute,
    zoom(f) { fly(controls.target.clone(), camera.position.distanceTo(controls.target) * f, .45); },
    reset() { fitRoute(true); },
  };
}
