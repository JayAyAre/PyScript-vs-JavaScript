const express = require("express");
const cors = require("cors");
const osu = require("node-os-utils");

const cpu = osu.cpu;
const app = express();
const port = 3000;

app.use(cors());

function calculatePi(digits) {
    let pi = 0.0;
    for (let k = 0; k < digits; k++) {
        pi += (1 / Math.pow(16, k)) * (
            (4 / (8 * k + 1)) -
            (2 / (8 * k + 4)) -
            (1 / (8 * k + 5)) -
            (1 / (8 * k + 6))
        );
    }
    return pi;
}

function getMemoryUsage() {
    return process.memoryUsage().heapUsed / (1024 * 1024);
}

async function getCpuUsage() {
    return await cpu.usage();
}

async function computePi(digits, repetitions) {
    let totalTime = 0;
    let totalMemory = 0;
    let totalCpu = 0;

    let startReal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        const startMemory = process.memoryUsage().heapUsed;

        let start = performance.now();
        let piValue = calculatePi(digits);
        let end = performance.now();

        let endMemory = process.memoryUsage().heapUsed;

        let executionTime = end - start;
        let memoryUsage = (endMemory - startMemory) / (1024 * 1024);


        totalTime += executionTime;
        totalMemory += memoryUsage;
    }

    let totalExecTime = ((performance.now() - startReal) / 1000).toFixed(2);
    totalCpu = await getCpuUsage();

    let avgTime = (totalTime / repetitions).toFixed(2);
    let avgMemory = (totalMemory / repetitions).toFixed(2);

    return {
        totalExecutionTime: totalExecTime,
        avgExecutionTime: avgTime,
        avgMemoryUsage: avgMemory,
        avgCPUUsage: totalCpu
    };
}

app.get("/", async (req, res) => {
    let result = await computePi(1_000, 1_000);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(result);
});

function runServer() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

runServer();
