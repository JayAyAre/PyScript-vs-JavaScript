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


function getMemoryUsageJS() {
    return Math.max(process.memoryUsage().heapUsed / (1024 * 1024), 0);
}

async function getCpuUsage() {
    return Math.max(await cpu.usage(), 0);
}

async function multiplyMatrices(size) {

    let A = createMatrix(size);
    let B = createMatrix(size);
    let C = new Array(size).fill(0).map(() => new Array(size).fill(0));

    const startTime = performance.now();

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let sum = 0;
            for (let k = 0; k < size; k++) {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] = sum;
        }
    }

    const executionTime = +(performance.now() - startTime).toFixed(2);
    const memoryUsage = +getMemoryUsageJS().toFixed(2);
    const endCpu = +(await getCpuUsage()).toFixed(2);

    return {
        time: `ET: ${executionTime} ms`,
        cpu_usage: `CPU: ${endCpu} %`,
        memory_usage: `RAM: ${memoryUsage} MB`
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