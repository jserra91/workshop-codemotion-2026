# Paso 01 → 02 — Del monolito a Module Federation

## Objetivo y alcance

En este manual (Paso 01 - El monolito) veremos las principales problematicas de trabajar en un monolito y como migrar hacía un modelo de ModuleFederation con Vite.

Tambien podrás ver las principales problematicas de un sistema monolito.

**Si por cualquier cosa te pierdes durante el proceso de modificación de este proyecto, todos los cambios aplicados en este fichero del taller terminaras con el proyecto 02-module-federation.**

## Contexto

Tenemos una **app bancaria móvil** construida con React 19 + Vite. Es una single-page application clásica con cuatro secciones:

| Sección | Ruta | Responsable |
|---|---|---|
| Dashboard | `/dashboard` | Equipo Core |
| Mis Productos | `/productos-contratados` | Equipo Productos |
| Catálogo (Contratar) | `/productos-contratar` | Equipo Comercial |
| Ayuda | `/ayuda` | Equipo Soporte |

Todo vive en un **único repositorio**, un **único build** y un **único deploy**.

Como buenos Ingenieros informaticos que somos, el equipo Comercial nos ha pedido que redefinamos toda la arquitectura frontend para poder agilizar los desarrollos. Quieren poder reducir el tiempo de desarrollo de nuevas caracteristicas en la aplicación sin tener fricciones entre equipos.

Para ello, hemos decidido explorar el mundo de los microfrontends.

**Vamos a ello codemotions!!!!!!!!!!** (suena como codeminions)

## Ejecución

```bash
npm install
npm run start
# → http://localhost:5173
```

Abre la app y navega por las distintas secciones para familiarizarte con ella.

Verás principalmente un menu superior, un menu inferior y, de este ultimo, podrás seleccionar varias opciones que te cambiaran la pantalla.

## Arquitectura actual

```
01-inicio/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx           ← punto de entrada único
    ├── App.jsx            ← router centralizado con TODAS las rutas
    ├── App.css            ← estilos globales de TODA la app
    ├── pages/             ← paginas de la aplicación
    └── components/        ← componentes de la aplicación
```

Observa cómo `App.jsx` importa **todos** los componentes de forma estática:

```jsx
import Dashboard from './pages/Dashboard';
import ProductosContratados from './pages/ProductosContratados';
import ProductosContratar from './pages/ProductosContratar';
import Ayuda from './pages/Ayuda';
```

Cada sección está acoplada al mismo router, los mismos estilos globales y las mismas dependencias.

## Los problemas del monolito

### 1. Deploys acoplados

Imagina que tienes varios equipos trabajando en la misma SPA (producto). El equipo Comercial quiere subir un cambio en el Catálogo. Para hacerlo, necesita:

- Hacer merge en el mismo repo que los otros equipos
- Esperar a que pase el pipeline de CI **completo** (incluido Dashboard, Ayuda, etc.)
- Hacer deploy de **toda** la aplicación

Un cambio en una línea del Catálogo puede romper Ayuda si alguien más ha tocado algo. Además, tambien puede tener problemas de congelación de los entornos previos a la puesta en producción (para certificar los tests, etc.).

### 2. Escalabilidad de equipos

Con 4 equipos trabajando en el mismo código:

- **Conflictos de merge** frecuentes en `App.jsx`, `App.css`, `package.json`
- **Dependencias compartidas**: si Productos necesita una librería nueva, todos la cargan. No existe multi-versión de librerías para diferentes paginas (tecnicamente si, podrías crear una librería solo con esa pagina pero... le estamos dando muchas vueltas al problema raiz).
- **Code reviews** cruzados: el equipo Dashboard revisa código de Soporte aunque no tenga contexto
- **Ownership difuso**: ¿de quién es `App.css`? ¿Y el `Header`? ¿y de los componentes? ¿creamos una super-estructura de carpetas? ¿un proyecto con mono-repo? Muy confuso todo....

### 3. Imposibilidad de evolucionar por partes

¿Qué pasa si el equipo de Productos quiere migrar a Svelte o Vue? No puede. Todo está atado a React 19 y a react-router-dom. La única opción es reescribir **toda** la app.

