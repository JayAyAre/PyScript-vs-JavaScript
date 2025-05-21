const express = require("express");
const cors = require("cors");
const osu = require("node-os-utils");
const tf = require("@tensorflow/tfjs");

const cpu = osu.cpu;
const app = express();
const port = 3000;

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
