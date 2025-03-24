const express = require("express");
const cors = require("cors");
const os = require("os");
const osu = require("node-os-utils");

const app = express();
const port = 3000;

app.use(cors());

const cpu = osu.cpu;

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
    const startMemory = process.memoryUsage().heapUsed;

    let startReal = performance.now();

    let cpuAvg = await cpu.usage();

    let primes = [];

    if (size > 2) {
        primes.push(2);
    }

    for (let i = 3; i < size; i += 2) {
        if (is_prime(i)) {
            primes.push(i);
        }
    }

    let endReal = performance.now();

    // ET (Execution Time)

    let executionTime = (endReal - startReal).toFixed(2);

    // CPU

    let cpuUsage = cpuAvg.toFixed(2);

    // RAM

    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsage = ((endMemory - startMemory) / (1024 * 1024)).toFixed(2);

    return {
        executionTime: executionTime,
        cpuUsage: cpuUsage,
        memoryUsage: memoryUsage
    };
}

app.get("/", async (req, res) => {
    let result = await primes_to_n(1000000);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
