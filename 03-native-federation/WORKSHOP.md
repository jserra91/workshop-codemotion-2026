# Paso 03 → 04 — De Native Federation a Single-SPA completo

## Objetivo y alcance

En este paso vamos a **llevar la arquitectura de microfrontends al extremo**: cada sección de la aplicación será su propio microfrontend independiente, incluyendo el Header y la barra de navegación.

Partimos del proyecto `03-native-federation` (3 proyectos: root-config + 2 remotes) y llegaremos al proyecto `04-single-spa` con **7 proyectos**:

- **root-config** — root-config mínimo: solo HTML + Import Map + `registerApplication`
- **mf-header** — cabecera de la app (siempre visible)
- **mf-navbar** — navegación inferior (siempre visible)
- **mf-dashboard** — panel principal con saldo y movimientos
- **mf-productos-contratados** — lista de productos contratados
- **mf-productos-contratar** — catálogo de productos disponibles
- **mf-ayuda** — centro de ayuda y FAQs

Además:

- Usaremos **`single-spa-react`** para estandarizar los wrappers (en vez de hacerlos a mano)
- Cada microfrontend tendrá **su propio CSS** — ownership total por equipo
- El root-config pasará a ser un **`root-config`** puro (sin React, sin componentes)

**Si por cualquier cosa te pierdes durante el proceso de modificación de este proyecto, todos los cambios aplicados en este fichero del taller terminarás con el proyecto `04-single-spa`.**

## Contexto

Partimos del proyecto `03-native-federation`, que tiene esta estructura:

| Proyecto | Puerto | Responsabilidad |
|---|---|---|
| `root-config/` | `:9000` | Orquestador single-spa + Header + BottomNav + Dashboard + Ayuda |
| `mf-productos-contratar/` | `:9001` | ES module puro que exporta ciclo de vida single-spa (manual) |
| `mf-productos-contratados/` | `:9002` | ES module puro que exporta ciclo de vida single-spa (manual) |

### ¿Qué problemas tiene esta arquitectura?

1. **El root-config es demasiado gordo** — contiene Header, BottomNav, Dashboard y Ayuda. Cualquier cambio en estas piezas obliga a re-desplegar el root-config entero
2. **Los wrappers single-spa son manuales** — cada remote tiene su propio `bootstrap/mount/unmount` escrito a mano. Es repetitivo y propenso a errores
3. **CSS centralizado** — los estilos viven en `App.css` dentro del root-config. No hay ownership real por equipo
4. **No es framework-agnostic de verdad** — el root-config está acoplado a React (usa `createRoot` directamente para montar todo)
5. **Namespace genérico** — `@company/catalog` y `@company/settings` no reflejan la naturaleza de cada MF

### ¿Qué vamos a cambiar?

| Antes (03-native-federation) | Después (04-single-spa) |
|---|---|
| 3 proyectos (root-config + 2 remotes) | 7 proyectos (root-config + 6 MFs) |
| Root-config con React + componentes locales | root-config puro (JS vanilla) |
| Wrappers manuales (`bootstrap/mount/unmount`) | `single-spa-react` estandarizado |
| CSS en `App.css` del root-config | CSS propio en cada MF |
| `localApp()` helper para componentes del root-config | Cada componente es un MF independiente |

## Ejecución del proyecto actual

```bash
npm install
npm run install:all
npm start
# → http://localhost:9000
```

Verifica que funciona y luego vuelve al directorio raíz del taller.

---

# 👉 Transformemos la arquitectura!

Vamos a trabajar dentro de `tu proyecto`. Crearemos la nueva estructura de 7 proyectos:

| Proyecto | Puerto | Responsabilidad |
|---|---|---|
| `root-config/` | `:9000` | Root-config mínimo: HTML + Import Map + registra las 6 apps |
| `mf-header/` | `:9001` | Cabecera con avatar, nombre y botones |
| `mf-navbar/` | `:9002` | Barra de navegación inferior |
| `mf-dashboard/` | `:9003` | Panel principal con saldo y movimientos |
| `mf-productos-contratados/` | `:9004` | Lista de productos contratados |
| `mf-productos-contratar/` | `:9005` | Catálogo de productos disponibles |
| `mf-ayuda/` | `:9006` | Centro de ayuda, FAQs y contacto |

---

## Paso 1 — Crear la estructura de carpetas

```bash
mkdir mf-header 
mkdir mf-header/src
mkdir mf-navbar
mkdir mf-navbar/src
mkdir mf-dashboard
mkdir mf-dashboard/src
mkdir mf-ayuda
mkdir mf-ayuda/src
```

Tu árbol debería quedar:

```
04-single-spa/
├── root-config/
│   └── src/
├── mf-header/
│   └── src/
├── mf-navbar/
│   └── src/
├── mf-dashboard/
│   └── src/
├── mf-productos-contratados/
│   └── src/
├── mf-productos-contratar/
│   └── src/
└── mf-ayuda/
    └── src/
```

---

## Paso 2 — Crear el `package.json` raíz

Modifica `03-single-spa/package.json`:

