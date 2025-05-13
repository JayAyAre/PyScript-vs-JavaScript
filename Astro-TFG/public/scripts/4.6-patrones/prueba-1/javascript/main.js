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
        clearCell("javascript");

        // measure Worker init time
        const startWorkerTime = performance.now();
        if (!worker) {
            worker = new Worker(new URL("worker.js", import.meta.url), {
                type: "module",
            });
        }
        const workerTime = performance.now() - startWorkerTime;
        document.getElementById(
            "javascript-worker"
        ).textContent = `${workerTime.toFixed(2)} ms`;

        // read repetitions
        const repetitions = parseInt(
            document.getElementById("num-repetitions-js").value,
            10
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
        stopJsTimer();
    }
}

function clearCell(prefix) {
    ["worker", "training", "inference", "accuracy", "memory", "total"].forEach(
        (id) => {
            const el = document.getElementById(`${prefix}-${id}`);
            if (el) el.textContent = "";
        }
    );
}

function displayResult(r) {
    document.getElementById(
        "javascript-training"
    ).textContent = `${r.training_time_ms.toFixed(2)} ms`;
    document.getElementById(
        "javascript-inference"
    ).textContent = `${r.inference_time_ms.toFixed(2)} ms`;
    document.getElementById(
        "javascript-accuracy"
    ).textContent = `${r.accuracy.toFixed(2)} %`;
    document.getElementById(
        "javascript-memory"
    ).textContent = `${r.model_size_mb.toFixed(2)} MB`;
    document.getElementById(
        "javascript-total"
    ).textContent = `${r.overall_time_ms.toFixed(2)} ms`;
}

// expose globally
window.javascriptBenchmark = javascriptBenchmark;
