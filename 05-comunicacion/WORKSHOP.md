# Paso 05 → 06 Componentes Comunes (UI library)

## Objetivo

Crear una **librería de componentes visuales compartida** (`ui-kit`) que sea consumida por múltiples microfrontends sin duplicar código ni empaquetarla dentro de cada MF. El mecanismo de distribución es 100% Import Maps — sin `npm install` entre proyectos.

---

## Contexto del problema

Cuando varios microfrontends necesitan los mismos componentes UI (botones, tarjetas, etiquetas…) surgen dos antipatrones habituales:

| Antipatrón | Problema |
|---|---|
| Copiar el código en cada MF | Duplicación, inconsistencias, actualizaciones manuales |
| Publicar un paquete npm y añadirlo como dependencia | El componente se **bundlea dentro de cada MF** → se descarga varias veces |

La solución es servir el ui-kit como un módulo ES independiente y registrarlo en el **Import Map**. Cada MF lo declara como `external` en su build para que Rollup no lo incluya en su bundle. El navegador lo descarga **una sola vez** y lo reutiliza en todos los MFs.

---

## Arquitectura

```
root-config (puerto 9000)
│
├── Import Map
│   ├── @mobile-app/ui-kit          → http://localhost:9007/ui-kit.js  ← NUEVO
│   ├── @mobile-app/mf-header       → http://localhost:9001/mf-header.js
│   ├── @mobile-app/mf-navbar       → http://localhost:9002/mf-navbar.js
│   ├── ...
│   ├── @mobile-app/mf-productos-contratados → :9004
│   └── @mobile-app/mf-productos-contratar   → :9005
│
├── ui-kit (puerto 9007)                       ← NUEVO
│   └── Button, Card, Badge (inline styles)
│
├── mf-productos-contratar (9005) → usa Button, Card, Badge del ui-kit
└── mf-productos-contratados (9004) → usa Card, Badge del ui-kit
```

---

## Pasos del workshop

### Paso 1 — Crear el proyecto `ui-kit`

El ui-kit es un proyecto Vite normal con un **library build**:

```js
// ui-kit/vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.js',
      formats: ['es'],
      fileName: () => 'ui-kit.js',   // produce dist/ui-kit.js
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],   // React viene del Import Map
    },
  },
});
```

Los componentes usan **inline styles** (objetos JS) en lugar de CSS. Esto evita:
- Necesitar el plugin `vite-plugin-css-injected-by-js`
- Conflictos de nombres de clase entre MFs

```jsx
// ui-kit/src/Button.jsx
export function Button({ children, variant = 'primary', onClick, fullWidth = true }) {
  const style = {
    background: variant === 'primary'
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : '#f0f2f5',
    color: variant === 'primary' ? 'white' : '#333',
    padding: '12px 20px',
    borderRadius: '12px',
    width: fullWidth ? '100%' : 'auto',
    // ...
  };
  return <button style={style} onClick={onClick}>{children}</button>;
}
```

El `src/index.js` re-exporta todo:

```js
export { Button } from './Button';
export { Card }   from './Card';
export { Badge }  from './Badge';
```

Tras el build, `dist/ui-kit.js` es un módulo ES que importa React externamente.

---

### Paso 2 — Registrar en el Import Map

En `root-config/index.html`, añadir la entrada al importmap:

```json
{
  "imports": {
    "@mobile-app/ui-kit": "http://localhost:9007/ui-kit.js",
    "@mobile-app/mf-header": "http://localhost:9001/mf-header.js",
    ...
  }
}
```

> **¿Por qué `@mobile-app/ui-kit` como nombre?**
> Es el mismo especificador de módulo que los MFs usarán en sus `import`. El navegador intercepta ese nombre y lo resuelve a la URL del Import Map — igual que hace con `react` o `single-spa`.

---

### Paso 3 — Excluir del bundle en cada MF consumidor

En los MFs que usen el ui-kit, añadir `'@mobile-app/ui-kit'` al array `external` de Rollup:

```js
// mf-productos-contratar/vite.config.js
rollupOptions: {
  external: [
    'react',
    'react/jsx-runtime',
    'react-dom/client',
    'single-spa',
    '@mobile-app/ui-kit',   // ← excluido del bundle
  ],
},
```

Esto le dice a Rollup: *"cuando encuentres `import ... from '@mobile-app/ui-kit'`, déjalo como está — no lo incluyas en el bundle"*. El navegador resolverá ese import en tiempo de ejecución usando el Import Map.

