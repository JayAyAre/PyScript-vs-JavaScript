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


def do_operations(size):
    my_list = []
    metrics = {}
    start_total = time.time()

    # CREATE
    tracemalloc.start()
    start_op = time.time()
    create_data_structure(my_list, size)
    current_mem = tracemalloc.get_traced_memory()[1] / (1024 * 1024)
    metrics['CREATE'] = {
        'time': (time.time() - start_op) * 1000,
        'memory': current_mem
    }
    tracemalloc.stop()

    operations = [
        ('TRANSFORM', transform_data_structure, (my_list,)),
        ('SORT',      sort_data_structure,      (my_list,)),
        ('SEARCH',    search_in_data_structure, (my_list, random.choice(my_list))),
        ('FILTER',    filter_data_structure,    (my_list, 500)),
        ('DELETE',    delete_from_data_structure, (my_list, random.choice(my_list)))
    ]

    for name, func, args in operations:
        tracemalloc.start()
        start_op = time.time()
        gc.collect()
        func(*args)
        current_mem = tracemalloc.get_traced_memory()[1] / (1024 * 1024)
        metrics[name] = {
            'time': (time.time() - start_op) * 1000,
            'memory': abs(current_mem)
        }
        tracemalloc.stop()

    end_total = time.time()
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
