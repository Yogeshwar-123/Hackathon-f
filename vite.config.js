import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const host = process.env.HOST || '127.0.0.1';
const port = Number( process.env.PORT || 3000 );
const hmrDisabled = process.env.DISABLE_HMR === 'true' || process.env.VITE_DISABLE_HMR === 'true';

export default defineConfig( () => ( {
  plugins: [ react(), tailwindcss() ],
  resolve: {
    alias: {
      '@': path.resolve( __dirname, '.' ),
    },
  },
  server: {
    host,
    port,
    strictPort: false,
    hmr: hmrDisabled ? false : false,
    watch: hmrDisabled ? null : {},
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  },
} ) );
