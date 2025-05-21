async function multiplyMatrices(size) {
    let A = tf.randomUniform([size, size], 0.0, 1.0);
    let B = tf.randomUniform([size, size], 0.0, 1.0);

    const start = performance.now();

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
        return Math.max(performance.memory.usedJSHeapSize / (1024 * 1024), 0);
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
        memoryDiv.textContent = `RAM measurement unsupported in this browser.`;
    }
    output.appendChild(memoryDiv);
    output.appendChild(document.createElement("br"));
    output.appendChild(document.createElement("hr"));
    output.appendChild(document.createElement("br"));
}

window.runJsBenchmark = async function () {
    window.clearCell("javascript-output");
    window.showExecutionLoader();

    requestAnimationFrame(() => {
        setTimeout(async () => {
            await multiplyMatrices(500);
            await multiplyMatrices(1000);
            await multiplyMatrices(2000);

            window.hideExecutionLoader();
        }, 0);
    });
};