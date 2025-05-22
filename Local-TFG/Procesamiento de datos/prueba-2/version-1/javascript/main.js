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

function getMemoryUsageJS() {
    if (performance.memory) {
        return Math.max(performance.memory.usedJSHeapSize / (1024 * 1024), 0);
    }
    return -1;
}

function doStatisticalAnalysis(size) {
    const metrics = {};
    const startTotal = performance.now();
    let maxMemory = 0;

    let start_op = performance.now();
    let data = createDataStructure(size);
    metrics['create'] = {
        time: performance.now() - start_op,
        memory: getMemoryUsageJS(),
    };

    maxMemory = Math.max(maxMemory, getMemoryUsageJS());

    const operations = [
        ['sum', calculateSum],
        ['mean', calculateMean],
        ['std', calculateStd]
    ];

    for (const [op_name, op_func] of operations) {
        start_op = performance.now();

        const mem_before = getMemoryUsageJS();
        op_func(data);
        const mem_after = getMemoryUsageJS();

        if (mem_after > maxMemory) maxMemory = mem_after;

        metrics[op_name] = {
            time: performance.now() - start_op,
            memory: Math.abs(mem_after - mem_before),
        };
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