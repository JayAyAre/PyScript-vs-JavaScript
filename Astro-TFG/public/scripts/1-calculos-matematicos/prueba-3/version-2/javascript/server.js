import express from 'express';
import cors from 'cors';
import { create, all } from 'mathjs';
import osu from 'node-os-utils';

const math = create(all);
const app = express();
const cpu = osu.cpu;

app.use(cors());



let highPrecisionMath;

function initHighPrecisionMath() {
    const { create, all } = math;

    highPrecisionMath = create(all, {
        number: 'BigNumber',
        precision: 10_000
    });
}

function getMemoryUsageJS() {
    return Math.max(process.memoryUsage().heapUsed / (1024 * 1024), 0);
}

async function getCpuUsage() {
    return Math.max(await cpu.usage(), 0);
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
    let totalTime = 0;
    let totalMemory = 0;
    let totalCPU = 0;

    const startTotal = performance.now();

    for (let i = 0; i < repetitions; i++) {
        const startMemory = getMemoryUsageJS();
        const start = performance.now();
        const cpuBefore = await getCpuUsage();

        const pi = calculatePiGaussLegendre(digits);

        const cpuAfter = await getCpuUsage();
        const end = performance.now();
        const endMemory = getMemoryUsageJS();

        const elapsed = end - start;
        const memoryUsed = endMemory - startMemory;
        const cpuUsed = cpuAfter - cpuBefore;

        totalTime += elapsed;
        totalMemory += memoryUsed;
        totalCPU += cpuUsed;
    }

    const totalExecTime = (performance.now() - startTotal);
    const avgTime = totalTime / repetitions;
    const avgMemory = math.abs(totalMemory / repetitions);
    const avgCPU = math.abs(totalCPU / repetitions);

    return {
        totalExecutionTime: `Total ET (10x): ${totalExecTime.toFixed(2)} ms`,
        avgExecutionTime: `ET (avg, 10x): ${avgTime.toFixed(2)} ms`,
        avgMemoryUsage: `RAM (avg, 10x): ${avgMemory.toFixed(2)} MB`,
        avgCPUUsage: `CPU (avg, 10x): ${avgCPU.toFixed(2)} %`
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
