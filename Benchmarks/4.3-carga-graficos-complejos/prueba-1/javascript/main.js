let worker = null;
const pendingPromises = new Map();

function initializeWorker() {
    return new Promise((resolve) => {
        if (worker) {
            resolve();
            return;
        }
        worker = new Worker("./javascript/worker.js");
        worker.onmessage = (event) => {
            const { id, results } = event.data;
            if (pendingPromises.has(id)) {
                pendingPromises.get(id)(results);
                pendingPromises.delete(id);
            }
        };
        resolve();
    });
}

async function measureMemoryUsage(duration = 500, interval = 50) {
    // Muestra el uso de memoria repetidamente durante 'duration' milisegundos
    const memoryUsages = [];
    const start = performance.now();
    return new Promise((resolve) => {
        const timer = setInterval(() => {
            if (performance.memory) {
                // Guardamos el uso actual en bytes
                memoryUsages.push(performance.memory.usedJSHeapSize);
            }
            if (performance.now() - start >= duration) {
                clearInterval(timer);
                // Tomamos el máximo y lo convertimos a MB
                const maxUsage = Math.max(...memoryUsages);
                resolve(maxUsage / (1024 * 1024));
            }
        }, interval);
    });
}

async function runJSBenchmark() {
    try {
        startJSTimer();
        const startWorkerTime = performance.now();

        if (!worker) {
            worker = new Worker("./javascript/worker.js");
            await setupWorker();
        }

        const workerTime = performance.now() - startWorkerTime;

        clearCell("javascript");
        clearGraphContainer("graph-container-js");

        const numSeries = parseInt(
            document.getElementById("num-series-js").value
        );
        const numPoints = parseInt(
            document.getElementById("num-points-js").value
        );

        // Enviar el mensaje al worker
        const id = `graph-${Date.now()}`;
        // Obtenemos el resultado del worker
        const result = await new Promise((resolve) => {
            pendingPromises.set(id, resolve);
            worker.postMessage({ id, size: 100_000, draw: true });
        });

        // Esperar 500ms y medir el uso máximo de memoria durante ese período
        const measuredMemory = await measureMemoryUsage(500, 50);

        // Añadimos el uso de memoria medido a result
        result.memory = measuredMemory;

        stopJSTimer();

        // Si existe la imagen, la mostramos
        if (result.image_base64) {
            displayPlotJs(result.image_base64);
        }

        // Actualizamos la UI en un solo contenedor (javascript-output) con cada métrica en su propio div
        const outputContainer = document.getElementById("javascript-output");
        if (outputContainer) {
            outputContainer.innerHTML = "";
            const metrics = [
                `Worker Time: ${workerTime.toFixed(2)} ms`,
                `Data Generation: ${result.data_gen_time.toFixed(2)} ms`,
                `Rendering: ${result.render_time.toFixed(2)} ms`,
                `Memory: ${result.memory.toFixed(2)} MB`,
            ];
            metrics.forEach((text) => {
                const div = document.createElement("div");
                div.textContent = text;
                outputContainer.appendChild(div);
            });

            const exactContainer = document.getElementById("javascript-exact");
            exactContainer.innerHTML = "";
            const totalDiv = document.createElement("div");
            totalDiv.textContent = `TOTAL TIME: ${result.total_time.toFixed(
                2
            )} ms`;
            exactContainer.appendChild(totalDiv);
        }
    } catch (error) {
        console.error("Worker error:", error);
        displayJSText("javascript-output", `Worker Error: ${error}`);
    }
}

// Timer
let jsTimerInterval = null;
let jsStartTime = 0;

function startJsTimer() {
    jsStartTime = performance.now();
    const timerElement = document.getElementById("js-timer-display");
    clearInterval(jsTimerInterval);
    jsTimerInterval = setInterval(() => {
        const elapsed = (performance.now() - jsStartTime) / 1000;
        timerElement.textContent = `JS Timer: ${elapsed.toFixed(4)} s`;
    }, 100);
}

function stopJsTimer() {
    clearInterval(jsTimerInterval);
    jsTimerInterval = null;
}

function displayPlotJs(base64Data) {
    const img = document.createElement("img");
    img.src = `data:image/png;base64,${base64Data}`;
    img.style.maxWidth = "100%";
    document.getElementById("graph-container-js").appendChild(img);
}
