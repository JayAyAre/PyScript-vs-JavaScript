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
        totalTime: performance.now() - startTotal,
        memoryPeak: maxMemory
    };

    const outputElement = document.getElementById("javascript-output");
    if (!outputElement) return;
    outputElement.innerHTML = "";


    for (const [op, data] of Object.entries(metrics)) {
        if (op === 'output') continue;
        const line = `${op.toUpperCase()} - Time av. : ${data.time.toFixed(2)} ms | RAM: ${data.memory.toFixed(2)} MB`;
        outputElement.innerHTML += line + "<br>";
    }

    outputElement.innerHTML += "<br>";
    const tot = metrics['output'];
    const totalLine = `TOTAL - Time: ${tot.totalTime.toFixed(2)} ms | RAM Peak: ${tot.memoryPeak.toFixed(2)} MB`;
    outputElement.innerHTML += totalLine;
}

window.runJsBenchmark = function () {
    clearCell("javascript-output");
    window.showExecutionLoader();

    requestAnimationFrame(() => {
        setTimeout(() => {
            doStatisticalAnalysis(10_000_000);
            window.hideExecutionLoader();
        }, 0);
    });
};