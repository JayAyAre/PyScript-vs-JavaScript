import math
import time
import random
import tracemalloc
import gc
import js  # type: ignore
from pyscript import display


def create_data_structure(my_list, size):
    for _ in range(size):
        my_list.append(random.randint(0, 1000))


def transform_data_structure(my_list):
    aux_list = my_list.copy()
    for i in range(len(aux_list)):
        aux_list[i] = (aux_list[i] ** 2 + math.log(aux_list[i] + 1)
                       ) / math.sqrt(aux_list[i] + 1)


def sort_data_structure(my_list):
    aux_list = my_list.copy()
    aux_list.sort()


def search_in_data_structure(my_list, value):
    for item in my_list:
        if item == value:
            return True
    return False


def filter_data_structure(my_list, threshold):
    return [x for x in my_list if x > threshold]


def delete_from_data_structure(my_list, value):
    i = 0
    while i < len(my_list):
        if my_list[i] == value:
            my_list.pop(i)
        else:
            i += 1


def get_memory_usage():
    return tracemalloc.get_traced_memory()[1] / (1024 * 1024)


def do_operations(size):
    gc.collect()
    tracemalloc.start()
    my_list = []
    metrics = {}

    start_total = time.perf_counter()
    start_op = time.perf_counter()

    create_data_structure(my_list, size)

    tracemalloc.stop()

    metrics['create'] = {
        'time': (time.perf_counter() - start_op) * 1000,
        'memory': get_memory_usage()
    }

    operations = [
        ('transform', transform_data_structure, (my_list,)),
        ('sort', sort_data_structure, (my_list,)),
        ('search', search_in_data_structure, (my_list, random.choice(my_list))),
        ('filter', filter_data_structure, (my_list, 500)),
        ('delete', delete_from_data_structure, (my_list, random.choice(my_list)))
    ]

    for op_name, op_func, args in operations:
        gc.collect()
        tracemalloc.start()
        start_op = time.perf_counter()

        op_func(*args)

        metrics[op_name] = {
            'time': float((time.perf_counter() - start_op) * 1000),
            'memory': get_memory_usage()
        }

        tracemalloc.stop()

    metrics['output'] = {
        'total_time': float((time.perf_counter() - start_total) * 1000),
        'memory_peak': max([op['memory'] for op in metrics.values() if 'memory' in op])
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
    js.hideExecutionLoader()


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    do_operations(10_000_000)


js.window.run_py_benchmark = run_py_benchmark
