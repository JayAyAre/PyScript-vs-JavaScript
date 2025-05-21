import time
import tracemalloc
import gc
import js  # type: ignore
from pyscript import display
import numpy as np

seed = int(time.time() * 1000) % 2**32
rng = np.random.default_rng(seed)


def create_data_structure(size):
    return rng.integers(0, 1001, size=size)


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
    start_total = time.perf_counter()
    tracemalloc.start()
    max_memory = 0

    start_op = time.perf_counter()
    my_array = create_data_structure(size)
    current_mem = tracemalloc.get_traced_memory()
    metrics['create'] = {
        'time': (time.perf_counter() - start_op) * 1000,
        'memory': current_mem[1] / (1024 * 1024)
    }
    max_memory = max(max_memory, current_mem[1] / (1024 * 1024))
    tracemalloc.stop()

    operations = [
        ('transform', transform_data_structure, (my_array,)),
        ('sort', sort_data_structure, (my_array,)),
        ('search', search_in_data_structure, (my_array, rng.choice(my_array))),
        ('filter', filter_data_structure, (my_array, 500)),
        ('delete', delete_from_data_structure, (my_array, rng.choice(my_array)))
    ]

    for op_name, op_func, args in operations:
        tracemalloc.start()
        start_op = time.perf_counter()
        gc.collect()

        result = op_func(*args)
        op_time = (time.perf_counter() - start_op) * 1000

        current_mem = tracemalloc.get_traced_memory()
        op_memory = current_mem[1] / (1024 * 1024)

        metrics[op_name] = {
            'time': op_time,
            'memory': abs(op_memory)
        }

        max_memory = max(max_memory, op_memory)
        tracemalloc.stop()

    metrics['output'] = {
        'total_time': (time.perf_counter() - start_total) * 1000,
        'memory_peak': max_memory
    }

    tracemalloc.stop()
    display_results(metrics)


def display_results(results):
    for op, data in results.items():
        if op != 'output':
            display(
                f"{op.upper()} - Time: {data['time']:.2f} ms | RAM: {data['memory']:.2f} MB",
                target="pyscript-output"
            )
    display(
        f"Total ET: {results['output']['total_time']:.2f} ms", target="pyscript-output"
    )
    display(
        f"RAM Peak: {results['output']['memory_peak']:.2f} MB", target="pyscript-output"
    )
    js.window.hideExecutionLoader()


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    do_operations(10_000_000)


js.window.run_py_benchmark = run_py_benchmark
