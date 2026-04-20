# Paso 02 → 03 — De Module Federation a Native Federation

## Contexto

En el paso anterior transformamos el monolito en 3 sub-proyectos usando **Module Federation con Vite** (`@originjs/vite-plugin-federation`). Funciona, pero tiene problemas:

| Problema | Detalle |
|---|---|
| **Protocolo propietario** | Module Federation no es un estándar web |
| **Shared scope opaco** | ¿Quién carga React? ¿Qué versión exacta? Difícil de depurar |
| **Config compleja** | `shared`, `singleton`, `requiredVersion`... muchos flags |
| **Sin tipos** | `import('catalog/Catalog')` no tiene TypeScript (en este workshop no vamos a codificar con typescript pero el sistema con ModuleFederation no lo permite) |
| **Build obligatorio** | Los remotes deben compilarse antes de servirse o estar deployados |
| **Acoplado a Webpack/Vite** | Necesitas el plugin específico del bundler |

## ¿Qué vamos a hacer?

Vamos a reemplazar Module Federation por **un estándar web** y una librería agnostica:

- **Import Maps** — un estándar HTML que le dice al navegador dónde encontrar cada módulo
- **single-spa** — una librería que orquesta el ciclo de vida de los microfrontends (mount/unmount)

```
ANTES (Module Federation)              DESPUÉS (Native Federation)
────────────────────────               ─────────────────────────
@originjs/vite-plugin-federation       <script type="importmap"> (estándar HTML)
remoteEntry.js (protocolo MF)          ESM puro (.spa.js)
React bundleado en cada remote         React desde CDN (esm.sh) vía import map
react-router-dom (SPA routing)         single-spa (lifecycle routing)
shared scope opaco                     import map explícito y visible
```

Al final, los remotes serán **módulos ES puros** que el navegador carga directamente — sin protocolo propietario, sin shared scope mágico.

En caso de que necesiteis algún sistema que no sea ES puros, como por ejemplo UMD, existen librerías que te hacen de soporte para ellos. Por ejemplo; SystemJS.

## Ejecución actual

```bash
npm install
npm run install:all
npm start
# → http://localhost:9000
```

---

# 👉 Transformemos la arquitectura!

## Paso 1 — Entender Import Maps

Antes de tocar código, entendamos qué es un Import Map. Abre la consola del navegador y escribe:

```js
import('react');
// → Error: Failed to resolve module specifier "react"
```

El navegador **no sabe** qué es `'react'`. Module Federation resolvía esto con su shared scope. Un Import Map le dice al navegador directamente:

```html
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@19.0.0"
  }
}
</script>
```

Ahora `import('react')` funciona nativamente — sin plugins, sin builds especiales.

Cuando el navegador interpreta `import('react')`, lo que hace es ir al imports y analizar si esta clave existe. Si dicha clave existe, lo que realizará es una descarga de esa dependencia.

Lo bueno de esto es que siempre puedes actualizar facilmente las versiones si estás seguro de que no rompe nada en el sistema. Por ejemplo, si utilizas la version 19.0.0 y quieres actualizar a la 19.0.1, solo debes actualizar la versión.

Es verdad de que tambien acepta **npm tags**, pero no los recomiendo. El navegador lo que realizará es una petición para resolver ese tag. Si la conexión es rapida (fibra optica) no ocurre nada porque la traducción y la posterior descarga es rapida. En caso de que se utilice 4G o 5G, puede penalizar por muchos milisegundos.

---

## Paso 2 — Entender single-spa

En Module Federation usábamos `react-router-dom` para decidir qué componente mostrar en cada ruta. Pero `react-router-dom` es React-específico y se configura en `App.jsx`.

**single-spa** es un orquestador genérico para microfrontends: registras apps con rutas, y él se encarga de llamar `mount()` cuando la ruta coincide y `unmount()` cuando se sale:

```js
import { registerApplication, start } from 'single-spa';

registerApplication({
  name: '@company/catalog',
  app: () => import('@company/catalog'),
  activeWhen: ['/productos-contratar'],
});

start();
```

La app registrada debe exportar 3 funciones: `bootstrap`, `mount`, `unmount`. No importa qué framework use internamente (React, Vue, Angular...)

---

## Paso 3 — Modificar los remotes

Vamos a crear cada uno de los microfrontends con lo que ya teniamos.

### 3.1 — `mf-productos-contratar/package.json`

Reemplaza el contenido por:

```json
{
  "name": "mf-productos-contratar",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  }
}
```

