import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// `base: './'` makes the build path-agnostic, so the same dist/ works on
// GitHub Pages (served from /<repo>/), Vercel, and Netlify without changes.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // React DOM + Motion are most of the bundle (~190 KB gzipped). Fine for an app; silence the warning.
  build: { chunkSizeWarningLimit: 700 },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