## ¿Por qué microfrontends?

La solución a estos problemas es **descomponer el monolito en piezas independientes** que:

- Se **desarrollan** de forma autónoma (repos o proyectos separados)
- Se **despliegan** de forma independiente (cada equipo en su pipeline)
- Se **componen** en runtime en el navegador (el usuario no nota la diferencia)

Esto es exactamente lo que hacen los **microfrontends**.

Hay que tener en cuenta que los **microfrontends** solo se deben aplicar cuando realmente el producto final o, la filosofia de la empresa, lo permitan. A mi modo de ver, aplicar **microfrontends** en una aplicación simple que todo lo lleva el mismo equipo, es un error.

La mejor frase (y que siempre los universitarios les comentan) es... **divide y vencerás**!

# 👉 Transformemos la aplicación!

Nuestro objetivo es transformar este monolito en **3 proyectos independientes** usando **Module Federation con Vite**:

| Proyecto | Puerto | Responsabilidad |
|---|---|---|
| `root-config/` | `:9000` | Layout (Header + BottomNav) + Dashboard + Ayuda + carga los remotes |
| `mf-productos-contratar/` | `:9001` | Expone el componente `ProductosContratar` como remote |
| `mf-productos-contratados/` | `:9002` | Expone el componente `ProductosContratados` como remote |

Al final, la experiencia de usuario será **idéntica**, pero cada pieza se compila y despliega de forma independiente.

---

## Paso 1 — Crear la estructura de carpetas

Sal de `01-inicio/` y crea la estructura del proyecto de Module Federation:

```bash
mkdir root-config 
mkdir root-config/src
mkdir root-config/src/components 
mkdir root-config/src/pages
mkdir mf-productos-contratar 
mkdir mf-productos-contratar/src
mkdir mf-productos-contratados 
mkdir mf-productos-contratados/src
```

Tu árbol debería quedar así:

```
00-my-project/
├── root-config/
│   └── src/
│       ├── components/
│       └── pages/
├── mf-productos-contratar/
│   └── src/
└── mf-productos-contratados/
    └── src/
```

---

## Paso 2 — Crear el `package.json` raíz (orquestador)

Crea `00-my-project/package.json`. Este fichero no contiene código, solo scripts que instalan, compilan y levantan los 3 sub-proyectos:

```json
{
  "name": "my-project",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "install:all": "npm install --prefix root-config && npm install --prefix mf-productos-contratar && npm install --prefix mf-productos-contratados",
    "build": "npm run build --prefix mf-productos-contratar && npm run build --prefix mf-productos-contratados && npm run build --prefix root-config",
    "start": "npm run build && concurrently -n root-config,catalog,settings -c blue,green,yellow \"npx serve root-config/dist -l 9000 --no-clipboard\" \"npx serve mf-productos-contratar/dist -l 9001 --cors --no-clipboard\" \"npx serve mf-productos-contratados/dist -l 9002 --cors --no-clipboard\""
  },
  "devDependencies": {
    "concurrently": "^9.0.0",
    "serve": "^14.2.0"
  }
}
```

> **Observa:** el `build` compila primero los remotes y luego el root-config. El root-config necesita que los remotes ya existan para resolver sus `remoteEntry.js`.

Instala las dependencias raíz:

```bash
npm install
```

---

## Paso 3 — Crear el remote `mf-productos-contratar`

### 3.1 — `mf-productos-contratar/package.json`

```json
{
  "name": "mf-productos-contratar",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@originjs/vite-plugin-federation": "^1.3.6",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  }
}
```

### 3.2 — `mf-productos-contratar/vite.config.js`

