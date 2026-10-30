/*
 * Capa geográfica: CesiumJS + Google Photorealistic 3D Tiles.
 * Sin API key cae a OpenStreetMap sobre el elipsoide (geografía real, sin relieve)
 * como vista previa de desarrollo. Ningún contenido de Google se captura ni se
 * almacena: todo se renderiza en vivo y las atribuciones quedan visibles.
 */
(function () {
  const C = window.Cesium;
  const toRad = C.Math.toRadians;

  async function createWorld(container, creditContainer, { apiKey, lowPower }) {
    const useGoogle = Boolean(apiKey);

    const viewer = new C.Viewer(container, {
      animation: false, timeline: false, baseLayerPicker: false, geocoder: false,
      homeButton: false, sceneModePicker: false, navigationHelpButton: false,
      fullscreenButton: false, infoBox: false, selectionIndicator: false,
      creditContainer,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      globe: useGoogle ? false : undefined,
      baseLayer: useGoogle
        ? false
        : new C.ImageryLayer(new C.OpenStreetMapImageryProvider({ url: 'https://tile.openstreetmap.org/' })),
    });

    // El scroll es el único control de cámara.
    const ctrl = viewer.scene.screenSpaceCameraController;
    ctrl.enableInputs = false;
    viewer.resolutionScale = lowPower ? 0.75 : Math.min(window.devicePixelRatio, 1.5);
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.fog.enabled = true;

    if (useGoogle) {
      C.GoogleMaps.defaultApiKey = apiKey;
      const tileset = await C.createGooglePhotorealistic3DTileset(undefined, {
        maximumScreenSpaceError: lowPower ? 24 : 12,
      });
      viewer.scene.primitives.add(tileset);
    }

    return {
      mode: useGoogle ? 'google' : 'osm',
      setCamera(k) {
        viewer.camera.setView({
          destination: C.Cartesian3.fromDegrees(k.lon, k.lat, k.height),
          orientation: { heading: toRad(k.heading), pitch: toRad(k.pitch), roll: 0 },
        });
        viewer.scene.requestRender();
      },
    };
  }

  // Interpolación entre dos keyframes: altura en escala logarítmica (de 115 km a
  // 300 m sin "caída" brusca) y heading por el camino angular más corto.
  function lerpCamera(a, b, t) {
    const lerp = (x, y) => x + (y - x) * t;
    let dh = ((b.heading - a.heading + 540) % 360) - 180;
    return {
      lon: lerp(a.lon, b.lon),
      lat: lerp(a.lat, b.lat),
      height: Math.exp(lerp(Math.log(a.height), Math.log(b.height))),
      heading: a.heading + dh * t,
      pitch: lerp(a.pitch, b.pitch),
    };
  }

  window.ConciergeWorld = { createWorld, lerpCamera };
})();