¿Qué ha cambiado?

- **Se elimina `react` y `react-dom` de `dependencies`** — React vendrá del Import Map (CDN)
- **Se elimina `@originjs/vite-plugin-federation`** — ya no se necesita

### 3.2 — `mf-productos-contratar/vite.config.js`

Reemplaza el contenido por:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/catalog.spa.jsx',
      formats: ['es'],
      fileName: () => 'catalog.spa.js',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom/client'],
    },
  },
});
```

Puntos clave:

- **Se elimina el plugin `federation`** y toda su configuración (`name`, `exposes`, `shared`)
- **`build.lib`** — ahora el remote se compila como una **librería ES module**
  - `entry: './src/catalog.spa.jsx'` — el punto de entrada es el wrapper single-spa (lo crearemos a continuación)
  - `formats: ['es']` — output ESM puro
  - `fileName: () => 'catalog.spa.js'` — nombre fijo del fichero de salida
- **`rollupOptions.external`** — React se marca como externo. No se bundlea, se resuelve en runtime vía Import Map
- **Se elimina `server.port`** — el remote ya no levanta su propio dev server. **NOTA: En este workshop no tiene sentido pero en la vida real, normalmente lo que se hace es que cada micro-frontend tiene un inicializador. En otras palabras, es un monorepo que exporta solo el microfrontend**.
- **Se eliminan las opciones `modulePreload`, `target`, `minify`, `cssCodeSplit`** — ya no son necesarias

### 3.3 — Crear `mf-productos-contratar/src/catalog.spa.jsx`

Este es el **fichero nuevo** clave. Es el wrapper de single-spa que define el ciclo de vida del microfrontend:

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

¿Qué hace?

- **`bootstrap()`** — se llama una sola vez cuando single-spa descarga el módulo. Aquí no necesitamos hacer nada.
- **`mount()`** — se llama cada vez que la ruta coincide. Crea un React root en `#mf-container` y renderiza el componente.
- **`unmount()`** — se llama cuando se sale de la ruta. Desmonta el React root para liberar memoria.

> **Nota:** `Catalog.jsx` no cambia

### 3.4 — Eliminar `mf-productos-contratar/index.html` y `mf-productos-contratar/src/main.jsx`

Estos ficheros ya no son necesarios. En modo librería no hay HTML propio — el remote es un módulo JS puro que el root-config importa.

```bash
cd mf-productos-contratar
rm index.html src/main.jsx
```

### 3.5 — Repetir para `mf-productos-contratados`

Haz exactamente lo mismo para el otro remote:

**`mf-productos-contratados/package.json`:**

```json
{
  "name": "mf-productos-contratados",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  }
}
```

**`mf-productos-contratados/vite.config.js`:**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/settings.spa.jsx',
      formats: ['es'],
      fileName: () => 'settings.spa.js',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom/client'],
    },
  },
});
```

**Crear `mf-productos-contratados/src/settings.spa.jsx`:**

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

export async function unmount() {
  root.unmount();
}
```

**Eliminar `index.html` y `src/main.jsx`:**

```bash
cd mf-productos-contratados
rm index.html src/main.jsx
```

### 3.6 — Reinstalar dependencias de los remotes

Como hemos eliminado dependencias, limpia e instala:

```bash
cd mf-productos-contratar
rm -rf node_modules package-lock.json
npm install
cd ..

cd mf-productos-contratados
rm -rf node_modules package-lock.json
npm install
cd ..
```

---

## Paso 4 — Modificar el Root-Config

El root-config es donde ocurren los cambios más grandes: pasamos de React Router + Module Federation a Import Maps + single-spa.

### 4.1 — `root-config/package.json`

Reemplaza el contenido por:

```json
{
  "name": "root-config",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  }
}
```

¿Qué ha cambiado?

- **Se elimina `react`, `react-dom`** de `dependencies` — vendrán del Import Map (CDN)
- **Se elimina `react-router-dom`** — reemplazado por single-spa
- **Se elimina `@originjs/vite-plugin-federation`** — reemplazado por Import Maps
- **`dev` cambia a `vite build --watch`** — consistente con los remotes
- **Solo quedan `devDependencies`** — Vite y el plugin de React para compilar

### 4.2 — `root-config/vite.config.js`

