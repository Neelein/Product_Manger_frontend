import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyReq', (proxyReq) => {
            const secret = process.env.API_GATEWAY_SECRET
            if (secret) proxyReq.setHeader('Authorization', `Bearer ${secret}`)
          })
        },
      },
      '/media': {
        target: 'http://localhost:8090',
        changeOrigin: true,
      },
    },
  },
})
