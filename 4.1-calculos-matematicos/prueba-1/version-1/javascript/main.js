function runNodeBenchmark() {
    clearCell("nodeJs-output");
    fetch("http://localhost:3000/")
        .then(response => response.json())
        .then(data => {
            let outputDiv = document.getElementById("nodeJs-output");

            let timeDiv = document.createElement("div");
            timeDiv.textContent = `ET: ${data.executionTime} ms`;
            outputDiv.appendChild(timeDiv);

            let cpuDiv = document.createElement("div");
            cpuDiv.textContent = `CPU: ${data.cpuUsage} %`;
            outputDiv.appendChild(cpuDiv);

            let memoryDiv = document.createElement("div");
            memoryDiv.textContent = `RAM: ${data.memoryUsage} MB`;
            outputDiv.appendChild(memoryDiv);

        })
        .catch(error => console.error("Error:", error));
}

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
    let A = createMatrix(size);
    let B = createMatrix(size);
    let C = new Array(size).fill(0).map(() => new Array(size).fill(0));

    let start = performance.now();
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let sum = 0;
            for (let k = 0; k < size; k++) {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }
    let end = performance.now();

    // ET (Execution Time)

    let resultTime = Number((end - start).toFixed(2));
    let result = `ET: ${resultTime} ms`;
    let resultDiv = document.createElement("div");
    resultDiv.textContent = result;
    document.getElementById("javascript-output").appendChild(resultDiv);
}

function runJSBenchmark() {
    clearCell("javascript-output");
    document.getElementById("javascript-output").textContent = ""
    multiplyMatrices(300);

    let memoryDiv = document.createElement("div");
    memoryDiv.textContent = getMemoryUsageJS();
    document.getElementById("javascript-output").appendChild(memoryDiv);
}

function getMemoryUsageJS() {
    // RAM
    if (performance.memory) {
        let memoryUsed = performance.memory.usedJSHeapSize / (1024 * 1024);
        return `RAM: ${memoryUsed.toFixed(2)} MB`;
    } else {
        return `RAM unsopported measurement in this browser.`;
    }
}