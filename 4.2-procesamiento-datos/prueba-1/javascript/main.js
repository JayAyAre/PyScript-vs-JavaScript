function runNodeBenchmark() {
    clearCell("nodeJs-output");
    fetch("http://localhost:3000/")
        .then(response => response.json())
        .then(data => {
            const outputDiv = document.getElementById("nodeJs-output");
            outputDiv.innerHTML = `
                <div>Total ET (1000x): ${data.totalExecutionTime} ms</div>
                <div>ET (avg, 1000x): ${data.avgExecutionTime} ms</div>
                <div>CPU (avg, 1000x): ${data.avgCPUUsage} %</div>
                <div>RAM (avg, 1000x): ${data.avgMemoryUsage} MB</div>
            `;
        })
        .catch(error => console.error("Error:", error));
}

function create_data_structure(my_list, size) {
    for (let i = 0; i < size; i++) {
        my_list.push(Math.floor(Math.random() * 1001));
    }
}

function transform_data_structure(my_list) {
    const aux_list = [...my_list];
    for (let i = 0; i < aux_list.length; i++) {
        const num = aux_list[i];
        aux_list[i] = (Math.pow(num, 2) + Math.log(num + 1)) / Math.sqrt(num + 1);
    }
}

function sort_data_structure(my_list) {
    const aux_list = [...my_list];
    aux_list.sort((a, b) => a - b);
}

function search_in_data_structure(my_list, value) {
    for (let i = 0; i < my_list.length; i++) {
        if (my_list[i] === value) {
            return true;
        }
    }
    return false;
}

function filter_data_structure(my_list, threshold) {
    const filtered = [];
    for (let i = 0; i < my_list.length; i++) {
        if (my_list[i] > threshold) {
            filtered.push(my_list[i]);
        }
    }
    return filtered;
}

function delete_from_data_structure(my_list, value) {
    let i = 0;
    while (i < my_list.length) {
        if (my_list[i] === value) {
            my_list.splice(i, 1);
        } else {
            i++;
        }
    }
}

function do_operations(size) {
    const my_list = [];
    const metrics = {};
    const start_total = performance.now();
    let max_memory = 0;

    const measureMemory = () => {
        if (performance.memory) {
            const current = performance.memory.usedJSHeapSize / (1024 * 1024);
            max_memory = Math.max(max_memory, current) < 0 ? -1 * (max_memory) : max_memory;
            return current;
        }
        return 0;
    };

    let start_op = performance.now();
    create_data_structure(my_list, size);
    metrics['create'] = {
        'time': performance.now() - start_op,
        'memory': measureMemory()
    };

    const operations = [
        ['transform', transform_data_structure, [my_list]],
        ['sort', sort_data_structure, [my_list]],
        ['search', search_in_data_structure, [my_list, my_list[Math.floor(Math.random() * my_list.length)]]],
        ['filter', filter_data_structure, [my_list, 500]],
        ['delete', delete_from_data_structure, [my_list, my_list[Math.floor(Math.random() * my_list.length)]]]
    ];

    for (const [op_name, op_func, args] of operations) {
        start_op = performance.now();

        if (window.gc) window.gc();


        const mem_before = measureMemory();
        op_func(...args);
        const mem_after = measureMemory();

        metrics[op_name] = {
            'time': performance.now() - start_op,
            'memory': (mem_after - mem_before) < 0 ? -1 * (mem_after - mem_before) : (mem_after - mem_before)
        };
    }

    metrics['output'] = {
        'total_time': performance.now() - start_total,
        'memory_peak': max_memory
    };

    for (const [op, data] of Object.entries(metrics)) {
        if (op !== 'output') {
            let element = document.getElementById(`javascript-${op}`);
            if (element) {
                element.innerHTML = `${op.toUpperCase()} - Time: ${data.time.toFixed(2)} ms | RAM: ${data.memory.toFixed(2)} MB`;
            }
        }
    }

    const outputElement = document.getElementById("javascript-output");
    if (outputElement) {
        outputElement.innerHTML =
            `TOTAL - Time: ${metrics['output'].total_time.toFixed(2)} ms | ` +
            `RAM Peak: ${metrics['output'].memory_peak.toFixed(2)} MB`;
    }
}

function runJSBenchmark() {
    clearCell("javascript");
    do_operations(10_000_000);
}