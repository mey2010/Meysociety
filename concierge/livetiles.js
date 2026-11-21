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

/* Memory: a phone (Safari above all) closes the page when it holds too many decoded pictures. So the photo files are
   kept compressed (a few hundred KB each) and only the 1024 px piece on screen is decoded, straight into a texture
   whose pixels are dropped from memory as soon as the GPU has them. */
const fileCache = new Map();
export function fileBlob(url, keep = 10) {
  let f = fileCache.get(url);
  if (!f) { f = { used: 0, blob: fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); }) }; f.blob.catch(() => fileCache.delete(url)); fileCache.set(url, f);
    if (fileCache.size > keep) { const old = [...fileCache.entries()].sort((a, b) => a[1].used - b[1].used)[0]; fileCache.delete(old[0]); } }
  f.used = performance.now(); return f.blob;
}
// a w x h piece of a stored picture as a texture (image top at v = 0: the meshes using it map their uv accordingly)
export async function pieceTexture(THREE, blob, x, y, w, h, aniso = 1) {
  let src;
  try { src = await createImageBitmap(blob, x, y, w, h); }
  catch { // older browsers: decode, cut on a canvas
    const u = URL.createObjectURL(blob);
    try { const im = new Image(); im.decoding = "async"; im.src = u; await im.decode(); src = document.createElement("canvas"); src.width = w; src.height = h; src.getContext("2d").drawImage(im, x, y, w, h, 0, 0, w, h); }
    finally { URL.revokeObjectURL(u); }
  }
  const tex = new THREE.Texture(src); tex.flipY = false; tex.needsUpdate = true; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = aniso;
  tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter;
  tex.onUpdate = () => { src.close?.(); if (src.width) { src.width = src.height = 1; } tex.image = { width: w, height: h }; };   // on the GPU now: free the CPU copy
  return tex;
}

export function liveShader(sh, { pull = .015, sharpen = .6 } = {}) {
  sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
    { vec3 t = texture2D(map, vMapUv).rgb; if (all(greaterThan(t, vec3(.0080, .0550, .1330))) && all(lessThan(t, vec3(.0190, .0840, .1800)))) discard; }`);   // the padding blue (30,74,110) of the stored blocks
  sh.vertexShader = sh.vertexShader.replace("#include <project_vertex>", `#include <project_vertex>
    mvPosition.xyz *= ${(1 - pull).toFixed(4)}; gl_Position = projectionMatrix * mvPosition;`);
  if (sharpen) sh.fragmentShader = sh.fragmentShader.replace("#include <map_fragment>", `#include <map_fragment>
    { vec2 px = max(1. / vec2(textureSize(map, 0)), fwidth(vMapUv));
      vec3 blur = (texture2D(map, vMapUv + vec2(px.x, 0.)).rgb + texture2D(map, vMapUv - vec2(px.x, 0.)).rgb
                 + texture2D(map, vMapUv + vec2(0., px.y)).rgb + texture2D(map, vMapUv - vec2(0., px.y)).rgb) * .25;
      diffuseColor.rgb = max(diffuseColor.rgb + (diffuseColor.rgb - blur) * ${sharpen.toFixed(2)}, 0.); }`);
}
export function createLiveTiles({ THREE, scene, renderer, camera, toXZ, fromXZ, heightAt, material, small = false, onChange, bounds, minZ = 16, maxZ = 20, pack = null }) {
  /* pack: the same photo, pre-cut into 2048 px blocks of 8x8 zoom-18 tiles and stored with the page (inside claude.ai,
     where outside image hosts are not reachable). { url(bx, by) -> string | null }. Each 1024 px patch is a quarter
     of a block; the last few blocks stay decoded so neighbouring patches come for free. */
  // a stored file holds one block, or two side by side (url ending "#0" = left half, "#1" = right half)
  const blockFile = (bx, by, z) => { const full = pack.url(bx, by, z) || "", [u, half] = full.split("#");
    return u ? fileBlob(u, small ? 8 : 16).then(blob => ({ blob, off: half === "1" ? 2048 : 0 })) : Promise.reject(0); };
  const live = new Map(), queue = [];
  let inflight = 0, ok = 0, fails = 0, dead = false, last = 0;
  const MAX = small ? 18 : 40, PAR = small ? 4 : 10, N = small ? 32 : 48;
  const aniso = Math.min(16, renderer.capabilities.getMaxAnisotropy());

  function patchMesh(z, sx, sy, tex, topDown = false) {
    const n = 2 ** z, x0 = sx * SUPER, y0 = sy * SUPER;
    const p0 = toXZ(x2lon(x0, n), y2lat(y0, n)), p1 = toXZ(x2lon(x0 + SUPER, n), y2lat(y0 + SUPER, n));
    const g = new THREE.PlaneGeometry(p1.x - p0.x, p1.z - p0.z, N, N).rotateX(-Math.PI / 2); g.translate((p0.x + p1.x) / 2, 0, (p0.z + p1.z) / 2);
    const pos = g.attributes.position, uv = g.attributes.uv;
    for (let k = 0; k < pos.count; k++) {
      const x = pos.getX(k), zz = pos.getZ(k); pos.setY(k, heightAt(x, zz));
      // Mercator rows are not evenly spaced in latitude: each vertex samples the photo exactly where it is
      const ll = fromXZ(x, zz), v = (lat2y(ll.lat, n) - y0) / SUPER; uv.setY(k, topDown ? v : 1 - v);
    }
    const mesh = new THREE.Mesh(g, material(tex, z)); mesh.receiveShadow = true; mesh.renderOrder = z; return mesh;
  }

  function load(e) {
    inflight++;
    if (pack) {   // a quarter of a stored block
      blockFile(e.sx >> 1, e.sy >> 1, e.z).then(({ blob, off }) => pieceTexture(THREE, blob, off + (e.sx & 1) * 1024, (e.sy & 1) * 1024, 1024, 1024, aniso)).then(tex => {
        inflight--; pump(); if (!live.has(e.key) || e.cancel) { tex.image.close?.(); tex.dispose(); return; } ok++;
        e.tex = tex; e.mesh = patchMesh(e.z, e.sx, e.sy, tex, true); e.mesh.visible = e.want; scene.add(e.mesh); onChange?.();
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
