import osu from 'node-os-utils';
import cors from 'cors';
import express from 'express';
import tf from '@tensorflow/tfjs';

const cpu = osu.cpu;
const app = express();

app.use(cors());

function getMemoryUsageJS() {
    return Math.max(process.memoryUsage().heapUsed / (1024 * 1024), 0);
}

async function getCpuUsage() {
    return Math.max(await cpu.usage(), 0);
}

async function multiplyMatrices(size) {
    let A = tf.randomUniform([size, size], 0.0, 1.0);
    let B = tf.randomUniform([size, size], 0.0, 1.0);

    const startTime = performance.now();

    let C = tf.matMul(A, B);

    const executionTime = +(performance.now() - startTime).toFixed(2);
    const memoryUsage = +getMemoryUsageJS().toFixed(2);
    const endCpu = +(await getCpuUsage()).toFixed(2);

    return {
        size: `${size}x${size}`,
        time: `ET: ${executionTime} ms`,
        cpu_usage: `CPU: ${endCpu} %`,
        memory_usage: `RAM: ${memoryUsage} MB`
    };
}

(async () => {
    let result = {
        matrices500: await multiplyMatrices(500),
        matrices1000: await multiplyMatrices(1000),
        matrices2000: await multiplyMatrices(2000)
    };

    const results = {
        type: 'matrix',
        data: result
    };

    console.log(JSON.stringify(results));
})();
