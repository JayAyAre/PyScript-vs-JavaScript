import json
import random
import time
import psutil
import os
import gc


def create_matrix(size):
    return [[random.random() for _ in range(size)] for _ in range(size)]


def get_memory_usage():
    process = psutil.Process(os.getpid())
    return round(process.memory_info().rss / (1024 * 1024), 2)


def multiply_matrices(size):
    gc.collect()
    start_memory = get_memory_usage()
    process = psutil.Process(os.getpid())
    process.cpu_percent(interval=None)

    A = create_matrix(size)
    B = create_matrix(size)

    C = [[0] * size for _ in range(size)]

    start_time = time.perf_counter()

    for i in range(size):
        for j in range(size):
            _sum = 0
            for k in range(size):
                _sum += A[i][k] * B[k][j]
            C[i][j] = _sum

    end_time = time.perf_counter()

    execution_time = round((end_time - start_time) * 1000, 2)
    memory_used = abs(round(get_memory_usage() - start_memory, 2))
    cpu_usage = abs(process.cpu_percent(interval=1))

    return {
        'time': f"ET: {execution_time} ms",
        'cpu_usage': f"CPU: {cpu_usage} %",
        'memory_usage': f"RAM: {memory_used} MB"
    }


if __name__ == '__main__':
    results = multiply_matrices(300)
    response = {
        'type': None,
        'data': results
    }
    print(json.dumps(response))
