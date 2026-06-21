// Raportuje błędy gry do tests/smoke.html, gdy strona działa w iframe.
(() => {
  if (window.parent === window) return;
  const send = (type, payload = {}) => {
    window.parent.postMessage({ source: "sowie-smoke", game: location.pathname, type, ...payload }, location.origin);
  };

  window.addEventListener("error", (event) => {
    send("error", {
      message: event.message || "Unknown error",
      file: event.filename || "",
      line: event.lineno || 0,
      column: event.colno || 0,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    send("error", { message: String(event.reason || "Unhandled rejection") });
  });

  window.addEventListener("load", () => {
    window.setTimeout(() => send("loaded"), 900);
  });
})();
