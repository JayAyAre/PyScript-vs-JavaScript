let worker = null;
let pendingPromises = new Map(); // Para gestionar las promesas pendientes
function initializeWorker() {
    return new Promise((resolve) => {
        if (worker) {
            resolve();
            return;
        }
        worker = new Worker(window.location.origin + window.document.body.dataset.jsPath + "worker.js");
        worker.onmessage = (event) => {
            const { id, results } = event.data;
            if (pendingPromises.has(id)) {
                pendingPromises.get(id)(results);
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

        const startWorkerTime = performance.now();

        await initializeWorker();
        const worker_time = performance.now() - startWorkerTime;

        const num_requests = parseInt(
            document.getElementById("num-requests-javascript").value,
            10
        );
        const delay = parseInt(
            document.getElementById("request-delay-javascript").value,
            10
        );

        const urls = Array.from(
            { length: num_requests },
            (_, i) => location.origin + "/api/4.4/" + delay + ".ts"
        );

        const start_time = performance.now();

        worker.postMessage({ num_requests, delay, worker_time });

        worker.onmessage = function (e) {
            const { total_time, avg_time, results } = e.data;
            updateResults(total_time, avg_time, worker_time, results);
            window.hideExecutionLoader();
        };
    } catch (e) {
        console.error(e);
        displayError(e);
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
        const last_value = results[results.length - 1].data[9].value; // Accede al último valor
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

function displayError(err) {
    const output = document.getElementById("javascript-output");
    output.innerHTML = `<div style="color: red;">Error: ${err.message}</div>`;
}

window.runJSBenchmark = javascriptBenchmark;
