import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'MFLIX',
        short_name: 'MFLIX',
        theme_color: '#050505',
        background_color: '#050505',
        display: 'standalone',
        icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        player: 'video-player.html'
      }
    }
  }
});

