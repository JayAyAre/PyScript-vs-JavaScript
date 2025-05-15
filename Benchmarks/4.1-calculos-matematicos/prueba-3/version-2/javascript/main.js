function runNodeBenchmark() {
    const outputDiv = document.getElementById("nodeJs-output");
    clearCell("nodeJs-output");
    fetch("http://localhost:3000/")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data || typeof data.avgExecutionTime === 'undefined') {
                throw new Error("Invalid server response");
            }

            outputDiv.innerHTML = '';

            const metrics = [
                { label: 'Total ET (10x)', value: data.totalExecutionTime, unit: 'ms' },
                { label: 'ET (avg, 10x)', value: data.avgExecutionTime, unit: 'ms' },
                { label: 'CPU (avg, 10x)', value: data.avgCPUUsage, unit: '%' },
                { label: 'RAM (avg, 10x)', value: data.avgMemoryUsage, unit: 'MB' }
            ];

            metrics.forEach(metric => {
                const div = document.createElement("div");
                div.textContent = `${metric.label}: ${metric.value} ${metric.unit}`;
                outputDiv.appendChild(div);
            });
        })
        .catch((error) => {
            console.error("Fetch error:", error);
        });
}

let highPrecisionMath;

function initHighPrecisionMath() {
    const mathLib = typeof math !== 'undefined' ? math : mathjs;
    const { create, all } = mathLib;

    highPrecisionMath = create(all, {
        number: 'BigNumber',
        precision: 10000
    });
}

function calculatePiGaussLegendre(digits) {
    initHighPrecisionMath()
    const math = highPrecisionMath;

    math.config({ precision: digits });

    const one = math.bignumber(1);
    const half = math.bignumber(0.5);
    const quarter = math.bignumber(0.25);
    const two = math.bignumber(2);

    let a = one;
    let b = math.sqrt(half);
    let t = quarter;
    let p = one;

    const numIter = Math.max(5, Math.floor(Math.log10(digits) * 1.4));

    for (let i = 0; i < numIter; i++) {
        const aNext = math.divide(math.add(a, b), two);
        b = math.sqrt(math.multiply(a, b));
        const diff = math.subtract(a, aNext);
        t = math.subtract(t, math.multiply(p, math.pow(diff, two)));
        a = aNext;
        p = math.multiply(p, two);
    }

    const pi = math.divide(math.pow(math.add(a, b), 2), math.multiply(4, t));
    return pi.toString();
}

async function n_digits_pi(repetitions, digits) {
    const outputDiv = document.getElementById("javascript-output");

    let totalTime = 0;
    let totalMemory = 0;
    const startTotal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        const start = performance.now();

        const piValue = calculatePiGaussLegendre(digits);

        const end = performance.now();
        const memoryUsage = performance.memory ?
            (performance.memory.usedJSHeapSize / (1024 * 1024)) : 0;

        totalTime += (end - start);
        totalMemory += memoryUsage;
    }

    const endTotal = performance.now();
    const totalExecTime = (endTotal - startTotal).toFixed(2);
    const avgTime = (totalTime / repetitions).toFixed(2);

    const avgMemory = (totalMemory / repetitions).toFixed(2);

    outputDiv.innerHTML = `
        <div>Total ET (10x): ${totalExecTime} ms</div>
        <div>ET (avg, 10x): ${avgTime} ms</div>
        <div>RAM (avg, 10x): ${avgMemory} MB</div>
    `;
}

function runJSBenchmark() {
    clearCell("javascript-output");
    n_digits_pi(10, 10_000);
}

function clearCell(elementId) {
    document.getElementById(elementId).innerHTML = "";
}
