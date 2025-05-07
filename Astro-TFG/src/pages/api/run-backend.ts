// src/pages/api/run-backend.astro
import type { APIContext } from 'astro';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { promisify } from 'util';

export const prerender = false;

// // src/pages/api/run-backend.astro
// export async function GET({ url }: APIContext) {
//     const type = url.searchParams.get('type');
//     const pathParam = decodeURIComponent(url.searchParams.get('path') || '');

//     console.log('[API] Tipo recibido:', type);
//     console.log('[API] Path recibido:', pathParam);

//     if (!type || !pathParam) {
//         return new Response(JSON.stringify({ error: 'Faltan parámetros' }), {
//             status: 400,
//             headers: { 'Content-Type': 'application/json' },
//         });
//     }

//     let scriptPath: string;
//     try {
//         scriptPath = fileURLToPath(
//             new URL(`../../../public/${pathParam}`, import.meta.url)
//         );
//         console.log('[API] Ruta absoluta de script:', scriptPath);
//     } catch (err) {
//         return new Response(JSON.stringify({ error: 'Ruta inválida' }), {
//             status: 400,
//             headers: { 'Content-Type': 'application/json' },
//         });
//     }

//     if (type === 'node') {
//         try {
//             const start = performance.now();
//             const { stdout } = await execAsync(`node "${scriptPath}"`);
//             const end = performance.now();
//             return new Response(
//                 JSON.stringify({
//                     output: stdout,
//                     time: (end - start).toFixed(2),
//                 }),
//                 { headers: { 'Content-Type': 'application/json' } }
//             );
//         } catch (err) {
//             return new Response(JSON.stringify({ error: String(err) }), {
//                 status: 500,
//                 headers: { 'Content-Type': 'application/json' },
//             });
//         }
//     }

//     if (type === 'python') {
//         // … igual que tienes
//     }

//     return new Response(JSON.stringify({ error: 'Tipo no soportado' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//     });
// }
// export async function GET({ url }: APIContext) {
//     const params = url.searchParams;
//     // const type = url.searchParams.get('type');
//     // const pathParam = decodeURIComponent(url.searchParams.get('path') || '');

//     console.log(params);

//     // if (!product) {
//     //     return new Response(null, {
//     //         status: 404,
//     //         statusText: 'Not found',
//     //     });
//     // }

//     return new Response(JSON.stringify(params), {
//         status: 200,
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     });
// }

export async function GET({ params, request }) {
    const response = await fetch(
        'https://docs.astro.build/assets/full-logo-light.png'
    );
    console.log(params);
    const buffer = Buffer.from(await response.arrayBuffer());

    return new Response(buffer, {
        headers: { 'Content-Type': 'image/png' },
    });
}

export async function POST({ request }) {
    const body = await request.json();
    const name = body.name;
    console.log(name); // Aquí puedes ver el nombre enviado en el cuerpo
    return new Response(JSON.stringify({ message: `Tu nombre es: ${name}` }), {
        status: 200,
    });
}
