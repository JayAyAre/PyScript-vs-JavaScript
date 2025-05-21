function normalRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

self.onmessage = function (e) {
    const msg = e.data;
    if (msg.type !== "do_analisis") return;

    const { id, num_points, num_series } = msg;

    try {
        const t0 = performance.now();

        const x = new Float64Array(num_points);
        for (let i = 0; i < num_points; i++) {
            x[i] = (10 * i) / (num_points - 1);
        }

        const ys = [];
        for (let s = 0; s < num_series; s++) {
            const y = new Float64Array(num_points);
            for (let j = 0; j < num_points; j++) {
                y[j] = Math.sin(x[j] + s) + normalRandom(0, 0.1);
            }
            ys.push(y);
        }

        const dataGenTime = performance.now() - t0;
        const bytesUsed = x.byteLength + ys.reduce((sum, y) => sum + y.byteLength, 0);
        const memoryMB = bytesUsed / (1024 * 1024);

        const traces = ys.map((yArr, idx) => ({
            x: Array.from(x),
            y: Array.from(yArr),
            mode: "lines",
            name: `Serie ${idx + 1}`,
            line: { width: 1 }
        }));

        const layout = {
            title: "Series Temporales (JavaScript)",
            width: 700,
            height: 500,
            xaxis: {},
            yaxis: {}
        };

        const renderTime = performance.now() - (t0 + dataGenTime);
        const totalTime = performance.now() - t0;

        self.postMessage({
            id,
            type: "result",
            payload: {
                metrics: {
                    dataGenTime,
                    renderTime,
                    totalTime,
                    mem: memoryMB,
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
};

function normalRandom(mean = 0, stdev = 1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}
