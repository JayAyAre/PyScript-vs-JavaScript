// src/hooks.server.ts

export async function handle({ event, resolve }: { event: any; resolve: any }) {
    // resuelve la petición normalmente
    const response = await resolve(event);

    // CORS (si lo necesitas)
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,DELETE,OPTIONS'
    );
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Habilita COOP/COEP para SharedArrayBuffer
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

    return response;
}
