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

function getMemoryUsageJS() {
    return Math.max(process.memoryUsage().heapUsed / (1024 * 1024), 0);
}

async function getCpuUsage() {
    return Math.max(await cpu.usage(), 0);
}

async function computePi(digits, repetitions) {
    let totalTime = 0;
    let totalMemory = 0;
    let totalCPU = 0;

    let startReal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        const startMemory = getMemoryUsageJS();
        const start = performance.now();
        const cpuBefore = await getCpuUsage();

        let piValue = calculatePi(digits);

        const cpuAfter = await getCpuUsage();
        const end = performance.now();
        const endMemory = getMemoryUsageJS();


        totalTime += (end - start);
        totalMemory += (endMemory - startMemory);
        totalCPU += (cpuAfter - cpuBefore);
    }

    const totalExecTime = (performance.now() - startReal).toFixed(2);
    const avgTime = (totalTime / repetitions).toFixed(2);
    const avgMemory = Math.abs((totalMemory / repetitions)).toFixed(2);
    const avgCPU = Math.abs((totalCPU / repetitions)).toFixed(2);

    return {
        totalExecutionTime: totalExecTime,
        avgExecutionTime: avgTime,
        avgMemoryUsage: avgMemory,
        avgCPUUsage: avgCPU
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
