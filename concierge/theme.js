/* Applies the saved light/dark theme before the first paint, so the page never flashes the wrong one. */
(function () {
  var t = "light";
  try { t = localStorage.getItem("mey-theme") || "light"; } catch (e) {}
  document.documentElement.setAttribute("data-theme", t === "dark" ? "dark" : "light");
})();
