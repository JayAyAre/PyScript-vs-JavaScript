function runNodeBenchmark() {
    clearCell("nodeJs-output");
    fetch("http://localhost:3000/")
        .then(response => response.json())
        .then(data => {
            let outputDiv = document.getElementById("nodeJs-output");

            Object.values(data).forEach((result) => {
                let titleDiv = document.createElement("div");
                titleDiv.textContent = `Matrix ${result.size}`;
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
    await C.data();
    let end = performance.now();

    let outputDiv = document.getElementById("javascript-output");

    let titleDiv = document.createElement("div");
    titleDiv.textContent = `Matriz ${size}x${size}`;
    titleDiv.style.fontWeight = "bold";
    outputDiv.appendChild(titleDiv);

    // ET (Execution Time)

    let timeDiv = document.createElement("div");
    timeDiv.textContent = `ET: ${Number((end - start).toFixed(2))} ms`;
    outputDiv.appendChild(timeDiv);

    // RAM

    let memoryDiv = document.createElement("div");
    memoryDiv.textContent = getMemoryUsageJS();
    outputDiv.appendChild(memoryDiv);
}

window.runJSBenchmark = async function () {
    clearCell("javascript-output");

    await multiplyMatrices(500);
    await multiplyMatrices(1000);
    await multiplyMatrices(2000);
}

function getMemoryUsageJS() {
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
