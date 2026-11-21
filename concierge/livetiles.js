/* Street-level sharpness, the way Google Maps does it: as the camera comes down, the aerial photo is streamed live
   from the Spanish national orthophoto (IGN PNOA, 25 cm per pixel, WMTS, CC BY 4.0) at the zoom level that matches
   the screen, 16 photos stitched into one 1024 px texture per patch, draped over the relief. Only the patches in
   view are fetched, nearest first, a few at a time; the ones left behind are freed. If the photos can't be reached
   (offline, or a host that blocks them) the layer switches itself off and the bundled tiles carry on as before. */
const URL_T = (z, x, y) => `https://www.ign.es/wmts/pnoa-ma?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=OI.OrthoimageCoverage&STYLE=default&FORMAT=image/jpeg&TILEMATRIXSET=GoogleMapsCompatible&TILEMATRIX=${z}&TILEROW=${y}&TILECOL=${x}`;
const COS = Math.cos(38.9 * Math.PI / 180), M_PX0 = 156543.034 * COS;   // metres per pixel at zoom 0, at Ibiza's latitude
const SUPER = 4;                                                          // 4x4 photos of 256 px per patch
const lon2x = (lon, n) => (lon + 180) / 360 * n;
const lat2y = (lat, n) => { const r = lat * Math.PI / 180; return (1 - Math.asinh(Math.tan(r)) / Math.PI) / 2 * n; };
const x2lon = (x, n) => x / n * 360 - 180;
const y2lat = (y, n) => Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;

/* Shared shader touches for every sharp photo layer:
   - PULL: each vertex slides toward the eye along its own line of sight (so it stays exactly where it is on screen)
     by a small share of its distance. The photo layers then always win the depth test against the coarse relief
     underneath, which used to poke through on slopes as blurry brown smudges.
   - SHARPEN: a light unsharp mask on the photo, sized to the pixel on screen, so the water over sand, the foam and
     the rocks of every cove read crisp. */
