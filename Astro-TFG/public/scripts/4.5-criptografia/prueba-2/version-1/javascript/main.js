// main.js
let worker = null;

function displayResult(r, workerTime) {
    const out = document.getElementById("javascript-output");

    out.innerHTML = `
      <div>Worker init time: ${workerTime.toFixed(2)} ms</div>
      <div>Message size: ${r.message_size_mb.toFixed(2)} MB</div>
      <div>Repetitions: ${r.repetitions}</div>
      <div>Avg encrypt time: ${r.encrypt_avg_ms.toFixed(2)} ms</div>
      <div>Avg decrypt time: ${r.decrypt_avg_ms.toFixed(2)} ms</div>
      <div>Integrity check: ${r.integrity_ok ? "OK" : "FAIL"}</div>
      <div>Integrity success: ${r.success_count} of ${r.repetitions
        } (${r.success_percentage.toFixed(2)}%)</div>
      <div>Ciphertext size: ${(r.ciphertext_bytes / 1024 / 1024).toFixed(
            2
        )} MB</div>
      <div>Total crypto time: ${r.crypto_total_ms.toFixed(2)} ms</div>
      <div>Overall total time: ${r.overall_time_ms.toFixed(2)} ms</div>
    `;
}

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
        const messageSizeMb = parseFloat(
            document.getElementById("message-size-javascript").value
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
                workerTime,
                repetitions,
                messageSizeMb,
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

window.runJSBenchmark = javascriptBenchmark;

