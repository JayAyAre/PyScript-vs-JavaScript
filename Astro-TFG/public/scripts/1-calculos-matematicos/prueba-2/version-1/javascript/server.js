import osu from 'node-os-utils';

const cpu = osu.cpu;


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
        time: `ET: ${executionTime} ms`,
        cpu_usage: `CPU: ${endCpu} %`,
        memory_usage: `RAM: ${memoryUsage} MB`
    };
}

(async () => {
    const result = await primes_to_n(1000000);
    const results = {
        type: null,
        data: result
    };

    console.log(JSON.stringify(results));
})();
