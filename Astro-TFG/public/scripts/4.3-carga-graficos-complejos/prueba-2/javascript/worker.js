self.onmessage = async (e) => {
    if (e.data.type === "runBenchmark") {
        try {
            const { numSeries, numPoints } = e.data.payload;
            const startTime = performance.now();

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

            const estimatedMemBytes =
                x.byteLength + ys.reduce((acc, y) => acc + y.byteLength, 0);
            const memoryUsageMB = (estimatedMemBytes / 1024 ** 2).toFixed(2);

            self.postMessage({
                type: "result",
                payload: {
                    metrics: {
                        dataGenTime: dataGenTime,
                        renderTime: renderTime,
                        totalTime: totalTime,
                        mem: memoryUsageMB,
                    },
                    graphData: { traces, layout },
                },
            });
        } catch (error) {
            self.postMessage({
                type: "error",
                payload: error.message,
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

self.postMessage({ type: "ready" });
