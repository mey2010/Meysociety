/*
 * El logo de Mey Society como objeto 3D: una moneda con la imagen del logo en las caras, un canto
 * holográfico animado con los colores de la marca y reflejos cromados. Gira despacio, se inclina
 * hacia el puntero con inercia y da media vuelta al pasar por cada servicio de la columna.
 * Solo pinta mientras se ve; three se carga bajo demanda.
 */
export type Coin = { focus: (i: number) => void; setVisible: (v: boolean) => void; destroy: () => void }

export async function createCoin(host: HTMLElement, opts: { reduced: boolean; lowPower: boolean }): Promise<Coin> {
  const THREE = await import("three")
  const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js")

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" })
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, opts.lowPower ? 1.5 : 2))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.outputColorSpace = THREE.SRGBColorSpace
  host.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = env

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
  camera.position.set(0, 0, 4.4)

  // caras: la imagen del logo
  const tex = await new THREE.TextureLoader().loadAsync("/brand/logo.png")
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
  const face = new THREE.MeshPhysicalMaterial({ map: tex, metalness: 0.35, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 })

  // canto: remolino holográfico con los colores del logo
  const rim = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uShift: { value: 0 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float uTime; uniform float uShift; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      vec3 pal(float t){
        vec3 c0 = vec3(0.325,0.682,0.800); vec3 c1 = vec3(0.137,0.259,0.710);
        vec3 c2 = vec3(0.478,0.188,0.769); vec3 c3 = vec3(0.816,0.267,0.863);
        t = fract(t) * 4.0;
        if (t < 1.0) return mix(c0, c1, t); if (t < 2.0) return mix(c1, c2, t - 1.0);
        if (t < 3.0) return mix(c2, c3, t - 2.0); return mix(c3, c0, t - 3.0);
      }
      void main(){
        float u = vUv.x * 6.2831; float v = vUv.y;
        float swirl = sin(u * 9.0 + uTime * 0.6 + sin(v * 7.0 + u * 3.0 + uTime) * 1.4) * 0.5 + 0.5;
        vec3 col = pal(swirl * 0.9 + u / 6.2831 + uShift + uTime * 0.03);
        float fres = pow(1.0 - max(dot(vN, vV), 0.0), 2.0);
        col += vec3(0.9, 0.92, 1.0) * fres * 0.55;
        gl_FragColor = vec4(col, 1.0);
      }`,
  })

  const geo = new THREE.CylinderGeometry(1, 1, 0.13, 160, 1, false)
  const coin = new THREE.Mesh(geo, [rim, face, face])
  coin.rotation.x = Math.PI / 2 // la cara mira a la cámara
  const pivot = new THREE.Group()
  pivot.add(coin)
  scene.add(pivot)

  // estado con inercia (resortes simples)
  const target = { x: 0, y: 0, spin: 0, shift: 0 }
  const cur = { x: 0, y: 0, spin: 0, shift: 0 }
  let visible = true
  let raf = 0
  const t0 = performance.now()

  function resize() {
    const w = host.clientWidth || 1
    const h = host.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function frame(now: number) {
    raf = 0
    if (!visible) return
    const t = (now - t0) / 1000
    const k = opts.reduced ? 1 : 0.075
    cur.x += (target.x - cur.x) * k
    cur.y += (target.y - cur.y) * k
    cur.spin += (target.spin - cur.spin) * (opts.reduced ? 1 : 0.06)
    cur.shift += (target.shift - cur.shift) * 0.05
    const idle = opts.reduced ? 0 : Math.sin(t * 0.45) * 0.32
    pivot.rotation.set(cur.y * 0.35, idle + cur.x * 0.5 + cur.spin, 0)
    pivot.position.y = opts.reduced ? 0 : Math.sin(t * 0.9) * 0.04
    rim.uniforms.uTime.value = opts.reduced ? 0 : t
    rim.uniforms.uShift.value = cur.shift
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }
  const kick = () => { if (!raf && visible) raf = requestAnimationFrame(frame) }

  const onPointer = (e: PointerEvent) => {
    target.x = (e.clientX / innerWidth) * 2 - 1
    target.y = (e.clientY / innerHeight) * 2 - 1
  }
  const ro = new ResizeObserver(resize)
  ro.observe(host)
  addEventListener("pointermove", onPointer, { passive: true })
  resize()
  kick()

  return {
    focus(i) {
      // media vuelta por servicio y un giro de color: el logo "responde" a la columna
      target.spin = Math.round(target.spin / Math.PI) * Math.PI + Math.PI
      target.shift = i * 0.11
      kick()
    },
    setVisible(v) {
      if (v === visible) return
      visible = v
      renderer.domElement.style.visibility = v ? "" : "hidden"
      kick()
    },
    destroy() {
      cancelAnimationFrame(raf)
      ro.disconnect()
      removeEventListener("pointermove", onPointer)
      geo.dispose(); rim.dispose(); face.dispose(); tex.dispose(); env.dispose(); pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    },
  }
}
