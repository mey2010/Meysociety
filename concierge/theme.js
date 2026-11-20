/* Applies the saved light/dark theme before the first paint, so the page never flashes the wrong one. */
(function () {
  var t = "light";
  try { t = localStorage.getItem("mey-theme") || "light"; } catch (e) {}
  document.documentElement.setAttribute("data-theme", t === "dark" ? "dark" : "light");
})();

/* Performance governor: the page decides, before the first paint, how much visual weight this device can carry, and
   keeps watching while people scroll. Phones that can't hold the frame rate get the "lite" tier: no live blur behind
   glass, no decorative loops; everything else (content, photos, videos, the map) stays exactly the same.
   - before paint: low memory, few cores, Data Saver or a slow network start in lite
   - while scrolling: if more than a quarter of the frames miss their slot over two seconds, it steps down to lite
     for the rest of the visit (remembered for the session, so the next page load starts there)
   It only ever steps down, never flickers between tiers, and announces the change with a "perfchange" event. */
(function () {
  var root = document.documentElement, nav = navigator, conn = nav.connection || {};
  var saved = null; try { saved = sessionStorage.getItem("mey-perf"); } catch (e) {}
  var weak = (nav.deviceMemory && nav.deviceMemory <= 4) || (nav.hardwareConcurrency && nav.hardwareConcurrency <= 4) ||
    conn.saveData || /(^|-)2g|3g/.test(conn.effectiveType || "");
  var tier = saved || (weak ? "lite" : "full");
  root.setAttribute("data-perf", tier);
  if (tier === "lite") return;
  function stepDown() {
    if (root.getAttribute("data-perf") === "lite") return;
    root.setAttribute("data-perf", "lite");
    try { sessionStorage.setItem("mey-perf", "lite"); } catch (e) {}
    try { document.dispatchEvent(new CustomEvent("perfchange", { detail: "lite" })); } catch (e) {}
  }
  var frames = 0, slow = 0, start = 0, last = 0, raf = 0, idle = 0;
  function tick(now) {
    if (last) { var d = now - last; if (d < 500) { frames++; if (d > 34) slow++; } }
    last = now;
    if (now - start > 2000) {
      if (frames > 20 && slow / frames > .25) return stepDown();
      frames = slow = 0; start = now;
    }
    raf = requestAnimationFrame(tick);
  }
  addEventListener("scroll", function () {
    if (document.hidden) return;
    if (!raf) { last = 0; start = performance.now(); raf = requestAnimationFrame(tick); }
    clearTimeout(idle); idle = setTimeout(function () { cancelAnimationFrame(raf); raf = 0; }, 400);   // only measures while scrolling
  }, { passive: true });
})();
