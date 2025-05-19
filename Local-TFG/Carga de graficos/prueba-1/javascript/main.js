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

        const num_executions = parseInt(
            document.getElementById("num-executions-javascript").value
        ) || 1;

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
                size: 100_000,
                num_executions,
            });
        });

        const result = JSON.parse(resultJson);
        displayResult(result);
    } catch (error) {
        console.error("Worker error:", error);
    } finally {
        stopJsTimer();
    }
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
    avgDataGenDiv.textContent = `Avg Data generation: ${r.data_gen_time.toFixed(2)} ms`;
    output.appendChild(avgDataGenDiv);

    const avgRenderDiv = createDiv();
    avgRenderDiv.textContent = `Avg Rendering: ${r.render_time.toFixed(2)} ms`;
    output.appendChild(avgRenderDiv);

    const avgExecutionTimeDiv = createDiv();
    avgExecutionTimeDiv.textContent = `Avg execution time: ${r.average_time_ms.toFixed(2)} ms`;
    output.appendChild(avgExecutionTimeDiv);

    const totalTimeDiv = createDiv();
    totalTimeDiv.textContent = `Total ET: ${r.total_time_ms.toFixed(2)} ms`;
    output.appendChild(totalTimeDiv);

    window.displayPlot(r.image_base64, "graph-container-javascript");

}

window.runJsBenchmark = runJsBenchmark;