import gc
import time
import tracemalloc
import js  # type: ignore
from pyscript import display
from mpmath import mp


def calculate_pi_gauss_legendre(digits):
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


def n_digits_pi(repetitions, digits):
    total_time = 0
    total_memory = 0

    start_total = time.perf_counter()

    for _ in range(repetitions):
        tracemalloc.start()

        start = time.perf_counter()
        gc.collect()
        pi_value = calculate_pi_gauss_legendre(digits)
        end = time.perf_counter()

        memory_usage = tracemalloc.get_traced_memory()[1] / (1024 * 1024)
        tracemalloc.stop()

        total_time += (end - start) * 1000
        total_memory += memory_usage

    total_exec_time = round((time.perf_counter() - start_total) * 1000, 2)
    avg_time = round(total_time / repetitions, 2)
    avg_memory = round(total_memory / repetitions, 2)

    results = {
        "total_time": total_exec_time,
        "execution_time": avg_time,
        "memory_usage": avg_memory
    }
    display_results(results)


def display_results(results):
    display(
        f"Total ET (10x): {results['total_time']:.2f} ms", target="pyscript-output")
    display(f"ET (avg, 10x): {results['execution_time']:.2f} ms",
            target="pyscript-output")
    display(
        f"RAM (avg, 10x): {results['memory_usage']:.2f} MB", target="pyscript-output")
    js.endTimerWebAssembly()


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    n_digits_pi(10, 10_000)
