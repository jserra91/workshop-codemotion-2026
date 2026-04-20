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
