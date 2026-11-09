/* The 3D logo: it rests large under the intro buttons, and as the page scrolls it shrinks and glides up
   and to the left until it sits exactly where the header logo lives — then it simply is the header logo.
   It tilts in 3D under the pointer (HoloCard springs, silver glare only) and a press sends a silver
   reflection sweeping across the metal. */
import { holo } from "./holo.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function logoFlight({ slot, headerImg, headerLink, src, menu }) {
  const fly = document.createElement("a");
  fly.className = "flylogo"; fly.href = headerLink.getAttribute("href") || "#top";
  fly.setAttribute("aria-label", headerLink.getAttribute("aria-label") || "Mey Society");
  fly.innerHTML = `<span class="flylogo__coin"><img src="${src}" alt="" draggable="false" decoding="async"><span class="flylogo__shine" aria-hidden="true"></span></span>`;
  document.body.appendChild(fly);
  const coin = fly.querySelector(".flylogo__coin");
  headerImg.classList.add("is-flown"); // the flying coin takes its place

  let start = null, end = null, travel = 1, raf = 0;
  function measure() {
    const s = slot.getBoundingClientRect(), e = headerImg.getBoundingClientRect();
    start = { x: s.left, y: s.top + scrollY, size: s.width };              // page coordinates of the resting spot
    end = { x: e.left, y: e.top, size: e.width };                         // viewport coordinates of the header logo
    travel = Math.max(1, start.y - end.y);                                // scrolling this far brings the spot up to the header row
    fly.style.width = fly.style.height = start.size + "px";
    place();
  }
  function place() {
    raf = 0; if (!start) return;
    const ps = Math.min(1, Math.max(0, scrollY / travel)), p = Math.max(ps, forced), k = reduced ? (p > .5 ? 1 : 0) : ease(p);
    const x = start.x + (end.x - start.x) * k;
    const yy = (start.y - scrollY) * (1 - k) + end.y * k;                  // follows the page, then settles on the header row
    const sc = (start.size + (end.size - start.size) * k) / start.size;
    fly.style.transform = `translate3d(${x.toFixed(2)}px, ${yy.toFixed(2)}px, 0) scale(${sc.toFixed(4)})`;
    fly.classList.toggle("is-docked", ps >= 1 || forced > .99);
    fly.style.setProperty("--fly-p", p.toFixed(3));
  }
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(place); }, { passive: true });
  // opening the menu sends the logo to its corner too; closing it lets the logo return to where the scroll had it
  let forced = 0, fAnim = 0;
  function force(to) {
    cancelAnimationFrame(fAnim); const from = forced, t0 = performance.now(), dur = reduced ? 1 : 620;
    const step = now => { const e = Math.min(1, (now - t0) / dur); forced = from + (to - from) * (1 - Math.pow(1 - e, 3)); place(); if (e < 1) fAnim = requestAnimationFrame(step); };
    fAnim = requestAnimationFrame(step);
  }
  if (menu) new MutationObserver(() => force(menu.hasAttribute("data-open") ? 1 : 0)).observe(menu, { attributes: true, attributeFilter: ["data-open"] });
  new ResizeObserver(measure).observe(document.documentElement);
  addEventListener("load", measure); measure();
  document.fonts?.ready.then(measure);

  // 3D tilt + silver glare (no colour), stronger while it is big
  holo(coin, { tiltMax: 14, hoverScale: 1.04, glare: .8, intensity: 0, edgeSparkle: 0, frame: 0 });
  // a press sends a silver reflection across the metal
  const shine = () => { coin.classList.remove("is-shining"); void coin.offsetWidth; coin.classList.add("is-shining"); };
  fly.addEventListener("pointerdown", shine);
  fly.addEventListener("click", e => { if (!fly.classList.contains("is-docked")) e.preventDefault(); }); // only the docked logo navigates
  return { measure };
}
