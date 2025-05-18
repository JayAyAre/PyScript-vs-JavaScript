const express = require("express");
const cors = require("cors");
const osu = require("node-os-utils");
const tf = require("@tensorflow/tfjs");

const cpu = osu.cpu;
const app = express();
const port = 3000;

app.use(cors());

function getMemoryUsage() {
    return process.memoryUsage().heapUsed / (1024 * 1024);
}

async function getCpuUsage() {
    return await cpu.usage();
}

async function multiplyMatrices(size) {
    let A = tf.randomNormal([size, size]);
    let B = tf.randomNormal([size, size]);

    const startTime = performance.now();

    let C = tf.matMul(A, B);


    const executionTime = (performance.now() - startTime).toFixed(2);
    const endMemory = getMemoryUsage();
    const memoryUsage = endMemory.toFixed(2);
    const endCpu = await getCpuUsage();

    return {
        size: `${size}x${size}`,
        executionTime: executionTime,
        cpuUsage: endCpu,
        memoryUsage: memoryUsage
    };
}

app.get("/", async (req, res) => {
    let results = {
        matrices500: await multiplyMatrices(500),
        matrices1000: await multiplyMatrices(1000),
        matrices2000: await multiplyMatrices(2000)
    };
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.json(results);
});

function runServer() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

runServer();
