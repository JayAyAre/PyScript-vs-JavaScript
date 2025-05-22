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

function getMemoryUsageJS() {
    if (performance.memory) {
        return Math.max(performance.memory.usedJSHeapSize / (1024 * 1024), 0);
    }
    return -1;
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

    const results = {
        total_time: totalExecTime,
        execution_time: avgTime,
        memory_usage: avgMemory
    };

    displayResults(results);
}

function displayResults(results) {
    const output = document.getElementById("javascript-output");

    const timeTotalDiv = document.createElement("div");
    timeTotalDiv.textContent = `Total ET (10x): ${results.total_time.toFixed(2)} ms`;
    output.appendChild(timeTotalDiv);

    const timeDiv = document.createElement("div");
    timeDiv.textContent = `ET (avg, 10x): ${results.execution_time.toFixed(2)} ms`;
    output.appendChild(timeDiv);

    const memoryDiv = document.createElement("div");
    if (results.memory_usage !== -1) {
        memoryDiv.textContent = `RAM (avg, 10x): ${results.memory_usage.toFixed(2)} MB`;
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
            n_digits_pi(10, 10_000);
            window.hideExecutionLoader();
        }, 0);
    });

}