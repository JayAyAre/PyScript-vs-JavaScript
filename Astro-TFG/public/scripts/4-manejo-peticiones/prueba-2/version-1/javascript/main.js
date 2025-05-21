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

        const workerStartTime = performance.now();
        await initializeWorker();
        const workerTime = performance.now() - workerStartTime;

        const numRequests = parseInt(
            document.getElementById("num-requests-javascript").value,
            10
        );

        const delay = parseInt(
            document.getElementById("request-delay-javascript").value,
            10
        );

        const id = `js-${Date.now()}`;

        let apiUrl = location.origin + "/api/4.2.1/socket";

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
                id: id,
                num_requests: numRequests,
                delay: delay,
                api_url: apiUrl,
            });
        });

        const result = JSON.parse(resultJson);
        displayResult(result);

    } catch (error) {
        console.error(error);
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

window.runJsBenchmark = _runJsBenchmark;