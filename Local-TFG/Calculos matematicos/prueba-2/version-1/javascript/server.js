const express = require("express");
const cors = require("cors");
const os = require("os");
const osu = require("node-os-utils");
const { performance } = require("perf_hooks");

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

function is_prime(size) {
    if (size < 2) {
        return false;
    }
    if ([2, 3].includes(size)) {
        return true;
    }
    if (size % 2 == 0 || size % 3 == 0) {
        return false;
    }
    for (let k = 5; k < Math.sqrt(size) + 1; k += 2) {
        if (size % k == 0) {
            return false;
        }
    }
    return true;
}

async function primes_to_n(size) {
    const startTime = performance.now();

    let primes = [];

    if (size > 2) {
        primes.push(2);
    }

    for (let i = 3; i < size; i += 2) {
        if (is_prime(i)) {
            primes.push(i);
        }
    }

    const executionTime = +(performance.now() - startTime).toFixed(2);
    const memoryUsage = +getMemoryUsageJS().toFixed(2);
    const endCpu = +(await getCpuUsage()).toFixed(2);

    return {
        executionTime: executionTime,
        cpuUsage: endCpu,
        memoryUsage: memoryUsage
    };
}

app.get("/", async (req, res) => {
    let result = await primes_to_n(1_000_000);
    res.json(result);
});

function runServer() {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

runServer();
