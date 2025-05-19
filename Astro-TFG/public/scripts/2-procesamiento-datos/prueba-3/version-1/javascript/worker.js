// worker.js
importScripts("https://cdn.jsdelivr.net/npm/danfojs@1.1.2/lib/bundle.js");

self.onmessage = function (event) {
    const { id, size } = event.data;
    if (!size) {
        self.postMessage({ id, error: "Size not provided" });
        return;
    }

    try {
        const metrics = {};
        const startTotal = performance.now();

        const startCreate = performance.now();
        const dataArray = Array.from({ length: size }, () => {
            return [Math.floor(Math.random() * 1000)];
        });
        const df = new self.dfd.DataFrame(dataArray, { columns: ["values"] });
        const memoryUsage = (size * 4) / (1024 * 1024);
        metrics.create = {
            time: performance.now() - startCreate,
            memory: memoryUsage,
        };

        const sumStart = performance.now();
        const sumValue = df.sum();
        metrics.sum = {
            time: performance.now() - sumStart,
            memory: memoryUsage,
        };

        const meanStart = performance.now();
        const meanValue = df.mean();
        metrics.mean = {
            time: performance.now() - meanStart,
            memory: memoryUsage,
        };

        const stdStart = performance.now();
        const stdValue = df.std();
        metrics.std = {
            time: performance.now() - stdStart,
            memory: memoryUsage,
        };

        metrics.total = { time: performance.now() - startTotal };
        self.postMessage({ id, results: metrics });
    } catch (e) {
        console.error("Error:", e);
        self.postMessage({
            id,
            error: e.message,
            stack: e.stack,
        });
    }
};
