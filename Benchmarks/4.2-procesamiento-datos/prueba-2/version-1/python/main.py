import time
import tracemalloc
import gc
import js  # type: ignore
from pyscript import display
import random


def create_data_structure(size):
    return [random.randint(0, 1000) for _ in range(size)]


def calculate_sum(data):
    return sum(data)


def calculate_mean(data):
    return sum(data) / len(data)


def calculate_std(data):
    mean = calculate_mean(data)
    return (sum((x - mean) ** 2 for x in data) / len(data)) ** 0.5


def do_statistical_analysis(size):
    metrics = {}
    start_total = time.perf_counter()
    tracemalloc.start()

    max_memory = 0

    start_op = time.perf_counter()
    data = create_data_structure(size)
    current_mem = tracemalloc.get_traced_memory()

    metrics['create'] = {
        'time': (time.perf_counter() - start_op) * 1000,
        'memory': abs(current_mem[1] / (1024 * 1024))
    }
    max_memory = max(max_memory, current_mem[1] / (1024 * 1024))
    tracemalloc.stop()

    operations = [
        ('sum', calculate_sum, (data,)),
        ('mean', calculate_mean, (data,)),
        ('std', calculate_std, (data,))
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


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    do_statistical_analysis(10_000_000)
