function createMatrix(size) {
    let matrix = new Array(size);
    for (let i = 0; i < size; i++) {
        matrix[i] = new Array(size);
        for (let j = 0; j < size; j++) {
            matrix[i][j] = Math.random();
        }
    }
    return matrix;
}

function multiplyMatrices(size) {
    let A = createMatrix(size);
    let B = createMatrix(size);
    let C = new Array(size).fill(0).map(() => new Array(size).fill(0));

    let start = performance.now();
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let sum = 0;
            for (let k = 0; k < size; k++) {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }
    let end = performance.now();

    let result = `JavaScript (Arrays nativos): ${end - start} ms`;
    let resultDiv = document.createElement("div");
    resultDiv.textContent = result;
    document.getElementById("output").appendChild(resultDiv);
}

function runJSBenchmark() {
    multiplyMatrices(200);  // Prueba con matrices de 200x200
}