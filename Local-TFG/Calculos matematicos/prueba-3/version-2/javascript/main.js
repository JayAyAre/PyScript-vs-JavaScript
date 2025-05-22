function runNodeBenchmark() {
    window.clearCell("node-js-output");
    let outputDiv = document.getElementById("node-js-output");
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

            metrics.forEach((metric) => {
                const div = document.createElement('div');
                div.innerHTML = `${metric.label}: ${metric.value} ${metric.unit}`;
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
    let totalTime = 0;
    let totalMemory = 0;
    const startTotal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        const start = performance.now();

        const piValue = calculatePiGaussLegendre(digits);

        const end = performance.now();
        totalTime += (end - start);
        totalMemory += getMemoryUsageJS();
    }

    const endTotal = performance.now();
    const totalExecTime = (endTotal - startTotal);

    const avgTime = Number((totalTime / repetitions));
    const avgMemory = Number((totalMemory / repetitions));

    displayResults({
        total_time: totalExecTime.toFixed(2),
        execution_time: avgTime.toFixed(2),
        memory_usage: avgMemory.toFixed(2)
    });

}


function getMemoryUsageJS() {
    if (performance.memory) {
        return Math.max(performance.memory.usedJSHeapSize / (1024 * 1024), 0);
    }
    return -1;
}


function displayResults(results) {
    const output = document.getElementById("javascript-output");

    const timeTotalDiv = document.createElement("div");
    timeTotalDiv.textContent = `Total ET (10x): ${results.total_time} ms`;
    output.appendChild(timeTotalDiv);

    const timeDiv = document.createElement("div");
    timeDiv.textContent = `ET (avg, 10x): ${results.execution_time} ms`;
    output.appendChild(timeDiv);

    const memoryDiv = document.createElement("div");
    if (results.memory_usage !== -1) {
        memoryDiv.textContent = `RAM (avg, 10x): ${results.memory_usage} MB`;
    } else {
        memoryDiv.textContent = `RAM unsupported measurement in this browser.`;
    }
    output.appendChild(memoryDiv);
}

function runJsBenchmark() {
    window.clearCell("javascript-output");
    n_digits_pi(10, 10_000);
}
