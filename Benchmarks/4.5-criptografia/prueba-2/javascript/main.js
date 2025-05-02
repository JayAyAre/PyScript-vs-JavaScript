// main.js
let worker = null;
let jsTimer = null;
let jsStartTime = 0;

function startJsTimer() {
    jsStartTime = performance.now();
    const timerElement = document.getElementById("js-timer-display");
    function updateTimer() {
        if (!jsTimer) return;
        const elapsed = ((performance.now() - jsStartTime) / 1000).toFixed(3);
        timerElement.textContent = `JS Timer: ${elapsed} s`;
        jsTimer = requestAnimationFrame(updateTimer);
    }
    cancelAnimationFrame(jsTimer);
    jsTimer = requestAnimationFrame(updateTimer);
}

function stopJsTimer() {
    cancelAnimationFrame(jsTimer);
    jsTimer = null;
    const elapsed = ((performance.now() - jsStartTime) / 1000).toFixed(3);
    document.getElementById(
        "js-timer-display"
    ).textContent = `JS Timer: ${elapsed} s`;
}

async function javascriptBenchmark() {
    try {
        startJsTimer();

        // measure Worker init time
        const startWorkerTime = performance.now();
        if (!worker) {
            worker = new Worker("./javascript/worker.js");
        }
        const workerTime = performance.now() - startWorkerTime;

        clearCell("javascript");

        // read inputs
        const repetitions = parseInt(
            document.getElementById("num-repetitions-js").value,
            10
        );
        const messageSizeMb = parseFloat(
            document.getElementById("message-size-js").value
        );
        const id = `js-${Date.now()}`;

        // dispatch to worker
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
        document.getElementById(
            "javascript-output"
        ).textContent = `Error: ${err.message}`;
    } finally {
        stopJsTimer();
    }
}

function clearCell(prefix) {
    ["output", "exact"].forEach((field) => {
        const el = document.getElementById(`${prefix}-${field}`);
        if (el) el.textContent = "";
    });
}

function displayResult(r, workerTime) {
    const out = document.getElementById("javascript-output");
    const exact = document.getElementById("javascript-exact");

    out.innerHTML = `
      <div>Worker init time: ${workerTime.toFixed(2)} ms</div>
      <div>Message size: ${r.message_size_mb.toFixed(2)} MB</div>
      <div>Repetitions: ${r.repetitions}</div>
      <div>Avg encrypt time: ${r.encrypt_avg_ms.toFixed(2)} ms</div>
      <div>Avg decrypt time: ${r.decrypt_avg_ms.toFixed(2)} ms</div>
      <div>Integrity check: ${r.integrity_ok ? "OK" : "FAIL"}</div>
      <div>Integrity success: ${r.success_count} of ${
        r.repetitions
    } (${r.success_percentage.toFixed(2)}%)</div>
      <div>Ciphertext size: ${(r.ciphertext_bytes / 1024 / 1024).toFixed(
          2
      )} MB</div>
    `;
    exact.innerHTML = `
      <div>Total crypto time: ${r.crypto_total_ms.toFixed(2)} ms</div>
      <div>Overall total time: ${r.overall_time_ms.toFixed(2)} ms</div>
    `;
}

// expose globally
window.javascriptBenchmark = javascriptBenchmark;