```json
{
  "name": "03-single-spa",
  "private": true,
  "scripts": {
    "install:all": "npm install --prefix root-config && npm install --prefix mf-header && npm install --prefix mf-navbar && npm install --prefix mf-dashboard && npm install --prefix mf-productos-contratados && npm install --prefix mf-productos-contratar && npm install --prefix mf-ayuda",
    "build": "npm run build --prefix mf-header && npm run build --prefix mf-navbar && npm run build --prefix mf-dashboard && npm run build --prefix mf-productos-contratados && npm run build --prefix mf-productos-contratar && npm run build --prefix mf-ayuda && npm run build --prefix root-config",
    "start": "npm run build && concurrently -n root,header,navbar,dash,contratados,contratar,ayuda -c blue,white,white,green,yellow,magenta,cyan \"npx serve -s root-config/dist -l 9000 --no-etag --no-clipboard\" \"npx serve mf-header/dist -l 9001 --no-etag --cors --no-clipboard\" \"npx serve mf-navbar/dist -l 9002 --no-etag --cors --no-clipboard\" \"npx serve mf-dashboard/dist -l 9003 --no-etag --cors --no-clipboard\" \"npx serve mf-productos-contratados/dist -l 9004 --no-etag --cors --no-clipboard\" \"npx serve mf-productos-contratar/dist -l 9005 --no-etag --cors --no-clipboard\" \"npx serve mf-ayuda/dist -l 9006 --no-etag --cors --no-clipboard\""
  },
  "devDependencies": {
    "concurrently": "^9.0.0",
    "serve": "^14.2.0"
  }
}
```

> **Observa:** ahora el script `build` compila **6 MFs primero** y el root-config **al final**. Y `start` levanta **7 servidores** — uno por MF + root-config.

> **Importante:** en `start`, el root usa `serve -s` para soportar rutas internas (`/dashboard`, `/ayuda`, etc.) al refrescar, y `--no-etag` para reducir problemas de caché durante desarrollo.

**Diferencias respecto al paso 03:**

| Antes | Ahora |
|---|---|
| `root-config`, `mf-productos-contratar`, `mf-productos-contratados` | `root-config` + 6 MFs |

```bash
npm install
```

---

## Paso 3 — Crear el `root-config` (el nuevo root-config)

El cambio más radical está aquí. El root-config deja de ser una app React con componentes — pasa a ser **puro HTML + JS vanilla**.

### 3.1 — `root-config/package.json`

```json
{
  "name": "@mobile-app/root-config",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "single-spa": "^6.0.0"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

**Diferencias clave respecto al root-config del paso 03:**

| Antes (root-config) | Ahora (root-config) |
|---|---|
| React y ReactDOM como external | Solo `single-spa` como external |
| Importa `Header`, `BottomNav`, `Dashboard`, `Ayuda` | No importa ningún componente — todo es MF |

### 3.2 — `root-config/vite.config.js`

```js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        'single-spa',
        '@mobile-app/mf-header',
        '@mobile-app/mf-navbar',
        '@mobile-app/mf-dashboard',
        '@mobile-app/mf-productos-contratados',
        '@mobile-app/mf-productos-contratar',
        '@mobile-app/mf-ayuda',
      ],
      output: {
        format: 'es',
      },
    },
  },
});
```

**Fíjate:** no hay `plugins: [react()]` — el root-config es JavaScript puro. Y los 6 MFs se marcan como `external` para que el navegador los resuelva vía Import Map.

### 3.3 — `root-config/index.html` — El Import Map 🔑

Este es el fichero más importante de toda la arquitectura:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Mi App Móvil — Single-SPA</title>

  <!-- Polyfill para navegadores sin soporte nativo de Import Maps -->
  <script async src="https://ga.jspm.io/npm:es-module-shims@1.10.1/dist/es-module-shims.js"></script>

  <!-- Import Map: fuente de verdad para resolución de módulos -->
  <script type="importmap">
  {
    "imports": {
      "single-spa": "https://esm.sh/single-spa@6.0.1",
      "react": "https://esm.sh/react@19.0.0",
      "react/jsx-runtime": "https://esm.sh/react@19.0.0/jsx-runtime",
      "react-dom/client": "https://esm.sh/react-dom@19.0.0/client?external=react",
      "@mobile-app/mf-header": "http://localhost:9001/mf-header.js",
      "@mobile-app/mf-navbar": "http://localhost:9002/mf-navbar.js",
      "@mobile-app/mf-dashboard": "http://localhost:9003/mf-dashboard.js",
      "@mobile-app/mf-productos-contratados": "http://localhost:9004/mf-productos-contratados.js",
      "@mobile-app/mf-productos-contratar": "http://localhost:9005/mf-productos-contratar.js",
      "@mobile-app/mf-ayuda": "http://localhost:9006/mf-ayuda.js"
    }
  }
  </script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #e8e8e8;
      min-height: 100vh;
      display: flex;
      justify-content: center;
    }

    #app-container {
      width: 100%;
      max-width: 430px;
      min-height: 100vh;
      background: #f0f2f5;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 0 30px rgba(0,0,0,0.15);
    }

    #mf-header { position: sticky; top: 0; z-index: 100; }

    #single-spa-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      padding-bottom: 80px;
    }

    #mf-navbar {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 430px;
      z-index: 100;
      box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
      border-top: 1px solid #e8e8e8;
    }

    #single-spa-content { overflow-x: hidden; }

    @keyframes slide-in-right {
      from { transform: translateX(100%); opacity: 0.3; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    @keyframes slide-in-left {
      from { transform: translateX(-100%); opacity: 0.3; }
      to   { transform: translateX(0);     opacity: 1; }
    }
    #single-spa-content.slide-right > * { animation: slide-in-right 0.3s ease-out; }
    #single-spa-content.slide-left > * { animation: slide-in-left 0.3s ease-out; }

    .spa-loading {
      display: flex; align-items: center; justify-content: center;
      height: 200px; color: #aaa; font-size: 14px;
    }

    @media (max-width: 430px) {
      #app-container { max-width: 100%; box-shadow: none; }
      #mf-navbar { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div id="app-container">
    <div id="mf-header"></div>
    <main id="single-spa-content">
      <div class="spa-loading">Cargando...</div>
    </main>
    <div id="mf-navbar"></div>
  </div>

  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

**Desglose del Import Map — diferencias respecto al paso 03:**

| Antes (03 — `root-config/index.html`) | Ahora (04 — `root-config/index.html`) |
|---|---|
| 2 remotes: `@company/catalog`, `@company/settings` | 6 MFs: header, navbar, dashboard, contratados, contratar, ayuda |
| `<div id="root-config-header">` + `<div id="root-config-navbar">` | `<div id="mf-header">` + `<div id="mf-navbar">` |
| `<main id="mf-container">` | `<main id="single-spa-content">` |
| `<script src="/src/main.jsx">` | `<script src="/src/root-config.js">` (¡ya no es JSX!) |
| CSS en `App.css` importado desde JS | CSS inline en el HTML (solo layout) |
| Sin animaciones de transición | Animaciones slide-left/slide-right entre pestañas |

> **Importante:** los estilos del layout (posicionamiento de header, contenido y navbar) ahora viven directamente en el HTML del root-config. Cada MF trae **sus propios estilos** — ownership total.

### 3.4 — Capa global mínima recomendada

Aunque cada MF tenga su CSS, conviene mantener una base compartida en el root (`tokens`, tipografía y utilidades comunes como `.page-title`/`.page-subtitle`) para coherencia visual.

Ejemplo (`root-config/src/global.css`):

```css
:root {
  --color-primary: #667eea;
  --color-primary-strong: #764ba2;
  --color-text-primary: #1a1a1a;
  --color-text-muted: #888888;
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.06);
  --radius-card: 16px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 20px;
}
```

### 3.5 — `root-config/src/root-config.js` — El orquestador 🔑

Este es el cambio **más significativo** respecto al paso 03. El `main.jsx` del root-config anterior era un fichero JSX que usaba React directamente. Ahora es **JavaScript puro**:

**Antes (03 — `root-config/src/main.jsx`):**
```jsx
import { registerApplication, start } from 'single-spa';
import { createRoot } from 'react-dom/client';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Ayuda from './pages/Ayuda';

