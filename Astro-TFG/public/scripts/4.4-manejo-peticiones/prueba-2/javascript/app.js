const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 5002 });

wss.on("connection", (ws) => {
    ws.send("connected");

    ws.on("message", (message) => {
        let delay = 0;
        let id = null;

        try {
            const data = JSON.parse(message);
            delay = typeof data.delay === "number" ? data.delay : 0;
            id = data.id ?? null;
        } catch (e) {
            // Si no es JSON válido, delay queda en 0
        }

        setTimeout(() => {
            const responseData = Array.from({ length: 10 }, (_, i) => ({
                id: i,
                value: Math.random(),
            }));

            const response = {
                status: "success",
                delay,
                id, // <- devolvemos el mismo ID
                data: responseData,
            };

            ws.send(JSON.stringify(response));
        }, delay);
    });

    ws.on("error", (err) => {
        console.error("WebSocket error:", err);
    });
});

console.log("WebSocket server is running on ws://localhost:5002");
