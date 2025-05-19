self.onmessage = async function (e) {
    const { id, num_requests, delay, api_url } = e.data;

    try {
        const apiResponse = await fetch(api_url);
        const apiData = await apiResponse.json();
        const wsUrl = `ws://localhost:5001${apiData.wsUrl}`;

        console.log(wsUrl);
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
        const startTime = performance.now();

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const reqId = data.id;

                if (pendingRequests.has(reqId)) {
                    const { resolve, startTime } = pendingRequests.get(reqId);
                    const elapsed = performance.now() - startTime;

                    individualTimes.push(elapsed);
                    resolve(data);
                    pendingRequests.delete(reqId);
                }
            } catch (error) {
                console.error("Error processing message:", error);
            }
        };

        const requests = Array.from({ length: num_requests }, (_, i) => {
            const reqId = crypto.randomUUID();
            const payload = JSON.stringify({
                delay: delay,
                id: reqId
            });

            return new Promise((resolve) => {
                pendingRequests.set(reqId, {
                    resolve,
                    startTime: performance.now()
                });
                ws.send(payload);
            });
        });

        const results = await Promise.all(requests);
        ws.close();

        const totalTime = performance.now() - startTime;
        const avgTime = individualTimes.reduce((a, b) => a + b, 0) / individualTimes.length;

        self.postMessage({
            id,
            metrics: {
                total_time: totalTime,
                avg_time: avgTime,
                individual_times: individualTimes,
            },
            results
        });

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