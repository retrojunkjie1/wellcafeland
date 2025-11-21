import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/aiSession': {
        // For local development: point to Firebase Functions emulator
        // Default: http://127.0.0.1:5001/your-project-id/us-central1/aiSession
        // Or set VITE_FIREBASE_FUNCTIONS_URL in .env
        target: process.env.VITE_FIREBASE_FUNCTIONS_URL || 
                'http://127.0.0.1:5001',
        changeOrigin: true,
        rewrite: (path) => {
          // If VITE_FIREBASE_FUNCTIONS_URL is set, use it directly
          if (process.env.VITE_FIREBASE_FUNCTIONS_URL) {
            return path.replace('/aiSession', '');
          }
          
          // Otherwise construct emulator path
          const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id';
          const region = process.env.VITE_FIREBASE_FUNCTIONS_REGION || 'us-central1';
          return `/${projectId}/${region}/aiSession`;
        },
      },
    },
    // Suppress CSP warnings in dev (Vite HMR uses eval)
    // Note: This is development-only. Production builds don't use eval.
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* https://localhost:*; object-src 'none'; base-uri 'self';"
    },
  },
  build: {
    // In production, we can use stricter CSP
    rollupOptions: {
      output: {
        // Ensure proper chunking to avoid eval
        manualChunks: undefined,
      },
    },
  },
})
