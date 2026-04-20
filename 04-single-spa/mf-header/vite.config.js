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