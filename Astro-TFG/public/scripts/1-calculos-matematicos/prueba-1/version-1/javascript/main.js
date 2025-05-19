function createMatrix(size) {
    let matrix = new Array(size);
    for (let i = 0; i < size; i++) {
        matrix[i] = new Array(size);
        for (let j = 0; j < size; j++) {
            matrix[i][j] = Math.random();
        }
    }
    return matrix;
}

function multiplyMatrices(size) {
    const A = createMatrix(size);
    const B = createMatrix(size);
    const C = Array.from({ length: size }, () => new Array(size).fill(0));

    const start = performance.now();

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let sum = 0;
            for (let k = 0; k < size; k++) {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }
    const executionTime = performance.now() - start;

    const results = {
        execution_time: executionTime,
        memory_usage: getMemoryUsageJS()
    };

    displayResults(results);
    window.hideExecutionLoader();
}

function getMemoryUsageJS() {
    if (performance.memory) {
        return performance.memory.usedJSHeapSize / (1024 * 1024);
    }
    return -1;
}


function displayResults(results) {
    const output = document.getElementById("javascript-output");

    const timeDiv = document.createElement("div");
    timeDiv.textContent = `ET: ${results.execution_time.toFixed(2)} ms`;
    output.appendChild(timeDiv);

    const memoryDiv = document.createElement("div");
    if (results.memory_usage !== -1) {
        memoryDiv.textContent = `RAM: ${results.memory_usage.toFixed(2)} MB`;
    } else {
        memoryDiv.textContent = `RAM unsupported measurement in this browser.`;
    }
    output.appendChild(memoryDiv);
}

window.runJsBenchmark = function () {
    clearCell("javascript-output");
    window.showExecutionLoader();

    requestAnimationFrame(() => {
        setTimeout(() => {
            document.getElementById("javascript-output").textContent = ""
            multiplyMatrices(300);
            window.hideExecutionLoader();
        }, 0);
    });

}