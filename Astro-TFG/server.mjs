import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 5001 });

wss.on('connection', ws => {
    console.log('[WS] Client connected');

    ws.on('message', async message => {
        const payload = JSON.parse(message);
        const delay = payload.delay ?? 0;
        const clientId = payload.id ?? null;

        if (delay > 0) await new Promise(r => setTimeout(r, delay));

        const response = {
            id: clientId,
            status: 'success',
            data: Array.from({ length: 10 }, (_, i) => ({
                id: i,
                value: Math.random()
            }))
        };

        ws.send(JSON.stringify(response));
    });


    ws.on('close', () => {
        console.log('[WS] Client disconnected');
    });
});

console.log('✅ WebSocket server listening on ws://localhost:5001');
