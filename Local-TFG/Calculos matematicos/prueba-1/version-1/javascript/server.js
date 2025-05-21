const express = require("express");
const cors = require("cors");
const osu = require("node-os-utils");

const cpu = osu.cpu;
const app = express();
const port = 3000;

app.use(cors());

function createMatrix(size) {
    const matrix = new Array(size);
    for (let i = 0; i < size; i++) {
        matrix[i] = new Array(size);
        for (let j = 0; j < size; j++) {
            matrix[i][j] = Math.random();
        }
    }
    return matrix;
}

function getMemoryUsageJS() {
    return Math.max(process.memoryUsage().heapUsed / (1024 * 1024), 0);
}

async function getCpuUsage() {
    return Math.max(await cpu.usage(), 0);
}

async function multiplyMatrices(size) {

    const A = createMatrix(size);
    const B = createMatrix(size);
    const C = new Array(size).fill(0).map(() => new Array(size).fill(0));

    const startTime = performance.now();

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let sum = 0;
            for (let k = 0; k < size; k++) {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }

    const executionTime = +(performance.now() - startTime).toFixed(2);
    const memoryUsage = +(getMemoryUsageJS()).toFixed(2);
    const endCpu = +(await getCpuUsage()).toFixed(2);

    return {
        executionTime: executionTime,
        cpuUsage: endCpu,
        memoryUsage: memoryUsage
    };
}

app.get("/", async (req, res) => {
    const results = await multiplyMatrices(300);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(results);
});

function runServer() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

runServer();