> **Importante**: El ui-kit **no se instala con `npm install`** en los MFs consumidores. La única conexión es a través del Import Map. No hay entrada en `dependencies` del `package.json` de cada MF.

---

### Paso 4 — Consumir el ui-kit en los MFs

Los MFs simplemente hacen el import normal de ES Modules:

```jsx
// mf-productos-contratar/src/root.component.jsx
import { Button, Card, Badge } from '@mobile-app/ui-kit';

// Uso
<Card highlighted={producto.destacado}>
  <Badge variant="primary">{producto.precio}</Badge>
  <Button variant={seleccionado ? 'success' : 'primary'} onClick={contratar}>
    {seleccionado ? '✓ Añadido' : 'Contratar'}
  </Button>
</Card>
```

```jsx
// mf-productos-contratados/src/root.component.jsx
import { Card, Badge } from '@mobile-app/ui-kit';

<Card padding="16px">
  <Badge variant={p.estadoVariant}>{p.estado}</Badge>
</Card>
```

---

### Paso 5 — Servir el ui-kit

El ui-kit hace `vite build --watch` para regenerar `dist/ui-kit.js` con cada cambio. Se sirve estáticamente con `vite preview` en el puerto 9007.

El `package.json` raíz coordina el arranque de todos los servidores:

```json
{
  "scripts": {
    "start:ui-kit": "npm run dev --prefix ui-kit  &  npx vite preview --config ui-kit/vite.config.js --port 9007 --outDir ui-kit/dist",
    "start": "... & npm run start:ui-kit & ..."
  }
}
```

---

## Tabla de ficheros modificados/creados

| Fichero | Acción | Motivo |
|---|---|---|
| `ui-kit/package.json` | Creado | Nuevo proyecto ui-kit |
| `ui-kit/vite.config.js` | Creado | Library build → `dist/ui-kit.js` |
| `ui-kit/src/index.js` | Creado | Barrel de exports |
| `ui-kit/src/Button.jsx` | Creado | Componente botón con variantes |
| `ui-kit/src/Card.jsx` | Creado | Contenedor con shadow y borde opcional |
| `ui-kit/src/Badge.jsx` | Creado | Etiqueta tipo pill |
| `root-config/index.html` | Modificado | Añadir `@mobile-app/ui-kit` al importmap |
| `mf-productos-contratar/vite.config.js` | Modificado | Añadir `@mobile-app/ui-kit` a `external` |
| `mf-productos-contratar/src/root.component.jsx` | Modificado | Usar Button, Card, Badge del ui-kit |
| `mf-productos-contratar/src/styles.css` | Modificado | Eliminar estilos de card/botón (ahora en ui-kit) |
| `mf-productos-contratados/vite.config.js` | Modificado | Añadir `@mobile-app/ui-kit` a `external` |
| `mf-productos-contratados/src/root.component.jsx` | Modificado | Usar Card, Badge del ui-kit |
| `mf-productos-contratados/src/styles.css` | Modificado | Eliminar estilos de tarjeta (ahora en ui-kit) |

---

## Verificación

```bash
# 1. Instalar dependencias
npm run install:all

# 2. Construir y arrancar todo
npm run build
npm start

# 3. Abrir http://localhost:9000
# - Navegar a "Contratar" → los productos usan Button, Card, Badge del ui-kit
# - Navegar a "Mis Productos" → las tarjetas usan Card del ui-kit
# - Seleccionar productos → el badge del header sigue funcionando (Custom Events de step 05)

# 4. Verificar que el ui-kit se descarga UNA SOLA VEZ:
#    DevTools → Network → buscar "ui-kit.js"
#    Debe aparecer solo una petición, independientemente de cuántos MFs lo usen
```

---

## Conceptos clave

- **Import Map como sistema de distribución**: los módulos compartidos se registran con un nombre lógico (`@mobile-app/ui-kit`) que el navegador resuelve a una URL. Ningún MF necesita conocer la URL concreta.
- **`external` en Rollup**: declara qué imports **no** deben incluirse en el bundle. Es la pieza clave para que el navegador sea quien resuelva el módulo.
- **Inline styles en componentes de librería**: evita la necesidad de inyectar CSS en el `<head>` del documento y elimina colisiones de nombres de clase entre MFs.
- **Sin `npm link` ni monorepo**: a diferencia de las soluciones basadas en workspaces de npm, aquí el ui-kit y los MFs son proyectos completamente independientes coordinados únicamente por el Import Map.
