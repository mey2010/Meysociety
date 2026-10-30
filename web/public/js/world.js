/*
 * Capa geográfica: CesiumJS + Google Photorealistic 3D Tiles.
 * Sin API key cae a fotografía de satélite (Esri World Imagery) sobre el elipsoide:
 * geografía real, sin relieve, solo como vista previa de desarrollo.
 * Ningún contenido de Google se captura ni se almacena: todo se renderiza en vivo
 * y las atribuciones quedan visibles.
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
        : new C.ImageryLayer(new C.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 18,
          credit: 'Imagery © Esri, Maxar, Earthstar Geographics',
        }), { brightness: 1.08, contrast: 1.12, saturation: 0.9, gamma: 1.05 }),
    });

    // El scroll es el único control de cámara.
    viewer.scene.screenSpaceCameraController.enableInputs = false;
    viewer.resolutionScale = lowPower ? 0.75 : Math.min(window.devicePixelRatio, 1.5);
    viewer.scene.skyAtmosphere.show = true;
    viewer.scene.fog.enabled = true;
    if (viewer.scene.globe) {
      viewer.scene.globe.showGroundAtmosphere = true;
      viewer.scene.globe.baseColor = C.Color.fromCssColorString('#0E3A5B');
    }

    let tileset = null;
    if (useGoogle) {
      C.GoogleMaps.defaultApiKey = apiKey;
      tileset = await C.createGooglePhotorealistic3DTileset(undefined, {
        maximumScreenSpaceError: lowPower ? 24 : 12,
      });
      viewer.scene.primitives.add(tileset);
    }

    return {
      mode: useGoogle ? 'google' : 'satellite',
      setCamera(k) {
        viewer.camera.setView({
          destination: C.Cartesian3.fromDegrees(k.lon, k.lat, k.height),
          orientation: { heading: toRad(k.heading), pitch: toRad(k.pitch), roll: 0 },
        });
        viewer.scene.requestRender();
      },
      // Se resuelve cuando la primera vista está cargada (para levantar la intro).
      ready() {
        return new Promise((resolve) => {
          const done = () => { viewer.scene.postRender.removeEventListener(check); resolve(); };
          const check = () => {
            const loaded = tileset ? tileset.tilesLoaded : viewer.scene.globe.tilesLoaded;
            if (loaded) done();
          };
          viewer.scene.postRender.addEventListener(check);
          viewer.scene.requestRender();
        });
      },
    };
  }

  // Interpolación entre dos keyframes: altura en escala logarítmica (de 115 km a
  // 300 m sin "caída" brusca) y heading por el camino angular más corto.
  function lerpCamera(a, b, t) {
    const lerp = (x, y) => x + (y - x) * t;
    const dh = ((b.heading - a.heading + 540) % 360) - 180;
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
