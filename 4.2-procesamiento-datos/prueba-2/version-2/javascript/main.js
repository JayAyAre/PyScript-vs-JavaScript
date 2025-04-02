function createDataStructure(size) {
    const arr = new Int32Array(size);
    for (let i = 0; i < size; i++) {
        arr[i] = Math.floor(Math.random() * 1001);
    }
    return arr;
}

async function calculateInParallel(data, operation) {
    const workerCount = navigator.hardwareConcurrency || 4;
    const chunkSize = Math.ceil(data.length / workerCount);
    const promises = [];

    for (let i = 0; i < workerCount; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, data.length);
        const chunk = data.slice(start, end);

        promises.push(new Promise((resolve) => {
            const worker = new Worker('statsWorker.js');
            worker.onmessage = (e) => {
                resolve(e.data);
                worker.terminate();
            };
            worker.postMessage({ chunk, operation });
        }));
    }

    const results = await Promise.all(promises);
    return results.reduce((acc, val) => acc + val, 0);
}

async function doStatisticalAnalysis(size) {
    const metrics = {};
    const startTotal = performance.now();
    let maxMemory = 0;

    let memoryBefore = performance.memory?.usedJSHeapSize || 0;
    let startOp = performance.now();
    const data = createDataStructure(size);
    metrics['create'] = {
        time: performance.now() - startOp,
        memory: data.byteLength / (1024 * 1024)
    };
    maxMemory = metrics['create'].memory;

    const operations = ['sum', 'mean', 'std'];

    for (const op of operations) {
        startOp = performance.now();
        let result;

        if (op === 'sum') {
            result = await calculateInParallel(data, 'sum');
        } else if (op === 'mean') {
            const sum = await calculateInParallel(data, 'sum');
            result = sum / data.length;
        } else if (op === 'std') {
            const sum = await calculateInParallel(data, 'sum');
            const sumSquares = await calculateInParallel(data, 'sumSquares');
            result = Math.sqrt(sumSquares / data.length - Math.pow(sum / data.length, 2));
        }

        metrics[op] = {
            time: performance.now() - startOp,
            memory: metrics['create'].memory,
            value: result
        };
    }

    metrics['output'] = {
        totalTime: performance.now() - startTotal,
        memoryPeak: maxMemory
    };

    for (const [op, data] of Object.entries(metrics)) {
        if (op !== 'output') {
            const element = document.getElementById(`javascript-${op}`);
            if (element) {
                const displayText = op === 'create'
                    ? `CREATE - Time: ${data.time.toFixed(2)} ms | RAM: ${data.memory.toFixed(2)} MB`
                    : `${op.toUpperCase()} = ${data.value?.toFixed(2)} | Time: ${data.time.toFixed(2)} ms | RAM: ${data.memory.toFixed(2)} MB`;
                element.textContent = displayText;
            }
        }
    }

    const outputElement = document.getElementById("javascript-output");
    if (outputElement) {
        outputElement.textContent =
            `TOTAL - Time: ${metrics['output'].totalTime.toFixed(2)} ms | ` +
            `RAM Peak: ${metrics['output'].memoryPeak.toFixed(2)} MB`;
    }
}

function runJSBenchmark() {
    clearCell("javascript");
    doStatisticalAnalysis(10_000_000);
}