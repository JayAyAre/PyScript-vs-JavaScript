self.onmessage = async function (e) {
    const { num_requests, delay, worker_time } = e.data;
    const base_url = location.origin;

    const urls = Array.from({ length: num_requests }, () => `${base_url}/api/4.4/${delay}.ts`);
    const results = [];
    const responseTimes = [];

    async function fetchUrl(url) {
        try {
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                results.push(data);
                responseTimes.push(data.response_time); // Obtén el tiempo de respuesta de la API
            } else {
                results.push({ error: `Request failed with status ${response.status}` });
                responseTimes.push(0); // Si la solicitud falla, lo tratamos como 0ms
            }
        } catch (e) {
            results.push({ error: `Request failed: ${e.message}` });
            responseTimes.push(0); // Si ocurre un error, también lo tratamos como 0ms
        }
    }

    const start_time = performance.now();
    console.log("mandamos peticiones");
    await Promise.all(urls.map(url => fetchUrl(url)));

    const total_time = performance.now() - start_time;

    const totalResponseTime = responseTimes.reduce((acc, time) => acc + time, 0);
    const avg_time = num_requests > 0 ? totalResponseTime / num_requests : 0;


    self.postMessage({
        worker_time,
        total_time,
        avg_time,
        results,
    });
};
