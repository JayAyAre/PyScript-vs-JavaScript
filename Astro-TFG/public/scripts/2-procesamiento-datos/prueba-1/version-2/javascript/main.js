function create_data_structure(size) {
    return new Int32Array(size).map(() => Math.floor(Math.random() * 1001));
}

function transform_data_structure(arr) {
    const result = new Float64Array(arr.length);
    for (let i = 0; i < arr.length; i++) {
        const num = arr[i];
        result[i] = (num ** 2 + Math.log(num + 1)) / Math.sqrt(num + 1);
    }
    return result;
}

function sort_data_structure(arr) {
    const copy = new Float64Array(arr);
    return copy.sort((a, b) => a - b);
}

function search_in_data_structure(my_array, value) {
    return my_array.includes(value);
}

function filter_data_structure(my_array, threshold) {
    return my_array.filter(x => x > threshold);
}

function delete_from_data_structure(arr, value) {
    const count = arr.reduce((acc, val) => val !== value ? acc + 1 : acc, 0);
    const result = new arr.constructor(count);
    let index = 0;
    for (const val of arr) {
        if (val !== value) result[index++] = val;
    }
    return result;
}

let max_memory = 0;

function do_operations(size) {
    const metrics = {};
    const start_total = performance.now();

    const measureMemory = () => {
        if (performance.memory) {
            const current = performance.memory.usedJSHeapSize / (1024 * 1024);
            max_memory = Math.max(max_memory, current);
            return current;
        }
        return 0;
    };

    let start_op = performance.now();
    let my_array = create_data_structure(size);
    metrics['create'] = {
        time: performance.now() - start_op,
        memory: measureMemory(),
    };

    const operations = [
        ['transform', transform_data_structure, [my_array]],
        ['sort', sort_data_structure, [my_array]],
        [
            'search',
            search_in_data_structure,
            [my_array, my_array[Math.floor(Math.random() * my_array.length)]],
        ],
        ['filter', filter_data_structure, [my_array, 500]],
        [
            'delete',
            delete_from_data_structure,
            [my_array, my_array[Math.floor(Math.random() * my_array.length)]],
        ],
    ];

    for (const [op_name, op_func, args] of operations) {
        start_op = performance.now();
        if (window.gc) window.gc();
        const mem_before = performance.memory
            ? performance.memory.usedJSHeapSize / (1024 * 1024)
            : 0;
        let result = op_func(...args);

        const mem_after = performance.memory
            ? performance.memory.usedJSHeapSize / (1024 * 1024)
            : 0;
        metrics[op_name] = {
            time: performance.now() - start_op,
            memory: Math.abs(mem_after - mem_before),
        };
        max_memory = Math.max(max_memory, mem_after);
    }

    metrics['output'] = {
        total_time: performance.now() - start_total,
        memory_peak: max_memory,
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


window.runJsBenchmark = function () {
    window.clearCell("javascript-output");
    window.showExecutionLoader();

    requestAnimationFrame(() => {
        setTimeout(() => {
            do_operations(10_000_000);
            window.hideExecutionLoader();
        }, 0);
    });
};