/*
 * Cesium se sirve desde /cesium (copiado de node_modules en postinstall/prebuild) y se carga
 * con un <script> para no meter 4 MB en el bundle de la página.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

export type Camera = { lon: number; lat: number; height: number; heading: number; pitch: number }

let loading: Promise<any> | null = null

export function loadCesium(): Promise<any> {
  const w = window as any
  if (w.Cesium) return Promise.resolve(w.Cesium)
  if (loading) return loading
  w.CESIUM_BASE_URL = "/cesium/"
  loading = new Promise((resolve, reject) => {
    const css = document.createElement("link")
    css.rel = "stylesheet"
    css.href = "/cesium/Widgets/widgets.css"
    document.head.appendChild(css)
    const s = document.createElement("script")
    s.src = "/cesium/Cesium.js"
    s.async = true
    s.onload = () => resolve(w.Cesium)
    s.onerror = () => reject(new Error("No se pudo cargar Cesium"))
    document.head.appendChild(s)
  })
  return loading
}

export type World = {
  mode: "google" | "satellite"
  setCamera: (c: Camera) => void
  tilesLoaded: () => boolean
  destroy: () => void
}

export async function createWorld(container: HTMLElement, apiKey: string, lowPower: boolean): Promise<World> {
  const C = await loadCesium()
  const viewer = new C.Viewer(container, {
    baseLayer: false,
    baseLayerPicker: false, geocoder: false, homeButton: false, sceneModePicker: false,
    navigationHelpButton: false, animation: false, timeline: false, fullscreenButton: false,
    infoBox: false, selectionIndicator: false, requestRenderMode: true, maximumRenderTimeChange: Infinity,
    msaaSamples: lowPower ? 1 : 4,
  })
  const scene = viewer.scene
  scene.screenSpaceCameraController.enableInputs = false // la cámara la mueve el scroll
  scene.globe.show = false
  scene.skyAtmosphere.show = true
  scene.fog.enabled = true
  viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5)

  let mode: World["mode"] = "satellite"
  let tileset: any = null
  if (apiKey) {
    try {
      C.GoogleMaps.defaultApiKey = apiKey
      tileset = await C.createGooglePhotorealistic3DTileset({ onlyUsingWithGoogleGeocoder: true })
      tileset.maximumScreenSpaceError = lowPower ? 24 : 12
      scene.primitives.add(tileset)
      mode = "google"
    } catch (e) {
      console.warn("Google 3D Tiles no disponibles", e)
    }
  }
  if (mode === "satellite") {
    scene.globe.show = true
    viewer.imageryLayers.addImageryProvider(await C.ArcGisMapServerImageryProvider.fromBasemapType(C.ArcGisBaseMapType.SATELLITE))
  }

  return {
    mode,
    setCamera(c) {
      viewer.camera.setView({
        destination: C.Cartesian3.fromDegrees(c.lon, c.lat, c.height),
        orientation: { heading: C.Math.toRadians(c.heading), pitch: C.Math.toRadians(c.pitch), roll: 0 },
      })
      scene.requestRender()
    },
    tilesLoaded: () => (tileset ? tileset.tilesLoaded : scene.globe.tilesLoaded),
    destroy: () => viewer.destroy(),
  }
}
