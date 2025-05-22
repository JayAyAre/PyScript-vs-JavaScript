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

    const totalExecTime = (performance.now() - startTotal).toFixed(2);
    const avgTime = (totalTime / repetitions).toFixed(2);
    const avgMemory = (totalMemory / repetitions).toFixed(2);
    const avgCPU = (totalCPU / repetitions).toFixed(2);

    return {
        totalExecutionTime: `Total ET (1000x): ${totalExecTime} ms`,
        avgExecutionTime: `ET (avg, 1000x): ${avgTime} ms`,
        avgMemoryUsage: `RAM (avg, 1000x): ${avgMemory} MB`,
        avgCPUUsage: `CPU (avg, 1000x): ${avgCPU} %`
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
