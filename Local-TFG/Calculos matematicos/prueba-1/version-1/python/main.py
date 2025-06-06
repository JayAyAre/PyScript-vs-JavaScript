import gc
import time
import random
import js  # type: ignore
import tracemalloc
from pyscript import display


def create_matrix(size):
    return [[random.random() for _ in range(size)] for _ in range(size)]


def get_memory_usage():
    return tracemalloc.get_traced_memory()[1] / (1024 * 1024)


def multiply_matrices(size):
    gc.collect()
    tracemalloc.start()

    A = create_matrix(size)
    B = create_matrix(size)

    C = [[0] * size for _ in range(size)]

    start = time.perf_counter()

    for i in range(size):
        for j in range(size):
            _sum = 0
            for k in range(size):
                _sum += A[i][k] * B[k][j]
            C[i][j] = _sum

    execution_time = (time.perf_counter() - start) * 1000
    memory_usage = abs(get_memory_usage())
    tracemalloc.stop()

    results = {
        "execution_time": execution_time,
        "memory_usage": memory_usage
    }

    display_results(results)
    js.endTimerWebAssembly()


def display_results(results):
    display(f"ET: {results['execution_time']:.2f} ms",
            target="pyscript-output")
    display(f"RAM: {results['memory_usage']:.2f} MB", target="pyscript-output")


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    multiply_matrices(300)
