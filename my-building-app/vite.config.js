import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// React and the router change rarely: keep them in a long-lived cached chunk.
// Heavy libraries (MUI, charts, Lottie) are left to route-level splitting; naming them
// here would pull helpers they share with the homepage into the first load.
const reactVendor = /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|react-helmet-async)[\\/]/

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'es2018',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (reactVendor.test(id)) return 'react-vendor'
        },
      },
    },
  },
  server:{
    host: true,
  }
})
