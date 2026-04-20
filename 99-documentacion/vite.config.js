import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import workshopMarkdown from './plugins/workshop-markdown.js';

export default defineConfig({
  plugins: [react(), workshopMarkdown()],
  server: {
    port: 4000,
  },
});
