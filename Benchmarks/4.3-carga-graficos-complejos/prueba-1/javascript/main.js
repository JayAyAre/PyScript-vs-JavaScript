let worker = null;
const pendingPromises = new Map();

function initializeWorker() {
    return new Promise((resolve) => {
        if (worker) {
            resolve();
            return;
        }
        worker = new Worker("./javascript/worker.js");
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

async function runJSBenchmark() {
    try {
        startJsTimer();

        const startWorkerTime = performance.now();
        if (!worker) {
            await initializeWorker();
        }
        const workerTime = performance.now() - startWorkerTime;

        clearCell("javascript");
        clearGraphContainer("graph-container-js");

        const numExecutions = parseInt(
            document.getElementById("num-executions-javascript").value
        ) || 1;

        const results = [];
        const times = [];
        let startTotalTime = performance.now();

        for (let i = 0; i < numExecutions; i++) {
            const id = `graph-${Date.now()}-${i}`;

            const result = await new Promise((resolve) => {
                pendingPromises.set(id, resolve);
                worker.postMessage({ id, size: 100_000, draw: true });
            });

            const measuredMemory = await measureMemoryUsage(500, 50);
            result.memory = measuredMemory;

            results.push(result);
        }

        stopJsTimer();

        const lastResult = results[results.length - 1];
        if (lastResult.image_base64) {
            displayPlotJs(lastResult.image_base64);
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

            const exactContainer = document.getElementById("javascript-exact");
            exactContainer.innerHTML = "";
            const totalDiv = document.createElement("div");
            totalDiv.textContent = `TOTAL TIME: ${totalTime.toFixed(2)} ms`;
            exactContainer.appendChild(totalDiv);
        }
    } catch (error) {
        console.error("Worker error:", error);
    }
}

let jsTimerInterval = null;
let jsStartTime = 0;

function startJsTimer() {
    jsStartTime = performance.now();
    const timerElement = document.getElementById("js-timer-display");
    clearInterval(jsTimerInterval);
    jsTimerInterval = setInterval(() => {
        const elapsed = (performance.now() - jsStartTime) / 1000;
        timerElement.textContent = `JS Timer: ${elapsed.toFixed(4)} s`;
    }, 100);
}

function stopJsTimer() {
    clearInterval(jsTimerInterval);
    jsTimerInterval = null;
}

function displayPlotJs(base64Data) {
    const img = document.createElement("img");
    img.src = `data:image/png;base64,${base64Data}`;
    img.style.maxWidth = "100%";
    document.getElementById("graph-container-js").appendChild(img);
}
