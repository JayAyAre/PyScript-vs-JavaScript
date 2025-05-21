let worker = null;
let workerTime = 0;

function initializeWorker() {
    if (!worker) {
        worker = new Worker(
            window.location.origin +
            window.document.body.dataset.jsPath +
            "worker.js",
            { type: "module" }
        );
    }
}

async function _runJsBenchmark() {
    try {
        window.clearCell("javascript-output");
        window.showExecutionLoader();

        const startWorkerTime = performance.now();
        await initializeWorker();
        workerTime = performance.now() - startWorkerTime;

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
                type: "do_analisis",
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

function createDiv() {
    const div = document.createElement("div");
    return div;
}

function displayResult(r) {
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

window.runJsBenchmark = _runJsBenchmark;