Aquí está la magia de Module Federation. El plugin `federation` define **qué expone** este remote:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'catalog',
      filename: 'remoteEntry.js',
      exposes: {
        './Catalog': './src/Catalog.jsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 9001,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
```

Puntos clave:
- **`name: 'catalog'`** — identifica este remote
- **`filename: 'remoteEntry.js'`** — el fichero que el root-config descargará para saber qué módulos expone
- **`exposes`** — mapea el path `'./Catalog'` al fichero local `./src/Catalog.jsx`
- **`shared`** — React se comparte con el root-config para no cargarlo dos veces

### 3.3 — `mf-productos-contratar/index.html`

El remote necesita su propio `index.html` para poder desarrollarse en standalone:

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Remote: Catalog</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 3.4 — `mf-productos-contratar/src/main.jsx`

Entry point para desarrollo standalone (no lo usa el root-config):

```jsx
import { createRoot } from 'react-dom/client';
import Catalog from './Catalog';

const root = createRoot(document.getElementById('root'));
root.render(<Catalog />);
```

### 3.5 — Mover `ProductosContratar.jsx` → `mf-productos-contratar/src/Catalog.jsx`

Copia el fichero `src/pages/ProductosContratar.jsx` a `mf-productos-contratar/src/Catalog.jsx`.

Cambia el nombre de la función exportada de `ProductosContratar` a `Catalog`:

> Tiene el mismo contenido

```jsx
// mf-productos-contratar/src/Catalog.jsx
const catalogo = [
  // ... (mismo contenido que ProductosContratar.jsx)
];

export default function Catalog() {
  return (
    <div>
      <h2 className="page-title">Catálogo de Productos</h2>
      {/* ... mismo JSX ... */}
    </div>
  );
}
```

### 3.6 — Instalar dependencias

```bash
cd mf-productos-contratar
npm install
cd ..
```

---

## Paso 4 — Crear el remote `mf-productos-contratados`

Repite el mismo patrón para `ProductosContratados`:

### 4.1 — `mf-productos-contratados/package.json`

```json
{
  "name": "mf-productos-contratados",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@originjs/vite-plugin-federation": "^1.3.6",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  }
}
```

### 4.2 — `mf-productos-contratados/vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'settings',
      filename: 'remoteEntry.js',
      exposes: {
        './Settings': './src/Settings.jsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 9002,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
```

### 4.3 — `mf-productos-contratados/index.html`

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Remote: Settings</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 4.4 — `mf-productos-contratados/src/main.jsx`

```jsx
import { createRoot } from 'react-dom/client';
import Settings from './Settings';

const root = createRoot(document.getElementById('root'));
root.render(<Settings />);
```

### 4.5 — Mover `ProductosContratados.jsx` → `mf-productos-contratados/src/Settings.jsx`

Copia `01-inicio/src/pages/ProductosContratados.jsx` a `mf-productos-contratados/src/Settings.jsx` y renombra la función:

```jsx
// mf-productos-contratados/src/Settings.jsx
const productos = [
  // ... (mismo contenido que ProductosContratados.jsx)
];

export default function Settings() {
  return (
    <div>
      <h2 className="page-title">Mis Productos</h2>
      {/* ... mismo JSX ... */}
    </div>
  );
}
```

### 4.6 — Instalar dependencias

```bash
cd mf-productos-contratados
npm install
cd ..
```

---

## Paso 5 — Crear el Root-Config

El root-config es la aplicación "host" que:
- Contiene el layout (Header + BottomNav)
- Mantiene las páginas que **no** se han extraído (Dashboard + Ayuda)
- Carga los remotes en runtime con `lazy()` + Module Federation

### 5.1 — `root-config/package.json`

```json
{
  "name": "root-config",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0"
  },
  "devDependencies": {
    "@originjs/vite-plugin-federation": "^1.3.6",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^6.0.0"
  }
}
```

> **Observa:** solo el root-config tiene `react-router-dom`. Los remotes no necesitan router — el root-config decide en qué ruta se monta cada remote.

### 5.2 — `root-config/vite.config.js`

Aquí el plugin `federation` define **qué remotes consume**:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'root-config',
      remotes: {
        catalog: 'http://localhost:9001/assets/remoteEntry.js',
        settings: 'http://localhost:9002/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 9000,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
```

Puntos clave:
- **`remotes`** — le dice al root-config dónde encontrar cada `remoteEntry.js`
- No hay `exposes` (el root-config no expone nada, solo consume)
- `shared` asegura que React se cargue una sola vez

### 5.3 — `root-config/index.html`

```html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Mi App Bancaria</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### 5.4 — `root-config/src/main.jsx`

```jsx
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### 5.5 — Copiar componentes y páginas locales

Copia del monolito al root-config estos ficheros **sin cambios**:

```
src/components/Header.jsx    →  root-config/src/components/Header.jsx
src/components/BottomNav.jsx →  root-config/src/components/BottomNav.jsx
src/pages/Dashboard.jsx      →  root-config/src/pages/Dashboard.jsx
src/pages/Ayuda.jsx          →  root-config/src/pages/Ayuda.jsx
src/App.css                  →  root-config/src/App.css
src/App.jsx                  →  root-config/src/App.jsx
```

### 5.6 — `root-config/src/App.jsx` — El cambio clave 🔑

Este es el fichero más importante. Compáralo con el `App.jsx` del monolito:

**Antes (monolito):**
```jsx
import ProductosContratados from './pages/ProductosContratados';
import ProductosContratar from './pages/ProductosContratar';
```

**Después (Module Federation):**
```jsx
const CatalogRemote = lazy(() => import('catalog/Catalog'));
const SettingsRemote = lazy(() => import('settings/Settings'));
```

Fichero completo:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Ayuda from './pages/Ayuda';

const CatalogRemote = lazy(() => import('catalog/Catalog'));
const SettingsRemote = lazy(() => import('settings/Settings'));

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: '#aaa', fontSize: 14 }}>Cargando microfrontend...</div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/productos-contratados" element={<SettingsRemote />} />
              <Route path="/productos-contratar" element={<CatalogRemote />} />
              <Route path="/ayuda" element={<Ayuda />} />
            </Routes>
          </Suspense>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
