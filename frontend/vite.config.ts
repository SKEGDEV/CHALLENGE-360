import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const layers = [
  'app',
  'assets',
  'components',
  'core',
  'hooks',
  'layouts',
  'pages',
  'services',
  'store',
  'styles',
] as const;

const alias = Object.fromEntries(
  layers.map((l) => [`@${l}`, fileURLToPath(new URL(`./src/${l}`, import.meta.url))]),
);

// Subruta de despliegue (p. ej. VITE_BASE=/shop/). Por defecto, raiz.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react()],
  resolve: { alias },
});
