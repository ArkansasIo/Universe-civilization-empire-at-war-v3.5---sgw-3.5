import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => ({
  // GitHub Pages publishes this repository under /<repository-name>/.
  // VITE_BASE_PATH can override this for custom domains or local hosting.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': projectRoot,
    },
  },
  server: {
    // HMR can be disabled in constrained authoring environments.
    hmr: process.env.DISABLE_HMR !== 'true',
    // Avoid file-system polling when the environment asks for a quiet editor.
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));
