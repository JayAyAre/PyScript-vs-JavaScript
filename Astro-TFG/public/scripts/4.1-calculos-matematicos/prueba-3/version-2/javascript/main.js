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

    // ET (Execution Time)

    const endTotal = performance.now();
    const totalExecTime = (endTotal - startTotal).toFixed(2);
    const avgTime = (totalTime / repetitions).toFixed(2);

    // RAM

    const avgMemory = (totalMemory / repetitions).toFixed(2);

    outputDiv.innerHTML = `
        <div>Total ET (10x): ${totalExecTime} ms</div>
        <div>ET (avg, 10x): ${avgTime} ms</div>
        <div>RAM (avg, 10x): ${avgMemory} MB</div>
    `;
}

window.runJSBenchmark = function () {
    clearCell("javascript-output");
    window.showExecutionLoader();

    requestAnimationFrame(() => {
        setTimeout(() => {
            n_digits_pi(10, 10_000);
            window.hideExecutionLoader();
        }, 0);
    });

}

function clearCell(elementId) {
    document.getElementById(elementId).innerHTML = "";
}
