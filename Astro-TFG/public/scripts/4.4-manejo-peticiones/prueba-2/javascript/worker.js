const WEBSOCKET_SERVER = "ws://localhost:5002";

self.onmessage = async function (e) {
    const { num_requests, delay } = e.data;

    const ws = new WebSocket(WEBSOCKET_SERVER);
    await new Promise((resolve) => {
        ws.onopen = resolve;
    });

    // Consumir mensaje de handshake
    await new Promise((resolve) => {
        ws.onmessage = () => resolve();
    });

    const responses = new Array(num_requests);
    const individual_times = new Array(num_requests);
    const pendingRequests = new Map();

    let requestId = 0;

    ws.onmessage = (event) => {
        const raw = event.data;
        const parsed = JSON.parse(raw);
        const id = parsed.id;

        if (pendingRequests.has(id)) {
            const { resolve, start } = pendingRequests.get(id);
            const elapsed = performance.now() - start;

            individual_times[id] = elapsed;
            responses[id] = parsed;

            resolve();
            pendingRequests.delete(id);
        }
    };

    const start_time = performance.now(); // <--- Tiempo inicial de referencia

    const promises = [];
    for (let i = 0; i < num_requests; i++) {
        const id = requestId++;
        const payload = JSON.stringify({ delay, id });

        const promise = new Promise((resolve) => {
            pendingRequests.set(id, {
                resolve,
                start: performance.now(),
            });
            ws.send(payload);
        });

        promises.push(promise);
    }

    await Promise.all(promises);
    ws.close();

    const end_time = performance.now(); // <--- Tiempo final de referencia
    const total_time = end_time - start_time; // <--- Tiempo total real

    const avg_time =
        individual_times.length > 0
            ? individual_times.reduce((sum, t) => sum + t, 0) /
              individual_times.length
            : 0;

    self.postMessage({
        total_time,
        avg_time,
        results: responses,
    });
};
