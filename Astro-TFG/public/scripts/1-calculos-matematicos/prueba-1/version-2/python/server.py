import json
import time
import psutil
import os
import numpy as np

seed = int(time.time() * 1000) % 2**32
rng = np.random.default_rng(seed)


def create_matrix(size):
    return rng.random((size, size))


def get_memory_usage():
    process = psutil.Process(os.getpid())
    return round(process.memory_info().rss / (1024 * 1024), 2)


def get_cpu_usage():
    return psutil.cpu_percent()


def multiply_matrices(size):
    start_memory = get_memory_usage()
    start_cpu = get_cpu_usage()

    A = create_matrix(size)
    B = create_matrix(size)

    start_time = time.perf_counter()
    C = np.dot(A, B)

    execution_time = round((time.perf_counter() - start_time) * 1000, 2)
    memory_used = round(get_memory_usage() - start_memory, 2)
    cpu_usage = round(get_cpu_usage() - start_cpu, 2)

    return {
        'size': f"{size}x{size}",
        'time': f"ET: {execution_time} ms",
        'cpu_usage': f"CPU: {cpu_usage} %",
        'memory_usage': f"RAM: {memory_used} MB"
    }


def main():
    results = {
        "matrices500": multiply_matrices(500),
        "matrices1000": multiply_matrices(1000),
        "matrices2000": multiply_matrices(2000)
    }

    response = {
        'type': 'matrix',
        'data': results
    }
    print(json.dumps(response))


if __name__ == '__main__':
    main()
