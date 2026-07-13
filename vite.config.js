import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1'
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@fortawesome')) return 'fontawesome';
          if (id.includes('node_modules/vue')) return 'vue-vendor';
        }
      }
    }
  }
});
