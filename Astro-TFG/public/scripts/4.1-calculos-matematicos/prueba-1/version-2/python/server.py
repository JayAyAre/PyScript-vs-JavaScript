import json
import time
import psutil
import os
import numpy as np


def create_matrix(size):
    return np.random.rand(size, size)


def get_memory_usage():
    process = psutil.Process(os.getpid())
    return round(process.memory_info().rss / (1024 * 1024), 2)


def get_cpu_usage(interval=None):
    return psutil.cpu_percent(interval=interval)


def multiply_matrices(size):
    start_memory = get_memory_usage()
    start_cpu = get_cpu_usage(None)

    A = create_matrix(size)
    B = create_matrix(size)

    start_time = time.time()
    C = np.dot(A, B)
    end_time = time.time()

    end_memory = get_memory_usage()
    end_cpu = get_cpu_usage(0.2)

    execution_time = round((end_time - start_time) * 1000, 2)
    memory_used = round(end_memory - start_memory, 2)
    cpu_usage = round(end_cpu - start_cpu, 2)

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

    # Agregar el atributo 'type'
    response = {
        'type': 'matrix',  # Aquí agregamos el tipo que mencionas
        'data': results
    }
    print(json.dumps(response))


if __name__ == '__main__':
    main()
