import time
import random
import js  # type: ignore
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

    result = f"PyScript (Listas nativas): {(end - start) * 1000} ms"
    display(result, target="output")
    display(js.performanceasd, target="output")


def run_py_benchmark(event):
    multiply_matrices(200)  # Prueba con matrices de 200x200
