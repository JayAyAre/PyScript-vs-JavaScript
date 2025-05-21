let workers = [];
let workersReady = false;

function initializeWorkers() {
    return new Promise((resolve) => {
        const numWorkers =
            parseInt(
                document.getElementById("parallel-workers-javascript").value
            ) || 1;

        if (workers.length > numWorkers) {
            workers = workers.slice(0, numWorkers);
            workersReady = true;
            resolve();
            return;
        }

        const additionalWorkers = numWorkers - workers.length;
        let initialized = 0;

        for (let i = 0; i < additionalWorkers; i++) {
            const worker = new Worker(window.location.origin + window.document.body.dataset.jsPath + "worker.js");

            worker.onmessage = (event) => {
                const { id, results } = event.data;
                if (pendingPromises.has(id)) {
                    pendingPromises.get(id)(results);
                    pendingPromises.delete(id);
                }
            };

            workers.push(worker);
            initialized++;

            if (initialized === additionalWorkers) {
                workersReady = true;
                resolve();
            }
        }

        if (additionalWorkers === 0) {
            workersReady = true;
            resolve();
        }
    });
}
const pendingPromises = new Map();

async function runJsBenchmark(event) {
    try {
        window.clearCell("javascript-output");
        const numExecutions =
            parseInt(
                document.getElementById("num-executions-javascript").value
            ) || 1;
        const numWorkers =
            parseInt(
                document.getElementById("parallel-workers-javascript").value
            ) || 1;

        await initializeWorkers();

        const simulationStartTime = performance.now();
        const promises = [];

        for (let i = 0; i < numExecutions; i++) {
            const worker = workers[i % numWorkers];
            const id = `${i}-${Date.now()}`;

            promises.push(
                new Promise((resolve) => {
                    pendingPromises.set(id, resolve);
                    worker.postMessage({ id, size: 10_000_000 });
                })
            );
        }

        const resultsArray = await Promise.all(promises);
        let accumulated = {
            create: { time: 0, memory: 0 },
            sum: { time: 0, memory: 0 },
            mean: { time: 0, memory: 0 },
            std: { time: 0, memory: 0 },
            total_per_execution: 0,
        };

        resultsArray.forEach((result) => {
            ["create", "sum", "mean", "std"].forEach((op) => {
                accumulated[op].time += result[op].time;
                accumulated[op].memory += result[op].memory;
            });
            accumulated.total_per_execution += result.total.time;
        });

        const results = {};
        ["create", "sum", "mean", "std"].forEach((op) => {
            results[op] = {
                time: accumulated[op].time / numExecutions,
                memory: accumulated[op].memory / numExecutions,
            };
        });

        results.total = {
            average_per_execution:
                accumulated.total_per_execution / numExecutions,
            total_time: performance.now() - simulationStartTime,
        };

        displayResults(results);
    } catch (error) {
        console.error("Worker error:", error);
    }
}

function displayResults(results) {
    const output = document.getElementById("javascript-output");

    for (const [op, data] of Object.entries(results)) {
        if (op !== 'total') {
            const div = document.createElement("div");
            div.textContent =
                `${op.toUpperCase()} - Time: ${data.time.toFixed(2)} ms | RAM: ${data.memory.toFixed(2)} MB`;
            output.appendChild(div);
        }
    }

    const avgTimeDiv = document.createElement("div");
    avgTimeDiv.textContent =
        `Avg request time: ${results.total.average_per_execution.toFixed(2)} ms`;
    output.appendChild(avgTimeDiv);

    const timeTotalDiv = document.createElement("div");
    timeTotalDiv.textContent =
        `Total ET: ${results.total.total_time.toFixed(2)} ms`;
    output.appendChild(timeTotalDiv);
}


window.runJsBenchmark = async function () {
    window.clearCell("javascript-output");
    window.showExecutionLoader();

    await new Promise(requestAnimationFrame);

    try {
        await runJsBenchmark();
    } finally {
        window.hideExecutionLoader();
    }
};