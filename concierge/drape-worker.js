/* Draws the page's dot background off the main thread, so scrolling and transitions never wait for it. */
importScripts("drape-core.js");
postMessage("ready");
let fx = null, raf = 0;
const frame = typeof requestAnimationFrame === "function" ? requestAnimationFrame : f => setTimeout(() => f(performance.now()), 16);
function loop(now) {
  raf = 0; if (!fx || !fx.state.visible) return;
  fx.draw(now);
  if (!fx.state.reduced) raf = frame(loop);
}
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
