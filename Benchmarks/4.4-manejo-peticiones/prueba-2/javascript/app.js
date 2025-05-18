const { WebSocketServer } = require("ws");

const port = 5002;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const wss = new WebSocketServer({ port });

wss.on("connection", ws => {
    ws.on("message", async message => {
        try {
            const data = JSON.parse(message);
            const delay = data.delay || 0;
            const req_id = data.id;

            if (delay > 0) await sleep(delay);

            const payload = {
                id: req_id,
                status: "success",
                data: Array.from({ length: 10 }, (_, i) => ({
                    id: i,
                    value: Math.random()
                }))
            };

            ws.send(JSON.stringify(payload));
        } catch (e) {
            console.error("Error:", e);
        }
    });
});

console.log(`JavaScript WebSocket Server running on ws://localhost:${port}`);
