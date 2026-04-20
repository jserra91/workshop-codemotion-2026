# Paso 04 → 05 — Comunicación entre Microfrontends

## Objetivo y alcance

En este paso vamos a resolver uno de los retos más habituales en arquitecturas de microfrontends: **¿cómo se comunican dos microfrontends entre sí cuando no se conocen mutuamente?**

Partimos del proyecto `04-single-spa` (7 microfrontends completamente independientes) y añadiremos un canal de comunicación en tiempo real entre:

- **`mf-productos-contratar`** (emisor) — el catálogo de productos
- **`mf-header`** (receptor) — la cabecera de la app

**Objetivo visible:** cuando el usuario pulse "Contratar" en un producto del catálogo, aparece un badge con un número en el icono de estrella del header. Si pulsa de nuevo el mismo producto, se quita (toggle). Sin ninguna librería externa.

**Si por cualquier cosa te pierdes durante el proceso de modificación de este proyecto, todos los cambios aplicados en este fichero del taller terminarán con el proyecto `05-comunicacion`.**

## Contexto

Partimos del proyecto `04-single-spa`, que tiene esta estructura:

| Proyecto | Puerto | Responsabilidad |
|---|---|---|
| `root-config/` | `:9000` | Orquestador pure-JS |
| `mf-header/` | `:9001` | Cabecera (siempre visible) |
| `mf-navbar/` | `:9002` | Navegación inferior (siempre visible) |
| `mf-dashboard/` | `:9003` | Panel principal |
| `mf-productos-contratados/` | `:9004` | Lista de productos contratados |
| `mf-productos-contratar/` | `:9005` | Catálogo de productos disponibles |
| `mf-ayuda/` | `:9006` | Centro de ayuda |

### El problema de la comunicación en microfrontends

Cada microfrontend es un bundle independiente desplegado en su propio servidor. No comparten código en tiempo de ejecución (más allá de React y single-spa), y el **root-config no debería actuar como intermediario de datos** entre MFs.

¿Cómo puede entonces `mf-productos-contratar` decirle a `mf-header` que el usuario ha añadido un producto? Opciones habituales:

| Mecanismo | Librería externa | Acoplamiento |
|---|---|---|
| `window` global | No | Alto (shared mutable state) |
| Custom Events (`window.dispatchEvent`) | No | Bajo (solo comparten el nombre del evento y el `detail`) |
| Pub/Sub personalizado | No | Medio |
| nanostores / Zustand / Redux | Sí | Medio-alto |
| BroadcastChannel API | No | Bajo (incluso entre tabs) |

**En este taller elegimos Custom Events sobre `window`**: son 100 % JavaScript nativo del navegador (ES2020+), no requieren ninguna dependencia, y el contrato entre MFs se reduce al nombre del evento y la forma del `detail`.

```
mf-productos-contratar                      mf-header
        │                                       │
        │  window.dispatchEvent(                │
        │    new CustomEvent(                   │
        │      'mf:carrito-actualizado',        │
        │      { detail: { productos: [...] } } │
        │    )                                  │
        │  )                                    │
        │ ─────────── window ──────────────────►│
        │                                       │  window.addEventListener(
        │                                       │    'mf:carrito-actualizado',
        │                                       │    handler
        │                                       │  )
```

Los dos microfrontends **no se importan mutuamente**. Solo comparten el contrato: nombre del evento `mf:carrito-actualizado` y la propiedad `detail.productos` (array de nombres).

## Ejecución del proyecto actual

```bash
npm install
npm run install:all
npm start
# → http://localhost:9000
```

---

## Paso 1 — Definir el contrato del evento

Antes de tocar ningún fichero, acordamos el contrato que usarán ambos microfrontends:

```js
// Nombre del evento (convención de namespace: "mf:" + descripción)
const EVENTO_CARRITO = "mf:carrito-actualizado";

// Payload (detail)
{
  productos: string[]   // array de nombres de productos seleccionados
}
```

Este contrato es todo lo que necesitan saber los dos equipos. No hace falta un paquete compartido, un API gateway ni ninguna otra pieza de infraestructura.

---

## Paso 2 — Modificar `mf-productos-contratar` como **emisor**

### 2.1 Añadir estado de selección en `root.component.jsx`

Abre `mf-productos-contratar/src/root.component.jsx`.

Añade la constante con el nombre del evento al principio del fichero, tras los imports:

```js
const EVENTO_CARRITO = "mf:carrito-actualizado";
```

Dentro del componente `ProductosContratar`, añade el estado para rastrear los productos seleccionados:

```js
const [seleccionados, setSeleccionados] = useState([]);
```

### 2.2 Añadir la función `toggleProducto`

Esta función añade o quita un producto de la lista y después emite el Custom Event:

```js
const toggleProducto = (nombre) => {
  const nuevaLista = seleccionados.includes(nombre)
    ? seleccionados.filter((n) => n !== nombre)
    : [...seleccionados, nombre];

  setSeleccionados(nuevaLista);

  // Emitir el Custom Event nativo del navegador
  window.dispatchEvent(
    new CustomEvent(EVENTO_CARRITO, {
      detail: { productos: nuevaLista },
    })
  );
};
```

### 2.3 Actualizar el botón en el JSX

