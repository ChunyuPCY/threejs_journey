import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, lazyPlugins } from 'vite-plus'

export default defineConfig({
  plugins: lazyPlugins(() => [tailwindcss(), react()]),
  server: {
    port: 5173,
    open: false,
  },
  build: {
    target: 'es2022',
  },
})
