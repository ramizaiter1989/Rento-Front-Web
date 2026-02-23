import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
  base: '/',
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react(),
  ],
  server: { 
    port: 3000,
    host: "127.0.0.1",
    strictPort: true
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
