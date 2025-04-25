(() => {
    let worker = null;
    let jsTimer = null;
    let jsStartTime = 0;

    function startJsTimer() {
        jsStartTime = performance.now();
        const timerElement = document.getElementById("js-timer-display");
        function updateTimer() {
            if (!jsTimer) return;
            const elapsed = ((performance.now() - jsStartTime) / 1000).toFixed(
                3
            );
            timerElement &&
                (timerElement.textContent = `JS Timer: ${elapsed} s`);
            jsTimer = requestAnimationFrame(updateTimer);
        }
        cancelAnimationFrame(jsTimer);
        jsTimer = requestAnimationFrame(updateTimer);
    }

    function stopJsTimer() {
        cancelAnimationFrame(jsTimer);
        jsTimer = null;
        const elapsed = ((performance.now() - jsStartTime) / 1000).toFixed(3);
        const timerElement = document.getElementById("js-timer-display");
        timerElement && (timerElement.textContent = `JS Timer: ${elapsed} s`);
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
        else console.warn(`Element with id \"${id}\" not found`);
    }

    function clearMetrics(prefix) {
        [
            "worker",
            "training",
            "inference",
            "accuracy",
            "memory",
            "total",
        ].forEach((id) => {
            setText(`${prefix}-${id}`, "");
        });
    }

    async function javascriptBenchmark() {
        const outputEl = document.getElementById("javascript-output");
        try {
            outputEl && (outputEl.textContent = "");
            startJsTimer();
            clearMetrics("javascript");

            const startWorkerTime = performance.now();
            if (!worker) {
                worker = new Worker(new URL("worker.js", import.meta.url), {
                    type: "module",
                });
            }
            const workerTime = performance.now() - startWorkerTime;
            setText("javascript-worker", `${workerTime.toFixed(2)} ms`);

            const repetitions = parseInt(
                document.getElementById("num-repetitions-js")?.value || "1",
                10
            );
            const id = `js-${Date.now()}`;

            const resultJson = await new Promise((resolve, reject) => {
                function onMessage(e) {
                    if (e.data.id !== id) return;
                    worker.removeEventListener("message", onMessage);
                    if (e.data.error) reject(new Error(e.data.error));
                    else {
                        console.log("Mensaje recibido del worker:", e.data);
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
            outputEl && (outputEl.textContent = `Error: ${err.message}`);
        } finally {
            stopJsTimer();
        }
    }

    function displayResult(r) {
        setText("javascript-training", `${r.training_time_ms.toFixed(2)} ms`);
        setText("javascript-inference", `${r.inference_time_ms.toFixed(2)} ms`);
        setText("javascript-accuracy", `${r.accuracy.toFixed(2)} %`);
        setText("javascript-memory", `${r.model_size_mb.toFixed(2)} MB`);
        setText("javascript-total", `${r.overall_time_ms.toFixed(2)} ms`);
    }

    document.addEventListener("DOMContentLoaded", () => {
        const btn = document.getElementById("run-button-js");
        if (btn) btn.addEventListener("click", javascriptBenchmark);
    });

    window.javascriptBenchmark = javascriptBenchmark;
})();
