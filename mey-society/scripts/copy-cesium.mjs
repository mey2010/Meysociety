// Copia el build estático de Cesium (workers, assets, widgets) a public/cesium.
// Se ejecuta en postinstall y antes de build; public/cesium no se versiona.
import { cpSync, existsSync, rmSync } from "node:fs"
const src = "node_modules/cesium/Build/Cesium"
const dst = "public/cesium"
if (!existsSync(src)) { console.warn("cesium no instalado; omito la copia"); process.exit(0) }
rmSync(dst, { recursive: true, force: true })
cpSync(src, dst, { recursive: true })
console.log("Cesium copiado a", dst)