Reemplaza el contenido por:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom/client',
        'single-spa',
        '@company/catalog',
        '@company/settings',
      ],
      output: {
        format: 'es',
      },
    },
  },
});
```

Puntos clave:

- **Se elimina el plugin `federation`** — toda la resolución de módulos la hace el Import Map
- **`external`** — le dice a Vite: "no intentes bundlear estos módulos, se resolverán en runtime"
  - `react`, `react/jsx-runtime`, `react-dom/client` — vienen del CDN
  - `single-spa` — viene del CDN
  - `@company/catalog`, `@company/settings` — vienen de los remotes
- **`format: 'es'`** — output ESM puro compatible con el navegador
- **Se eliminan `server.port`** y las opciones de `build` (modulePreload, target, etc.)

### 4.3 — `root-config/index.html` — El Import Map 🔑

Este es el cambio más importante. Reemplaza el contenido por:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Mi App Bancaria</title>

    <!-- Import Map -->
    <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@19.0.0",
        "react/jsx-runtime": "https://esm.sh/react@19.0.0/jsx-runtime",
        "react-dom/client": "https://esm.sh/react-dom@19.0.0/client?external=react",
        "single-spa": "https://esm.sh/single-spa@6.0.1",
        "@company/catalog": "http://localhost:9001/catalog.spa.js",
        "@company/settings": "http://localhost:9002/settings.spa.js"
      }
    }
    </script>
  </head>
  <body>
    <div id="app-container">
      <div id="root-config-header"></div>
      <main id="mf-container"></main>
      <div id="root-config-navbar"></div>
    </div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

¿Qué ha cambiado?

1. **`es-module-shims`** — polyfill para navegadores que aún no soportan Import Maps nativos
2. **`<script type="importmap">`** — la fuente de verdad. Ahora puedes **ver** exactamente de dónde viene cada módulo:
   - `react` → CDN (esm.sh)
   - `single-spa` → CDN (esm.sh)
   - `@company/catalog` → `http://localhost:9001/catalog.spa.js` (nuestro remote)
   - `@company/settings` → `http://localhost:9002/settings.spa.js` (nuestro remote)
3. **El `<body>` cambia** — ya no hay un solo `<div id="root">`. Ahora hay 3 contenedores:
   - `#root-config-header` — donde se monta el Header (siempre visible)
   - `#mf-container` — donde single-spa monta/desmonta los microfrontends según la ruta
   - `#root-config-navbar` — donde se monta el BottomNav (siempre visible)

> **Contraste con Module Federation:** antes, `remoteEntry.js` usaba un protocolo binario propietario. Ahora, el import map es **texto plano en el HTML** — cualquiera puede leerlo, debuguearlo, y modificarlo.

### 4.4 — `root-config/src/main.jsx` — single-spa en acción

Reemplaza el contenido por:

```jsx
import { registerApplication, start } from 'single-spa';
import { createRoot } from 'react-dom/client';
import './App.css';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Ayuda from './pages/Ayuda';

// --- Render Root-Config Chrome ---
const headerRoot = createRoot(document.getElementById('root-config-header'));
headerRoot.render(<Header />);

const navRoot = createRoot(document.getElementById('root-config-navbar'));
navRoot.render(<BottomNav />);

// --- Helper: mount local React component as single-spa app ---
function localApp(Component) {
  let root;
  return {
    bootstrap: () => Promise.resolve(),
    mount: () => {
      const container = document.getElementById('mf-container');
      root = createRoot(container);
      root.render(<Component />);
      return Promise.resolve();
    },
    unmount: () => {
      root.unmount();
      return Promise.resolve();
    },
  };
}

// --- Register Applications ---
registerApplication({
  name: '@company/dashboard',
  app: () => Promise.resolve(localApp(Dashboard)),
  activeWhen: ['/dashboard'],
});

registerApplication({
  name: '@company/catalog',
  app: () => import('@company/catalog'),
  activeWhen: ['/productos-contratar'],
});

registerApplication({
  name: '@company/settings',
  app: () => import('@company/settings'),
  activeWhen: ['/productos-contratados'],
});

registerApplication({
  name: '@company/ayuda',
  app: () => Promise.resolve(localApp(Ayuda)),
  activeWhen: ['/ayuda'],
});

// Default route
if (location.pathname === '/') {
  history.replaceState(null, '', '/dashboard');
}

start({ urlRerouteOnly: true });
```

¿Qué ha cambiado respecto al `main.jsx` anterior?

