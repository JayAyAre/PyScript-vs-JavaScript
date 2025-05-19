import osu from 'node-os-utils';
import cors from 'cors';
import express from 'express';

const app = express();

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

function getMemoryUsage() {
    return process.memoryUsage().heapUsed;
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

        let executionTime = performance.now() - start;
        let memoryUsage = (getMemoryUsage - startMemory) / (1024 * 1024);

        totalTime += executionTime;
        totalMemory += memoryUsage;
    }

    let totalExecTime = ((performance.now() - startReal) / 1000).toFixed(2);
    totalCpu = await getCpuUsage();

    let avgTime = (totalTime / repetitions).toFixed(2);
    let avgMemory = (totalMemory / repetitions).toFixed(2);

    return {
        totalExecutionTime: `Total ET (1000x): ${totalExecTime} ms`,
        avgExecutionTime: `ET (avg, 1000x): ${avgTime} ms`,
        avgMemoryUsage: `RAM (avg, 1000x): ${avgMemory} MB`,
        avgCPUUsage: `CPU (avg, 1000x): ${totalCpu} %`
    };
}

(async () => {
    let result = await computePi(1_000, 1_000);
    const results = {
        type: null,
        data: result
    };

    console.log(JSON.stringify(results));
})();
