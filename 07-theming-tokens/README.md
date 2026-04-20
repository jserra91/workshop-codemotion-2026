# Paso 13 — Theming y Design Tokens

## ¿Qué es esto?

Centralizamos los estilos con **Design Tokens** vía CSS Custom Properties. El root-config define los tokens y los temas, los remotes los consumen automáticamente. El cambio de tema se propaga sin código en los remotes.

## ¿Qué cambió respecto al paso 11?

- El CSS ahora tiene tokens para tema `light` y `dark` via `[data-theme]`
- Settings cambia `document.documentElement.dataset.theme` y el nanostore `$theme`
- Los remotes usan `var(--color-*)` y se actualizan automáticamente
- Sin código de theming en los remotes

## Ejecutar

```bash
npm install
npm run build
npm start
# Abrir http://localhost:3000 → Ir a Configuración → Cambiar tema
```

## Cómo funciona

```css
/* tokens.css (cargado por el root-config) */
:root { --color-primary: #2563eb; --color-bg: #f8fafc; }
[data-theme="dark"] { --color-primary: #60a5fa; --color-bg: #0f172a; }
```

```jsx
// Settings: cambiar tema
document.documentElement.dataset.theme = 'dark';
window.__MF_STORES__.user.setTheme('dark');
```

Los remotes usan `var(--color-primary)` en sus estilos → se actualiza al instante.

## Ejercicio

1. Cambia el tema desde Settings y observa cómo afecta a todos los MFs
2. Inspecciona las CSS Custom Properties en DevTools
3. **Reto**: Añade un tercer tema "brand" con colores corporativos

## 👉 Siguiente paso

Ve a `../15-localizacion/` para añadir soporte multi-idioma.
