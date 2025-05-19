function calculatePi(digits) {
    let pi = 0.0;
    for (let k = 0; k < digits; k++) {
        pi += (1 / Math.pow(16, k)) * (
            (4 / (8 * k + 1)) -
            (2 / (8 * k + 4)) -
            (1 / (8 * k + 5)) -
            (1 / (8 * k + 6))
        );
    }
    return pi;
}


function n_digits_pi(repetitions, digits) {
    let totalTime = 0;
    let totalMemory = 0;

    const startTotal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        const start = performance.now();

        const piValue = calculatePi(digits);

        const end = performance.now();
        const memoryUsage = getMemoryUsageJS();

        totalTime += (end - start);
        totalMemory += memoryUsage;
    }

    const endTotal = performance.now();
    const totalExecTime = (endTotal - startTotal);

    const avgTime = Number((totalTime / repetitions));
    const avgMemory = Number((totalMemory / repetitions));

    displayResults({
        total_time: totalExecTime,
        execution_time: avgTime,
        memory_usage: avgMemory
    });
}

function getMemoryUsageJS() {
    if (performance.memory) {
        return performance.memory.usedJSHeapSize / (1024 * 1024);
    }
    return -1;
}

function displayResults(results) {
    const output = document.getElementById("javascript-output");

    const timeTotalDiv = document.createElement("div");
    timeTotalDiv.textContent = `Total ET (1000x): ${results.total_time.toFixed(2)} ms`;
    output.appendChild(timeTotalDiv);

    const timeDiv = document.createElement("div");
    timeDiv.textContent = `ET (avg, 1000x): ${results.execution_time.toFixed(2)} ms`;
    output.appendChild(timeDiv);

    const memoryDiv = document.createElement("div");
    if (results.memory_usage !== -1) {
        memoryDiv.textContent = `RAM (avg, 1000x): ${results.memory_usage.toFixed(2)} MB`;
    } else {
        memoryDiv.textContent = `RAM unsupported measurement in this browser.`;
    }
    output.appendChild(memoryDiv);
}

window.runJsBenchmark = function () {
    window.clearCell("javascript-output");
    window.showExecutionLoader();
    requestAnimationFrame(() => {
        setTimeout(() => {
            n_digits_pi(1_000, 1_000);
            window.hideExecutionLoader();
        }, 0);
    });
}