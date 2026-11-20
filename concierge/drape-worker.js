/* Draws the page's dot background off the main thread, so scrolling and transitions never wait for it. */
importScripts("drape-core.js");
postMessage("ready");
let fx = null, raf = 0;
const frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : f => setTimeout(() => f(performance.now()), 16);
function loop(now) {
  raf = 0; if (!fx || !fx.state.visible) return;
  // 30 fps is plenty for a slow fold of dots, and nothing is drawn while the page is scrolling
  if (fx.state.reduced) fx.draw(now);
  else if (fx.scrolling(now)) fx.rest();
  else if (now - last >= 31) { last = now; fx.draw(now); }
  if (!fx.state.reduced) raf = frame(loop);
}
let last = 0;
const kick = () => { if (!raf) raf = frame(loop); };
onmessage = e => {
  const m = e.data;
  if (m.type === "init") {
    const ctx = m.canvas.getContext("2d");
    fx = makeDrape(ctx, (w, h) => new OffscreenCanvas(w, h));
    fx.set(m); kick(); return;
  }
  if (!fx) return;
  fx.message(m);
  // reduced motion: one still frame, redrawn only when something changes
  if (fx.state.reduced || m.type === "visible") kick();
};
