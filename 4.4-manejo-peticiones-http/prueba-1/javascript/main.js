let worker = null;
const JAVASCRIPT_SERVER = "http://localhost:5002";

async function javascriptBenchmark() {
    try {
        window.clearCell("javascript");
        startJsTimer();

        const num_requests = parseInt(
            document.getElementById("num-requests-js").value,
            10
        );
        const delay = parseInt(
            document.getElementById("request-delay-js").value,
            10
        );

        const urls = Array.from(
            { length: num_requests },
            (_, i) => `${JAVASCRIPT_SERVER}/mock-api/${delay}`
        );

        let start_time_worker = performance.now();
        if (!worker) {
            worker = new Worker("javascript/worker.js");
        }
        let worker_time = performance.now() - start_time_worker;

        worker.onmessage = function (e) {
            const { total_time, avg_time, results } = e.data;
            updateResults(total_time, avg_time, worker_time, results);
            stopJsTimer();
        };

        const start_time = performance.now();

        worker.postMessage({ num_requests, delay, worker_time });
    } catch (e) {
        console.error(e);
    }
}

function updateResults(total_time, avg_time, worker_time, results) {
    const output = document.getElementById("javascript-output");

    let lastValueDisplay = "No valid data in the last response.";
    if (
        results &&
        results.length > 0 &&
        results[results.length - 1] &&
        results[results.length - 1].data
    ) {
        const last_value = results[results.length - 1].data[9].value;
        lastValueDisplay = `Last Value: ${last_value.toFixed(6)}`;
    }

    output.innerHTML = `
        <div>Worker Time: ${worker_time.toFixed(2)} ms</div>
        <div>Avg Request Time: ${avg_time.toFixed(2)} ms</div>
        <div>Total Time: ${total_time.toFixed(2)} ms</div>
        <div>Total Finished Requests: ${results.length}</div>
        <div>${lastValueDisplay}</div>
    `;
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
