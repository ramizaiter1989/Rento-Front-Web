import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 4000,
    host: "127.0.0.1",      // force IPv4 instead of ::1
    strictPort: true        // prevents random port change
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
