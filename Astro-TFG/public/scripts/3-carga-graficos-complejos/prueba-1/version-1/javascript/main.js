let worker = null;
let workerTime = 0;

function initializeWorker() {
    if (!worker) {
        worker = new Worker(new URL("worker.js", import.meta.url), {
            type: "module",
        });
    }
}

async function _runJSBenchmark() {
    try {
        window.clearCell("javascript-output");

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
    window.hideExecutionLoader();
    window.displayPlot(r.image_base64, "javascript-output");

}


window.runJsBenchmark = async function () {
    window.clearCell("javascript-output");
    window.showExecutionLoader();

    await new Promise(requestAnimationFrame);

    try {
        await _runJSBenchmark();
    } finally {
        window.hideExecutionLoader();
    }
};