1. **Se elimina `App` como componente** — ya no hay un componente raíz con BrowserRouter
2. **Header y BottomNav se montan directamente** en sus contenedores (`#root-config-header`, `#root-config-navbar`). Son "chrome" siempre visible.
3. **`localApp()`** — helper que convierte un componente React local en una app single-spa (con `bootstrap`/`mount`/`unmount`)
4. **`registerApplication()`** — cada sección se registra con:
   - `name` — identificador único
   - `app` — función que devuelve el módulo (local o `import()` remoto)
   - `activeWhen` — rutas en las que se activa
5. **Apps locales** (Dashboard, Ayuda) usan `localApp()` — se montan/desmontan con el helper
6. **Apps remotas** (Catalog, Settings) usan `import('@company/catalog')` — el navegador resuelve la URL vía Import Map y descarga el `.spa.js`
7. **`start({ urlRerouteOnly: true })`** — arranca single-spa. `urlRerouteOnly` evita re-renders innecesarios.

### 4.5 — Eliminar `root-config/src/App.jsx`

Ya no se necesita. La lógica de routing pasó a `main.jsx` con single-spa:

```bash
cd root-config
rm src/App.jsx
```

### 4.6 — Actualizar `root-config/src/components/BottomNav.jsx`

El BottomNav usaba `<Link>` de react-router-dom. Ahora usa `navigateToUrl` de single-spa:

```jsx
import { navigateToUrl } from 'single-spa';

const tabs = [
  { path: '/dashboard', label: 'Inicio', icon: '🏠' },
  { path: '/productos-contratados', label: 'Productos', icon: '💼' },
  { path: '/productos-contratar', label: 'Contratar', icon: '🛍️' },
  { path: '/ayuda', label: 'Ayuda', icon: '❓' },
];

export default function BottomNav() {
  const current = location.pathname;
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <a
          key={tab.path}
          href={tab.path}
          onClick={navigateToUrl}
          className={`nav-item ${current === tab.path ? 'active' : ''}`}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </a>
      ))}
    </nav>
  );
}
```

¿Qué ha cambiado?

- **`import { navigateToUrl } from 'single-spa'`** reemplaza a los `<Link>` de react-router-dom
- `navigateToUrl` intercepta el click, hace `pushState`, y single-spa decide qué app montar
- Usamos `<a>` nativo con `onClick={navigateToUrl}` — funciona igual que `<Link>` pero sin depender de React Router

### 4.7 — Actualizar `root-config/src/App.css`

En el CSS, necesitas añadir estilos para los nuevos contenedores. Busca el selector `#root` y cámbialo:

**Antes:**
```css
#root {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}
```

**Después — añade `#app-container`:**
```css
#app-container {
  width: 100%;
  max-width: 430px;
  height: 100%;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 0 30px rgba(0,0,0,0.15);
  overflow: hidden;
}
```

Y actualiza `#mf-container` para que herede el estilo de `.main-content`:

```css
#mf-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: 80px;
}
```

> Puedes eliminar `.app-container` y `.main-content` del CSS ya que ahora se usan `#app-container` y `#mf-container`.

### 4.8 — Reinstalar dependencias del root-config

```bash
cd root-config
rm -rf node_modules package-lock.json
npm install
cd ..
```

---

## Paso 5 — Compilar y ejecutar

Desde la raíz del proyecto:

```bash
npm run install:all
npm start
```

Abre http://localhost:9000 y navega por las secciones.

---

## Paso 6 — Verificar los cambios

### 6.1 — Import Map visible

Abre **View Source** (Ctrl+U) en el navegador. Verás el Import Map directamente en el HTML. Cada módulo tiene su URL explícita — nada oculto.

### 6.2 — Network tab

Abre **DevTools → Network** y navega a "Contratar":

1. Verás una petición a `http://localhost:9001/catalog.spa.js` — un módulo ES puro
2. `react` se carga desde `esm.sh` (CDN) — una sola vez, cacheado por el navegador
3. **No hay `remoteEntry.js`** — no hay protocolo propietario

### 6.3 — single-spa lifecycle

Abre la consola y navega entre secciones. Cada vez que cambias de ruta:
1. single-spa llama `unmount()` de la app saliente
2. Llama `mount()` de la app entrante
3. El contenedor `#mf-container` se limpia y se rellena

### 6.4 — Desconectar un remote

Para `mf-productos-contratar` y navega a "Contratar". La consola mostrará un error de red, pero Dashboard y Ayuda siguen funcionando.

---

## 👉 Siguiente paso

Ve a [`03-native-federation`](../03-native-federation/) para ver una arquitectura single-spa más completa con múltiples microfrontends independientes.
