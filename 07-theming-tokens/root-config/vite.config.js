import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        'react-dom/client',
        'single-spa',
        '@company/ui-kit',
        '@company/catalog',
        '@company/settings',
      ],
      output: {
        format: 'es',
      },
    },
  },
});
