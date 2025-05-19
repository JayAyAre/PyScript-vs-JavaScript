function is_prime(size) {
    if (size < 2) {
        return false;
    }
    if ([2, 3].includes(size)) {
        return true;
    }
    if (size % 2 == 0 || size % 3 == 0) {
        return false;
    }
    for (let k = 5; k < Math.sqrt(size) + 1; k += 2) {
        if (size % k == 0) {
            return false;
        }
    }
    return true;
}

function primes_to_n(size) {
    let start = performance.now();

    let primes = [];

    if (size > 2) {
        primes.push(2);
    }

    for (let i = 3; i < size; i += 2) {
        if (is_prime(i)) {
            primes.push(i);
        }
    }

    const executionTime = performance.now() - start;

    const results = {
        execution_time: executionTime,
        memory_usage: getMemoryUsageJS(),
    };

    displayResults(results);
}

function getMemoryUsageJS() {
    if (performance.memory) {
        return performance.memory.usedJSHeapSize / (1024 * 1024);
    }
    return -1;
}

function displayResults(results) {
    const output = document.getElementById("javascript-output");

    const timeDiv = document.createElement("div");
    timeDiv.textContent = `ET: ${results.execution_time.toFixed(2)} ms`;
    output.appendChild(timeDiv);

    const memoryDiv = document.createElement("div");
    if (results.memory_usage !== -1) {
        memoryDiv.textContent = `RAM: ${results.memory_usage.toFixed(2)} MB`;
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
            document.getElementById("javascript-output").textContent = ""
            primes_to_n(1_000_000);
            window.hideExecutionLoader();
        }, 0);
    });

}