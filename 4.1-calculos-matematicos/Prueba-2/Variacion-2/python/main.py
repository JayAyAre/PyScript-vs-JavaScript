import time
import tracemalloc
import sympy
import js  # type: ignore
from pyscript import display  # type: ignore


def sieve_of_eratosthenes(n):
    return list(sympy.primerange(0, n + 1))


def benchmark_primes_py(repetitions, n):
    total_time = 0
    total_memory = 0

    start_total = time.time()

    for _ in range(repetitions):
        tracemalloc.start()
        start = time.time()

        primes = sieve_of_eratosthenes(n)

        end = time.time()
        memory_usage = tracemalloc.get_traced_memory()[1] / (1024 * 1024)
        tracemalloc.stop()

        total_time += (end - start) * 1000
        total_memory += memory_usage

    # ET (Execution Time)

    end_total = time.time()
    total_exec_time = round((end_total - start_total) * 1000, 2)
    avg_time = round(total_time / repetitions, 2)

    # RAM

    avg_memory = round(total_memory / repetitions, 2)

    display(f"Total ET (1000x): {total_exec_time} ms",
            target="pyscript-output")
    display(f"ET (avg, 1000x): {avg_time} ms", target="pyscript-output")
    display(f"RAM (avg, 1000x): {avg_memory} MB", target="pyscript-output")
    js.endTimerWebAssembly()


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    benchmark_primes_py(1000, 10_000)
