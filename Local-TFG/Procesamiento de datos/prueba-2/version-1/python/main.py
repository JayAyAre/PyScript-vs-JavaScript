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


def get_memory_usage():
    current, peak = tracemalloc.get_traced_memory()
    return peak / (1024 * 1024)


def do_statistical_analysis(size):
    metrics = {}
    max_memory = 0
    start_total = time.perf_counter()

    gc.collect()
    tracemalloc.start()
    start_op = time.perf_counter()
    data = create_data_structure(size)
    create_time = (time.perf_counter() - start_op) * 1000
    create_memory = get_memory_usage()
    tracemalloc.stop()

    metrics['create'] = {
        'time': create_time,
        'memory': create_memory
    }
    max_memory = max(max_memory, create_memory)

    operations = [
        ('sum', calculate_sum, (data,)),
        ('mean', calculate_mean, (data,)),
        ('std', calculate_std, (data,))
    ]

    for op_name, op_func, args in operations:
        gc.collect()
        tracemalloc.start()
        start_op = time.perf_counter()
        result = op_func(*args)
        op_time = (time.perf_counter() - start_op) * 1000
        op_memory = get_memory_usage()
        tracemalloc.stop()

        metrics[op_name] = {
            'time': op_time,
            'memory': op_memory
        }
        max_memory = max(max_memory, op_memory)

    metrics['output'] = {
        'total_time': (time.perf_counter() - start_total) * 1000,
        'memory_peak': max_memory
    }

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
