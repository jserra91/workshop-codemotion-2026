import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/settings.spa.jsx',
      formats: ['es'],
      fileName: () => 'settings.spa.js',
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime', 'react-dom/client', '@company/ui-kit'],
    },
  },
});
