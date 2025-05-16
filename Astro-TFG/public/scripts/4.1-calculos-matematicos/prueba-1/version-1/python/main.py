import gc
import time
import random
import js  # type: ignore
import tracemalloc
from pyscript import display


def create_matrix(size):
    return [[random.random() for _ in range(size)] for _ in range(size)]


def multiply_matrices(size):
    tracemalloc.start()
    A = create_matrix(size)
    B = create_matrix(size)
    C = [[0] * size for _ in range(size)]

    start = time.time()
    gc.collect()
    for i in range(size):
        for j in range(size):
            _sum = 0
            for k in range(size):
                _sum += A[i][k] * B[k][j]
            C[i][j] = _sum

    execution_time = (time.time() - start) * 1000
    memory_usage = tracemalloc.get_traced_memory()[1] / (1024 * 1024)
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


js.window.run_py_benchmark = run_py_benchmark
