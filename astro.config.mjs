// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site: https://n333k0.github.io/shipped/
  site: 'https://n333k0.github.io',
  base: '/shipped',
  vite: {
    plugins: [tailwindcss()]
  }
});