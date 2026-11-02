/*
 * El mundo 3D de Mey Society: una sola escena three.js a pantalla completa que el scroll recorre.
 *   1. Partículas de luz con los colores del logo que se juntan y forman el monograma MS.
 *   2. El logo como moneda 3D: canto holográfico, caras con la imagen del logo, reflejos cromados.
 *   3. Un vórtice de hilos de luz por el que viaja la cámara, con paneles de cristal flotando:
 *      uno por servicio.
 * Solo uniforms y transforms por fotograma; el bucle se detiene si la pestaña no se ve.
 */
import type { Service } from "@/lib/data"

export type World = {
  setProgress: (p: number) => void
  setPointer: (x: number, y: number) => void
  cardProgress: (i: number) => number
  destroy: () => void
}

const PALETTE = ["#53AECC", "#2342B5", "#4A25BF", "#7A30C4", "#D044DC"]
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t) }

// tramos del recorrido (progreso 0–1 del scroll)
export const SEG = { logo: [0, 0.1], coin: [0.1, 0.24], tunnel: [0.26, 0.9], end: [0.9, 1] } as const

const PAL_GLSL = `vec3 pal(float t){ vec3 a=vec3(.325,.682,.8), b=vec3(.137,.259,.71), c=vec3(.478,.188,.769), d=vec3(.816,.267,.863); t=fract(t)*4.;
  if(t<1.) return mix(a,b,t); if(t<2.) return mix(b,c,t-1.); if(t<3.) return mix(c,d,t-2.); return mix(d,a,t-3.); }`

/** Textura de un panel: campo holográfico con el nombre del servicio. */
function panelTexture(s: Service, seed: number, display: string) {
  const W = 1024, H = 640
  const c = document.createElement("canvas")
  c.width = W; c.height = H
  const g = c.getContext("2d")!
  let r = seed * 9301 + 49297
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280)
  g.fillStyle = "#07061c"; g.fillRect(0, 0, W, H)
  for (let i = 0; i < 26; i++) {
    const x = rnd() * W, y = rnd() * H, rad = 80 + rnd() * 320
    const col = PALETTE[Math.floor(rnd() * PALETTE.length)]
    const grad = g.createRadialGradient(x, y, 0, x, y, rad)
    grad.addColorStop(0, col + "cc"); grad.addColorStop(1, col + "00")
    g.globalCompositeOperation = i % 3 ? "lighter" : "source-over"
    g.fillStyle = grad; g.fillRect(0, 0, W, H)
  }
  g.globalCompositeOperation = "source-over"
  const shade = g.createLinearGradient(0, 0, 0, H)
  shade.addColorStop(0, "rgba(5,4,20,0.05)"); shade.addColorStop(1, "rgba(5,4,20,0.75)")
  g.fillStyle = shade; g.fillRect(0, 0, W, H)
  g.fillStyle = "#EEF0F7"
  g.font = `700 84px ${display}`
  const words = s.name.toUpperCase().split(" ")
  const lines: string[] = []
  let line = ""
  for (const w of words) { const t = line ? line + " " + w : w; if (g.measureText(t).width > W - 120) { lines.push(line); line = w } else line = t }
  lines.push(line)
  let y = H - 70 - (lines.length - 1) * 92
  for (const l of lines) { g.fillText(l, 60, y); y += 92 }
  return c
}

