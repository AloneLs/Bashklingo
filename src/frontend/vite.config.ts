import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
    plugins: [preact()],
    server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8765',
                changeOrigin: true
            }
        }
    },
    build: {
        target: 'esnext',
        minify: 'esbuild'
    }
});
