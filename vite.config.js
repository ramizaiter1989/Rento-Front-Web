import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: "https://rento-lb.com", // <-- replace with your domain
    })
  ],
  server: { 
    port: 4000,
    host: "127.0.0.1",
    strictPort: true
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
