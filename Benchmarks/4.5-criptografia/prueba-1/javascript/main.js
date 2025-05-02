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
        const startWorkerTime = performance.now();
        if (!worker) {
            worker = new Worker("./javascript/worker.js");
        }
        const workerTime = performance.now() - startWorkerTime;

        clearCell("javascript");

        const repetitions = parseInt(
            document.getElementById("num-repetitions-js").value,
            10
        );
        const fileSizeMb = parseFloat(
            document.getElementById("file-size-js").value
        );
        const id = `js-${Date.now()}`;

        const resultJson = await new Promise((resolve, reject) => {
            // handler que sólo procesa nuestro mensaje
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
        stopJsTimer();
    }
}

function clearCell(prefix) {
    ["output", "exact"].forEach((field) => {
        const el = document.getElementById(`${prefix}-${field}`);
        if (el) el.textContent = "";
    });
}

function displayResult(result, workerTime) {
    const out = document.getElementById("javascript-output");
    const exact = document.getElementById("javascript-exact");

    out.innerHTML = `
      <div>Worker time: ${workerTime.toFixed(2)} ms</div>
      <div>Simulated file: ${result.file_size_mb.toFixed(2)} MB</div>
      <div>Repetitions: ${result.repetitions}</div>
      <div>Avg hash time: ${result.hash_avg_time_ms.toFixed(2)} ms</div>
      <div>Avg verify time: ${result.verify_avg_time_ms.toFixed(2)} ms</div>
      <div>Last hash (shortened): ${result.last_digest.slice(0, 20)}...</div>
    `;
    exact.innerHTML = `
      <div>Total op time: ${result.total_time_ms.toFixed(2)} ms</div>
      <div>Total time: ${result.total_time.toFixed(2)} ms</div>
    `;
}

// dejar expuesta
window.javascriptBenchmark = javascriptBenchmark;
