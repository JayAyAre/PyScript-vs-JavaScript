function createDataStructure(my_list, size) {
    for (let i = 0; i < size; i++) {
        my_list.push(Math.floor(Math.random() * 1001));
    }
}

function transformDataStructure(my_list) {
    const aux_list = [...my_list];
    for (let i = 0; i < aux_list.length; i++) {
        const num = aux_list[i];
        aux_list[i] = (Math.pow(num, 2) + Math.log(num + 1)) / Math.sqrt(num + 1);
    }
}

function sortDataStructure(my_list) {
    const aux_list = [...my_list];
    aux_list.sort((a, b) => a - b);
}

function searchInDataStructure(my_list, value) {
    for (let i = 0; i < my_list.length; i++) {
        if (my_list[i] === value) {
            return true;
        }
    }
    return false;
}

function filterDataStructure(my_list, threshold) {
    const filtered = [];
    for (let i = 0; i < my_list.length; i++) {
        if (my_list[i] > threshold) {
            filtered.push(my_list[i]);
        }
    }
    return filtered;
}

function deleteFromDataStructure(my_list, value) {
    let i = 0;
    while (i < my_list.length) {
        if (my_list[i] === value) {
            my_list.splice(i, 1);
        } else {
            i++;
        }
    }
}

function getMemoryUsageJS() {
    if (performance.memory) {
        return Math.max(performance.memory.usedJSHeapSize / (1024 * 1024), 0);
    }
    return -1;
}

let max_memory = 0;

function doOperations(size) {
    const my_list = [];
    const metrics = {};
    const start_total = performance.now();

    let start_op = performance.now();
    createDataStructure(my_list, size);
    metrics['create'] = {
        'time': performance.now() - start_op,
        'memory': getMemoryUsageJS()
    };

    max_memory = Math.max(max_memory, getMemoryUsageJS());

    const operations = [
        ['transform', transformDataStructure, [my_list]],
        ['sort', sortDataStructure, [my_list]],
        ['search', searchInDataStructure, [my_list, my_list[Math.floor(Math.random() * my_list.length)]]],
        ['filter', filterDataStructure, [my_list, 500]],
        ['delete', deleteFromDataStructure, [my_list, my_list[Math.floor(Math.random() * my_list.length)]]]
    ];

    for (const [op_name, op_func, args] of operations) {
        start_op = performance.now();

        const mem_before = getMemoryUsageJS();
        op_func(...args);
        const mem_after = getMemoryUsageJS();

        if (mem_after > max_memory) max_memory = mem_after;

        metrics[op_name] = {
            'time': performance.now() - start_op,
            'memory': Math.abs(mem_after - mem_before)
        };
    }

    metrics['output'] = {
        'total_time': performance.now() - start_total,
        'memory_peak': max_memory
    };
    displayResults(metrics);
}

function displayResults(results) {
    const output = document.getElementById("javascript-output");

    for (const [op, data] of Object.entries(results)) {
        if (op !== 'output') {
            const timeDiv = document.createElement("div");
            timeDiv.textContent =
                `${op.toUpperCase()} - Time: ${data.time.toFixed(2)} ms | RAM: ${data.memory.toFixed(2)} MB`;
            output.appendChild(timeDiv);
        }
    }

    const timeTotalDiv = document.createElement("div");
    timeTotalDiv.textContent =
        `Total ET: ${results.output.total_time.toFixed(2)} ms`;
    output.appendChild(timeTotalDiv);

    const memoryDiv = document.createElement("div");
    memoryDiv.textContent =
        `RAM Peak: ${results.output.memory_peak.toFixed(2)} MB`;
    output.appendChild(memoryDiv);
}


function runJsBenchmark() {
    window.clearCell("javascript-output");
    doOperations(10_000_000);
}
