import time
import random
import js  # type: ignore
import tracemalloc
from pyscript import display  # type: ignore


def create_matrix(size):
    return [[random.random() for _ in range(size)] for _ in range(size)]


def multiply_matrices(size):
    A = create_matrix(size)
    B = create_matrix(size)
    C = [[0] * size for _ in range(size)]

    start = time.time()

    for i in range(size):
        for j in range(size):
            _sum = 0
            for k in range(size):
                _sum += A[i][k] * B[k][j]
            C[i][j] = _sum

    end = time.time()

    # ET (Execution Time)

    execution_time = (end - start) * 1000
    display(f"ET: {round(execution_time, 2)} ms", target="pyscript-output")

    # PLT

    js.endTimerWebAssembly()

    # RAM

    memory_usage = tracemalloc.get_traced_memory()[1] / (1024 * 1024)
    display(f"RAM: {round(memory_usage, 2)} MB",
            target="pyscript-output")
    tracemalloc.stop()


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    tracemalloc.start()
    multiply_matrices(300)
