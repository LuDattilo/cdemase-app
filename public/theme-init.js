// Script anti-flash: applica tema + lingua dal localStorage prima della prima paint.
// Caricato in <head> dal layout (sincrono).
//
// NOTA: usiamo la classe ".theme-dark" sul <html> (non un data-attribute) perché
// LightningCSS di Tailwind v4 ottimizza via [data-theme="dark"] interpretandolo
// come marker per la funzione light-dark(), scartando le override di variabili.
(function () {
  try {
    var t = localStorage.getItem("mase-theme");
    if (t === "dark") {
      document.documentElement.classList.add("theme-dark");
    } else {
      document.documentElement.classList.remove("theme-dark");
    }
    var l = localStorage.getItem("mase-locale");
    document.documentElement.setAttribute("lang", l === "en" ? "en" : "it");
  } catch (e) {
    // Ignora errori (es. localStorage disabilitato in iframe SharePoint)
  }
})();
