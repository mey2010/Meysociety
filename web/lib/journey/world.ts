/* eslint-disable @typescript-eslint/no-explicit-any -- Cesium se carga como global desde su CDN */
/*
 * Capa geográfica: CesiumJS + Google Photorealistic 3D Tiles.
 *
 * Sin API key cae a fotografía de satélite (Esri World Imagery) sobre el elipsoide:
 * geografía real, sin relieve, solo como vista previa de desarrollo. En ese modo las
 * cámaras muy bajas se elevan para que el suelo plano no se vea de canto.
 * Ningún contenido de Google se captura ni se almacena: todo se renderiza en vivo y las
 * atribuciones quedan visibles en #credits.
 */
import type { Camera } from "@/lib/content"
import { sunTimes } from "@/lib/geo"

export const CESIUM_BASE = process.env.NEXT_PUBLIC_CESIUM_BASE || "https://cdn.jsdelivr.net/npm/cesium@1.120.0/Build/Cesium/"

declare global {
  interface Window {
    Cesium?: any
    CESIUM_BASE_URL?: string
  }
}

let loading: Promise<any> | null = null

/** Carga Cesium.js y su hoja de estilos una sola vez. Rechaza si no llega en 20 s. */
export function loadCesium(base = CESIUM_BASE): Promise<any> {
  if (window.Cesium) return Promise.resolve(window.Cesium)
  if (loading) return loading
  window.CESIUM_BASE_URL = base
  loading = new Promise((resolve, reject) => {
    const css = document.createElement("link")
    css.rel = "stylesheet"
    css.href = `${base}Widgets/widgets.css`
    document.head.appendChild(css)
    const s = document.createElement("script")
    s.src = `${base}Cesium.js`
    s.async = true
    const timer = window.setTimeout(() => reject(new Error("Cesium timeout")), 20000)
    s.onload = () => {
      window.clearTimeout(timer)
      if (window.Cesium) resolve(window.Cesium)
      else reject(new Error("Cesium missing"))
    }
    s.onerror = () => {
      window.clearTimeout(timer)
      reject(new Error("Cesium failed to load"))
    }
    document.head.appendChild(s)
  })
  loading.catch(() => { loading = null })
  return loading
}

// Etalonaje en postproceso: hora dorada (calidez en luces, sombras ámbar) y noche
// (desaturado, azul, oscurecido, con las luces más brillantes conservadas como farolas).
const GRADE_SHADER = `
uniform sampler2D colorTexture;
uniform float u_golden;
uniform float u_night;
in vec2 v_textureCoordinates;
void main() {
  vec4 c = texture(colorTexture, v_textureCoordinates);
  vec3 col = c.rgb;
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  vec3 warm = col * vec3(1.09, 0.97, 0.82) + vec3(0.06, 0.025, 0.0) * (1.0 - lum);
  col = mix(col, warm, u_golden);
  vec3 night = mix(vec3(lum), col, 0.3) * vec3(0.34, 0.44, 0.74) * 0.6;
  night += smoothstep(0.72, 1.0, lum) * vec3(1.0, 0.78, 0.48) * 0.45;
  col = mix(col, night, u_night);
  out_FragColor = vec4(col, c.a);
}`

// Fecha de referencia del recorrido: pleno verano, para que el cielo de Cesium
// pase del mediodía al atardecer y a la hora azul con el sol real de Ibiza.
const SUMMER = sunTimes(new Date("2026-07-15T12:00:00Z"), 38.95, 1.35)

export type World = {
  mode: "google" | "satellite"
  setCamera: (k: Camera) => void
  setLight: (light: number) => void
  ready: () => Promise<void>
  destroy: () => void
}

