// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    vite: {
        server: {
            cors: true,
        },
        plugins: [
            {
                name: 'astro-dev-add-headers',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET');
                        next();
                    });
                },
            },
            tailwindcss(),
        ],
    },
    output: 'server',
});