// Renderizar chrome del root-config con React
const headerRoot = createRoot(document.getElementById('root-config-header'));
headerRoot.render(<Header />);
const navRoot = createRoot(document.getElementById('root-config-navbar'));
navRoot.render(<BottomNav />);

// Helper para montar componentes locales como apps single-spa
function localApp(Component) { ... }

registerApplication({
  name: '@company/dashboard',
  app: () => Promise.resolve(localApp(Dashboard)),  // ← componente local
  activeWhen: ['/dashboard'],
});
// ...
```

**Después (04 — `root-config/src/root-config.js`):**
```js
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
```

**¿Qué ha cambiado?**

| Concepto | Antes (03) | Ahora (04) |
|---|---|---|
| Lenguaje | JSX (necesita plugin React) | JS puro (sin plugin) |
| Imports de React | `import { createRoot } from 'react-dom/client'` | Ninguno |
| Componentes locales | `import Header`, `import Dashboard`... | No hay — todo es MF remoto |
| Helper `localApp()` | Necesario para Dashboard y Ayuda | Eliminado — ya no hay apps locales |
| Header y Navbar | Montados con `createRoot().render()` | Son MFs registrados con `activeWhen: ["/"]` |
| Animaciones | No hay | Slide-left/slide-right entre pestañas |
| `start()` | `start({ urlRerouteOnly: true })` | `start()` |

> **Clave:** Header y Navbar usan `activeWhen: ["/"]` — esto significa que están activos en **todas las rutas** (siempre visibles). Los MFs de contenido usan rutas específicas.

### 3.6 — Instalar dependencias del root-config

```bash
cd root-config
npm install
cd ..
```

---

## Paso 4 — Crear el MF Header

En el paso 03, el Header vivía dentro del root-config como un componente React local. Ahora es un **microfrontend independiente** con su propio build, sus propios estilos y su propio ciclo de vida.

### 4.1 — `mf-header/package.json`

```json
{
  "name": "@mobile-app/mf-header",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0",
    "vite-plugin-css-injected-by-js": "4.0.1"
  },
  "dependencies": {
    "single-spa-react": "^6.0.0"
  }
}
```

> **Novedad:** `single-spa-react` aparece en `dependencies`. Este paquete estandariza la creación de wrappers single-spa para React. Ya no necesitamos escribir `bootstrap/mount/unmount` a mano.

### 4.2 — `mf-header/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: './src/mf-header.jsx',
      formats: ['es'],
      fileName: () => 'mf-header.js',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom/client', 'single-spa'],
    },
  },
});
```

> **Nota:** `single-spa` también se marca como `external` — se comparte vía Import Map (antes en el paso 03, los remotes no usaban `single-spa` directamente, solo exportaban las funciones).

> **Si eliges CSS inyectado por JS (opción B del Paso 3.4):** añade también `cssInjectedByJsPlugin()` en `plugins` para este MF y replica lo mismo en el resto de `vite.config.js`.

### 4.3 — `mf-header/src/mf-header.jsx` — El wrapper con `single-spa-react` 🔑

**Antes (paso 03 — wrapper manual):**
```jsx
import { createRoot } from 'react-dom/client';
import Catalog from './Catalog';
let root;
export async function bootstrap() {}
export async function mount() {
  const container = document.getElementById('mf-container');
  root = createRoot(container);
  root.render(<Catalog />);
}
export async function unmount() {
  root.unmount();
}
```

**Después (paso 04 — `single-spa-react`):**
```jsx
import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Header from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Header,
  domElementGetter: () => document.getElementById("mf-header"),
});

