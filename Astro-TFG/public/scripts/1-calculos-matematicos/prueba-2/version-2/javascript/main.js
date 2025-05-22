function sieveOfEratosthenes(n) {
    let primes = new Uint8Array(n + 1).fill(1);
    primes[0] = primes[1] = 0;

    for (let i = 2; i * i <= n; i++) {
        if (primes[i]) {
            for (let j = i * i; j <= n; j += i) {
                primes[j] = 0;
            }
        }
    }

    return primes.reduce((acc, val, idx) => val ? [...acc, idx] : acc, []);
}

function getMemoryUsageJS() {
    if (performance.memory) {
        return Math.abs(performance.memory.usedJSHeapSize / (1024 * 1024), 0);
    }
    return -1;
}


function benchmarkPrimesJS(repetitions, n) {
    let totalTime = 0;
    let totalMemory = 0;

    let startTotal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        let start = performance.now();
        let primes = sieveOfEratosthenes(n);
        let end = performance.now();

        totalTime += (end - start);
        totalMemory += getMemoryUsageJS();
    }

    const executionTime = performance.now() - startTotal;

    let avgTime = (totalTime / repetitions);
    let avgMemory = (totalMemory / repetitions);

    const results = {
        total_time: executionTime,
        execution_time: avgTime,
        memory_usage: avgMemory,
    };

    displayResults(results);
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
            benchmarkPrimesJS(1_000, 10_000);
            window.hideExecutionLoader();
        }, 0);
    });
}