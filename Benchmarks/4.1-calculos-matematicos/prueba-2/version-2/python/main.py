import gc
import time
import tracemalloc
import sympy
import js  # type: ignore
from pyscript import display


def sieve_of_eratosthenes(n):
    return list(sympy.primerange(0, n + 1))


def benchmark_primes_py(repetitions, n):
    tracemalloc.start()
    start_total_time = time.time()
    gc.collect()

    total_time = 0
    total_memory = 0
    for _ in range(repetitions):
        tracemalloc.start()
        start = time.time()
        gc.collect()
        primes = sieve_of_eratosthenes(n)

        end = time.time()
        memory_usage = tracemalloc.get_traced_memory()[1] / (1024 * 1024)
        tracemalloc.stop()

        total_time += (end - start) * 1000
        total_memory += memory_usage

    total_exec_time = (time.time() - start_total_time) * 1000
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
    benchmark_primes_py(1000, 10_000)
