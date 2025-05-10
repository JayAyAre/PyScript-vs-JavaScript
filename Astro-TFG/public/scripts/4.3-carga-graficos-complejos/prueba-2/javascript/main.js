let worker = null;
let workerStartTime;

async function runJSBenchmark() {
    try {
        startJsTimer();
        const startWorkerTime = performance.now();

        if (!worker) {
            worker = new Worker("javascript/worker.js");
            await setupWorker();
        }

        const workerTime = performance.now() - startWorkerTime;

        clearUI();

        const numSeries = parseInt(
            document.getElementById("num-series-js").value
        );
        const numPoints = parseInt(
            document.getElementById("num-points-js").value
        );

        worker.onmessage = (e) => {
            if (e.data.type === "result") {
                const result = e.data.payload;
                result.metrics.workerTime = workerTime;
                handleWorkerResult(result);
                stopJsTimer();
            } else if (e.data.type === "error") {
                displayError(new Error(e.data.payload));
                stopJsTimer();
            }
        };

        worker.postMessage({
            type: "runBenchmark",
            payload: {
                numSeries: numSeries,
                numPoints: numPoints,
            },
        });
        stopJsTimer();
    } catch (e) {
        displayError(e);
    }
}

function setupWorker() {
    return new Promise((resolve) => {
        worker.onmessage = (e) => {
            if (e.data.type === "ready") {
                resolve();
            } else if (e.data.type === "result") {
                handleWorkerResult(e.data.payload);
            } else if (e.data.type === "error") {
                displayError(new Error(e.data.payload));
            }
        };

        worker.onerror = (error) => {
            displayError(error);
        };
    });
}

function handleWorkerResult({ metrics, graphData }) {
    Plotly.newPlot(
        "graph-container-js",
        graphData.traces,
        graphData.layout
    ).then(() => {
        attachRelayoutListener("graph-container-js", "javascript-output");
    });
    updateUI(metrics);
    performance.measureMemory?.();
}

function clearUI() {
    document.getElementById("javascript-output").innerHTML = "";
    document.getElementById("javascript-exact").innerHTML = "";
    Plotly.purge("graph-container-js");
}

function updateUI(metrics) {
    const output = document.getElementById("javascript-output");
    const exact = document.getElementById("javascript-exact");
    output.innerHTML = `
        <div>Worker Time: ${metrics.workerTime.toFixed(2)} ms</div>
        <div>Generación datos: ${metrics.dataGenTime.toFixed(2)} ms</div>
        <div>Renderizado: ${metrics.renderTime.toFixed(2)} ms</div>
        <div>Memory DS: ${metrics.mem} MB</div>
        <div>Memory by library: 2,6MB + 1.4MB</div>
    `;

    exact.innerHTML = `<div>TOTAL: ${metrics.totalTime.toFixed(2)} ms</div>`;
}

function displayError(error) {
    document.getElementById(
        "javascript-output"
    ).innerHTML = `<div class="error">Error: ${error.message}</div>`;
}
let jsTimer = null;
let jsStartTime = 0;

function startJsTimer() {
    jsStartTime = performance.now();
    const timerElement = document.getElementById("js-timer-display");

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
        "js-timer-display"
    ).textContent = `JS Timer: ${elapsed} s`;
}
