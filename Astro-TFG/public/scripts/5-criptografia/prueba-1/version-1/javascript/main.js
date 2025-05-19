let worker = null;

async function javascriptBenchmark() {
    try {

        window.clearCell("javascript-output");
        window.showExecutionLoader();

        const startWorkerTime = performance.now();
        await initializeWorker();
        const workerTime = performance.now() - startWorkerTime;

        const repetitions = parseInt(
            document.getElementById("num-repetitions-javascript").value,
            10
        );
        const fileSizeMb = parseFloat(
            document.getElementById("file-size-javascript").value
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
                type: "js_run_js_benchmark",
                workerTime,
                repetitions,
                fileSizeMb,
            });
        });

        const result = JSON.parse(resultJson);
        displayResult(result, workerTime);
    } catch (err) {
        console.error("Benchmark error:", err);
        const out = document.getElementById("javascript-output");
        out.textContent = `Error: ${err.message}`;
    } finally {
        window.hideExecutionLoader();
    }
}

function displayResult(result, workerTime) {
    const out = document.getElementById("javascript-output");

    out.innerHTML = `
      <div>Worker time: ${workerTime.toFixed(2)} ms</div>
      <div>Simulated file: ${result.file_size_mb.toFixed(2)} MB</div>
      <div>Repetitions: ${result.repetitions}</div>
      <div>Avg hash time: ${result.hash_avg_time_ms.toFixed(2)} ms</div>
      <div>Avg verify time: ${result.verify_avg_time_ms.toFixed(2)} ms</div>
      <div>Last hash (shortened): ${result.last_digest.slice(0, 20)}...</div>
      <div>Total op time: ${result.total_time_ms.toFixed(2)} ms</div>
      <div>Total time: ${result.total_time.toFixed(2)} ms</div>
    `;
}

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

        resolve();
    });
}

window.runJsBenchmark = javascriptBenchmark;



