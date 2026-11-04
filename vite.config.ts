import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwind(),
        basicSsl()
    ],
    server: {
        host: true
    }
});