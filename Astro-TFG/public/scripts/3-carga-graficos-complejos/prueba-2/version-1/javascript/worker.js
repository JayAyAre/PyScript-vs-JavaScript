// Al arrancar, avisamos al hilo principal
self.postMessage({ type: "ready" });

self.onmessage = async (e) => {
    const { id, type, payload } = e.data;

    if (type === "runBenchmark") {
        try {
            const { numSeries, numPoints } = payload;
            const startTime = performance.now();

            // Generación de datos
            const dataGenStart = performance.now();
            const x = new Float64Array(numPoints);
            for (let i = 0; i < numPoints; i++) {
                x[i] = (10 * i) / (numPoints - 1);
            }
            const ys = [];
            for (let i = 0; i < numSeries; i++) {
                const y = new Float64Array(numPoints);
                for (let j = 0; j < numPoints; j++) {
                    y[j] = Math.sin(x[j] + i) + normalRandom(0, 0.1);
                }
                ys.push(y);
            }
            const dataGenTime = performance.now() - dataGenStart;

            // Preparar trazas para Plotly
            const renderStart = performance.now();
            const traces = ys.map((y, i) => ({
                x: x,
                y: y,
                mode: "lines",
                name: `Serie ${i + 1}`,
                line: { width: 1 },
            }));
            const layout = {
                title: "Series Temporales (JavaScript)",
                width: 700,
                height: 500,
            };
            const renderTime = performance.now() - renderStart;
            const totalTime = performance.now() - startTime;

            // Memoria estimada
            const estimatedMemBytes =
                x.byteLength + ys.reduce((acc, y) => acc + y.byteLength, 0);
            const memoryUsageMB = parseFloat((estimatedMemBytes / 1024 ** 2).toFixed(2));

            // Respondemos incluyendo el mismo `id`
            self.postMessage({
                id,
                type: "result",
                payload: {
                    metrics: {
                        dataGenTime,
                        renderTime,
                        totalTime,
                        mem: memoryUsageMB,
                    },
                    graphData: { traces, layout },
                },
            });
        } catch (err) {
            self.postMessage({
                id,
                type: "error",
                payload: err.message,
            });
        }
    }
};

function normalRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}
