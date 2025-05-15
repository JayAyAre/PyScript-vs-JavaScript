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
    for i in range(len(my_list)):
        if my_list[i] == value:
            return True
    return False


def filter_data_structure(my_list, threshold):
    filtered = []
    for i in range(len(my_list)):
        if my_list[i] > threshold:
            filtered.append(my_list[i])
    return filtered


def delete_from_data_structure(my_list, value):
    i = 0
    while i < len(my_list):
        if my_list[i] == value:
            my_list.pop(i)
        else:
            i += 1


def do_operations(size):
    my_list = []
    metrics = {}
    start_total = time.time()

    tracemalloc.start()
    start_op = time.time()
    create_data_structure(my_list, size)
    current_mem = tracemalloc.get_traced_memory()
    metrics['create'] = {
        'time': (time.time() - start_op) * 1000,
        'memory': current_mem[1] / (1024 * 1024)
    }
    tracemalloc.stop()

    operations = [
        ('transform', transform_data_structure, (my_list,)),
        ('sort', sort_data_structure, (my_list,)),
        ('search', search_in_data_structure, (my_list, random.choice(my_list))),
        ('filter', filter_data_structure, (my_list, 500)),
        ('delete', delete_from_data_structure, (my_list, random.choice(my_list)))
    ]

    for op_name, op_func, args in operations:
        tracemalloc.start()
        start_op = time.time()
        gc.collect()
        op_func(*args)
        current_mem = tracemalloc.get_traced_memory()
        metrics[op_name] = {
            'time': float((time.time() - start_op) * 1000),
            'memory': abs(current_mem[1] / (1024 * 1024))
        }
        tracemalloc.stop()

    end_total = time.time()

    metrics['output'] = {
        'total_time': float((end_total - start_total) * 1000),
        'memory_peak': max([op['memory'] for op in metrics.values() if 'memory' in op])
    }

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
