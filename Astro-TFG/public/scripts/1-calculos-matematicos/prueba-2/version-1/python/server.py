import gc
import json
import time
import psutil
import os


def is_prime(n):
    if n < 2:
        return False
    if n in (2, 3):
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False

    for k in range(5, int(n**0.5) + 1, 2):
        if n % k == 0:
            return False
    return True


def get_memory_usage():
    process = psutil.Process(os.getpid())
    return max(process.memory_info().rss / (1024 * 1024), 0)


def primes_to_n(n):
    gc.collect()
    start_time = time.perf_counter()
    start_memory = get_memory_usage()
    process = psutil.Process(os.getpid())
    process.cpu_percent(interval=None)

    primes = []

    if n > 2:
        primes.append(2)

    for i in range(3, n, 2):
        if is_prime(i):
            primes.append(i)

    execution_time = round((time.perf_counter() - start_time) * 1000, 2)
    memory_used = round(abs(get_memory_usage() - start_memory), 2)
    cpu_usage = abs(process.cpu_percent(interval=1))

    return {
        'time': f"ET: {execution_time} ms",
        'cpu_usage': f"CPU: {cpu_usage} %",
        'memory_usage': f"RAM: {memory_used} MB"
    }


def main():
    result = primes_to_n(1_000_000)
    response = {
        'type': None,
        'data': result
    }
    print(json.dumps(response))


if __name__ == '__main__':
    main()
