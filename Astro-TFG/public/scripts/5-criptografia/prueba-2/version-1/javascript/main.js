let worker = null;
let workerTime = 0;

function initializeWorker() {
    if (!worker) {
        worker = new Worker(
            window.location.origin +
            window.document.body.dataset.jsPath +
            "worker.js"
        );
    }
}

async function _runJsBenchmark() {
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
                type: "do_analisis",
                workerTime,
                repetitions,
                messageSizeMb,
            });
        });

        const result = JSON.parse(resultJson);
        displayResult(result);
    } catch (err) {
        console.error("Benchmark error:", err);
    } finally {
        window.hideExecutionLoader();
    }
}

function createDiv() {
    const div = document.createElement("div");
    return div;
}

function displayResult(r) {
    const out = document.getElementById("javascript-output");

    const workerDiv = createDiv();
    workerDiv.textContent = `Worker init time: ${workerTime.toFixed(2)} ms`;
    out.appendChild(workerDiv);

    const msgSizeDiv = createDiv();
    msgSizeDiv.textContent = `Message size: ${r.message_size_mb.toFixed(2)} MB`;
    out.appendChild(msgSizeDiv);

    const repsDiv = createDiv();
    repsDiv.textContent = `Repetitions: ${r.repetitions}`;
    out.appendChild(repsDiv);

    const encryptDiv = createDiv();
    encryptDiv.textContent = `Avg encrypt time: ${r.encrypt_avg_ms.toFixed(2)} ms`;
    out.appendChild(encryptDiv);

    const decryptDiv = createDiv();
    decryptDiv.textContent = `Avg decrypt time: ${r.decrypt_avg_ms.toFixed(2)} ms`;
    out.appendChild(decryptDiv);

    const integrityDiv = createDiv();
    integrityDiv.textContent = `Integrity check: ${r.integrity_ok ? "OK" : "FAIL"}`;
    out.appendChild(integrityDiv);

    const successDiv = createDiv();
    successDiv.textContent = `Integrity success: ${r.success_count} of ${r.repetitions} (${r.success_percentage.toFixed(2)}%)`;
    out.appendChild(successDiv);

    const sizeDiv = createDiv();
    sizeDiv.textContent = `Ciphertext size: ${(r.ciphertext_bytes / 1024 / 1024).toFixed(2)} MB`;
    out.appendChild(sizeDiv);

    const cryptoTimeDiv = createDiv();
    cryptoTimeDiv.textContent = `Total crypto time: ${r.crypto_total_ms.toFixed(2)} ms`;
    out.appendChild(cryptoTimeDiv);

    const overallTimeDiv = createDiv();
    overallTimeDiv.textContent = `Overall total time: ${r.overall_time_ms.toFixed(2)} ms`;
    out.appendChild(overallTimeDiv);
}

window.runJsBenchmark = _runJsBenchmark;

