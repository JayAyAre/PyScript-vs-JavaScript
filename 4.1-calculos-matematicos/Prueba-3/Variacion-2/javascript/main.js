function calculatePiGaussLegendre(digits) {
    const precision = BigInt(digits + 5);
    let a = BigInt(1);
    let b = BigInt(Math.floor(Math.sqrt(2) * 10 ** digits));
    let t = BigInt(1) * BigInt(10 ** digits) / BigInt(4);
    let p = BigInt(1);
    let numIter = Math.floor(Math.log10(digits));

    for (let i = 0; i < numIter; i++) {
        let aNext = (a + b) / BigInt(2);
        b = BigInt(Math.floor(Math.sqrt(Number(a * b)) * 10 ** digits));
        t -= p * (a - aNext) * (a - aNext);
        a = aNext;
        p *= BigInt(2);
    }

    let pi = ((a + b) * (a + b)) / (BigInt(4) * t);
    return pi;
}

async function n_digits_pi(repetitions, digits) {
    let totalTime = 0;
    let totalMemory = 0;

    const startTotal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        const start = performance.now();

        const piValue = calculatePiGaussLegendre(digits);

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

    let timeDiv = document.createElement("div");
    timeDiv.textContent = `Total ET: ${totalExecTime} s`;
    outputDiv.appendChild(timeDiv);

    let avgTimeDiv = document.createElement("div");
    avgTimeDiv.textContent = `ET (avg, 10x): ${avgTime} ms`;
    outputDiv.appendChild(avgTimeDiv);

    let avgMemoryDiv = document.createElement("div");
    avgMemoryDiv.textContent = `RAM (avg, 10x): ${avgMemory} MB`;
    outputDiv.appendChild(avgMemoryDiv);
}

function runJSBenchmark() {
    clearCell("javascript-output");
    n_digits_pi(10, 100_000); // Ejecutar con 100,000 dígitos
}

function clearCell(elementId) {
    document.getElementById(elementId).innerHTML = "";
}
