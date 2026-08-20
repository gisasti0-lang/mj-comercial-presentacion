import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5178 },
  /* Rutas relativas: el entregable debe abrirse desde el disco, no desde un dominio. */
  base: './',
  build: {
    chunkSizeWarningLimit: 4000,
    /* Todo adentro del bundle (incluidas las tipografías) para poder empaquetar
       la presentación en un único archivo. */
    assetsInlineLimit: 1024 * 1024 * 64,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
})
