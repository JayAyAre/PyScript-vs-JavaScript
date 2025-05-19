import osu from 'node-os-utils';
import express from 'express';
import cors from 'cors';

const app = express();
const cpu = osu.cpu;

app.use(cors());

function getMemoryUsage() {
    return process.memoryUsage().heapUsed / (1024 * 1024);
}

async function getCpuUsage() {
    return await cpu.usage();
}

function sieveOfEratosthenes(n) {
    let primes = new Uint8Array(n + 1).fill(1);
    primes[0] = primes[1] = 0;

    for (let i = 2; i * i <= n; i++) {
        if (primes[i]) {
            for (let j = i * i; j <= n; j += i) {
                primes[j] = 0;
            }
        }
    }

    return primes.reduce((acc, val, idx) => val ? [...acc, idx] : acc, []);
}

async function benchmarkPrimesJS(repetitions, n) {
    let totalTime = 0;
    let totalMemory = 0;
    let totalCPU = 0;

    const startTotal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        const startMemory = getMemoryUsage();
        const start = performance.now();
        const cpuBefore = await getCpuUsage();

        sieveOfEratosthenes(n);

        const cpuAfter = await getCpuUsage();
        const end = performance.now();
        const endMemory = getMemoryUsage();

        totalTime += (end - start);
        totalMemory += (endMemory - startMemory);
        totalCPU += (cpuAfter - cpuBefore);
    }

    const totalExecTime = (performance.now() - startTotal).toFixed(2);
    const avgTime = (totalTime / repetitions).toFixed(2);
    const avgMemory = (totalMemory / repetitions).toFixed(2);
    const avgCPU = (totalCPU / repetitions).toFixed(2);

    return {
        totalExecutionTime: `Total ET (50x): ${totalExecTime} ms`,
        avgExecutionTime: `ET (avg, 50x): ${avgTime} ms`,
        avgMemoryUsage: `RAM (avg, 50x): ${avgMemory} MB`,
        avgCPUUsage: `CPU (avg, 50x): ${avgCPU} %`
    };
}

(async () => {
    let result = await benchmarkPrimesJS(50, 10_000);
    const results = {
        type: null,
        data: result
    };

    console.log(JSON.stringify(results));
})();
