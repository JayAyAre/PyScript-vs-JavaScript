import json
import os
import time
import psutil
from mpmath import mp
import gc


def calculate_pi(digits):
    mp.dps = digits

    a = mp.mpf(1)
    b = 1 / mp.sqrt(2)
    t = mp.mpf(1) / 4
    p = mp.mpf(1)

    num_iter = int(mp.log10(digits) * 1.4)

    for _ in range(num_iter):
        a_next = (a + b) / 2
        b = mp.sqrt(a * b)
        t -= p * (a - a_next) ** 2
        a = a_next
        p *= 2

    pi = ((a + b) ** 2) / (4 * t)
    return pi


def get_memory_usage():
    process = psutil.Process(os.getpid())
    return max(process.memory_info().rss / (1024 * 1024), 0)


def get_cpu_usage(process):
    return process.cpu_percent(interval=None)


def n_digits_pi(repetitions, digits):
    gc.collect()
    process = psutil.Process(os.getpid())
    process.cpu_percent(interval=None)

    total_time = 0
    total_memory = 0
    total_cpu = 0

    start_total = time.perf_counter()

    for _ in range(repetitions):
        gc.collect()
        start_memory = get_memory_usage()
        start = time.perf_counter()

        cpu_before = get_cpu_usage(process)
        pi_value = calculate_pi(digits)
        cpu_after = get_cpu_usage(process)

        end = time.perf_counter()
        memory_usage = get_memory_usage() - start_memory
        cpu_usage = cpu_after - cpu_before

        total_time += (end - start) * 1000
        total_memory += memory_usage
        total_cpu += cpu_usage

    total_exec_time = round((time.perf_counter() - start_total) * 1000, 2)
    avg_time = round(total_time / repetitions, 2)
    avg_memory = round(total_memory / repetitions, 2)
    avg_cpu = round(total_cpu / repetitions, 2)

    return {
        'total_time': f"Total ET (avg, 10x): {total_exec_time} ms",
        'av_time': f"ET (avg, 10x): {avg_time} ms",
        'cpu_usage': f"CPU (avg, 10x): {avg_cpu} %",
        'memory_usage': f"RAM (avg, 10x): {avg_memory} MB"
    }


def main():
    results = n_digits_pi(10, 10_000)
    response = {
        'type': None,
        'data': results
    }
    print(json.dumps(response))


if __name__ == '__main__':
    main()
