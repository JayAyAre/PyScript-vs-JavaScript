import time
import random
import js  # type: ignore
import gc  # type: ignore
import sys  # type: ignore
from pyscript import display  # type: ignore


def create_matrix(size):
    return [[random.random() for _ in range(size)] for _ in range(size)]


def get_memory_usage_py():
    gc.collect()
    return sum(sys.getsizeof(obj)
               for obj in gc.get_objects()) / (1024 * 1024)


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

    #   Execution time

    execution_time = (end - start) * 1000
    display(
        f"PyScript (Listas nativas): {execution_time:.3f} ms", target="pyscript-output")

    #   RAM
    memory_usage = get_memory_usage_py()
    display(f"Uso de memoria: {memory_usage:.3f} MB", target="pyscript-output")

    js.endTimerWebAssembly()


def run_py_benchmark(event):
    multiply_matrices(200)
