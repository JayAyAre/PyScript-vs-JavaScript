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

function benchmarkPrimesJS(repetitions, n) {
    let totalTime = 0;
    let totalMemory = 0;

    let startTotal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        let start = performance.now();
        let primes = sieveOfEratosthenes(n);
        let end = performance.now();
        totalTime += (end - start);

        if (performance.memory) {
            totalMemory += performance.memory.usedJSHeapSize / (1024 * 1024);
        }
    }

    // ET (Execution Time)

    let endTotal = performance.now();
    let totalExecTime = (endTotal - startTotal).toFixed(2);

    // RAM

    let avgTime = (totalTime / repetitions).toFixed(2);
    let avgMemory = (totalMemory / repetitions).toFixed(2);

    let outputDiv = document.getElementById("javascript-output");
    outputDiv.innerHTML = `
        <div>Total ET (1000x): ${totalExecTime} ms</div>
        <div>ET (avg, 1000x): ${avgTime} ms</div>
        <div>RAM (avg, 1000x): ${avgMemory} MB</div>
    `;
}

window.runJSBenchmark = async function () {
    document.getElementById("javascript-output").textContent = "";
    benchmarkPrimesJS(1000, 10_000);
}