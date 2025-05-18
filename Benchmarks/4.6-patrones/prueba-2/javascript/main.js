let worker = null;
let jsTimer = null;
let jsStartTime = 0;

function startJsTimer() {
    jsStartTime = performance.now();
    const timerElement = document.getElementById("javascript-timer-display");
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
    const timerElement = document.getElementById("javascript-timer-display");
    timerElement && (timerElement.textContent = `JS Timer: ${elapsed} s`);
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
            document.getElementById("num-repetitions-javascript")?.value || "1",
            10
        );
        const id = `js-${Date.now()}`;

        const resultJson = await new Promise((resolve, reject) => {
            function onMessage(e) {
                if (e.data.id !== id) return;
                worker.removeEventListener("message", onMessage);
                if (e.data.error) reject(new Error(e.data.error));
                else {
                    resolve(e.data.json);
                }
            }
            worker.addEventListener("message", onMessage);
            worker.postMessage({
                id,
                type: "do_analisis",
                repetitions,
            });
        });

        const r = JSON.parse(resultJson);
        displayResult(r, workerTime);
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

    const trainingDiv = createDiv();
    trainingDiv.textContent = `Training time: ${r.training_time_ms.toFixed(2)} ms`;
    output.appendChild(trainingDiv);

    const inferenceDiv = createDiv();
    inferenceDiv.textContent = `Inference time: ${r.inference_time_ms.toFixed(2)} ms`;
    output.appendChild(inferenceDiv);

    const accuracyDiv = createDiv();
    accuracyDiv.textContent = `Accuracy: ${r.accuracy.toFixed(2)} %`;
    output.appendChild(accuracyDiv);

    const modelSizeDiv = createDiv();
    modelSizeDiv.textContent = `Model size: ${r.model_size_mb.toFixed(2)} MB`;
    output.appendChild(modelSizeDiv);

    const totalDiv = createDiv();
    totalDiv.textContent = `Total ET: ${r.overall_time_ms.toFixed(2)} ms`;
    output.appendChild(totalDiv);
}

window.runJsBenchmark = runJsBenchmark;