Cambia el botón "Contratar" para que refleje el estado y llame a `toggleProducto`:

```jsx
const estaSeleccionado = seleccionados.includes(p.nombre);

<button
  className={`btn-contratar ${estaSeleccionado ? "btn-contratar--seleccionado" : ""}`}
  onClick={() => toggleProducto(p.nombre)}
>
  {estaSeleccionado ? "✓ Añadido" : "Contratar"}
</button>
```

### 2.4 Añadir el estilo del botón seleccionado en `styles.css`

```css
/* Estado: producto ya añadido */
.btn-contratar--seleccionado {
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
}
```

---

## Paso 3 — Modificar `mf-header` como **receptor**

### 3.1 Escuchar el evento en `root.component.jsx`

Abre `mf-header/src/root.component.jsx`.

Añade la constante del evento (misma cadena que en el emisor):

```js
const EVENTO_CARRITO = "mf:carrito-actualizado";
```

Dentro del componente `Header`, añade el estado y el `useEffect` que registra el listener:

```js
const [productos, setProductos] = useState([]);

useEffect(() => {
  const handleCarritoActualizado = (event) => {
    setProductos(event.detail.productos);
  };

  window.addEventListener(EVENTO_CARRITO, handleCarritoActualizado);

  // Limpieza al desmontar el microfrontend
  return () => {
    window.removeEventListener(EVENTO_CARRITO, handleCarritoActualizado);
  };
}, []);
```

> **¿Por qué el `return` dentro del `useEffect`?**
> single-spa puede montar y desmontar el microfrontend al navegar entre rutas. Si no limpiamos el listener, se acumularían múltiples handlers cada vez que el MF se vuelve a montar, produciendo comportamiento inesperado (memory leak + múltiples actualizaciones de estado por evento).

### 3.2 Añadir el icono de estrella con badge en el JSX

En la sección `header-actions`, añade un nuevo botón **antes** de los botones existentes:

```jsx
<button className="header-btn header-btn--carrito" aria-label="Productos seleccionados">
  <svg viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
  {productos.length > 0 && (
    <span className="header-badge">{productos.length}</span>
  )}
</button>
```

El badge solo se renderiza cuando `productos.length > 0`, por lo que no aparece en la carga inicial.

### 3.3 Añadir los estilos del badge en `styles.css`

```css
/* Icono de estrella: relleno para que sea reconocible */
.header-btn--carrito svg {
  fill: currentColor;
  stroke: none;
}

/* Badge con el número de productos seleccionados */
.header-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff4757;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid rgba(102, 126, 234, 0.8);
  line-height: 1;
  animation: badge-pop 0.2s ease-out;
}

@keyframes badge-pop {
  0%   { transform: scale(0); }
  70%  { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

También añade `position: relative` al selector `.header-btn` para que el badge se posicione correctamente:

```css
.header-btn {
  /* ... estilos existentes ... */
  position: relative;
}
```

---

## Paso 4 — Verificar el resultado

```bash
npm run install:all
npm start
# → http://localhost:9000
```

1. Navega a **Contratar** (icono del carrito en la barra inferior).
2. Pulsa "Contratar" en cualquier producto → el botón se vuelve verde con "✓ Añadido" y en el header aparece ⭐ con el número **1**.
3. Pulsa otro producto → el badge sube a **2**.
4. Pulsa de nuevo un producto ya añadido → se quita y el número baja.
5. Navega a cualquier otra sección → el badge persiste porque `mf-header` nunca se desmonta.

---

## Resumen de cambios

| Fichero | Cambio |
|---|---|
| `mf-productos-contratar/src/root.component.jsx` | Añade `useState`, función `toggleProducto`, dispara `CustomEvent` |
| `mf-productos-contratar/src/styles.css` | Añade `.btn-contratar--seleccionado` |
| `mf-header/src/root.component.jsx` | Añade `useState`, `useEffect` con listener, badge en JSX |
| `mf-header/src/styles.css` | Añade `.header-btn--carrito`, `.header-badge`, `@keyframes badge-pop` |

## Puntos clave

- Los dos microfrontends **no se importan entre sí**. El acoplamiento es cero a nivel de código.
- El contrato está en la **cadena del nombre del evento** (`"mf:carrito-actualizado"`) y la forma del `detail`. Documentarlo es suficiente.
- `window` actúa como **bus de eventos global** del navegador, que es exactamente lo que necesitamos para comunicación entre MFs independientes.
- La limpieza del listener en el `return` del `useEffect` es **obligatoria** en single-spa para evitar memory leaks al navegar.
- Esta misma técnica funciona con cualquier framework (Vue, Angular, Svelte…) porque se basa en la API nativa del navegador, no en React.

## Alternativas y cuándo usarlas

| Técnica | Cuándo usarla |
|---|---|
| **Custom Events** (este taller) | Comunicación simple: "algo ocurrió, aquí tienes los datos" |
| **BroadcastChannel** | Necesitas sincronizar entre pestañas del navegador |
| **`window` global con observadores** | Estado compartido más complejo (varios consumidores, historial) |
| **Librería de estado** (nanostores, Zustand…) | Estado complejo con múltiples escritores y lectores |
| **Props de single-spa** | Datos que el root-config necesita pasar al arrancar un MF |
