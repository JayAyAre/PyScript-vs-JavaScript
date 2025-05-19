let worker = null;
const pendingPromises = new Map();

function initializeWorker() {
    return new Promise((resolve) => {
        if (worker) {
            resolve();
            return;
        }

        const workerPath = window.location.origin +
            window.document.body.dataset.jsPath +
            "worker.js";

        worker = new Worker(workerPath);

        worker.onmessage = (event) => {
            const { id, results, error, metrics } = event.data;

            if (error && pendingPromises.has(id)) {
                pendingPromises.get(id).reject(error);
                pendingPromises.delete(id);
                return;
            }

            if (pendingPromises.has(id)) {
                pendingPromises.get(id).resolve({
                    results,
                    metrics
                });
                pendingPromises.delete(id);
            }
        };

        resolve();
    });
}

async function javascriptBenchmark() {
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

        const requestId = crypto.randomUUID();

        const benchmarkPromise = new Promise((resolve, reject) => {
            pendingPromises.set(requestId, { resolve, reject });
        });

        let apiUrl = location.origin + "/api/4.4.2/socket";

        worker.postMessage({
            id: requestId,
            num_requests: numRequests,
            delay: delay,
            api_url: apiUrl,
        });

        const { results, metrics } = await benchmarkPromise;

        updateResultsUI({
            workerTime,
            ...metrics,
            results
        });

    } catch (error) {
        displayError(error);
    } finally {
        window.hideExecutionLoader();
    }
}

function updateResultsUI({
    workerTime,
    total_time,
    avg_time,
    individual_times,
    results
}) {
    const output = document.getElementById("javascript-output");

    const lastValue = results.length > 0 && results[results.length - 1]?.data?.length > 0
        ? results[results.length - 1].data[0].value
        : null;

    output.innerHTML = `
        <div>Worker Time: ${workerTime.toFixed(2)} ms</div>
        <div>Avg. Request Time: ${avg_time.toFixed(2)} ms</div>
        <div>Total Time: ${total_time.toFixed(2)} ms</div>
        <div>Completed Requests: ${individual_times.length}</div>
        ${lastValue ? `
            <div>Last Value: ${lastValue}</div>` : ''}
    `;
}

function displayError(error) {
    const output = document.getElementById("javascript-output");
    output.innerHTML = `
        <div style="color: red;">
            Error: ${error.message || 'Unknown error'}
        </div>
    `;
}

window.runJsBenchmark = javascriptBenchmark;