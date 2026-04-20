# Paso 01 — Aplicación Monolítica

## ¿Qué es esto?

Una aplicación React 19 monolítica con tres secciones:

- **Inicio**: Panel general del usuario
- **Productos**: Lista de productos
- **Contratar**: Panel para contratar nuevos productos
- **Ayuda**: FAQs

Todo vive en un solo proyecto, un solo build, un solo deploy.

## Ejecutar

```bash
npm install
npm run start
# Abrir http://localhost:5173
```

## Estructura

```
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── data/products.js
    ├── pages/
    │   ├── Dashboard.jsx
    │   ├── Catalog.jsx
    │   └── [...].jsx
    └── components/
        ├── Navbar.jsx
        └── [...].jsx
    [...]
```

## Reflexión

Mientras exploras la app, piensa en:

1. **¿Qué pasa si el equipo de Catálogo quiere hacer deploy sin afectar a Settings?** No puede, es un solo build.
2. **¿Qué pasa si quieres migrar Settings a otro framework?** No puedes, todo está acoplado.
3. **¿Qué pasa cuando el bundle crece?** Build más lento, deploy más arriesgado.

## 👉 Siguiente paso

Ve a `../03-module-federation/` para ver cómo separar la app en microfrontends con Module Federation.
