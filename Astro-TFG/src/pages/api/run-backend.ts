// src/pages/api/run-backend.astro
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
export const prerender = false;

function runWorkerProcess(
    type: 'python' | 'node',
    scriptPath: string
): Promise<any> {
    return new Promise((resolve, reject) => {
        const command = type === 'python' ? 'python' : 'node';
        const child = spawn(command, [scriptPath]);

        let output = '';
        let errorOutput = '';

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(output);
                    resolve(result);
                } catch (err) {
                    reject(new Error('Error al parsear JSON: ' + err.message));
                }
            } else {
                reject(new Error('Worker fallo: ' + errorOutput));
            }
        });
    });
}

export async function POST({ request }) {
    const { type, path: relativePath } = await request.json();
    const decodedPath = decodeURIComponent(relativePath);
    const scriptPath = fileURLToPath(
        new URL(`../../../public/${decodedPath}`, import.meta.url)
    );

    try {
        const result = await runWorkerProcess(type, scriptPath);
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error ejecutando o parseando el script:', error);
        return new Response(
            JSON.stringify({
                error: 'Error ejecutando script',
                details: error.message,
            }),
            { status: 500 }
        );
    }
}
