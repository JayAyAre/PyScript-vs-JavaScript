import gc
import time
import js  # type: ignore
import tracemalloc
import numpy as np
from pyscript import display

seed = int(time.time() * 1000) % 2**32
rng = np.random.default_rng(seed)


def create_matrix(size):
    return rng.random((size, size))


def get_memory_usage():
    return tracemalloc.get_traced_memory()[1] / (1024 * 1024)


def multiply_matrices(size):
    gc.collect()
    tracemalloc.start()

    A = create_matrix(size)
    B = create_matrix(size)

    start = time.perf_counter()

    C = np.dot(A, B)

    execution_time = (time.perf_counter() - start) * 1000
    memory_usage = abs(get_memory_usage())
    tracemalloc.stop()

    results = {
        "execution_time": execution_time,
        "memory_usage": memory_usage
    }
    display_results(results, size)


def display_results(results, size):
    output_element = js.document.getElementById("pyscript-output")
    output_element.innerHTML += f"""
        <div style="font-weight: bold;">Matriz {size}x{size}</div>
        """
    display(f"ET: {results['execution_time']:.2f} ms",
            target="pyscript-output")
    display(f"RAM: {results['memory_usage']:.2f} MB", target="pyscript-output")
    js.endTimerWebAssembly()
    output_element.appendChild(js.document.createElement('hr'))


def run_py_benchmark(event):
    js.clearCell("pyscript-output")

    multiply_matrices(500)
    multiply_matrices(1000)
    multiply_matrices(2000)
