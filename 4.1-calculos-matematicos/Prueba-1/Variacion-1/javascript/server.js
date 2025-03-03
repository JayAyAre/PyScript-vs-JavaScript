const express = require("express");
const cors = require("cors");
const os = require("os");
const osu = require("node-os-utils");

const app = express();
const port = 3000;

app.use(cors());

const cpu = osu.cpu;

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

async function multiplyMatrices(size) {
    let A = createMatrix(size);
    let B = createMatrix(size);
    let C = new Array(size).fill(0).map(() => new Array(size).fill(0));

    const startMemory = process.memoryUsage().heapUsed;

    let startReal = performance.now();

    let cpuAvg = await cpu.usage();

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let sum = 0;
            for (let k = 0; k < size; k++) {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }

    let endReal = performance.now();

    // ET (Execution Time)

    let executionTime = (endReal - startReal).toFixed(2);

    // CPU

    let cpuUsage = cpuAvg.toFixed(2);

    // RAM

    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsage = ((endMemory - startMemory) / (1024 * 1024)).toFixed(2); // Convertir a MB

    return {
        executionTime: executionTime,
        cpuUsage: cpuUsage,
        memoryUsage: memoryUsage
    };
}

app.get("/", async (req, res) => {
    let result = await multiplyMatrices(300);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
