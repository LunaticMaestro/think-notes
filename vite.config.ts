import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],

   base: "/think-notes",

  server: {
    host: "0.0.0.0",
    watch: {
      usePolling: true
    }
  }
  
})
