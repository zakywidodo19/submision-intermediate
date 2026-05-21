import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/submision-intermediate/',

  root: resolve(__dirname, 'src'),

  publicDir: resolve(__dirname, 'src', 'public'),

  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
