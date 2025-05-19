function createDataStructure(size) {
    const arr = [];
    for (let i = 0; i < size; i++) {
        arr.push(Math.floor(Math.random() * 1001));
    }
    return arr;
}

function calculateSum(data) {
    let total = 0;
    for (const num of data) {
        total += num;
    }
    return total;
}

function calculateMean(data) {
    return calculateSum(data) / data.length;
}

function calculateStd(data) {
    const mean = calculateMean(data);
    let squaredDiffSum = 0;
    for (const num of data) {
        squaredDiffSum += Math.pow(num - mean, 2);
    }
    return Math.sqrt(squaredDiffSum / data.length);
}

function doStatisticalAnalysis(size) {
    const metrics = {};
    const startTotal = performance.now();
    let maxMemory = 0;

    let memoryBefore = performance.memory?.usedJSHeapSize || 0;
    let startOp = performance.now();
    const data = createDataStructure(size);
    metrics['create'] = {
        time: performance.now() - startOp,
        memory: Math.abs(((performance.memory?.usedJSHeapSize || 0) - memoryBefore) / (1024 * 1024))
    };
    maxMemory = metrics['create'].memory;

    const operations = [
        ['sum', calculateSum],
        ['mean', calculateMean],
        ['std', calculateStd]
    ];

    for (const [opName, opFunc] of operations) {
        memoryBefore = performance.memory?.usedJSHeapSize || 0;
        startOp = performance.now();

        const result = opFunc(data);

        metrics[opName] = {
            time: performance.now() - startOp,
            memory: Math.abs(((performance.memory?.usedJSHeapSize || 0) - memoryBefore) / (1024 * 1024))
        };
        maxMemory = Math.max(maxMemory, metrics[opName].memory);
    }

    metrics['output'] = {
        total_time: performance.now() - startTotal,
        memory_peak: maxMemory
    };

    displayResults(metrics);
}

function displayResults(results) {
    const output = document.getElementById("javascript-output");

    for (const [op, data] of Object.entries(results)) {
        if (op !== 'output') {
            const timeDiv = document.createElement("div");
            timeDiv.textContent =
                `${op.toUpperCase()} - Time: ${data.time.toFixed(2)} ms | RAM: ${data.memory.toFixed(2)} MB`;
            output.appendChild(timeDiv);
        }
    }

    const timeTotalDiv = document.createElement("div");
    timeTotalDiv.textContent =
        `Total ET: ${results.output.total_time.toFixed(2)} ms`;
    output.appendChild(timeTotalDiv);

    const memoryDiv = document.createElement("div");
    memoryDiv.textContent =
        `RAM Peak: ${results.output.memory_peak.toFixed(2)} MB`;
    output.appendChild(memoryDiv);
}

function runJsBenchmark() {
    window.clearCell("javascript-output");
    doStatisticalAnalysis(10_000_000);
}