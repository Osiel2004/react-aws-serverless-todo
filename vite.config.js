import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Esto engaña a las librerías de AWS para que encuentren la variable global que buscan
    global: 'window', 
  },
})