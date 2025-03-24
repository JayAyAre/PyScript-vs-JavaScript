function runNodeBenchmark() {
    clearCell("nodeJs-output");
    fetch("http://localhost:3000/")
        .then(response => response.json())
        .then(data => {
            let outputDiv = document.getElementById("nodeJs-output");

            let timeDiv = document.createElement("div");
            timeDiv.textContent = `Total ET (1000x): ${data.totalExecutionTime} ms`;
            outputDiv.appendChild(timeDiv);

            let avgTimeDiv = document.createElement("div");
            avgTimeDiv.textContent = `ET (avg, 1000x): ${data.avgExecutionTime} ms`;
            outputDiv.appendChild(avgTimeDiv);

            let cpuDiv = document.createElement("div");
            cpuDiv.textContent = `CPU (avg, 1000x): ${data.avgCPUUsage} %`;
            outputDiv.appendChild(cpuDiv);

            let memoryDiv = document.createElement("div");
            memoryDiv.textContent = `RAM (avg, 1000x): ${data.avgMemoryUsage} MB`;
            outputDiv.appendChild(memoryDiv);
        })
        .catch(error => console.error("Error:", error));
}

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
        const memoryUsage = performance.memory ? (performance.memory.usedJSHeapSize / (1024 * 1024)) : 0;

        totalTime += (end - start);
        totalMemory += memoryUsage;
    }

    const endTotal = performance.now();
    const totalExecTime = ((endTotal - startTotal) / 1000).toFixed(2);

    const avgTime = Number((totalTime / repetitions).toFixed(2));
    const avgMemory = Number((totalMemory / repetitions).toFixed(2));

    const outputDiv = document.getElementById("javascript-output");

    // ET (Execution Time)

    let timeDiv = document.createElement("div");
    timeDiv.textContent = `Total ET: ${totalExecTime} s`;
    outputDiv.appendChild(timeDiv);

    let avgTimeDiv = document.createElement("div");
    avgTimeDiv.textContent = `ET (avg, 1000x): ${avgTime} ms`;
    outputDiv.appendChild(avgTimeDiv);

    // RAM

    let avgMemoryDiv = document.createElement("div");
    avgMemoryDiv.textContent = `RAM (avg, 1000x): ${avgMemory} MB`;
    outputDiv.appendChild(avgMemoryDiv);
}

function runJSBenchmark() {
    clearCell("javascript-output");
    n_digits_pi(1_000, 1_000);
}

function clearCell(elementId) {
    document.getElementById(elementId).innerHTML = "";
}
