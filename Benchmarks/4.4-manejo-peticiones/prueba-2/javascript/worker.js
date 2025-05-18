const WEBSOCKET_SERVER = "ws://localhost:5002";

self.onmessage = async function (e) {
    const data = e.data;

    if (data.type === "do_analisis") {
        try {
            const { id, num_requests, delay } = data;

            const results = [];
            const individualTimes = [];

            const ws = new WebSocket(WEBSOCKET_SERVER);
            await new Promise((resolve) => {
                ws.onopen = resolve;
            });

            const pendingRequests = new Map();
            let requestId = 0;

            ws.onmessage = (event) => {
                const parsed = JSON.parse(event.data);
                const respId = parsed.id;

                if (pendingRequests.has(respId)) {
                    const { resolve, start } = pendingRequests.get(respId);
                    const elapsed = performance.now() - start;

                    individualTimes[respId] = elapsed;
                    results[respId] = parsed;

                    resolve();
                    pendingRequests.delete(respId);
                }
            };

            const sendRequestWithTiming = async (currentDelay) => {
                const currentId = requestId++;
                const payload = JSON.stringify({ delay: currentDelay, id: currentId });

                return new Promise((resolve) => {
                    pendingRequests.set(currentId, {
                        resolve,
                        start: performance.now(),
                    });
                    ws.send(payload);
                });
            };


            const fetchPromises = Array.from({ length: num_requests }, () =>
                sendRequestWithTiming(delay)
            );

            const start_time = performance.now();
            await Promise.all(fetchPromises);
            const total_time = performance.now() - start_time;

            ws.close();

            const avg_time =
                individualTimes.length > 0
                    ? individualTimes.reduce((acc, t) => acc + t, 0) /
                    individualTimes.length
                    : 0;

            let last_value = null;
            for (let i = results.length - 1; i >= 0; i--) {
                const r = results[i];
                if (r && r.data && Array.isArray(r.data)) {
                    last_value = r.data[r.data.length - 1].value;
                    break;
                }
            }

            const result = {
                average_time_ms: avg_time,
                total_time_ms: total_time,
                total_requests: num_requests,
                last_value
            };

            self.postMessage({ id, json: JSON.stringify(result) });
        } catch (error) {
            self.postMessage({
                id: data.id,
                error: `Error in worker: ${error.message}`,
            });
        }
    }
};
