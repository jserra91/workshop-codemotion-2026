import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.js',
      formats: ['es'],
      fileName: () => 'ui-kit.js',
    },
    rollupOptions: {
      // React se resuelve via Import Map en el navegador — no se incluye en el bundle
      external: ['react', 'react/jsx-runtime'],
    },
  },
});
