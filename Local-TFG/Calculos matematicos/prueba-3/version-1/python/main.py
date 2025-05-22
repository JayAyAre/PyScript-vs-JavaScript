import time
import tracemalloc
import gc
import js  # type: ignore
from pyscript import display


def calculate_pi(digits):
    pi = 0.0
    for k in range(digits):
        pi += (1 / (16**k)) * (
            (4 / (8 * k + 1)) -
            (2 / (8 * k + 4)) -
            (1 / (8 * k + 5)) -
            (1 / (8 * k + 6))
        )
    return pi


def get_memory_usage():
    return tracemalloc.get_traced_memory()[1] / (1024 * 1024)


def n_digits_pi(repetitions, digits):
    gc.collect()
    tracemalloc.start()
    start_total_time = time.perf_counter()

    total_time = 0
    total_memory = 0
    for _ in range(repetitions):
        gc.collect()
        tracemalloc.start()
        start = time.perf_counter()

        pi_value = calculate_pi(digits)

        end = time.perf_counter()
        memory_usage = get_memory_usage()
        tracemalloc.stop()

        total_time += (end - start) * 1000
        total_memory += memory_usage

    total_exec_time = round((time.perf_counter() - start_total_time) * 1000, 2)
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
        f"Total ET (1000x): {results['total_time']:.2f} ms", target="pyscript-output")
    display(f"ET (avg, 1000x): {results['execution_time']:.2f} ms",
            target="pyscript-output")
    display(
        f"RAM (avg, 1000x): {results['memory_usage']:.2f} MB", target="pyscript-output")
    js.endTimerWebAssembly()


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    n_digits_pi(1_000, 1_000)