export async function createWorld(
  C: any,
  container: HTMLElement,
  creditContainer: HTMLElement,
  { apiKey, lowPower }: { apiKey: string; lowPower: boolean },
): Promise<World> {
  const useGoogle = Boolean(apiKey)
  const toRad = C.Math.toRadians

  const viewer = new C.Viewer(container, {
    animation: false, timeline: false, baseLayerPicker: false, geocoder: false,
    homeButton: false, sceneModePicker: false, navigationHelpButton: false,
    fullscreenButton: false, infoBox: false, selectionIndicator: false,
    creditContainer,
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    shouldAnimate: false,
    globe: useGoogle ? false : undefined,
    baseLayer: useGoogle
      ? false
      : new C.ImageryLayer(
          new C.UrlTemplateImageryProvider({
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            maximumLevel: 18,
            credit: "Imagery © Esri, Maxar, Earthstar Geographics",
          }),
          { brightness: 1.06, contrast: 1.1, saturation: 0.92, gamma: 1.04 },
        ),
  })

  const scene = viewer.scene
  // El scroll es el único control de cámara.
  scene.screenSpaceCameraController.enableInputs = false
  viewer.resolutionScale = lowPower ? 0.7 : Math.min(window.devicePixelRatio, 1.5)
  scene.skyAtmosphere.show = true
  scene.fog.enabled = true
  scene.highDynamicRange = false
  if (scene.globe) {
    scene.globe.showGroundAtmosphere = true
    scene.globe.enableLighting = true
    scene.globe.baseColor = C.Color.fromCssColorString("#0E3A5B")
  }

  let tileset: any = null
  if (useGoogle) {
    C.GoogleMaps.defaultApiKey = apiKey
    tileset = await C.createGooglePhotorealistic3DTileset(undefined, { maximumScreenSpaceError: lowPower ? 24 : 12 })
    scene.primitives.add(tileset)
  }

  let grade: any = null
  try {
    grade = scene.postProcessStages.add(
      new C.PostProcessStage({ fragmentShader: GRADE_SHADER, uniforms: { u_golden: 0, u_night: 0 } }),
    )
  } catch (err) {
    console.warn("Grade stage unavailable", err)
  }

  const t0 = C.JulianDate.fromDate(new Date(SUMMER.noon.getTime() + 60 * 60000))
  const t1 = C.JulianDate.fromDate(new Date(SUMMER.sunset.getTime() - 12 * 60000))
  const t2 = C.JulianDate.fromDate(new Date(SUMMER.sunset.getTime() + 40 * 60000))
  const scratch = new C.JulianDate()

  return {
    mode: useGoogle ? "google" : "satellite",
    setCamera(k) {
      let { height, pitch } = k
      if (!useGoogle && height < 2400) {
        height = 2400
        pitch = Math.min(pitch, -34)
      }
      viewer.camera.setView({
        destination: C.Cartesian3.fromDegrees(k.lon, k.lat, height),
        orientation: { heading: toRad(k.heading), pitch: toRad(pitch), roll: 0 },
      })
      scene.requestRender()
    },
    setLight(light) {
      const golden = Math.min(1, light) - Math.max(0, light - 1) * 0.6
      const night = Math.max(0, Math.min(1, light - 1))
      const [a, b, t] = light <= 1 ? [t0, t1, light] : [t1, t2, light - 1]
      C.JulianDate.addSeconds(a, C.JulianDate.secondsDifference(b, a) * t, scratch)
      viewer.clock.currentTime = scratch
      if (grade) {
        grade.uniforms.u_golden = golden * 0.85
        grade.uniforms.u_night = night * 0.9
      }
      scene.requestRender()
    },
    // Se resuelve cuando la primera vista está cargada (para levantar la intro).
    ready() {
      return new Promise((resolve) => {
        const check = () => {
          const loaded = tileset ? tileset.tilesLoaded : scene.globe?.tilesLoaded
          if (!loaded) return
          scene.postRender.removeEventListener(check)
          resolve()
        }
        scene.postRender.addEventListener(check)
        scene.requestRender()
      })
    },
    destroy() {
      if (!viewer.isDestroyed()) viewer.destroy()
    },
  }
}

// Interpolación entre dos keyframes: altura en escala logarítmica (de 115 km a 120 m sin
// "caída" brusca) y heading por el camino angular más corto.
export function lerpCamera(a: Camera, b: Camera, t: number): Camera {
  const lerp = (x: number, y: number) => x + (y - x) * t
  const dh = ((b.heading - a.heading + 540) % 360) - 180
  return {
    lon: lerp(a.lon, b.lon),
    lat: lerp(a.lat, b.lat),
    height: Math.exp(lerp(Math.log(a.height), Math.log(b.height))),
    heading: a.heading + dh * t,
    pitch: lerp(a.pitch, b.pitch),
  }
}
