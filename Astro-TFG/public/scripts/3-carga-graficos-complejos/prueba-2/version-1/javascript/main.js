let worker = null;
let workerTime = 0;

function initializeWorker() {
    if (!worker) {
        worker = new Worker(
            window.location.origin +
            window.document.body.dataset.jsPath +
            "worker.js"
        );
    }
}

async function _runJsBenchmark() {
    try {
        window.clearCell("javascript-output");
        window.showExecutionLoader();

        const start_time_worker = performance.now();
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
                }
                else if (e.data.payload !== undefined) {
                    const payload = {
                        metrics: e.data.payload.metrics,
                        data: e.data.payload.graphData.traces,
                        layout: e.data.payload.graphData.layout
                    };
                    resolve(JSON.stringify(payload));
                }
                else {
                    reject(new Error("Worker dont return results"));
                }
            }

            worker.addEventListener("message", onMessage);
            worker.postMessage({
                id,
                type: "do_analisis",
                num_points,
                num_series,
            });
        });

        const result = JSON.parse(resultJson);
        displayResult(result.metrics);

        window.displayPlotFromJSON(resultJson, 'javascript-output');
        window.startFPSMeasurement(3000, "javascript-output");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        window.hideExecutionLoader();
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
    avgDataGenDiv.textContent = `Data generation: ${r.dataGenTime.toFixed(2)} ms`;
    output.appendChild(avgDataGenDiv);

    const avgRenderDiv = createDiv();
    avgRenderDiv.textContent = `Rendering: ${r.renderTime.toFixed(2)} ms`;
    output.appendChild(avgRenderDiv);

    const memoryDiv = createDiv();
    memoryDiv.textContent = `Memory: ${r.mem.toFixed(2)} MB`;
    output.appendChild(memoryDiv);

    const totalTimeDiv = createDiv();
    totalTimeDiv.textContent = `Total ET: ${r.totalTime.toFixed(2)} ms`;
    output.appendChild(totalTimeDiv);
}

window.runJsBenchmark = _runJsBenchmark;
