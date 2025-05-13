let worker = null;
const pendingPromises = new Map();

async function initializeWorker() {
    if (worker) return;
    worker = new Worker(
        window.location.origin +
        window.document.body.dataset.jsPath +
        "worker.js"
    );
    worker.onmessage = (e) => {
        const { id, type, payload } = e.data;
        if (type === "ready") {
            return;
        }
        if (pendingPromises.has(id)) {
            if (type === "result") {
                pendingPromises.get(id)(payload);
            } else if (type === "error") {
                pendingPromises.get(id)(Promise.reject(new Error(payload)));
            }
            pendingPromises.delete(id);
        }
    };
    worker.onerror = (err) => {
        displayError(err);
    };

    await new Promise((resolve, reject) => {
        const onReady = (e) => {
            if (e.data.type === "ready") {
                resolve();
            } else if (e.data.type === "error") {
                reject(new Error(e.data.payload));
            }
        };
        worker.addEventListener("message", onReady, { once: true });
    });
}

function updateUI(metrics) {
    const out = document.getElementById("javascript-output");
    out.innerHTML += `
    <div>Worker Time: ${metrics.workerTime.toFixed(2)} ms</div>
    <div>Generación datos: ${metrics.dataGenTime.toFixed(2)} ms</div>
    <div>Renderizado: ${metrics.renderTime.toFixed(2)} ms</div>
    <div>Memory DS: ${metrics.mem} MB</div>
    <div>Memory by library: 2,6MB + 1.4MB</div>
    <div>TOTAL: ${metrics.totalTime.toFixed(2)} ms</div>
  `;
}

function displayError(error) {
    document.getElementById(
        "javascript-output"
    ).innerHTML = `<div class="error">Error: ${error.message || error}</div>`;
}

async function _runJSBenchmark() {
    try {
        clearCell("javascript-output");
        window.showExecutionLoader();

        const startWorkerTime = performance.now();
        await initializeWorker();
        const workerTime = performance.now() - startWorkerTime;

        const numSeries = parseInt(
            document.getElementById("num-series-javascript").value,
            10
        );
        const numPoints = parseInt(
            document.getElementById("num-points-javascript").value,
            10
        );

        const resultPromise = new Promise((resolve, reject) => {
            const id = `bench-${Date.now()}-${Math.random()}`;
            pendingPromises.set(id, (res) => {
                res.metrics.workerTime = workerTime;
                resolve(res);
            });
            worker.postMessage({
                id,
                type: "runBenchmark",
                payload: { numSeries, numPoints },
            });
        });

        const { metrics, graphData } = await resultPromise;
        const graphDataJSON = JSON.stringify({
            data: graphData.traces.map(trace => ({
                ...trace,
                x: Array.from(trace.x),
                y: Array.from(trace.y),
            })),
            layout: graphData.layout
        });

        // window.Plotly.newPlot("javascript-output", graphDataJSON.data, graphDataJSON.layout);
        window.displayPlotFromJSON(graphDataJSON, 'javascript-output');
        updateUI(metrics);
        window.startFPSMeasurement(3000, "javascript-output")

    } catch (err) {
        displayError(err);
    } finally {
        window.hideExecutionLoader();
    }
}

window.runJSBenchmark = _runJSBenchmark;
