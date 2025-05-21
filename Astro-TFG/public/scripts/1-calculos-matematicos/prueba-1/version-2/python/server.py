import json
import time
import psutil
import os
import numpy as np
import gc

seed = int(time.time() * 1000) % 2**32
rng = np.random.default_rng(seed)


def create_matrix(size):
    return rng.random((size, size))


def get_memory_usage():
    process = psutil.Process(os.getpid())
    return max(process.memory_info().rss / (1024 * 1024), 0)


def multiply_matrices(size):
    gc.collect()
    start_memory = get_memory_usage()
    process = psutil.Process(os.getpid())
    process.cpu_percent(interval=None)

    A = create_matrix(size)
    B = create_matrix(size)

    start_time = time.perf_counter()
    C = np.dot(A, B)
    end_time = time.perf_counter()

    execution_time = round((end_time - start_time) * 1000, 2)
    memory_used = abs(get_memory_usage() - start_memory)
    cpu_usage = abs(process.cpu_percent(interval=1))

    return {
        'size': f"{size}x{size}",
        'time': f"ET: {execution_time:.2f} ms",
        'cpu_usage': f"CPU: {cpu_usage:.2f} %",
        'memory_usage': f"RAM: {memory_used:.2f} MB"
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
