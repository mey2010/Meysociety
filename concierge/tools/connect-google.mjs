// Connects the site with Google. Run it from the site folder; both values are public identifiers, not passwords.
//   node tools/connect-google.mjs --gsc CODIGO      Search Console: adds the verification tag to the home page
//   node tools/connect-google.mjs --ga G-XXXXXXXXXX Analytics 4: turns the measurement on (visitors are asked for consent first)
// Both can go in the same command. Run it again with a new value to replace the old one.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? (process.argv[i + 1] || "") : null; };
let gsc = arg("--gsc"), ga = arg("--ga");
if (gsc === null && ga === null) { console.error("Usage: node tools/connect-google.mjs --gsc CODE --ga G-XXXXXXXXXX"); process.exit(1); }
if (gsc !== null) {
  const m = gsc.match(/content="([^"]+)"/); if (m) gsc = m[1];            // the whole <meta> tag was pasted: keep its code
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(gsc)) { console.error("That does not look like a Search Console code (the value inside content=\"…\")."); process.exit(1); }
  for (const f of ["index.html", "preview.html"]) {
    const p = join(root, f); let s; try { s = readFileSync(p, "utf8"); } catch { continue; }
    const tag = `<meta name="google-site-verification" content="${gsc}">`;
    s = /<meta name="google-site-verification"[^>]*>/.test(s) ? s.replace(/<meta name="google-site-verification"[^>]*>/, tag) : s.replace(/(<meta name="description"[^>]*>)/, `$1\n${tag}`);
    if (!s.includes(tag)) { console.error("Could not place the tag in", f); process.exit(1); }
    writeFileSync(p, s); console.log("✓ Search Console tag in", f);
  }
}
if (ga !== null) {
  if (!/^G-[A-Z0-9]{6,14}$/.test(ga)) { console.error("The Analytics ID looks like G-XXXXXXXXXX (Admin › Data streams › Measurement ID)."); process.exit(1); }
  const p = join(root, "app.js"), s = readFileSync(p, "utf8"), out = s.replace(/(analytics:\s*\{\s*plausible:\s*"[^"]*",\s*ga4:\s*)"[^"]*"/, `$1"${ga}"`);
  if (out === s && !s.includes(`ga4: "${ga}"`)) { console.error("Could not find the analytics setting in app.js"); process.exit(1); }
  writeFileSync(p, out); console.log("✓ Analytics", ga, "in app.js");
}
console.log("Done. Upload the site again so the change is live.");
