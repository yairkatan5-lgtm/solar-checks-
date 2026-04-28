import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3333,
    strictPort: true,
    host: '127.0.0.1',
    open: true,
  },
  preview: {
    port: 3334,
    strictPort: true,
    host: '127.0.0.1',
    open: true,
  },
});
