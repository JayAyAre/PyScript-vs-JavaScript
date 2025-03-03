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

async function multiplyMatrices(size) {

    let A = tf.randomNormal([size, size]);
    let B = tf.randomNormal([size, size]);

    let start = performance.now();

    let C = tf.matMul(A, B);

    await C.data();

    let end = performance.now();

    // ET (Execution Time)
    let resultTime = Number((end - start).toFixed(2));
    let result = `ET: ${resultTime} ms`;
    let resultDiv = document.createElement("div");
    resultDiv.textContent = result;
    document.getElementById("javascript-output").appendChild(resultDiv);
}

async function runJSBenchmark() {
    clearCell("javascript-output");
    document.getElementById("javascript-output").textContent = "";
    await multiplyMatrices(1000);

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
        return `RAM: Unsupported measurement in this browser.`;
    }
}

function clearCell(elementId) {
    document.getElementById(elementId).textContent = "";
}