```

¿Qué ha cambiado?

1. **`import { lazy, Suspense }`** — React lazy loading para cargar los remotes bajo demanda
2. **`lazy(() => import('catalog/Catalog'))`** — el especificador `'catalog/Catalog'` se resuelve gracias al plugin de federation que lo mapea a `http://localhost:9001/assets/remoteEntry.js` + módulo `'./Catalog'`
3. **`<Suspense fallback={...}>`** — muestra un placeholder mientras el remote se descarga
4. Los imports estáticos de `ProductosContratados` y `ProductosContratar` **desaparecen** — ya no existen en este proyecto

### 5.7 — Instalar dependencias del root-config

```bash
cd root-config
npm install
cd ..
```

### 5.8 — Eliminamos lo sobrante

Eliminamos la carpeta **src**

---

## Paso 6 — Compilar y ejecutar

Desde `03-module-federation/`:

```bash
npm run install:all
npm start
```

Abre http://localhost:9000 y navega por las secciones. Deberías ver la **misma app** que en el monolito.

---

## Paso 7 — Verificar que funciona

### 7.1 — Network tab

Abre **DevTools → Network** y navega a "Contratar":

1. Verás una petición a `http://localhost:9001/assets/remoteEntry.js`
2. Seguida de otra a la chunk del componente Catalog
3. React **no** se descarga de nuevo (shared scope)

### 7.2 — Desconectar un remote

Para a `mf-productos-contratar` (Ctrl+C en su terminal). Recarga la app y navega a "Contratar":

- El `<Suspense>` mostrará "Cargando microfrontend..." indefinidamente
- El Dashboard y Ayuda siguen funcionando — son locales al root-config
- Esto demuestra el **aislamiento**: un remote caído no tumba toda la app

---

## 🤔 Pain Points

Antes de pasar al siguiente paso, reflexionemos sobre lo que **no funciona bien**:

1. **Los URLs de los remotes están hardcodeados** en `vite.config.js` — ¿qué pasa en producción?
2. **`shared` es opaco** — ¿cómo sabes qué versión de React se está usando realmente?
3. **No es un estándar web** — Module Federation es un protocolo propietario
4. **Sin tipos** — `import('catalog/Catalog')` no tiene TypeScript, errores se descubren en runtime
5. **Build obligatorio** — los remotes deben compilarse antes de servirse

## 👉 Siguiente paso

Ve a [`02-module-federation`](../02-module-federation/) para ver cómo reemplazar Module Federation por **Import Maps nativos** — un estándar del navegador que resuelve varios de estos pain points.