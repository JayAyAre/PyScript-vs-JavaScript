import gc
import time
import js  # type: ignore
import tracemalloc
from pyscript import display  # type: ignore
import numpy as np


def create_matrix(size):
    return np.random.rand(size, size)


def multiply_matrices(size):
    tracemalloc.start()

    A = create_matrix(size)
    B = create_matrix(size)

    start = time.time()
    gc.collect()
    C = np.dot(A, B)

    end = time.time()

    # ET (Execution Time)

    execution_time = (end - start) * 1000

    # RAM

    memory_usage = tracemalloc.get_traced_memory()[1] / (1024 * 1024)
    tracemalloc.stop()

    output_element = js.document.getElementById("pyscript-output")
    output_element.innerHTML += f"""
        <div style="font-weight: bold;">Matriz {size}x{size}</div>
        <div>ET: {round(execution_time, 2)} ms</div>
        <div>RAM: {round(memory_usage, 2)} MB</div>
    """

    # PLT

    js.endTimerWebAssembly()


def run_py_benchmark(event):
    js.clearCell("pyscript-output")

    multiply_matrices(500)
    multiply_matrices(1000)
    multiply_matrices(2000)


js.window.run_py_benchmark = run_py_benchmark
