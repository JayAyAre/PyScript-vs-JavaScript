import { WebSocketServer } from 'ws';
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
    const wsServer = new WebSocketServer({ noServer: true });

    const url = new URL(request.url);
    const delay = parseInt(url.searchParams.get('delay') ?? '0', 10);
    const req_id = url.searchParams.get('id') ?? null;

    const { socket, headers } = request;
    wsServer.handleUpgrade(request, socket, headers, (ws) => {
        wsServer.emit('connection', ws, request);

        ws.on('message', async () => {
            if (delay > 0) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            const data = Array.from({ length: 10 }, (_, i) => ({
                id: i,
                value: Math.random(),
            }));

            ws.send(
                JSON.stringify({
                    status: 'success',
                    delay,
                    id: req_id,
                    data,
                })
            );
        });

        ws.on('close', () => {
            console.log('WebSocket disconnected');
        });
    });

    return new Response('WebSocket server ready', {
        status: 200,
    });
};
