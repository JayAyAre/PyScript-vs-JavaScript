let worker = null;
const pendingPromises = new Map();

function initializeWorker() {
    return new Promise((resolve) => {
        if (worker) {
            resolve();
            return;
        }
        worker = new Worker(window.location.origin + window.document.body.dataset.jsPath + "worker.js");
        worker.onmessage = (event) => {
            const { id, results } = event.data;
            if (pendingPromises.has(id)) {
                pendingPromises.get(id)(results);
                pendingPromises.delete(id);
            }
        };
        resolve();
    });
}


async function measureMemoryUsage(duration = 500, interval = 50) {
    const memoryUsages = [];
    const start = performance.now();
    return new Promise((resolve) => {
        const timer = setInterval(() => {
            if (performance.memory) {
                memoryUsages.push(performance.memory.usedJSHeapSize);
            }
            if (performance.now() - start >= duration) {
                clearInterval(timer);
                const maxUsage = Math.max(...memoryUsages);
                resolve(maxUsage / (1024 * 1024));
            }
        }, interval);
    });
}

async function _runJSBenchmark() {
    try {
        const startWorkerTime = performance.now();

        if (!worker) {
            await initializeWorker();
        }

        const numExecutions = parseInt(
            document.getElementById("num-executions-javascript").value
        ) || 1;

        const workerTime = performance.now() - startWorkerTime;

        window.clearCell("javascript");

        const results = [];
        const times = [];

        let startTotalTime = performance.now();

        for (let i = 0; i < numExecutions; i++) {
            const id = `graph-${Date.now()}-${i}`;

            const result = await new Promise((resolve) => {
                pendingPromises.set(id, resolve);
                worker.postMessage({ id, size: 100_000, draw: true });
            });
            results.push(result);
        }

        const totalTime = performance.now() - startTotalTime;

        const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const avgDataGen = avg(results.map(r => r.data_gen_time));
        const avgRender = avg(results.map(r => r.render_time));
        const avgMemory = avg(results.map(r => r.memory));
        const avgElapsed = avg(results.map(r => r.total_time));

        const outputContainer = document.getElementById("javascript-output");
        if (outputContainer) {
            outputContainer.innerHTML = "";

            const metrics = [
                `Av. Worker Time: ${workerTime.toFixed(2)} ms`,
                `Av. Data Generation: ${avgDataGen.toFixed(2)} ms`,
                `Av. Rendering: ${avgRender.toFixed(2)} ms`,
                `Av. Memory: ${avgMemory.toFixed(2)} MB`,
                `Av. Execution Time: ${avgElapsed.toFixed(2)} ms`,
            ];

            metrics.forEach((text) => {
                const div = document.createElement("div");
                div.textContent = text;
                outputContainer.appendChild(div);
            });

            const totalDiv = document.createElement("div");
            totalDiv.textContent = `TOTAL TIME: ${totalTime.toFixed(2)} ms`;
            outputContainer.appendChild(totalDiv);
        }

        const lastResult = results[results.length - 1];
        if (lastResult.image_base64) {
            window.displayPlot(lastResult.image_base64, "javascript-output");
        }

        window.hideExecutionLoader();
    } catch (error) {
        console.error("Worker error:", error);
    }
}


window.runJsBenchmark = async function () {
    clearCell("javascript-output");
    window.showExecutionLoader();

    await new Promise(requestAnimationFrame);

    try {
        await _runJSBenchmark();
    } finally {
        window.hideExecutionLoader();
    }
};