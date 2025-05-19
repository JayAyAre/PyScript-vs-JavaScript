let worker = null;
const WEBSOCKET_SERVER = "ws://localhost:5001";

let jsTimer = null;
let jsStartTime = 0;
let workerTime = 0;

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


function initializeWorker() {
    if (!worker) {
        worker = new Worker(new URL("worker.js", import.meta.url), {
            type: "module",
        });
    }
}

async function runJsBenchmark() {
    try {
        window.clearCell("javascript-output");
        startJsTimer();

        let start_time_worker = performance.now();
        initializeWorker();
        workerTime = performance.now() - start_time_worker;

        const num_requests = parseInt(
            document.getElementById("num-requests-javascript").value,
            10
        );
        const delay = parseInt(
            document.getElementById("request-delay-javascript").value,
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
                num_requests,
                delay,
            });
        });

        const result = JSON.parse(resultJson);
        displayResult(result);
    } catch (e) {
        console.error(e);
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

    const avgTimeDiv = createDiv();
    avgTimeDiv.textContent = `Avg request time: ${r.average_time_ms.toFixed(2)} ms`;
    output.appendChild(avgTimeDiv);

    const totalTimeDiv = createDiv();
    totalTimeDiv.textContent = `Total ET: ${r.total_time_ms.toFixed(2)} ms`;
    output.appendChild(totalTimeDiv);

    const requestsDiv = createDiv();
    requestsDiv.textContent = `Requests: ${r.total_requests}`;
    output.appendChild(requestsDiv);

    const lastValueDiv = createDiv();
    lastValueDiv.textContent = `Last value: ${r.last_value.toFixed(2)}`;
    output.appendChild(lastValueDiv);
}

window.runJsBenchmark = runJsBenchmark;