export const { bootstrap, mount, unmount } = lifecycles;
```

**¿Qué hace `single-spa-react`?**

| Parámetro | ¿Para qué? |
|---|---|
| `React` | La instancia de React (compartida vía Import Map) |
| `ReactDOMClient` | Para `createRoot()` internamente |
| `rootComponent` | El componente React que se renderiza |
| `domElementGetter` | Función que devuelve el contenedor DOM donde montar |

`single-spa-react` genera automáticamente las funciones `bootstrap`, `mount` y `unmount` con toda la lógica de creación y limpieza de React roots. Es más robusto que hacerlo a mano y maneja edge cases (doble montaje, errores, etc.).

> **Convención:** el fichero de entrada se llama `mf-<nombre>.jsx` y el componente principal `root.component.jsx`. Esta es la convención de single-spa.

### 4.4 — `mf-header/src/root.component.jsx`

```jsx
import React from "react";
import "./styles.css";

export default function Header() {
  return (
    <header className="app-header">
      <div className="header-avatar">JS</div>
      <div className="header-info">
        <div className="header-greeting">Buenos días</div>
        <div className="header-name">Jordi Serra</div>
      </div>
      <div className="header-actions">
        <button className="header-btn" aria-label="Notificaciones">
          <svg viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <button className="header-btn" aria-label="Configuración">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
```

### 4.5 — `mf-header/src/styles.css`

```css
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.header-info { flex: 1; }
.header-greeting { font-size: 12px; opacity: 0.85; margin-bottom: 2px; }
.header-name { font-size: 18px; font-weight: 600; }

.header-actions { display: flex; gap: 8px; }

.header-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.header-btn:hover { background: rgba(255, 255, 255, 0.35); }

.header-btn svg {
  width: 20px; height: 20px;
  fill: none; stroke: currentColor;
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}
```

> **Ownership total:** el Header tiene sus propios estilos. Ya no depende de `App.css` del root-config.

### 4.6 — Instalar dependencias

```bash
cd mf-header
npm install
cd ..
```

---

## Paso 5 — Crear el MF Navbar

El BottomNav del paso 03 vivía dentro del root-config. Ahora es un MF independiente.

### 5.1 — `mf-navbar/package.json`

```json
{
  "name": "@mobile-app/mf-navbar",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0",
    "vite-plugin-css-injected-by-js": "4.0.1"
  },
  "dependencies": {
    "single-spa-react": "^6.0.0"
  }
}
```

### 5.2 — `mf-navbar/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: './src/mf-navbar.jsx',
      formats: ['es'],
      fileName: () => 'mf-navbar.js',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom/client', 'single-spa'],
    },
  },
});
```

### 5.3 — `mf-navbar/src/mf-navbar.jsx`

```jsx
import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Navbar from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Navbar,
  domElementGetter: () => document.getElementById("mf-navbar"),
});

export const { bootstrap, mount, unmount } = lifecycles;
```

> **Fíjate:** `domElementGetter` apunta a `#mf-navbar`, no a `#single-spa-content`. Header y Navbar se montan en contenedores **fijos** — no en el área de contenido.

### 5.4 — `mf-navbar/src/root.component.jsx`

```jsx
import React, { useState, useEffect } from "react";
import { navigateToUrl } from "single-spa";
import "./styles.css";

const tabs = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    path: "/productos-contratados",
    label: "Contratados",
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    path: "/productos-contratar",
    label: "Contratar",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    path: "/ayuda",
    label: "Ayuda",
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const [activePath, setActivePath] = useState(window.location.pathname);

  useEffect(() => {
    const handler = () => setActivePath(window.location.pathname);
    window.addEventListener("single-spa:routing-event", handler);
    return () =>
      window.removeEventListener("single-spa:routing-event", handler);
  }, []);

  const handleClick = (e, path) => {
    e.preventDefault();
    navigateToUrl(path);
  };

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <a
          key={tab.path}
          href={tab.path}
          className={activePath === tab.path ? "active" : ""}
          onClick={(e) => handleClick(e, tab.path)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </a>
      ))}
    </nav>
  );
}
```

**Diferencias respecto al BottomNav del paso 03:**

| Antes (03 — `BottomNav.jsx`) | Ahora (04 — `root.component.jsx`) |
|---|---|
| `const current = location.pathname` (lectura directa) | `useState` + `useEffect` escuchando `single-spa:routing-event` |
| `onClick={navigateToUrl}` (pasando el handler directamente) | `onClick={(e) => handleClick(e, path)}` (preventDefault explícito) |
| Emojis como iconos (`🏠`, `💼`...) | SVGs reales para mejor control visual |
| Vivía dentro del root-config | Es un MF independiente |

> **¿Por qué `useState` + evento?** Al ser un MF independiente, el Navbar necesita **reaccionar** a los cambios de ruta que single-spa gestiona. En el paso 03, como vivía dentro del root-config, se re-renderizaba naturalmente. Ahora necesitamos escuchar el evento `single-spa:routing-event` para actualizar la pestaña activa.

### 5.5 — `mf-navbar/src/styles.css`

```css
.bottom-nav {
  display: flex;
  justify-content: space-around;
  padding: 6px 0 14px;
  background: white;
}

.bottom-nav a {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #aaa;
  font-size: 11px;
  font-weight: 500;
  padding: 6px 14px;
  transition: color 0.2s;
  gap: 4px;
  -webkit-tap-highlight-color: transparent;
}

.bottom-nav a.active { color: #667eea; }

.bottom-nav a svg {
  width: 24px; height: 24px;
  fill: none; stroke: currentColor;
  stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;
}
```

