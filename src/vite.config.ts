import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  const isDevelopment = mode === 'development'
  const isProduction = mode === 'production'
  
  // Safe environment variable access with fallbacks
  const demoMode = env.VITE_DEMO_MODE || (isDevelopment ? 'true' : 'false')
  const skipAuth = env.VITE_SKIP_AUTH || (isDevelopment ? 'true' : 'false')
  
  console.log(`🏗️  Building FuelTrakr in ${mode} mode`)
  console.log(`📋 Demo mode: ${demoMode}`)
  console.log(`🔐 Skip auth: ${skipAuth}`)

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // Make environment variables available at build time
      __DEV__: isDevelopment,
      __PROD__: isProduction,
      __DEMO_MODE__: demoMode === 'true',
    },
    server: {
      port: 5173,
      host: true,
      // Enable CORS for development
      cors: true,
    },
    preview: {
      port: 4173,
      host: true,
    },
    build: {
      // Ensure environment variables are available in production build
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            ui: ['lucide-react', 'sonner'],
          },
        },
      },
    },
  }
})