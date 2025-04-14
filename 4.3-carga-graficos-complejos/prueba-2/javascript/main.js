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

async function runJSBenchmark() {
    try {
        startJsTimer();
        const overallStart = performance.now();

        const initStart = performance.now();
        await initializeWorker();
        const workerTime = performance.now() - initStart;

        const numExecutions = parseInt(
            document.querySelector("#num-executions-javascript").value
        );

        const resultsList = [];

        clearCell("javascript");
        clearGraphContainer("graph-container-js");

        for (let i = 0; i < numExecutions; i++) {
            const id = `graph-${Date.now()}-${i}`;
            const result = await new Promise((resolve) => {
                pendingPromises.set(id, resolve);
                worker.postMessage({ id, size: 100_000, draw: true });
            });
            resultsList.push(result);
        }

        const totalElapsed = performance.now() - overallStart;

        // Mostrar el gráfico de la última ejecución
        const lastResult = resultsList[resultsList.length - 1];
        if (lastResult.image_base64) {
            displayPlotJs(lastResult.image_base64);
        }

        // Calcular promedios
        const accumulated = {
            data_gen_time: 0,
            render_time: 0,
            memory: 0,
            total_time: 0,
        };

        for (const result of resultsList) {
            accumulated.data_gen_time += result.data_gen_time;
            accumulated.render_time += result.render_time;
            accumulated.memory += result.memory;
            accumulated.total_time += result.total_time;
        }

        const averaged = {
            data_gen_time: accumulated.data_gen_time / numExecutions,
            render_time: accumulated.render_time / numExecutions,
            memory: accumulated.memory / numExecutions,
            total_time: accumulated.total_time / numExecutions,
        };

        // Mostrar resultados
        const outputContainer = document.getElementById("javascript-output");
        if (outputContainer) {
            const metrics = [
                `Worker Time: ${workerTime.toFixed(2)} ms`,
                `Data Generation: ${averaged.data_gen_time.toFixed(2)} ms`,
                `Rendering: ${averaged.render_time.toFixed(2)} ms`,
                `Memory: ${averaged.memory.toFixed(2)} MB`,
                `Average per Execution: ${averaged.total_time.toFixed(2)} ms`,
            ];

            for (const text of metrics) {
                const div = document.createElement("div");
                div.textContent = text;
                outputContainer.appendChild(div);
            }

            const totalContainer = document.getElementById("javascript-exact");
            const totalDiv = document.createElement("div");
            totalDiv.textContent = `TOTAL TIME: ${totalElapsed.toFixed(2)} ms`;
            totalContainer.appendChild(totalDiv);
        }

        stopJsTimer();
    } catch (error) {
        console.error("Worker error:", error);
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
