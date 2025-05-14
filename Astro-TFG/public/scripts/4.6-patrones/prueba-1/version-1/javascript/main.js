// main.js
let worker = null;
let worker_time = 0;

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

        const id = `js-${Date.now()}`;

        const resultJson = await new Promise((resolve, reject) => {
            function onMessage(e) {
                if (e.data.id !== id) return;
                worker.removeEventListener("message", onMessage);
                if (e.data.error) {
                    reject(new Error(e.data.error));
                } else {
                    resolve(e.data.json);
                }
            }
            worker.addEventListener("message", onMessage);
            worker.postMessage({
                id,
                type: "js_run_js_benchmark",
                repetitions,
            });
        });

        const r = JSON.parse(resultJson);
        displayResult(r);
    } catch (err) {
        console.error("Benchmark error:", err);
        document.getElementById(
            "javascript-output"
        ).textContent = `Error: ${err.message}`;
    } finally {
        window.hideExecutionLoader();
    }
}


function displayResult(r) {
    const out = document.getElementById("javascript-output");

    out.innerHTML = `
      <div>Worker init time: ${worker_time.toFixed(2)} ms</div>
      <div>Training  time: ${r.training_time_ms.toFixed(2)} ms
      <div>Inference time: ${r.inference_time_ms.toFixed(2)} ms</div>
      <div>Accuracy: ${r.accuracy.toFixed(2)} %</div>
      <div>Model size: ${r.model_size_mb.toFixed(2)} MB</div>
      <div>Overall time: ${r.overall_time_ms.toFixed(2)} ms</div>
    `
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

        worker = new Worker(workerPath, { type: "module" });
        resolve();
    });
}

window.runJSBenchmark = javascriptBenchmark;