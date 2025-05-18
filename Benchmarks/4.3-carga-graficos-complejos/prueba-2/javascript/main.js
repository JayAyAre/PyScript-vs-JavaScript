let worker = null;
let jsTimer = null;
let jsStartTime = 0;
let workerTime = 0;

function initializeWorker() {
    if (!worker) {
        worker = new Worker(new URL("worker.js", import.meta.url), {
            type: "module",
        });
    }
}

function startJsTimer() {
    jsStartTime = performance.now();
    const timerElement = document.getElementById("javascript-timer-display");

    function updateTimer() {
        if (!jsTimer) return;

        const elapsedMs = performance.now() - jsStartTime;
        const elapsed = (elapsedMs / 1000).toFixed(3);
        timerElement.textContent = `JS Timer: ${elapsed} s`;

        jsTimer = requestAnimationFrame(updateTimer);
    }

    cancelAnimationFrame(jsTimer);
    jsTimer = requestAnimationFrame(updateTimer);
}

function stopJsTimer() {
    cancelAnimationFrame(jsTimer);
    jsTimer = null;

    const elapsedMs = performance.now() - jsStartTime;
    const elapsed = (elapsedMs / 1000).toFixed(3);
    document.getElementById(
        "javascript-timer-display"
    ).textContent = `JS Timer: ${elapsed} s`;
}

async function runJsBenchmark() {
    try {
        window.clearCell("javascript-output");
        window.clearGraphContainer("graph-container-javascript");
        startJsTimer();

        let start_time_worker = performance.now();
        initializeWorker();
        workerTime = performance.now() - start_time_worker;

        const num_points = parseInt(
            document.getElementById("num-points-javascript").value,
            10
        );

        const num_series = parseInt(
            document.getElementById("num-series-javascript").value,
            10
        );

        const id = `js-${Date.now()}`;

        const resultJson = await new Promise((resolve, reject) => {
            function onMessage(e) {
                if (e.data.id !== id) return;
                worker.removeEventListener("message", onMessage);
                if (e.data.error) {
                    reject(new Error(e.data.error));
                } else if (e.data.json !== undefined) {
                    resolve(e.data.json);
                } else {
                    reject(new Error("Worker dont return results"));
                }
            }
            worker.addEventListener("message", onMessage);
            worker.postMessage({
                id,
                type: "do_analisis",
                num_points: num_points,
                num_series: num_series,
            });
        });

        const result = JSON.parse(resultJson);
        displayResult(result);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        stopJsTimer();
    }
}

function handleWorkerResult({ metrics, graphData }) {
    Plotly.newPlot(
        "graph-container-javascript",
        graphData.traces,
        graphData.layout
    ).then(() => {
        attachRelayoutListener("graph-container-javascript", "javascript-output");
    });
    updateUI(metrics);
    performance.measureMemory?.();
}

function createDiv() {
    const div = document.createElement("div");
    return div;
}

function displayResult(r) {
    const output = document.getElementById("javascript-output");

    const workerDiv = createDiv();
    workerDiv.textContent = `Worker init time: ${workerTime.toFixed(2)} ms`;
    output.appendChild(workerDiv);

    const avgDataGenDiv = createDiv();
    avgDataGenDiv.textContent = `Data generation: ${r.data_gen_time.toFixed(2)} ms`;
    output.appendChild(avgDataGenDiv);

    const avgRenderDiv = createDiv();
    avgRenderDiv.textContent = `Rendering: ${r.render_time.toFixed(2)} ms`;
    output.appendChild(avgRenderDiv);

    const memoryDiv = createDiv();
    memoryDiv.textContent = `Memory: ${r.memory.toFixed(2)} MB`;
    output.appendChild(memoryDiv);

    const totalTimeDiv = createDiv();
    totalTimeDiv.textContent = `Total ET: ${r.total_time_ms.toFixed(2)} ms`;
    output.appendChild(totalTimeDiv);

    const graphDiv = document.getElementById("graph-container-javascript");
    graphDiv.innerHTML = "";
    Plotly.newPlot(graphDiv, r.traces, r.layout);
}

window.runJsBenchmark = runJsBenchmark;