export function liveShader(sh, { pull = .015, sharpen = .6 } = {}) {
  sh.vertexShader = sh.vertexShader.replace("#include <project_vertex>", `#include <project_vertex>
    mvPosition.xyz *= ${(1 - pull).toFixed(4)}; gl_Position = projectionMatrix * mvPosition;`);
  if (sharpen) sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
    { vec2 px = max(1. / vec2(textureSize(map, 0)), fwidth(vMapUv));
      vec3 blur = (texture2D(map, vMapUv + vec2(px.x, 0.)).rgb + texture2D(map, vMapUv - vec2(px.x, 0.)).rgb
                 + texture2D(map, vMapUv + vec2(0., px.y)).rgb + texture2D(map, vMapUv - vec2(0., px.y)).rgb) * .25;
      diffuseColor.rgb = max(diffuseColor.rgb + (diffuseColor.rgb - blur) * ${sharpen.toFixed(2)}, 0.); }`);
}
// the stored blocks pad the open sea (never photographed at this scale) with one flat blue: made see-through
function knockOutPad(c) {
  const cx = c.getContext("2d", { willReadFrequently: true }), im = cx.getImageData(0, 0, c.width, c.height), d = im.data;
  let hit = 0;
  for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - 30) < 7 && Math.abs(d[i + 1] - 74) < 7 && Math.abs(d[i + 2] - 110) < 7) { d[i + 3] = 0; hit++; }
  if (hit) cx.putImageData(im, 0, 0);
}

export function createLiveTiles({ THREE, scene, renderer, camera, toXZ, fromXZ, heightAt, material, small = false, onChange, bounds, minZ = 16, maxZ = 20, pack = null }) {
  /* pack: the same photo, pre-cut into 2048 px blocks of 8x8 zoom-18 tiles and stored with the page (inside claude.ai,
     where outside image hosts are not reachable). { url(bx, by) -> string | null }. Each 1024 px patch is a quarter
     of a block; the last few blocks stay decoded so neighbouring patches come for free. */
  const blocks = new Map();
  // a stored file holds one block, or two side by side (url ending "#0" = left half, "#1" = right half)
  const blockImg = (bx, by, z) => {
    const full = pack.url(bx, by, z) || "", [u0, half] = full.split("#"), k = u0; let b = blocks.get(k);
    if (b) b.used = performance.now();
    const off = half === "1" ? 2048 : 0;
    if (!b) {
      const u = u0;
      b = { used: 0, img: u ? new Promise((ok, no) => { const im = new Image(); im.decoding = "async"; im.onload = () => ok(im); im.onerror = no; im.src = u; }) : Promise.reject(0) };
      b.img.catch(() => {}); blocks.set(k, b);
      if (blocks.size > (small ? 4 : 8)) { const old = [...blocks.entries()].sort((x, y) => x[1].used - y[1].used)[0]; blocks.delete(old[0]); }
    }
    b.used = performance.now(); return b.img.then(im => ({ im, off }));
  };
  const live = new Map(), queue = [];
  let inflight = 0, ok = 0, fails = 0, dead = false, last = 0;
  const MAX = small ? 30 : 42, PAR = small ? 6 : 10, N = small ? 32 : 48;
  const aniso = Math.min(16, renderer.capabilities.getMaxAnisotropy());

  function patchMesh(z, sx, sy, tex) {
    const n = 2 ** z, x0 = sx * SUPER, y0 = sy * SUPER;
    const p0 = toXZ(x2lon(x0, n), y2lat(y0, n)), p1 = toXZ(x2lon(x0 + SUPER, n), y2lat(y0 + SUPER, n));
    const g = new THREE.PlaneGeometry(p1.x - p0.x, p1.z - p0.z, N, N).rotateX(-Math.PI / 2); g.translate((p0.x + p1.x) / 2, 0, (p0.z + p1.z) / 2);
    const pos = g.attributes.position, uv = g.attributes.uv;
    for (let k = 0; k < pos.count; k++) {
      const x = pos.getX(k), zz = pos.getZ(k); pos.setY(k, heightAt(x, zz));
      // Mercator rows are not evenly spaced in latitude: each vertex samples the photo exactly where it is
      const ll = fromXZ(x, zz); uv.setY(k, 1 - (lat2y(ll.lat, n) - y0) / SUPER);
    }
    const mesh = new THREE.Mesh(g, material(tex, z)); mesh.receiveShadow = true; mesh.renderOrder = z; return mesh;
  }

  function load(e) {
    inflight++;
    if (pack) {   // a quarter of a stored block
      blockImg(e.sx >> 1, e.sy >> 1, e.z).then(({ im, off }) => {
        const c = document.createElement("canvas"); c.width = c.height = 1024;
        c.getContext("2d", { willReadFrequently: true }).drawImage(im, off + (e.sx & 1) * 1024, (e.sy & 1) * 1024, 1024, 1024, 0, 0, 1024, 1024);
        knockOutPad(c);
        inflight--; pump(); if (!live.has(e.key) || e.cancel) return; ok++;
        const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso;
        tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
        e.tex = tex; e.mesh = patchMesh(e.z, e.sx, e.sy, tex); e.mesh.visible = e.want; scene.add(e.mesh); onChange?.();
      }).catch(() => { inflight--; e.failed = true; pump(); });
      return;
    }
    // the sharp level gets 1024 px patches; the wider backdrop levels behind it 512 px (they are further away)
    const S = e.sharp ? 256 : 128, c = document.createElement("canvas"); c.width = c.height = S * SUPER; const cx = c.getContext("2d");
    let left = SUPER * SUPER, got = 0;
    const done = () => {
      if (--left) return; inflight--; pump();
      if (!live.has(e.key) || e.cancel) return;
      if (!got) { e.failed = true; return; }
      const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso;
      tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
      e.tex = tex; e.mesh = patchMesh(e.z, e.sx, e.sy, tex); e.mesh.visible = e.want; scene.add(e.mesh); onChange?.();
    };
    for (let i = 0; i < SUPER; i++) for (let j = 0; j < SUPER; j++) {
      const im = new Image(); im.crossOrigin = "anonymous"; im.decoding = "async";
      im.onload = () => { ok++; fails = 0; got++; cx.drawImage(im, i * S, j * S, S, S); done(); };
      im.onerror = () => { if (!ok && ++fails > 24) dead = true; done(); };
      im.src = URL_T(e.z, e.sx * SUPER + i, e.sy * SUPER + j);
    }
  }
  function pump() {
    if (dead) return;
    queue.sort((a, b) => a.d - b.d);
    while (inflight < (pack ? PAR : PAR / 2) && queue.length) { const e = queue.shift(); if (!e.cancel && live.has(e.key)) load(e); }   // each patch is 16 requests: two or so at a time
  }
  function drop(k, e) { e.cancel = true; if (e.mesh) { scene.remove(e.mesh); e.mesh.geometry.dispose(); e.mesh.material.dispose(); } e.tex?.dispose(); live.delete(k); }

  // which level the screen needs right now: the photo's pixel no bigger than the screen's pixel at the focus
  function levelFor(dist) {
    const h = renderer.domElement.clientHeight || 600, dpr = renderer.getPixelRatio();
    const mpp = 2 * dist * 1000 * Math.tan(camera.fov * Math.PI / 360) / (h * dpr);
    return Math.min(maxZ, Math.ceil(Math.log2(M_PX0 / mpp)));
  }

  function update(target, now = performance.now(), force = false) {
    if (dead || (!force && now - last < 180)) return; last = now;
    const dist = camera.position.distanceTo(target), z = levelFor(dist);
    const wanted = new Set();
    if (z >= minZ) {
      const ll = fromXZ(target.x, target.z);
      // the level the screen needs, plus two coarser rings behind it: they cover the whole view out to the haze, so
      // the photographed sea and coast never end in a visible edge, and they fill in first while the sharp ones arrive
      // stored blocks exist at zoom 18 only: shown from the moment the screen needs finer than the bundled tiles
      // and around every marked place a zoom-20 photo (~12 cm per pixel, the sharpest the national orthophoto gives) on top
      const levels = pack ? (z >= 17 ? [[18, small ? 1 : 2], ...(z >= 19 ? [[20, 1]] : [])] : []) : [[z, 1], [z - 1, 1], [z - 2, 1]];
      for (const [lz, R] of levels) {
        if (!pack && lz < minZ - 1) continue;
        const n = 2 ** lz, cx = Math.floor(lon2x(ll.lon, n) / SUPER), cy = Math.floor(lat2y(ll.lat, n) / SUPER);
        const fx = lon2x(ll.lon, n) / SUPER - cx - .5, fy = lat2y(ll.lat, n) / SUPER - cy - .5;
        for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
          const sx = cx + dx, sy = cy + dy;
          if (bounds) { const lon = x2lon(sx * SUPER, n), lat = y2lat(sy * SUPER, n); if (lon > bounds.lon1 || lon + SUPER * 360 / n < bounds.lon0 || lat < bounds.lat0 || y2lat((sy + 1) * SUPER, n) > bounds.lat1) continue; }
          if (pack && !pack.url(sx >> 1, sy >> 1, lz)) continue;   // open sea: no block stored
          const key = `${lz}/${sx}/${sy}`; wanted.add(key);
          const d = Math.hypot(dx - fx, dy - fy) + (z - lz) * .45;
          let e = live.get(key);
          if (!e) { e = { key, z: lz, sx, sy, d, used: now, want: true, sharp: lz === z }; live.set(key, e); queue.push(e); }
          e.d = d; e.used = now; e.want = true;
        }
      }
    }
    live.forEach((e, k) => {
      const want = wanted.has(k);
      if (!want) e.want = false;
      if (e.mesh && e.mesh.visible !== want) { e.mesh.visible = want; onChange?.(); }
      if (!want && !e.mesh && !e.failed) { const i = queue.indexOf(e); if (i >= 0) { queue.splice(i, 1); live.delete(k); } }
    });
    if (live.size > MAX) [...live.entries()].filter(([, e]) => !e.want).sort((a, b) => a[1].used - b[1].used).slice(0, live.size - MAX).forEach(([k, e]) => drop(k, e));
    pump();
  }
  return { update, get active() { return !dead; }, levelFor };
}
