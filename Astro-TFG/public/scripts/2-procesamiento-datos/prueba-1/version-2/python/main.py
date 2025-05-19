from calendar import c
import time
import tracemalloc
import gc
import js  # type: ignore
from pyscript import display  # type: ignore
import numpy as np


def create_data_structure(size):
    return np.random.randint(0, 1001, size=size)


def transform_data_structure(arr):
    return (arr**2 + np.log(arr + 1)) / np.sqrt(arr + 1)


def sort_data_structure(arr):
    return np.sort(arr)


def search_in_data_structure(arr, value):
    return np.any(arr == value)


def filter_data_structure(arr, threshold):
    return arr[arr > threshold]


def delete_from_data_structure(arr, value):
    return arr[arr != value]


def do_operations(size):
    metrics = {}
    start_total = time.time()
    tracemalloc.start()
    max_memory = 0

    start_op = time.time()
    my_array = create_data_structure(size)
    current_mem = tracemalloc.get_traced_memory()
    metrics['create'] = {
        'time': (time.time() - start_op) * 1000,
        'memory': current_mem[1] / (1024 * 1024)
    }
    max_memory = max(max_memory, current_mem[1] / (1024 * 1024))
    tracemalloc.stop()

    operations = [
        ('transform', transform_data_structure, (my_array,)),
        ('sort', sort_data_structure, (my_array,)),
        ('search', search_in_data_structure,
         (my_array, np.random.choice(my_array))),
        ('filter', filter_data_structure, (my_array, 500)),
        ('delete', delete_from_data_structure,
         (my_array, np.random.choice(my_array)))
    ]

    for op_name, op_func, args in operations:
        tracemalloc.start()
        start_op = time.time()
        gc.collect()
        result = op_func(*args)
        op_time = (time.time() - start_op) * 1000
        current_mem = tracemalloc.get_traced_memory()
        op_memory = current_mem[1] / (1024 * 1024)
        metrics[op_name] = {
            'time': op_time,
            'memory': abs(op_memory)
        }
        max_memory = max(max_memory, op_memory)
        tracemalloc.stop()

    end_total = time.time()
    tracemalloc.stop()

    metrics['TOTAL'] = {
        'time': (end_total - start_total) * 1000,
        'memory': max(m['memory'] for m in metrics.values())
    }

    display("", target="pyscript-output")
    output_element = js.document.getElementById("pyscript-output")

    for op, data in metrics.items():
        if op == 'TOTAL':
            continue
        line = f"{op.upper()} - Time av. : {data['time']:.2f} ms | RAM: {data['memory']:.2f} MB"
        display(line, target="pyscript-output")

    output_element.innerHTML += f"""
        <br>
    """
    line = f"TOTAL - Time: {metrics['TOTAL']['time']:.2f} ms | RAM Peak: {metrics['TOTAL']['memory']:.2f} MB"
    display(line, target="pyscript-output")
    js.window.hideExecutionLoader()


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    do_operations(10_000_000)


js.window.run_py_benchmark = run_py_benchmark
