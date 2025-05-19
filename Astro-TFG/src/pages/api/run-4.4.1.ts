import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import type { APIRoute } from 'astro';

export const prerender = false;

function runWorkerProcess(scriptPath: string, args: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
        const child = spawn('python3', [scriptPath, ...args], {
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(stdout));
                } catch (err: any) {
                    reject(new Error(`Invalid JSON: ${err.message}`));
                }
            } else {
                reject(
                    new Error(
                        `Script exited with code ${code}: ${stderr.trim()}`
                    )
                );
            }
        });
    });
}

export const POST: APIRoute = async ({ request }) => {
    const { delay } = await request.json().catch(() => ({}) as any);
    const ms = typeof delay === 'number' && delay > 0 ? delay : 0;

    const scriptPath = fileURLToPath(
        new URL('../../../public/scripts/mock_api.py', import.meta.url)
    );

    try {
        const result = await runWorkerProcess(scriptPath, [String(ms)]);
        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('Error on API route:', err);
        return new Response(
            JSON.stringify({
                status: 'error',
                message: err.message,
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
