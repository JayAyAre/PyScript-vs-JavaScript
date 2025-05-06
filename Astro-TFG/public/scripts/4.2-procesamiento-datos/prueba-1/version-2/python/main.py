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
    metrics['output'] = {
        'total_time': (end_total - start_total) * 1000,
        'memory_peak': max_memory
    }
    tracemalloc.stop()

    for op, data in metrics.items():
        if op != 'output':
            display(
                f"{op.upper()} - Time: {data['time']:.2f} ms | RAM: {data['memory']:.2f} MB",
                target=f"pyscript-{op}"
            )

    display(
        f"TOTAL - Time: {metrics['output']['total_time']:.2f} ms | "
        f"RAM Peak: {metrics['output']['memory_peak']:.2f} MB",
        target="pyscript-output"
    )


def run_py_benchmark(event):
    js.clearCell('pyscript')
    do_operations(10_000_000)