### 5.6 — Instalar dependencias

```bash
cd mf-navbar
npm install
cd ..
```

---

## Paso 6 — Crear el MF Dashboard

En el paso 03, Dashboard vivía dentro del root-config y se montaba con el helper `localApp()`. Ahora es un MF independiente con sus propios datos, estilos y ciclo de vida.

### 6.1 — `mf-dashboard/package.json`

```json
{
  "name": "@mobile-app/mf-dashboard",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0",
    "vite-plugin-css-injected-by-js": "4.0.1"
  },
  "dependencies": {
    "single-spa-react": "^6.0.0"
  }
}
```

### 6.2 — `mf-dashboard/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: './src/mf-dashboard.jsx',
      formats: ['es'],
      fileName: () => 'mf-dashboard.js',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom/client', 'single-spa'],
    },
  },
});
```

### 6.3 — `mf-dashboard/src/mf-dashboard.jsx`

```jsx
import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import RootComponent from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: RootComponent,
  domElementGetter: () => document.getElementById("single-spa-content"),
});

export const { bootstrap, mount, unmount } = lifecycles;
```

> **Nota:** los MFs de contenido (Dashboard, Contratados, Contratar, Ayuda) apuntan a `#single-spa-content` — el área principal. Header y Navbar apuntan a sus contenedores fijos.

### 6.4 — `mf-dashboard/src/root.component.jsx`

```jsx
import React from "react";
import "./styles.css";

const movimientos = [
  { nombre: "Supermercado Día", monto: "-€ 47,82", fecha: "Hoy", icono: "🛒" },
  { nombre: "Nómina Empresa", monto: "+€ 2.150,00", fecha: "12 Abr", icono: "💰", positivo: true },
  { nombre: "Netflix", monto: "-€ 15,99", fecha: "10 Abr", icono: "🎬" },
  { nombre: "Gasolinera Shell", monto: "-€ 62,30", fecha: "9 Abr", icono: "⛽" },
  { nombre: "Transferencia recibida", monto: "+€ 150,00", fecha: "8 Abr", icono: "↙️", positivo: true },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="balance-card">
        <div className="balance-label">Saldo disponible</div>
        <div className="balance-amount">€ 12.458,32</div>
        <div className="balance-account">ES12 3456 7890 1234 5678</div>
      </div>

      <div className="quick-actions">
        <button className="quick-action">
          <div className="qa-icon">↗️</div>
          <span>Enviar</span>
        </button>
        <button className="quick-action">
          <div className="qa-icon">↙️</div>
          <span>Solicitar</span>
        </button>
        <button className="quick-action">
          <div className="qa-icon">💳</div>
          <span>Tarjetas</span>
        </button>
        <button className="quick-action">
          <div className="qa-icon">📊</div>
          <span>Informes</span>
        </button>
      </div>

      <h3 className="section-title">Últimos movimientos</h3>
      <div className="transactions">
        {movimientos.map((tx, i) => (
          <div className="transaction-item" key={i}>
            <div className="tx-icon">{tx.icono}</div>
            <div className="tx-info">
              <div className="tx-name">{tx.nombre}</div>
              <div className="tx-date">{tx.fecha}</div>
            </div>
            <div className={`tx-amount ${tx.positivo ? "positive" : ""}`}>
              {tx.monto}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6.5 — `mf-dashboard/src/styles.css`

```css
.dashboard { padding-bottom: 16px; }

.balance-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.balance-label { font-size: 13px; opacity: 0.9; margin-bottom: 4px; }
.balance-amount { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
.balance-account { font-size: 12px; opacity: 0.7; letter-spacing: 1px; font-family: monospace; }

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.quick-action {
  background: white;
  border: none;
  border-radius: 14px;
  padding: 16px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  font-size: 12px;
  color: #333;
  transition: transform 0.15s;
  font-family: inherit;
}

.quick-action:active { transform: scale(0.94); }
.qa-icon { font-size: 24px; }

.section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #333; }

.transactions {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  gap: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.transaction-item:last-child { border-bottom: none; }

.tx-icon {
  font-size: 22px;
  width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
  flex-shrink: 0;
}

.tx-info { flex: 1; min-width: 0; }
.tx-name { font-size: 14px; font-weight: 500; color: #333; }
.tx-date { font-size: 12px; color: #999; margin-top: 2px; }
.tx-amount { font-size: 14px; font-weight: 600; color: #333; white-space: nowrap; }
.tx-amount.positive { color: #4caf50; }
```

### 6.6 — Instalar dependencias

```bash
cd mf-dashboard
npm install
cd ..
```

---

## Paso 7 — Migrar `mf-productos-contratados`

Este MF ya existía en el paso 03, pero necesita cambios para usar `single-spa-react` y tener sus propios estilos.

### 7.1 — `mf-productos-contratados/package.json`

```json
{
  "name": "@mobile-app/mf-productos-contratados",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0",
    "vite-plugin-css-injected-by-js": "4.0.1"
  },
  "dependencies": {
    "single-spa-react": "^6.0.0"
  }
}
```

**Diferencia respecto al paso 03:** se añade `single-spa-react` en `dependencies`.

### 7.2 — `mf-productos-contratados/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: './src/mf-productos-contratados.jsx',
      formats: ['es'],
      fileName: () => 'mf-productos-contratados.js',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom/client', 'single-spa'],
    },
  },
});
```

**Cambios respecto al paso 03:**

| Antes | Ahora |
|---|---|
| `entry: './src/settings.spa.jsx'` | `entry: './src/mf-productos-contratados.jsx'` |
| `fileName: () => 'settings.spa.js'` | `fileName: () => 'mf-productos-contratados.js'` |
| No externaliza `single-spa` | Externaliza `single-spa` |

### 7.3 — `mf-productos-contratados/src/mf-productos-contratados.jsx`

**Antes (paso 03 — `settings.spa.jsx`):**
```jsx
import { createRoot } from 'react-dom/client';
import Settings from './Settings';
let root;
export async function bootstrap() {}
export async function mount() {
  const container = document.getElementById('mf-container');
  root = createRoot(container);
  root.render(<Settings />);
}
export async function unmount() { root.unmount(); }
```

**Después (paso 04):**
```jsx
import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import RootComponent from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: RootComponent,
  domElementGetter: () => document.getElementById("single-spa-content"),
});

