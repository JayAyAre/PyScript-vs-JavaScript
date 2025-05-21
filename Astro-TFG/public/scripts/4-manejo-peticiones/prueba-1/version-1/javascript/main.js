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

        const startWorkerTime = performance.now();
        await initializeWorker();
        workerTime = performance.now() - startWorkerTime;

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
        displayResult(result, num_requests);
    } catch (e) {
        console.error(e);
    } finally {
        window.hideExecutionLoader();
    }
}

function createDiv() {
    const div = document.createElement("div");
    return div;
}

function displayResult(r, total_requests) {
    const output = document.getElementById("javascript-output");

    const workerDiv = createDiv();
    workerDiv.textContent = `Worker init time: ${workerTime.toFixed(2)} ms`;
    output.appendChild(workerDiv);

    const avgTimeDiv = createDiv();
    avgTimeDiv.textContent = `Avg request time: ${r.avg_time.toFixed(2)} ms`;
    output.appendChild(avgTimeDiv);

    const totalTimeDiv = createDiv();
    totalTimeDiv.textContent = `Total ET: ${r.total_time.toFixed(2)} ms`;
    output.appendChild(totalTimeDiv);

    const requestsDiv = createDiv();
    requestsDiv.textContent = `Requests: ${total_requests}`;
    output.appendChild(requestsDiv);

    const lastValueDiv = createDiv();
    lastValueDiv.textContent = `Last value: ${r.last_value.toFixed(2)}`;
    output.appendChild(lastValueDiv);
}

window.runJsBenchmark = _runJsBenchmark;
