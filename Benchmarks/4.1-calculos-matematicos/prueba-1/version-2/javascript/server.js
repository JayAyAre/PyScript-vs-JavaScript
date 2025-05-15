const express = require("express");
const cors = require("cors");
const osu = require("node-os-utils");
const tf = require("@tensorflow/tfjs");

const app = express();
const port = 3000;

app.use(cors());

const cpu = osu.cpu;

async function multiplyMatrices(size) {
    const startMemory = process.memoryUsage().heapUsed;
    let startReal = performance.now();
    let cpuAvg = await cpu.usage();

    let A = tf.randomNormal([size, size]);
    let B = tf.randomNormal([size, size]);

    let C = tf.matMul(A, B);
    await C.data();

    let endReal = performance.now();

    let executionTime = (endReal - startReal).toFixed(2);

    let cpuUsage = cpuAvg.toFixed(2);

    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsage = ((endMemory - startMemory) / (1024 * 1024)).toFixed(2);

    return {
        size: `${size}x${size}`,
        executionTime,
        cpuUsage,
        memoryUsage
    };
}

app.get("/", async (req, res) => {
    let results = {
        matrices500: await multiplyMatrices(500),
        matrices1000: await multiplyMatrices(1000),
        matrices2000: await multiplyMatrices(2000)
    };

    res.json(results);
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