export const { bootstrap, mount, unmount } = lifecycles;
```

### 7.4 — `mf-productos-contratados/src/root.component.jsx`

Renombrado de `Settings.jsx` a `root.component.jsx` (convención single-spa) y con sus propios estilos:

```jsx
import React from "react";
import "./styles.css";

const productos = [
  {
    nombre: "Cuenta Corriente",
    numero: "ES12 3456 7890 1234 5678",
    estado: "Activa",
    icono: "🏦",
    detalle: "Saldo: € 12.458,32",
  },
  {
    nombre: "Tarjeta Visa Platinum",
    numero: "**** **** **** 4532",
    estado: "Activa",
    icono: "💳",
    detalle: "Límite: € 5.000,00",
  },
  {
    nombre: "Seguro de Hogar Plus",
    numero: "POL-2024-78432",
    estado: "Vigente",
    icono: "🏠",
    detalle: "Vence: 15/03/2027",
  },
  {
    nombre: "Plan de Ahorro Premium",
    numero: "AH-2023-11290",
    estado: "Activo",
    icono: "📈",
    detalle: "Rentabilidad: +3,2%",
  },
  {
    nombre: "Préstamo Personal",
    numero: "PR-2024-55612",
    estado: "En curso",
    icono: "📋",
    detalle: "Pendiente: € 8.750,00",
  },
];

export default function ProductosContratados() {
  return (
    <div className="productos-contratados">
      <h2 className="page-title">Mis Productos</h2>
      <p className="page-subtitle">{productos.length} productos contratados</p>

      <div className="productos-list">
        {productos.map((p, i) => (
          <div className="producto-card" key={i}>
            <div className="producto-icon">{p.icono}</div>
            <div className="producto-info">
              <div className="producto-nombre">{p.nombre}</div>
              <div className="producto-numero">{p.numero}</div>
              <div className="producto-detalle">{p.detalle}</div>
            </div>
            <div
              className={`producto-estado estado-${p.estado.toLowerCase().replace(/ /g, "-")}`}
            >
              {p.estado}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 7.5 — `mf-productos-contratados/src/styles.css`

```css
.productos-contratados { padding-bottom: 16px; }

.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
.page-subtitle { font-size: 14px; color: #888; margin-bottom: 20px; }

.productos-list { display: flex; flex-direction: column; gap: 12px; }

.producto-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.15s;
}

.producto-card:active { transform: scale(0.98); }

.producto-icon {
  font-size: 28px;
  width: 48px; height: 48px;
  display: flex; align-items: center; justify-content: center;
  background: #f0f2f5;
  border-radius: 12px;
  flex-shrink: 0;
}

.producto-info { flex: 1; min-width: 0; }
.producto-nombre { font-size: 15px; font-weight: 600; color: #1a1a1a; margin-bottom: 2px; }
.producto-numero { font-size: 12px; color: #999; margin-bottom: 4px; font-family: monospace; }
.producto-detalle { font-size: 13px; color: #555; }

.producto-estado {
  font-size: 11px; font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
}

.estado-activa, .estado-activo, .estado-vigente { background: #e8f5e9; color: #2e7d32; }
.estado-en-curso { background: #fff3e0; color: #e65100; }
```

### 7.6 — Instalar dependencias

```bash
cd mf-productos-contratados
npm install
cd ..
```

### 7.7 - Eliminamos lo sobrante

Eliminamos los ficheros innecesarios del proyecto

---

## Paso 8 — Migrar `mf-productos-contratar`

Mismo patrón: migrar de wrapper manual a `single-spa-react` y añadir CSS propio.

### 8.1 — `mf-productos-contratar/package.json`

```json
{
  "name": "@mobile-app/mf-productos-contratar",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0",
    "vite-plugin-css-injected-by-js": "4.0.1"
  },
  "dependencies": {
    "single-spa-react": "^6.0.0"
  }
}
```

### 8.2 — `mf-productos-contratar/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: './src/mf-productos-contratar.jsx',
      formats: ['es'],
      fileName: () => 'mf-productos-contratar.js',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom/client', 'single-spa'],
    },
  },
});
```

### 8.3 — `mf-productos-contratar/src/mf-productos-contratar.jsx`

```jsx
import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import RootComponent from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: RootComponent,
  domElementGetter: () => document.getElementById("single-spa-content"),
});

export const { bootstrap, mount, unmount } = lifecycles;
```

### 8.4 — `mf-productos-contratar/src/root.component.jsx`

Renombrado de `Catalog.jsx` a `root.component.jsx`:

```jsx
import React from "react";
import "./styles.css";

