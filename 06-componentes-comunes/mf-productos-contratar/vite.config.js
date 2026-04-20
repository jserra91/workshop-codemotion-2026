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
      // Excluir del bundle: se resolverán via Import Map en el navegador
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom/client',
        'single-spa',
        '@mobile-app/ui-kit',
      ],
    },
  },
});
