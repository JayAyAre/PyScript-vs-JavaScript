self.onmessage = async function (e) {
    const { num_requests, delay } = e.data;

    const results = [];
    const individualTimes = [];

    const fetchWithTiming = async () => {
        const start = performance.now();
        try {
            const res = await fetch(`http://localhost:5002/mock-api/${delay}`);
            const json = await res.json();
            results.push(json);
        } catch (e) {
            results.push(null);
        } finally {
            const end = performance.now();
            individualTimes.push(end - start);
        }
    };

    const fetchPromises = Array.from({ length: num_requests }, () =>
        fetchWithTiming()
    );

    const start_time = performance.now();
    await Promise.all(fetchPromises);
    const total_time = performance.now() - start_time;

    const avg_time =
        individualTimes.length > 0
            ? individualTimes.reduce((acc, t) => acc + t, 0) /
              individualTimes.length
            : 0;

    self.postMessage({
        total_time,
        avg_time,
        results,
    });
};