const catalogo = [
  {
    nombre: "Cuenta Joven",
    descripcion: "Sin comisiones hasta los 30 años. Transferencias gratuitas y tarjeta de débito incluida.",
    precio: "Gratis",
    icono: "🎓",
    destacado: true,
    features: ["Sin comisiones", "Tarjeta gratis", "App móvil"],
  },
  {
    nombre: "Depósito a Plazo Fijo",
    descripcion: "Rentabilidad garantizada del 2,5% TAE a 12 meses.",
    precio: "Desde € 1.000",
    icono: "🔒",
    destacado: false,
    features: ["2,5% TAE", "Capital garantizado", "12 meses"],
  },
  {
    nombre: "Seguro de Vida",
    descripcion: "Protección completa para ti y tu familia con cobertura mundial.",
    precio: "Desde € 15/mes",
    icono: "🛡️",
    destacado: false,
    features: ["Cobertura mundial", "Sin carencias", "Asistencia 24h"],
  },
  {
    nombre: "Fondo de Inversión Verde",
    descripcion: "Invierte en empresas sostenibles con impacto positivo.",
    precio: "Desde € 500",
    icono: "🌱",
    destacado: true,
    features: ["Inversión ESG", "Diversificado", "Gestión activa"],
  },
  {
    nombre: "Hipoteca Online",
    descripcion: "Las mejores condiciones del mercado con tramitación 100% digital.",
    precio: "Euríbor + 0,9%",
    icono: "🏡",
    destacado: false,
    features: ["100% online", "Sin comisión apertura", "Hasta 30 años"],
  },
];

export default function ProductosContratar() {
  return (
    <div className="productos-contratar">
      <h2 className="page-title">Catálogo de Productos</h2>
      <p className="page-subtitle">Encuentra el producto perfecto para ti</p>

      <div className="catalogo-list">
        {catalogo.map((p, i) => (
          <div className={`catalogo-card ${p.destacado ? "destacado" : ""}`} key={i}>
            {p.destacado && <div className="badge-destacado">⭐ Destacado</div>}
            <div className="catalogo-header">
              <div className="catalogo-icon">{p.icono}</div>
              <div className="catalogo-precio">{p.precio}</div>
            </div>
            <div className="catalogo-nombre">{p.nombre}</div>
            <div className="catalogo-desc">{p.descripcion}</div>
            <div className="catalogo-features">
              {p.features.map((f, j) => (
                <span className="feature-tag" key={j}>{f}</span>
              ))}
            </div>
            <button className="btn-contratar">Contratar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 8.5 — `mf-productos-contratar/src/styles.css`

```css
.productos-contratar { padding-bottom: 16px; }

.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
.page-subtitle { font-size: 14px; color: #888; margin-bottom: 20px; }

.catalogo-list { display: flex; flex-direction: column; gap: 16px; }

.catalogo-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.catalogo-card.destacado { border: 2px solid #667eea; }

.badge-destacado {
  position: absolute; top: 12px; right: 12px;
  font-size: 11px; color: #667eea; font-weight: 600;
}

.catalogo-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
}

.catalogo-icon { font-size: 36px; }

.catalogo-precio {
  font-size: 13px; font-weight: 600; color: #667eea;
  background: #f0f0ff; padding: 4px 12px; border-radius: 20px;
}

.catalogo-nombre { font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; }
.catalogo-desc { font-size: 13px; color: #666; line-height: 1.5; margin-bottom: 12px; }

.catalogo-features { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }

.feature-tag {
  font-size: 11px; background: #f5f5f5; color: #555;
  padding: 4px 10px; border-radius: 12px;
}

.btn-contratar {
  width: 100%; padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; border: none; border-radius: 12px;
  font-size: 15px; font-weight: 600; cursor: pointer;
  transition: opacity 0.2s; font-family: inherit;
}

.btn-contratar:active { opacity: 0.8; }
```

### 8.6 — Instalar dependencias

```bash
cd mf-productos-contratar
npm install
cd ..
```

---

## Paso 9 — Crear el MF Ayuda

En el paso 03, Ayuda vivía dentro del root-config. Ahora es un MF independiente con su propia página de FAQs interactiva.

### 9.1 — `mf-ayuda/package.json`

```json
{
  "name": "@mobile-app/mf-ayuda",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0",
    "vite-plugin-css-injected-by-js": "4.0.1"
  },
  "dependencies": {
    "single-spa-react": "^6.0.0"
  }
}
```

### 9.2 — `mf-ayuda/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    lib: {
      entry: './src/mf-ayuda.jsx',
      formats: ['es'],
      fileName: () => 'mf-ayuda.js',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom/client', 'single-spa'],
    },
  },
});
```

### 9.3 — `mf-ayuda/src/mf-ayuda.jsx`

```jsx
import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import RootComponent from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: RootComponent,
  domElementGetter: () => document.getElementById("single-spa-content"),
});

export const { bootstrap, mount, unmount } = lifecycles;
```

### 9.4 — `mf-ayuda/src/root.component.jsx`

```jsx
import React, { useState } from "react";
import "./styles.css";

const faqs = [
  {
    pregunta: "¿Cómo puedo cambiar mi contraseña?",
    respuesta: "Ve a Configuración > Seguridad > Cambiar contraseña. Necesitarás tu contraseña actual y recibirás un código de verificación por SMS.",
  },
  {
    pregunta: "¿Cuánto tarda una transferencia?",
    respuesta: "Las transferencias nacionales (SEPA) se procesan en 24 horas laborables. Las transferencias internacionales pueden tardar entre 2 y 5 días laborables.",
  },
  {
    pregunta: "¿Cómo solicitar una nueva tarjeta?",
    respuesta: "Puedes solicitar una nueva tarjeta desde la sección 'Productos para Contratar' o visitando cualquiera de nuestras oficinas con tu DNI.",
  },
  {
    pregunta: "¿Qué hago si pierdo mi tarjeta?",
    respuesta: "Bloquea inmediatamente tu tarjeta desde la app en Tarjetas > Bloquear. También puedes llamarnos al 900 123 456 las 24 horas.",
  },
  {
    pregunta: "¿Cómo activo las notificaciones push?",
    respuesta: "Ve a Configuración > Notificaciones y activa las alertas que desees recibir: movimientos, promociones, seguridad, etc.",
  },
];

