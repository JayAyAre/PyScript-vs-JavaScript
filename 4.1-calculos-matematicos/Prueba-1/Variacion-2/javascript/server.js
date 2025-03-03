const express = require("express");
const cors = require("cors");
const os = require("os");
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

    // ET (Execution Time)

    let executionTime = (endReal - startReal).toFixed(2);

    // CPU

    let cpuUsage = cpuAvg.toFixed(2);

    // RAM

    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsage = ((endMemory - startMemory) / (1024 * 1024)).toFixed(2); // Convertir a MB

    return {
        executionTime: executionTime,
        cpuUsage: cpuUsage,
        memoryUsage: memoryUsage
    };
}

app.get("/", async (req, res) => {
    let result = await multiplyMatrices(1000);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
