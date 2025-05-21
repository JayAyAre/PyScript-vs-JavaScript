self.onmessage = async function (e) {
    const { id, num_requests, delay, api_url } = e.data;

    try {
        const apiResponse = await fetch(api_url);
        const apiData = await apiResponse.json();
        const wsUrl = `ws://localhost:5001${apiData.wsUrl}`;

        const ws = new WebSocket(wsUrl);
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error("WebSocket connection timeout"));
            }, 5000);

            ws.onopen = () => {
                clearTimeout(timeout);
                resolve();
            };

            ws.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
            };
        });

        const pendingRequests = new Map();
        const individualTimes = [];
        const results = [];

        let requestId = 0;

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const respId = data.id;

                if (pendingRequests.has(respId)) {
                    const { resolve, start } = pendingRequests.get(respId);
                    const elapsed = performance.now() - start;

                    individualTimes.push(elapsed);
                    results.push(data);

                    resolve();
                    pendingRequests.delete(respId);
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        };

        const sendRequestWithTiming = async () => {
            const currentId = crypto.randomUUID();
            const payload = JSON.stringify({ delay, id: currentId });

            return new Promise((resolve) => {
                pendingRequests.set(currentId, {
                    resolve,
                    start: performance.now(),
                });
                ws.send(payload);
            });
        };

        const start_time = performance.now();
        const fetchPromises = Array.from({ length: num_requests }, () => sendRequestWithTiming());
        await Promise.all(fetchPromises);
        const total_time = performance.now() - start_time;

        ws.close();

        const avg_time =
            individualTimes.length > 0
                ? individualTimes.reduce((acc, t) => acc + t, 0) / individualTimes.length
                : 0;

        let last_value = null;
        const resultArray = Object.values(results);

        for (let i = resultArray.length - 1; i >= 0; i--) {
            const r = resultArray[i];
            if (r?.data && Array.isArray(r.data) && r.data.length > 0) {
                last_value = r.data[r.data.length - 1].value;
                break;
            }
        }

        const result = {
            average_time_ms: avg_time,
            total_time_ms: total_time,
            total_requests: num_requests,
            last_value: last_value
        };

        self.postMessage({ id, json: JSON.stringify(result) });

    } catch (error) {
        self.postMessage({
            id,
            error: {
                message: error.message,
                stack: error.stack
            }
        });
    }
};
