import osu from 'node-os-utils';
import cors from 'cors';
import express from 'express';
import tf from '@tensorflow/tfjs';

const app = express();
const port = 3000;

app.use(cors());

const cpu = osu.cpu;

async function multiplyMatrices(size) {
    const startMemory = process.memoryUsage().rss / (1024 * 1024);
    let startReal = performance.now();
    let cpuAvg = await cpu.usage();

    let A = tf.randomNormal([size, size]);
    let B = tf.randomNormal([size, size]);

    let C = tf.matMul(A, B);
    await C.data();

    let endReal = performance.now();

    let executionTime = (endReal - startReal).toFixed(2);

    let cpuUsage = cpuAvg.toFixed(2);

    const endMemory = process.memoryUsage().rss / (1024 * 1024);
    const memoryUsage = (endMemory - startMemory).toFixed(2);

    return {
        size: `${size}x${size}`,
        time: executionTime,
        cpu_usage: cpuUsage,
        memory_usage: memoryUsage
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
