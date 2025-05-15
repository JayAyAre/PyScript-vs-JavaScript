const express = require("express");
const cors = require("cors");
const osu = require("node-os-utils");

const app = express();
const port = 3000;

app.use(cors());
const cpu = osu.cpu;

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

    let startTotal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        const startMemory = process.memoryUsage().heapUsed;
        let start = performance.now();

        let cpuBefore = await cpu.usage();

        sieveOfEratosthenes(n);

        let end = performance.now();
        totalTime += (end - start);

        let cpuAfter = await cpu.usage();
        totalCPU += cpuAfter;

        const endMemory = process.memoryUsage().heapUsed;
        totalMemory += (endMemory - startMemory) / (1024 * 1024);
    }

    let endTotal = performance.now();
    let totalExecTime = (endTotal - startTotal).toFixed(2);
    let avgTime = (totalTime / repetitions).toFixed(2);

    let avgMemory = (totalMemory / repetitions).toFixed(2);

    let avgCPU = (totalCPU / repetitions).toFixed(2);

    return {
        totalExecutionTime: totalExecTime,
        avgExecutionTime: avgTime,
        avgMemoryUsage: avgMemory,
        avgCPUUsage: avgCPU
    };
}

app.get("/", async (req, res) => {
    let result = await benchmarkPrimesJS(50, 10_000);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
