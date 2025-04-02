let jsWorker = null;
let jsBenchmarkStartTime = 0;

function runJSBenchmark() {
    clearJSCells();
    displayJSText('javascript-create', 'Running...');
    displayJSText('javascript-sum', 'Running...');
    displayJSText('javascript-mean', 'Running...');
    displayJSText('javascript-std', 'Running...');
    displayJSText('javascript-output', 'Running...');

    jsBenchmarkStartTime = performance.now();

    if (jsWorker) {
        jsWorker.terminate();
    }
    jsWorker = new Worker('./javascript/worker.js');

    jsWorker.onmessage = function(event) {
        if (event.data.error) {
            console.error("Error in JS Worker:", event.data.error, event.data.stack);
            displayJSText('javascript-output', `Error: ${event.data.error}`);
            clearJSCellsButOutput();
            return;
        }

        const results = event.data.results;

        displayJSText('javascript-create', `${results.create.time.toFixed(2)} ms | ${results.create.memory.toFixed(2)} MB`);
        displayJSText('javascript-sum',    `${results.sum.time.toFixed(2)} ms | ${results.sum.memory.toFixed(2)} MB`);
        displayJSText('javascript-mean',   `${results.mean.time.toFixed(2)} ms | ${results.mean.memory.toFixed(2)} MB`);
        displayJSText('javascript-std',    `${results.std.time.toFixed(2)} ms | ${results.std.memory.toFixed(2)} MB`);

        displayJSText('javascript-output', `TOTAL: ${results.total.time.toFixed(2)} ms | Peak: ${results.total.memory.toFixed(2)} MB`);


    };

    jsWorker.onerror = function(error) {
        console.error("JS Worker Error:", error);
        displayJSText('javascript-output', `Worker Error: ${error.message}`);
        clearJSCellsButOutput();
        if (jsWorker) {
            jsWorker.terminate();
            jsWorker = null;
        }
    };

    const dataSize = 10_000_000;
    jsWorker.postMessage({ size: dataSize });
}

function displayJSText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    } else {
        console.warn(`Element with ID ${elementId} not found.`);
    }
}

function clearJSCells() {
    const ids = ['javascript-create', 'javascript-sum', 'javascript-mean', 'javascript-std', 'javascript-output'];
    ids.forEach(id => displayJSText(id, ''));
}

function clearJSCellsButOutput() {
     const ids = ['javascript-create', 'javascript-sum', 'javascript-mean', 'javascript-std'];
    ids.forEach(id => displayJSText(id, ''));
}