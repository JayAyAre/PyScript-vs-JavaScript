import gc
import time
import tracemalloc
import sympy
import numpy as np
import js  # type: ignore
from pyscript import display


def sieve_of_eratosthenes_np(n):
    primes = list(sympy.primerange(0, n + 1))
    return np.array(primes, dtype=np.int32)


def get_memory_usage():
    return tracemalloc.get_traced_memory()[1] / (1024 * 1024)


def benchmark_primes_py(repetitions, n):
    tracemalloc.start()
    start_total_time = time.perf_counter()
    gc.collect()

    total_time = 0
    total_memory = 0
    for _ in range(repetitions):
        tracemalloc.start()
        start = time.perf_counter()
        gc.collect()

        primes = sieve_of_eratosthenes_np(n)

        end = time.perf_counter()
        memory_usage = get_memory_usage()
        tracemalloc.stop()

        total_time += (end - start) * 1000
        total_memory += memory_usage

    total_exec_time = (time.perf_counter() - start_total_time) * 1000
    avg_time = total_time / repetitions
    avg_memory = total_memory / repetitions

    tracemalloc.stop()

    results = {
        "total_time": total_exec_time,
        "execution_time": avg_time,
        "memory_usage": avg_memory
    }

    display_results(results)


def display_results(results):
    display(f"Total ET (1000x): {results['total_time']:.2f} ms",
            target="pyscript-output")
    display(f"ET (avg, 1000x): {results['execution_time']:.2f} ms",
            target="pyscript-output")
    display(
        f"RAM (avg, 1000x): {results['memory_usage']:.2f} MB", target="pyscript-output")
    js.endTimerWebAssembly()


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    benchmark_primes_py(1_000, 10_000)
