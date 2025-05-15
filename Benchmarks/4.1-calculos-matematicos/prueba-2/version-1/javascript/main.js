function runNodeBenchmark() {
    clearCell("nodeJs-output");
    fetch("http://localhost:3000/")
        .then(response => response.json())
        .then(data => {
            let outputDiv = document.getElementById("nodeJs-output");

            let timeDiv = document.createElement("div");
            timeDiv.textContent = `ET: ${data.executionTime} ms`;
            outputDiv.appendChild(timeDiv);

            let cpuDiv = document.createElement("div");
            cpuDiv.textContent = `CPU: ${data.cpuUsage} %`;
            outputDiv.appendChild(cpuDiv);

            let memoryDiv = document.createElement("div");
            memoryDiv.textContent = `RAM: ${data.memoryUsage} MB`;
            outputDiv.appendChild(memoryDiv);

        })
        .catch(error => console.error("Error:", error));
}

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
    let end = performance.now();

    let resultTime = Number((end - start).toFixed(2));
    let result = `ET: ${resultTime} ms`;
    let resultDiv = document.createElement("div");
    resultDiv.textContent = result;
    document.getElementById("javascript-output").appendChild(resultDiv);
}

function runJSBenchmark() {
    clearCell("javascript-output");
    document.getElementById("javascript-output").textContent = ""
    primes_to_n(1_000_000);
    let memoryDiv = document.createElement("div");
    memoryDiv.textContent = getMemoryUsageJS();
    document.getElementById("javascript-output").appendChild(memoryDiv);
}

function getMemoryUsageJS() {

    if (performance.memory) {
        let memoryUsed = performance.memory.usedJSHeapSize / (1024 * 1024);
        return `RAM: ${memoryUsed.toFixed(2)} MB`;
    } else {
        return `RAM unsopported measurement in this browser.`;
    }
}