const express = require("express");
const cors = require("cors");
const os = require("os");
const osu = require("node-os-utils");

const app = express();
const port = 3000;

app.use(cors());

const cpu = osu.cpu;

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

async function computePi(digits, repetitions) {
    let totalTime = 0;
    let totalMemory = 0;
    let totalCpu = 0;

    let startReal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        const startMemory = process.memoryUsage().heapUsed;
        let cpuBefore = await cpu.usage();

        let start = performance.now();
        let piValue = calculatePi(digits);
        let end = performance.now();

        let cpuAfter = await cpu.usage();
        let endMemory = process.memoryUsage().heapUsed;

        let executionTime = end - start;
        let memoryUsage = (endMemory - startMemory) / (1024 * 1024);
        let cpuUsage = cpuAfter - cpuBefore;

        totalTime += executionTime;
        totalMemory += memoryUsage;
        totalCpu += cpuUsage;
    }

    // ET (Execution Time)

    let endReal = performance.now();
    let totalExecTime = ((endReal - startReal) / 1000).toFixed(2);
    let avgTime = (totalTime / repetitions).toFixed(2);

    // RAM

    let avgMemory = (totalMemory / repetitions).toFixed(2);

    // CPU

    let avgCpu = (totalCpu / repetitions).toFixed(2);

    return {
        totalExecutionTime: totalExecTime,
        avgExecutionTime: avgTime,
        avgMemoryUsage: avgMemory,
        avgCPUUsage: avgCpu
    };
}

app.get("/", async (req, res) => {
    let result = await computePi(1000, 1000);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
