# Paso 03 — Native Federation (Import Maps + single-spa)

## ¿Qué es esto?

La misma app de microfrontends, pero **sin Module Federation**. Usamos:

- **Import Maps nativos** para resolver módulos (estándar HTML)
- **single-spa** para orquestar el ciclo de vida (mount/unmount)
- **Vite** como bundler (output ESM puro)
- **es-module-shims** como polyfill de compatibilidad

## ¿Qué cambió respecto al paso 03?

| Antes (Webpack MF) | Después (Native Federation) |
|---|---|
| `ModuleFederationPlugin` | `<script type="importmap">` en HTML |
| `import('catalog/Catalog')` | `import('@company/catalog')` |
| Webpack dev server | Vite build + serve estático |
| Shared scope opaco | Import map explícito y visible |
| Solo Webpack | Cualquier bundler (Vite, Rollup...) |
| React cargado por Webpack | React desde CDN (esm.sh) vía import map |

## Ejecutar

```bash
# Instalar todo
cd root-config && npm install && cd ..
cd mf-productos-contratar && npm install && cd ..
cd mf-productos-contratados && npm install && cd ..

# Construir remotes
cd mf-productos-contratar && npm run build && cd ..
cd mf-productos-contratados && npm run build && cd ..

# Build root-config
cd root-config && npm run build && cd ..

# Levantar todos los servidores
# Terminal 1:
cd mf-productos-contratar && npx serve dist -l 3001 --cors --no-clipboard

# Terminal 2:
cd mf-productos-contratados && npx serve dist -l 3002 --cors --no-clipboard

# Terminal 3:
cd root-config && npx serve dist -l 3000 --no-clipboard

# Abrir http://localhost:3000
```

O con un solo comando (instalar `concurrently` globalmente o usar npx):

```bash
npm install
npm run build
npm start
```

## Anatomía del Import Map

Abre `root-config/index.html` y examina:

```html
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@19.0.0",
    "react/jsx-runtime": "https://esm.sh/react@19.0.0/jsx-runtime",
    "react-dom/client": "https://esm.sh/react-dom@19.0.0/client?external=react",
    "single-spa": "https://esm.sh/single-spa@6.0.1",
    "@company/catalog": "http://localhost:3001/catalog.spa.js",
    "@company/settings": "http://localhost:3002/settings.spa.js"
  }
}
</script>
```

Cada clave es un **especificador de módulo**. Cuando el código hace `import React from 'react'`, el navegador mira el import map y descarga desde `esm.sh`.

## Ciclo de vida single-spa

Cada remote exporta 3 funciones:

```jsx
export async function bootstrap() { }   // Se llama una vez
export async function mount(props) { }   // Se llama al activar la ruta
export async function unmount() { }      // Se llama al salir de la ruta
```

El root-config registra las apps:

```jsx
import { registerApplication, start } from 'single-spa';

registerApplication({
  name: '@company/catalog',
  app: () => import('@company/catalog'),
  activeWhen: ['/catalog'],
});
```

## Ejercicio

1. Examina el Import Map en `root-config/index.html`
2. Abre `root-config/src/main.jsx` y ve cómo se registran las apps
3. Abre `mf-productos-contratar/src/catalog.spa.jsx` y ve el lifecycle
4. Modifica algo en `Catalog.jsx`, haz `npm run build` en mf-productos-contratar, y recarga
5. **Reto**: Añade un tercer remote `@company/profile` en el puerto 3003

## 👉 Siguiente paso

Ve a `../07-single-spa/` para ver cómo single-spa orquesta microfrontends independientes.
