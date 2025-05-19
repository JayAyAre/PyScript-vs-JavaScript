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
    tracemalloc.start()

    A = create_matrix(size)
    B = create_matrix(size)

    start = time.perf_counter()
    gc.collect()

    C = np.dot(A, B)

    end = time.perf_counter()
    execution_time = (end - start) * 1000

    memory_usage = get_memory_usage()
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
    output_element.appendChild(js.document.createElement('br'))
    output_element.appendChild(js.document.createElement('hr'))
    output_element.appendChild(js.document.createElement('br'))


def run_py_benchmark(event):
    js.clearCell("pyscript-output")

    multiply_matrices(500)
    multiply_matrices(1000)
    multiply_matrices(2000)


js.window.run_py_benchmark = run_py_benchmark
