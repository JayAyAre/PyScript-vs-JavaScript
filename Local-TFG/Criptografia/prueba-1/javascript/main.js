let worker = null;
let jsTimer = null;
let jsStartTime = 0;

function startJsTimer() {
    jsStartTime = performance.now();
    const timerElement = document.getElementById("javascript-timer-display");
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
        "javascript-timer-display"
    ).textContent = `JS Timer: ${elapsed} s`;
}

function initializeWorker() {
    if (!worker) {
        worker = new Worker(new URL("worker.js", import.meta.url), {
            type: "module",
        });
    }
}

async function runJsBenchmark() {
    try {
        window.clearCell("javascript-output");
        startJsTimer();

        const startWorkerTime = performance.now();
        initializeWorker();
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
                type: "do_analisis",
                repetitions,
                fileSizeMb,
            });
        });

        const result = JSON.parse(resultJson);
        displayResult(result, workerTime);
    } catch (err) {
        console.error("Benchmark error:", err);
    } finally {
        stopJsTimer();
    }
}

function createDiv() {
    const div = document.createElement("div");
    return div;
}

function displayResult(r, workerTime) {
    const output = document.getElementById("javascript-output");

    const workerDiv = createDiv();
    workerDiv.textContent = `Worker init time: ${workerTime.toFixed(2)} ms`;
    output.appendChild(workerDiv);

    const simulatedDiv = createDiv();
    simulatedDiv.textContent = `Simulated file: ${r.file_size_mb.toFixed(2)} ms`;
    output.appendChild(simulatedDiv);

    const repetitionsDiv = createDiv();
    repetitionsDiv.textContent = `Repetitions: ${r.repetitions.toFixed(2)} ms`;
    output.appendChild(repetitionsDiv);

    const hashDiv = createDiv();
    hashDiv.textContent = `Avg hash time: ${r.hash_avg_time_ms.toFixed(2)} ms`;
    output.appendChild(hashDiv);

    const verifyDiv = createDiv();
    verifyDiv.textContent = `Avg verify time: ${r.verify_avg_time_ms.toFixed(2)} ms`;
    output.appendChild(verifyDiv);

    const lastDigestDiv = createDiv();
    lastDigestDiv.textContent = `Last hash (shortened): ${r.last_digest.slice(0, 8)}`;
    output.appendChild(lastDigestDiv);

    const totalOpDiv = createDiv();
    totalOpDiv.textContent = `Total hash + verify time: ${r.total_time_ms.toFixed(2)} ms`;
    output.appendChild(totalOpDiv);

    const totalDiv = createDiv();
    totalDiv.textContent = `Total ET: ${r.total_time.toFixed(2)} ms`;
    output.appendChild(totalDiv);
}

window.runJsBenchmark = runJsBenchmark;
