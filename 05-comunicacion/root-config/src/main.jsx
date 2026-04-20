import { registerApplication, start } from "single-spa";

// Redirigir raíz a /dashboard
if (location.pathname === "/") {
  history.replaceState(null, "", "/dashboard");
}

// ── Animación de transición entre pantallas ──
const TAB_ORDER = ["/dashboard", "/productos-contratados", "/productos-contratar", "/ayuda"];
let previousPath = location.pathname;

window.addEventListener("single-spa:before-routing-event", () => {
  const content = document.getElementById("single-spa-content");
  if (!content) return;

  const nextPath = location.pathname;
  const prevIdx = TAB_ORDER.indexOf(previousPath);
  const nextIdx = TAB_ORDER.indexOf(nextPath);

  content.classList.remove("slide-left", "slide-right");

  if (prevIdx !== -1 && nextIdx !== -1 && prevIdx !== nextIdx) {
    content.classList.add(nextIdx > prevIdx ? "slide-right" : "slide-left");
  }

  previousPath = nextPath;
});

window.addEventListener("single-spa:routing-event", () => {
  const content = document.getElementById("single-spa-content");
  if (!content) return;
  setTimeout(() => content.classList.remove("slide-left", "slide-right"), 350);
});

// ── Header (siempre visible) ──
registerApplication({
  name: "@mobile-app/mf-header",
  app: () => import("@mobile-app/mf-header"),
  activeWhen: ["/"],
});

// ── Navbar / Bottom menu (siempre visible) ──
registerApplication({
  name: "@mobile-app/mf-navbar",
  app: () => import("@mobile-app/mf-navbar"),
  activeWhen: ["/"],
});

// ── Páginas de contenido (por ruta) ──
registerApplication({
  name: "@mobile-app/mf-dashboard",
  app: () => import("@mobile-app/mf-dashboard"),
  activeWhen: ["/dashboard"],
});

registerApplication({
  name: "@mobile-app/mf-productos-contratados",
  app: () => import("@mobile-app/mf-productos-contratados"),
  activeWhen: ["/productos-contratados"],
});

registerApplication({
  name: "@mobile-app/mf-productos-contratar",
  app: () => import("@mobile-app/mf-productos-contratar"),
  activeWhen: ["/productos-contratar"],
});

registerApplication({
  name: "@mobile-app/mf-ayuda",
  app: () => import("@mobile-app/mf-ayuda"),
  activeWhen: ["/ayuda"],
});

start();
