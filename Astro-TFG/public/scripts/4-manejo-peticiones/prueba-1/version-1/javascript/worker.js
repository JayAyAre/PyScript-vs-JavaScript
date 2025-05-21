self.onmessage = async function (e) {
    const data = e.data;

    if (data.type === "do_analisis") {
        try {
            const { id, num_requests, delay } = data;
            const BASE_URL = location.origin;

            const urls = Array.from(
                { length: num_requests },
                () => `${BASE_URL}/api/4.1.1/${delay}.ts`
            );

            const results = [];
            const responseTimes = [];

            const fetchWithTiming = async (url) => {
                const start = performance.now();
                try {
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Status ${res.status}`);

                    const payload = await res.json();
                    const elapsed = performance.now() - start;

                    results.push(payload);
                    responseTimes.push(elapsed);
                } catch (err) {
                    const elapsed = performance.now() - start;
                    results.push({ error: err.message });
                    responseTimes.push(elapsed);
                }
            };

            const tStart = performance.now();
            await Promise.all(urls.map(fetchWithTiming));
            const total_time = performance.now() - tStart;

            const totalResponseTime = responseTimes.reduce((sum, t) => sum + t, 0);
            const avg_time = num_requests > 0 ? totalResponseTime / num_requests : 0;

            const lastRes = results[results.length - 1];
            const lastArr = lastRes && Array.isArray(lastRes.data) ? lastRes.data : [];
            const last_value = lastArr.length > 0 ? lastArr[lastArr.length - 1].value : null;

            const result = {
                total_time,
                avg_time,
                last_value,
            };

            self.postMessage({
                id,
                json: JSON.stringify(result),
            });
        } catch (error) {
            self.postMessage({
                id: data.id,
                error: `Error in worker: ${error.message}`,
            });
        }
    }
};
