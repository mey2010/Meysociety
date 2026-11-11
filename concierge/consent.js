/* Analytics with consent (RGPD / LSSI-CE).
   - Plausible is cookieless and anonymous: it loads without asking.
   - Google Analytics 4 sets cookies: it only loads after the visitor accepts.
   With nothing configured, nothing loads and no banner is shown. */
import { t } from "./i18n.js";

const KEY = "mey-consent";
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const save = v => { try { localStorage.setItem(KEY, v); } catch {} };
const script = (src, attrs = {}) => { const s = document.createElement("script"); s.async = true; s.src = src; Object.assign(s.dataset, attrs.data || {}); if (attrs.defer) s.defer = true; document.head.appendChild(s); return s; };

function loadGA(id) {
  window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
  gtag("js", new Date()); gtag("config", id, { anonymize_ip: true });
  script(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
}

/* One call for both tools. Before consent (or with nothing configured) the event is simply dropped. */
export function track(name, params = {}) {
  try { if (window.gtag) gtag("event", name, params); if (window.plausible) plausible(name, { props: params }); } catch {}
}

export function initConsent({ plausible = "", ga4 = "" } = {}) {
  if (plausible) script("https://plausible.io/js/script.js", { defer: true, data: { domain: plausible } });
  if (!ga4) return;
  const choice = read();
  if (choice === "yes") return loadGA(ga4);
  if (choice === "no") return;
  const bar = document.createElement("div"); bar.className = "consent"; bar.setAttribute("role", "dialog"); bar.setAttribute("aria-label", t("Cookies"));
  bar.innerHTML = `<p>${t("Usamos cookies de analítica para entender qué te interesa y mejorar la web. Solo se activan si aceptas.")} <a href="legal/cookies.html">${t("Más información")}</a></p>
    <div class="consent__btns"><button type="button" class="btn btn--ghost btn--sm" data-c="no">${t("Rechazar")}</button><button type="button" class="btn btn--primary btn--sm" data-c="yes">${t("Aceptar")}</button></div>`;
  bar.addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (!b) return; save(b.dataset.c); bar.remove(); if (b.dataset.c === "yes") loadGA(ga4); });
  document.body.appendChild(bar);
}