export default function Ayuda() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="ayuda">
      <h2 className="page-title">Centro de Ayuda</h2>
      <p className="page-subtitle">¿En qué podemos ayudarte?</p>

      <div className="contact-cards">
        <div className="contact-card">
          <div className="contact-icon">📞</div>
          <div className="contact-title">Llámanos</div>
          <div className="contact-detail">900 123 456</div>
        </div>
        <div className="contact-card">
          <div className="contact-icon">💬</div>
          <div className="contact-title">Chat</div>
          <div className="contact-detail">En línea</div>
        </div>
        <div className="contact-card">
          <div className="contact-icon">✉️</div>
          <div className="contact-title">Email</div>
          <div className="contact-detail">soporte@app.es</div>
        </div>
      </div>

      <h3 className="section-title">Preguntas frecuentes</h3>
      <div className="faq-list">
        {faqs.map((faq, i) => (
          <div className={`faq-item ${openIndex === i ? "open" : ""}`} key={i}>
            <button
              className="faq-question"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span>{faq.pregunta}</span>
              <span className="faq-arrow">{openIndex === i ? "−" : "+"}</span>
            </button>
            {openIndex === i && (
              <div className="faq-answer">{faq.respuesta}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 9.5 — `mf-ayuda/src/styles.css`

```css
.ayuda { padding-bottom: 16px; }

.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
.page-subtitle { font-size: 14px; color: #888; margin-bottom: 20px; }

.contact-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }

.contact-card {
  background: white; border-radius: 14px; padding: 16px 10px;
  text-align: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer; transition: transform 0.15s;
}

.contact-card:active { transform: scale(0.95); }
.contact-icon { font-size: 28px; margin-bottom: 8px; }
.contact-title { font-size: 13px; font-weight: 600; color: #333; }
.contact-detail { font-size: 11px; color: #888; margin-top: 2px; }

.section-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #333; }

.faq-list { display: flex; flex-direction: column; gap: 8px; }

.faq-item {
  background: white; border-radius: 12px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid transparent; transition: border-color 0.2s;
}

.faq-item.open { border-color: #667eea; }

.faq-question {
  width: 100%; padding: 16px; background: none; border: none;
  display: flex; justify-content: space-between; align-items: center;
  font-size: 14px; font-weight: 500; color: #333;
  cursor: pointer; text-align: left; gap: 12px; font-family: inherit;
}

.faq-arrow { font-size: 20px; color: #667eea; flex-shrink: 0; font-weight: 300; }

.faq-answer { padding: 0 16px 16px; font-size: 13px; color: #666; line-height: 1.6; }
```

### 9.6 — Instalar dependencias

```bash
cd mf-ayuda
npm install
cd ..
```

---

## Paso 10 — Compilar y ejecutar

Desde `04-single-spa/`:

```bash
npm run install:all
npm start
```

Abre http://localhost:9000 y navega por las secciones.

---

## Paso 11 — Verificar que funciona

### 11.1 — Network tab

Abre **DevTools → Network** y navega entre las pestañas:

1. Al cargar la app: `mf-header.js` y `mf-navbar.js` se cargan inmediatamente (siempre visibles)
2. Al navegar a cada sección: se carga el `.js` correspondiente bajo demanda
3. **Cada MF trae su propio CSS** (por archivo `.css` o inyectado en su `.js`) — ya no hay un `App.css` monolítico

### 11.2 — Inspeccionar el Import Map

En DevTools → Sources, verifica que los 6 MFs están mapeados:

```
import('@mobile-app/mf-header')    → http://localhost:9001/mf-header.js
import('@mobile-app/mf-navbar')    → http://localhost:9002/mf-navbar.js
import('@mobile-app/mf-dashboard') → http://localhost:9003/mf-dashboard.js
...
```

### 11.3 — Desconectar un remote

Para el servidor de `mf-ayuda` (puerto 9006). Navega a "Ayuda":

- single-spa mostrará un error, pero el resto de la app sigue funcionando
- Header, Navbar, Dashboard y el resto de MFs no se ven afectados

### 11.4 — Animaciones de transición

Navega entre las pestañas y observa las animaciones slide-left/slide-right. El root-config detecta la dirección según el orden de las pestañas en `TAB_ORDER`.

---

### Patrón repetible para cada MF

Cada nuevo MF sigue exactamente el mismo patrón:

```
mf-<nombre>/
├── package.json           → name: @mobile-app/mf-<nombre>, dep: single-spa-react
├── vite.config.js         → build.lib con entry mf-<nombre>.jsx
└── src/
    ├── mf-<nombre>.jsx    → singleSpaReact({ rootComponent, domElementGetter })
    ├── root.component.jsx → El componente React principal
    └── styles.css         → Estilos propios del MF
```

---

## 🤔 Reflexión: ¿Y ahora qué?

Tenemos 6 microfrontends completamente independientes, pero **no se comunican entre sí**. ¿Qué pasa si:

- El usuario contrata un producto en "Contratar" y necesita verse reflejado en "Contratados"?
- El Header necesita mostrar el número de notificaciones que viene de otro MF?
- Un MF necesita compartir el estado de autenticación con los demás?

En el **paso 05 (Comunicación)** resolveremos esto con eventos custom, stores compartidas y otros patrones de comunicación entre microfrontends.

---
