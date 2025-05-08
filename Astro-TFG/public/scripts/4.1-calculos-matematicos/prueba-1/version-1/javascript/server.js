import osu from 'node-os-utils';
import { performance } from 'perf_hooks';

const cpu = osu.cpu;

function createMatrix(size) {
    let matrix = new Array(size);
    for (let i = 0; i < size; i++) {
        matrix[i] = new Array(size);
        for (let j = 0; j < size; j++) {
            matrix[i][j] = Math.random();
        }
    }
    return matrix;
}

async function multiplyMatrices(size) {
    let A = createMatrix(size);
    let B = createMatrix(size);
    let C = new Array(size).fill(0).map(() => new Array(size).fill(0));

    const startMemory = process.memoryUsage().heapUsed;
    const cpuAvg = await cpu.usage();
    const startReal = performance.now();

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let sum = 0;
            for (let k = 0; k < size; k++) {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }

    const endReal = performance.now();
    const endMemory = process.memoryUsage().heapUsed;

    const time = (endReal - startReal).toFixed(2);
    const cpu_usage = ((endMemory - startMemory) / (1024 * 1024)).toFixed(2);
    const memory_usage = cpuAvg.toFixed(2);

    return {
        time: time,
        cpu_usage: cpu_usage,
        memory_usage: memory_usage
    };
}

(async () => {
    const result = await multiplyMatrices(300);
    const results = {
        type: null,
        data: result
    };
    console.log(JSON.stringify(results));
})();
