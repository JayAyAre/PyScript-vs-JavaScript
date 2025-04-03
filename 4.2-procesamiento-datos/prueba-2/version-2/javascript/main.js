function runJSBenchmark() {
    const numExecutions = parseInt(document.getElementById("num-executions-javascript").value) || 1;
    clearCell("javascript");
    let simulationStartTime = performance.now();

    const promises = [];

    for (let i = 0; i < numExecutions; i++) {
        promises.push(new Promise((resolve, reject) => {
            const worker = new Worker("./javascript/worker.js");

            worker.onmessage = function (event) {
                if (event.data.error) {
                    console.error("Error in JS Worker:", event.data.error, event.data.stack);
                    reject(event.data.error);
                } else {
                    resolve(event.data.results);
                }
                worker.terminate();
            };

            worker.onerror = function (error) {
                console.error("JS Worker Error:", error);
                reject(error);
                worker.terminate();
            };

            const dataSize = 10_000_000;
            worker.postMessage({ size: dataSize });
        }));
    }

    Promise.all(promises)
        .then((resultsArray) => {
            let totalResults = {
                create: { time: 0, memory: 0 },
                sum: { time: 0, memory: 0 },
                mean: { time: 0, memory: 0 },
                std: { time: 0, memory: 0 },
                total: { time: 0, memory: 0, total_time_exact: 0 }
            };

            resultsArray.forEach(results => {
                for (let op in totalResults) {
                    if (results[op]) {
                        totalResults[op].time += results[op].time;
                        totalResults[op].memory += results[op].memory;
                    }
                }
            });

            for (let op in totalResults) {
                totalResults[op].time /= numExecutions;
                totalResults[op].memory /= numExecutions;
            }

            totalResults.total.total_time_exact = performance.now() - simulationStartTime;

            displayResults(totalResults);
        })
        .catch((error) => {
            console.error("Worker error:", error);
            displayJSText("javascript-output", `Worker Error: ${error}`);
        });
}

function displayResults(results) {
    displayJSText("javascript-create", `${results.create.time.toFixed(2)} ms | ${results.create.memory.toFixed(2)} MB`);
    displayJSText("javascript-sum", `${results.sum.time.toFixed(2)} ms | ${results.sum.memory.toFixed(2)} MB`);
    displayJSText("javascript-mean", `${results.mean.time.toFixed(2)} ms | ${results.mean.memory.toFixed(2)} MB`);
    displayJSText("javascript-std", `${results.std.time.toFixed(2)} ms | ${results.std.memory.toFixed(2)} MB`);
    displayJSText("javascript-output",
        `TOTAL (Promedio): ${results.total.time.toFixed(2)} ms | Peak: ${results.total.memory.toFixed(2)} MB`
    );
    displayJSText("javascript-exact",
        `TOTAL Exacto: ${results.total.total_time_exact.toFixed(2)} ms`
    );
}

function clearCell(elementId) {
    const operations = ['create', 'sum', 'mean', 'std', 'output', 'exact'];
    operations.forEach(op => {
        const element = document.getElementById(`${elementId}-${op}`);
        if (element) {
            element.innerHTML = "";
        }
    });
}

function displayJSText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent += text;
    } else {
        console.warn(`Element with ID ${elementId} not found.`);
    }
}
