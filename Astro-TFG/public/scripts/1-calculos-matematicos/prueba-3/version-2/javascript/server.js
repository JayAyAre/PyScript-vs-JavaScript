import express from 'express';
import cors from 'cors';
import { create, all } from 'mathjs';
import osu from 'node-os-utils';

const math = create(all);
const app = express();
const port = 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

const cpu = osu.cpu;

let highPrecisionMath;

function initHighPrecisionMath() {
    const { create, all } = math;

    highPrecisionMath = create(all, {
        number: 'BigNumber',
        precision: 10_000
    });
}

function calculatePiGaussLegendre(digits) {
    initHighPrecisionMath()
    const math = highPrecisionMath;

    math.config({ precision: digits });

    const one = math.bignumber(1);
    const half = math.bignumber(0.5);
    const quarter = math.bignumber(0.25);
    const two = math.bignumber(2);

    let a = one;
    let b = math.sqrt(half);
    let t = quarter;
    let p = one;

    const iterations = Math.max(5, Math.floor(Math.log10(digits) * 1.4));

    for (let i = 0; i < iterations; i++) {
        const aNext = math.divide(math.add(a, b), two);
        b = math.sqrt(math.multiply(a, b));
        const diff = math.subtract(a, aNext);
        t = math.subtract(t, math.multiply(p, math.pow(diff, two)));
        a = aNext;
        p = math.multiply(p, two);
    }

    const pi = math.divide(math.pow(math.add(a, b), 2), math.multiply(4, t));
    return pi;
}

async function runBenchmark(repetitions, digits) {
    const results = {
        totalTime: 0,
        totalMemory: 0,
        totalCPU: 0,
        executions: []
    };

    const startTotal = process.hrtime();

    for (let i = 0; i < repetitions; i++) {
        const startMemory = process.memoryUsage().heapUsed;
        const cpuStart = await cpu.usage();
        const startTime = process.hrtime();

        const pi = calculatePiGaussLegendre(digits);

        const endTime = process.hrtime(startTime);
        const cpuEnd = await cpu.usage();
        const endMemory = process.memoryUsage().heapUsed;

        const execTimeMs = (endTime[0] * 1000) + (endTime[1] / 1000000);

        const memoryUsageMb = (endMemory - startMemory) / (1024 * 1024);

        const cpuUsage = cpuEnd - cpuStart;

        results.totalTime += execTimeMs;
        results.totalMemory += memoryUsageMb;
        results.totalCPU += cpuUsage;
    }

    const endTotal = process.hrtime(startTotal);
    const totalExecTimeMs = (endTotal[0] * 1000) + (endTotal[1] / 1000000);

    return {
        totalExecutionTime: `Total ET (1000x): ${totalExecTimeMs.toFixed(2)} ms`,
        avgExecutionTime: `ET (avg, 1000x): ${(results.totalTime / repetitions).toFixed(2)} ms`,
        avgMemoryUsage: `RAM (avg, 1000x): ${(results.totalMemory / repetitions).toFixed(2)} MB`,
        avgCPUUsage: `CPU (avg, 1000x): ${(results.totalCPU / repetitions).toFixed(2)} %`
    };
}

(async () => {
    const result = await runBenchmark(10, 10_000);
    const results = {
        type: null,
        data: result
    };

    console.log(JSON.stringify(results));
})();
