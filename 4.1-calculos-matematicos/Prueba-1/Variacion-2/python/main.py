import time
import js  # type: ignore
import tracemalloc
from pyscript import display  # type: ignore
import numpy as np  # Importamos numpy


def create_matrix(size):
    return np.random.rand(size, size)


def multiply_matrices(size):
    tracemalloc.start()
    A = create_matrix(size)
    B = create_matrix(size)
    C = np.zeros((size, size))

    start = time.time()

    C = np.dot(A, B)

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
    multiply_matrices(500)
    multiply_matrices(1000)
    multiply_matrices(2000)
