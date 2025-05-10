async function multiplyMatrices(size) {
    let A = tf.randomNormal([size, size]);
    let B = tf.randomNormal([size, size]);

    let start = performance.now();
    let C = tf.matMul(A, B);
    await C.data();
    let end = performance.now();

    let outputDiv = document.getElementById("javascript-output");

    let titleDiv = document.createElement("div");
    titleDiv.textContent = `${size}x${size}`;
    outputDiv.appendChild(titleDiv);

    // ET (Execution Time)

    let timeDiv = document.createElement("div");
    timeDiv.textContent = `ET: ${Number((end - start).toFixed(2))} ms`;
    outputDiv.appendChild(timeDiv);

    // RAM

    let memoryDiv = document.createElement("div");
    memoryDiv.textContent = getMemoryUsageJS();
    outputDiv.appendChild(memoryDiv);

    let br = document.createElement("br");
    outputDiv.appendChild(br);
}

window.runJSBenchmark = async function () {
    clearCell("javascript-output");
    window.showExecutionLoader();

    await multiplyMatrices(500);
    await multiplyMatrices(1000);
    await multiplyMatrices(2000);

    window.hideExecutionLoader();
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
