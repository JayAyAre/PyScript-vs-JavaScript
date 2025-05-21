self.onmessage = async function (e) {
    const data = e.data;

    if (data.type === "do_analisis") {
        try {
            const { id, num_requests, delay } = data;
            const JAVASCRIPT_SERVER = "http://127.0.0.1:5002";

            const results = [];
            const individualTimes = [];

            const fetchWithTiming = async () => {
                const url = `${JAVASCRIPT_SERVER}/mock-api/${delay}`;
                const start = performance.now();
                try {
                    const res = await fetch(url);
                    const json = await res.json();
                    results.push(json);
                } catch (e) {
                    results.push(null);
                } finally {
                    const end = performance.now();
                    individualTimes.push(end - start);
                }
            };

            const start_time = performance.now();
            await Promise.all(
                Array.from({ length: num_requests }, () => fetchWithTiming())
            );
            const total_time = performance.now() - start_time;

            const avg_time = individualTimes.length > 0
                ? individualTimes.reduce((acc, t) => acc + t, 0) / individualTimes.length
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
                last_value,
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