export async function createWorld(canvas: HTMLCanvasElement, services: Service[], opts: { reduced: boolean; lowPower: boolean; display: string }): Promise<World> {
  const THREE = await import("three")
  const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js")

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !opts.lowPower, powerPreference: "high-performance" })
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, opts.lowPower ? 1.5 : 2))
  renderer.setClearColor(0x04030f, 1)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x04030f, 0.018)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400)

  const logoTex = await new THREE.TextureLoader().loadAsync("/brand/logo.png")
  logoTex.colorSpace = THREE.SRGBColorSpace

  /* ---------- 1. Partículas que forman el logo ---------- */
  const img = logoTex.image as HTMLImageElement
  const SAMPLE = 160
  const sc = document.createElement("canvas")
  sc.width = sc.height = SAMPLE
  const sg = sc.getContext("2d", { willReadFrequently: true })!
  sg.drawImage(img, 0, 0, SAMPLE, SAMPLE)
  const px = sg.getImageData(0, 0, SAMPLE, SAMPLE).data
  const targets: number[] = []
  const colors: number[] = []
  for (let y = 0; y < SAMPLE; y++) for (let x = 0; x < SAMPLE; x++) {
    const k = (y * SAMPLE + x) * 4
    const a = px[k + 3], rr = px[k], gg = px[k + 1], bb = px[k + 2]
    const sat = Math.max(rr, gg, bb) - Math.min(rr, gg, bb)
    // el anillo holográfico y las letras (saturados u oscuros), no el disco blanco
    if (a > 200 && (sat > 60 || rr + gg + bb < 420)) { targets.push(x / SAMPLE - 0.5, 0.5 - y / SAMPLE); colors.push(rr / 255, gg / 255, bb / 255) }
  }
  const N = Math.min(targets.length / 2, opts.lowPower ? 9000 : 16000)
  const pos = new Float32Array(N * 3), tgt = new Float32Array(N * 3), col = new Float32Array(N * 3), rnd = new Float32Array(N)
  const step = targets.length / 2 / N
  for (let i = 0; i < N; i++) {
    const j = Math.floor(i * step)
    tgt[i * 3] = targets[j * 2] * 5.2; tgt[i * 3 + 1] = targets[j * 2 + 1] * 5.2; tgt[i * 3 + 2] = (Math.random() - 0.5) * 0.15
    const th = Math.random() * Math.PI * 2, rad = 3 + Math.random() * 14
    pos[i * 3] = Math.cos(th) * rad; pos[i * 3 + 1] = Math.sin(th) * rad * 0.7; pos[i * 3 + 2] = (Math.random() - 0.5) * 18
    col[i * 3] = colors[j * 3]; col[i * 3 + 1] = colors[j * 3 + 1]; col[i * 3 + 2] = colors[j * 3 + 2]
    rnd[i] = Math.random()
  }
  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
  pGeo.setAttribute("aTarget", new THREE.BufferAttribute(tgt, 3))
  pGeo.setAttribute("aColor", new THREE.BufferAttribute(col, 3))
  pGeo.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 1))
  const pMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uForm: { value: 0 }, uFade: { value: 1 }, uTime: { value: 0 }, uScale: { value: 1 } },
    vertexShader: `attribute vec3 aTarget; attribute vec3 aColor; attribute float aRnd; uniform float uForm; uniform float uTime; uniform float uScale; varying vec3 vC; varying float vR;
      void main(){
        float f = smoothstep(0.0, 1.0, clamp(uForm * 1.4 - aRnd * 0.4, 0.0, 1.0));
        vec3 p = mix(position, aTarget, f);
        p += vec3(sin(uTime * 0.7 + aRnd * 40.0), cos(uTime * 0.5 + aRnd * 30.0), sin(uTime * 0.3 + aRnd * 20.0)) * (0.02 + (1.0 - f) * 0.35);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (2.6 + aRnd * 3.6) * uScale * (8.0 / -mv.z);
        gl_Position = projectionMatrix * mv; vC = aColor; vR = aRnd; }`,
    fragmentShader: `uniform float uFade; varying vec3 vC; varying float vR;
      void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; float a = smoothstep(0.5, 0.0, d);
        vec3 c = mix(vC * 2.0 + 0.08, vec3(1.0, 0.8, 0.96), step(0.9, vR) * 0.7); gl_FragColor = vec4(c * a, a * uFade); }`,
  })
  const particles = new THREE.Points(pGeo, pMat)
  scene.add(particles)

  /* ---------- 2. La moneda del logo ---------- */
  const face = new THREE.MeshPhysicalMaterial({ map: logoTex, metalness: 0.35, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true })
  const rimMat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uTime: { value: 0 }, uFade: { value: 1 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uTime; uniform float uFade; varying vec2 vUv; varying vec3 vN; varying vec3 vV; ${PAL_GLSL}
      void main(){ float u = vUv.x*6.2831; float s = sin(u*9.+uTime*.6+sin(vUv.y*7.+u*3.+uTime)*1.4)*.5+.5;
        vec3 col = pal(s*.9+u/6.2831+uTime*.03); col += vec3(.9,.92,1.)*pow(1.-max(dot(vN,vV),0.),2.)*.55; gl_FragColor = vec4(col, uFade); }`,
  })
  const coinGeo = new THREE.CylinderGeometry(1, 1, 0.13, 160)
  const coin = new THREE.Mesh(coinGeo, [rimMat, face, face])
  coin.rotation.x = Math.PI / 2
  const coinPivot = new THREE.Group()
  coinPivot.add(coin)
  coinPivot.position.set(0, 0, -6)
  scene.add(coinPivot)

  /* ---------- 3. Vórtice de hilos de luz y paneles de servicios ---------- */
  const T0 = -16, T1 = -16 - services.length * 14 - 20
  const threads = new THREE.Group()
  const THREADS = opts.lowPower ? 70 : 140, SEGS = 220
  const tMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uFade: { value: 0 } },
    vertexShader: `attribute float aT; attribute float aHue; varying float vT; varying float vH; void main(){ vT = aT; vH = aHue; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `uniform float uTime; uniform float uFade; varying float vT; varying float vH; ${PAL_GLSL}
      void main(){ float k = fract(vT*3.-uTime*.25+vH); float pulse = smoothstep(.0,.2,k)*smoothstep(1.,.6,k);
        gl_FragColor = vec4(pal(vH+vT*.6), (.12+pulse*.55)*uFade); }`,
  })
  for (let k = 0; k < THREADS; k++) {
    const pts = new Float32Array(SEGS * 3), ts = new Float32Array(SEGS), hs = new Float32Array(SEGS)
    const a0 = Math.random() * Math.PI * 2, turns = 3 + Math.random() * 3, r0 = 2.2 + Math.random() * 3.8, hue = Math.random()
    for (let s = 0; s < SEGS; s++) {
      const t = s / (SEGS - 1)
      const a = a0 + t * turns * Math.PI * 2
      const r = r0 * (0.75 + 0.25 * Math.sin(t * 9 + k))
      pts[s * 3] = Math.cos(a) * r; pts[s * 3 + 1] = Math.sin(a) * r; pts[s * 3 + 2] = T0 + (T1 - T0) * t
      ts[s] = t; hs[s] = hue
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(pts, 3))
    g.setAttribute("aT", new THREE.BufferAttribute(ts, 1))
    g.setAttribute("aHue", new THREE.BufferAttribute(hs, 1))
    threads.add(new THREE.Line(g, tMat))
  }
  scene.add(threads)

  await document.fonts?.ready
  const cards: InstanceType<typeof THREE.Mesh>[] = []
  const cardZ: number[] = []
  services.forEach((s, i) => {
    const tex = new THREE.CanvasTexture(panelTexture(s, i + 3, opts.display))
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 8
    const m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.94, side: THREE.DoubleSide })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.125), m)
    const side = i % 2 ? 1 : -1
    const z = T0 - 10 - i * 14
    mesh.position.set(side * 2.2, (i % 3 - 1) * 0.35, z)
    mesh.rotation.y = -side * 0.38
    scene.add(mesh)
    cards.push(mesh)
    cardZ.push(z)
  })

  /* ---------- Cámara guiada por el scroll ---------- */
  const tunnelLen = SEG.tunnel[1] - SEG.tunnel[0]
  const zStart = -2.5
  const zEnd = cardZ[cardZ.length - 1] + 1.5
  const zAt = (p: number) => {
    if (p < SEG.coin[0]) return 12 - smooth(0, SEG.logo[1], p) * 3
    if (p < SEG.tunnel[0]) return 9 - smooth(SEG.coin[0], SEG.tunnel[0], p) * 11.5
    if (p < SEG.tunnel[1]) return zStart + (zEnd - zStart) * ((p - SEG.tunnel[0]) / tunnelLen)
    return zEnd - smooth(SEG.end[0], 1, p) * 14
  }
  // progreso en el que la cámara queda delante del panel i
  const cardProgress = (i: number) => SEG.tunnel[0] + ((cardZ[i] + 5.5 - zStart) / (zEnd - zStart)) * tunnelLen

  let progress = 0, view = 0, landscape = true
  const ptr = { x: 0, y: 0, cx: 0, cy: 0 }
  let raf = 0, visible = document.visibilityState === "visible"
  const t0 = performance.now()

  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    landscape = w >= h
    camera.fov = landscape ? 42 : 58 // en vertical, más campo para que quepa el logo
    camera.updateProjectionMatrix()
    pMat.uniforms.uScale.value = (h / 900) * renderer.getPixelRatio()
  }

  function frame(now: number) {
    raf = 0
    if (!visible) return
    const t = (now - t0) / 1000
    view += (progress - view) * (opts.reduced ? 1 : 0.09)
    ptr.cx += (ptr.x - ptr.cx) * 0.06; ptr.cy += (ptr.y - ptr.cy) * 0.06
    const p = view

    pMat.uniforms.uTime.value = opts.reduced ? 0 : t
    // el logo se forma solo al llegar y se deshace al bajar hacia la moneda
    pMat.uniforms.uForm.value = opts.reduced ? 1 : smooth(0.2, 2.6, t) * (1 - smooth(0.04, SEG.coin[0] + 0.02, p))
    pMat.uniforms.uFade.value = 1 - smooth(SEG.coin[0], SEG.coin[0] + 0.06, p) + smooth(SEG.end[0] + 0.03, 1, p)
    particles.position.z = p > SEG.end[0] ? zAt(p) - 9 : 0

    const coinIn = smooth(SEG.logo[1] - 0.04, SEG.coin[0] + 0.04, p) * (1 - smooth(SEG.coin[1], SEG.tunnel[0] + 0.02, p))
    rimMat.uniforms.uFade.value = coinIn
    face.opacity = coinIn
    coinPivot.visible = coinIn > 0.01
    coinPivot.rotation.set(ptr.cy * 0.3, (opts.reduced ? 0 : t * 0.5) + ptr.cx * 0.6, 0)
    coinPivot.position.set(landscape ? 2.55 : 0, landscape ? 0 : 1.15, -6)
    coinPivot.scale.setScalar(landscape ? 1.25 : 0.95)
    rimMat.uniforms.uTime.value = t

    const tun = smooth(SEG.coin[1] - 0.02, SEG.tunnel[0] + 0.04, p) * (1 - smooth(SEG.end[0] + 0.02, 1, p) * 0.7)
    tMat.uniforms.uFade.value = tun
    tMat.uniforms.uTime.value = opts.reduced ? 0 : t
    threads.rotation.z = (opts.reduced ? 0 : t * 0.06) + p * 4
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i]
      c.visible = tun > 0.01
      c.position.y = (i % 3 - 1) * 0.35 + (opts.reduced ? 0 : Math.sin(t * 0.8 + i) * 0.06)
      // se desvanece al pasar junto a la cámara para no llenar la pantalla
      const dz = c.position.z - zAt(p);
      (c.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = 0.94 * smooth(-1.4, -4.2, dz)
    }

    camera.position.set(ptr.cx * 0.6, -ptr.cy * 0.4, zAt(p))
    camera.lookAt(ptr.cx * 0.2, -ptr.cy * 0.1, zAt(p) - 10)
    renderer.render(scene, camera)
    if (!opts.reduced || Math.abs(progress - view) > 0.0005) raf = requestAnimationFrame(frame)
  }
  const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame) }
  const onVis = () => { visible = document.visibilityState === "visible"; kick() }
  document.addEventListener("visibilitychange", onVis)
  const ro = new ResizeObserver(() => { resize(); kick() })
  ro.observe(canvas)
  resize()
  kick()

  return {
    setProgress(p) { progress = clamp01(p); kick() },
    setPointer(x, y) { ptr.x = x; ptr.y = y; kick() },
    cardProgress,
    destroy() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      scene.traverse((o) => {
        const m = o as unknown as { geometry?: { dispose: () => void }; material?: { dispose: () => void } | { dispose: () => void }[] }
        m.geometry?.dispose()
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : []
        for (const mt of mats) { (mt as { map?: { dispose: () => void } }).map?.dispose(); mt.dispose() }
      })
      env.dispose(); pmrem.dispose(); renderer.dispose()
    },
  }
}
