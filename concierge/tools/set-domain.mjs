// Usage (once you have the domain):  node tools/set-domain.mjs https://www.tudominio.com
// Replaces the placeholder in every file that needs the absolute address (canonical, hreflang,
// Open Graph, structured data, sitemap, robots and legal pages).
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const url = (process.argv[2] || "").replace(/\/+$/, "");
if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}$/i.test(url)) { console.error("Give the full https address, e.g. https://www.tudominio.com"); process.exit(1); }
const files = ["index.html", "sitemap.xml", "robots.txt", "legal/aviso-legal.html", "legal/privacidad.html", "legal/cookies.html", "legal/terminos.html"];
for (const f of files) { const p = join(root, f), s = readFileSync(p, "utf8"); writeFileSync(p, s.split("https://DOMINIO.example").join(url)); console.log("✓", f); }
