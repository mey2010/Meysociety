/*
 * Intro "saliendo de las nubes": un canvas three.js encima del mapa con capas de nubes que la
 * cámara atraviesa al hacer scroll. Solo trabaja durante la intro: al terminar se oculta y deja
 * de pintar. three se carga bajo demanda para no pesar en la primera carga.
 */

export type Sky = { setProgress: (t: number) => void; destroy: () => void }

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

// Textura de nube: varias "bocanadas" radiales sobre un canvas, con semilla fija.
function cloudTexture(size: number) {
  const c = document.createElement("canvas")
  c.width = c.height = size
  const g = c.getContext("2d")!
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 22; i++) {
    const r = size * (0.12 + rnd() * 0.2)
    const x = size / 2 + (rnd() - 0.5) * size * 0.46
    const y = size / 2 + (rnd() - 0.5) * size * 0.3
    const grad = g.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, "rgba(255,255,255,0.55)")
    grad.addColorStop(0.6, "rgba(255,255,255,0.18)")
    grad.addColorStop(1, "rgba(255,255,255,0)")
    g.fillStyle = grad
    g.fillRect(0, 0, size, size)
  }
  return c
}

export async function createSky(container: HTMLElement, opts: { lowPower: boolean }): Promise<Sky> {
  const THREE = await import("three")
  const count = opts.lowPower ? 70 : 150
  const DEPTH = 420

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.lowPower ? 1 : 1.5))
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(62, 1, 1, 1000)
  const texture = new THREE.CanvasTexture(cloudTexture(256))
  texture.colorSpace = THREE.SRGBColorSpace

  // Nubes repartidas en un túnel delante de la cámara; cada una guarda su posición base.
  let seed = 11
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  type Cloud = { s: InstanceType<typeof THREE.Sprite>; m: InstanceType<typeof THREE.SpriteMaterial>; x: number; y: number; z: number; drift: number }
  const clouds: Cloud[] = []
  for (let i = 0; i < count; i++) {
    const shade = 0.82 + rnd() * 0.18
    const m = new THREE.SpriteMaterial({
      map: texture,
      color: new THREE.Color(shade * 0.97, shade * 0.98, Math.min(1, shade * 1.08)),
      transparent: true,
      depthWrite: false,
      opacity: 0.9,
      rotation: rnd() * Math.PI * 2,
    })
    const s = new THREE.Sprite(m)
    const size = 38 + rnd() * 70
    s.scale.set(size, size * (0.6 + rnd() * 0.3), 1)
    const angle = rnd() * Math.PI * 2
    const radius = 4 + Math.pow(rnd(), 0.7) * 62
    clouds.push({ s, m, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * 0.55 - 6, z: -rnd() * DEPTH, drift: (rnd() - 0.5) * 0.6 })
    scene.add(s)
  }

  let progress = 0
  let raf = 0
  let visible = document.visibilityState === "visible"
  const start = performance.now()

  function resize() {
    const w = container.clientWidth || innerWidth
    const h = container.clientHeight || innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function draw(now: number) {
    const t = progress
    const time = (now - start) / 1000
    // la cámara avanza a través del túnel; las nubes se apartan del centro al final
    camera.position.set(0, 0, 110 - t * (DEPTH + 130))
    const part = 1 + smooth(0.35, 1, t) * 2.4
    const opacity = 0.9 * (1 - smooth(0.7, 1, t))
    for (const c of clouds) {
      c.s.position.set((c.x + c.drift * time) * part, c.y * part, c.z)
      c.m.opacity = opacity
    }
    renderer.render(scene, camera)
  }

  // Solo hay bucle mientras la intro está a la vista: deriva suave de las nubes.
  function loop(now: number) {
    raf = 0
    if (!visible || progress >= 1) return
    draw(now)
    raf = requestAnimationFrame(loop)
  }
  const kick = () => { if (!raf && visible && progress < 1) raf = requestAnimationFrame(loop) }

  const onVis = () => { visible = document.visibilityState === "visible"; kick() }
  document.addEventListener("visibilitychange", onVis)
  addEventListener("resize", resize)
  resize()
  kick()

  return {
    setProgress(t) {
      progress = clamp01(t)
      renderer.domElement.style.display = progress >= 1 ? "none" : ""
      kick()
    },
    destroy() {
      cancelAnimationFrame(raf)
      document.removeEventListener("visibilitychange", onVis)
      removeEventListener("resize", resize)
      for (const c of clouds) c.m.dispose()
      texture.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
