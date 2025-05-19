function runNodeBenchmark() {
    clearCell("node-js-output");
    fetch("http://localhost:3000/")
        .then(response => response.json())
        .then(data => {
            let outputDiv = document.getElementById("node-js-output");

            Object.values(data).forEach((result) => {
                let titleDiv = document.createElement("div");
                titleDiv.textContent = `Matriz ${result.size}`;
                titleDiv.style.fontWeight = "bold";
                outputDiv.appendChild(titleDiv);

                let timeDiv = document.createElement("div");
                timeDiv.textContent = `ET: ${result.executionTime} ms`;
                outputDiv.appendChild(timeDiv);

                let cpuDiv = document.createElement("div");
                cpuDiv.textContent = `CPU: ${result.cpuUsage} %`;
                outputDiv.appendChild(cpuDiv);

                let memoryDiv = document.createElement("div");
                memoryDiv.textContent = `RAM: ${result.memoryUsage} MB`;
                outputDiv.appendChild(memoryDiv);

                outputDiv.appendChild(document.createElement("hr"));
            });
        })
        .catch(error => console.error("Error:", error));
}

async function multiplyMatrices(size) {
    let A = tf.randomNormal([size, size]);
    let B = tf.randomNormal([size, size]);

    let start = performance.now();

    let C = tf.matMul(A, B);

    const executionTime = performance.now() - start;

    const results = {
        size: `${size}x${size}`,
        execution_time: executionTime,
        memory_usage: getMemoryUsageJS(),
    };

    displayResults(results);
}

function getMemoryUsageJS() {
    if (performance.memory) {
        return performance.memory.usedJSHeapSize / (1024 * 1024);
    }
    return -1;
}

function displayResults(results) {
    const output = document.getElementById("javascript-output");

    const titleDiv = document.createElement("div");
    titleDiv.textContent = `Matriz ${results.size}`;
    titleDiv.style.fontWeight = "bold";
    output.appendChild(titleDiv);

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
    output.appendChild(document.createElement("hr"));
}

async function runJsBenchmark() {
    clearCell("javascript-output");
    await multiplyMatrices(500);
    await multiplyMatrices(1000);
    await multiplyMatrices(2000);
}