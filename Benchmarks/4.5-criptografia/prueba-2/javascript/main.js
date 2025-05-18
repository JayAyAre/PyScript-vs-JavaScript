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
                repetitions,
                messageSizeMb,
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


window.runJsBenchmark = runJsBenchmark;
