// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'standalone', // <-- aquí le dices cómo comportarse
    }),
    vite: {
        server: { cors: true },
        plugins: [
            {
                name: 'astro-dev-add-headers',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
                        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                        next();
                    });
                },
            },
            tailwindcss(),
        ],
    },
});
