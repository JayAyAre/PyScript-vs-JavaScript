function createDataStructure(size) {
    const start = performance.now();
    const data = new Int32Array(size);
    for (let i = 0; i < size; i++) {
        data[i] = Math.floor(Math.random() * 1000);
    }
    const end = performance.now();
    const timeTaken = end - start;
    const memory = data.byteLength / (1024 * 1024);
    return { data, time: timeTaken, memory };
}

function calculateSum(data) {
    const start = performance.now();
    const sum = data.reduce((acc, val) => acc + val, 0);
    const end = performance.now();
    return { result: sum, time: end - start };
}

function calculateMean(data) {
    const start = performance.now();
    const mean = data.reduce((acc, val) => acc + val, 0) / data.length;
    const end = performance.now();
    return { result: mean, time: end - start };
}

function calculateStd(data) {
    const start = performance.now();
    const len = data.length;
    let sum = 0;
    let sumSq = 0;
    for (let i = 0; i < len; i++) {
        const val = data[i];
        sum += val;
        sumSq += val * val;
    }
    const mean = sum / len;
    const variance = (sumSq - len * mean * mean) / len;
    const std = Math.sqrt(variance);
    const end = performance.now();
    return { result: std, time: end - start };
}

self.onmessage = function (event) {
    const { id, size } = event.data;
    if (!size) {
        self.postMessage({ id, error: "Size not provided" });
        return;
    }
    try {
        const metrics = {};
        const startTotal = performance.now();

        const createResult = createDataStructure(size);
        metrics.create = {
            time: createResult.time,
            memory: createResult.memory,
        };
        const data = createResult.data;

        const sumResult = calculateSum(data);
        metrics.sum = { time: sumResult.time, memory: createResult.memory };

        const meanResult = calculateMean(data);
        metrics.mean = { time: meanResult.time, memory: createResult.memory };

        const stdResult = calculateStd(data);
        metrics.std = { time: stdResult.time, memory: createResult.memory };

        const totalTime = performance.now() - startTotal;
        metrics.total = { time: totalTime };

        self.postMessage({ id, results: metrics });
    } catch (e) {
        self.postMessage({ id, error: e.message, stack: e.stack });
    }
};
