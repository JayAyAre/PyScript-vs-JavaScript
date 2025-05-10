import time
import tracemalloc
import gc
import js  # type: ignore
from pyscript import display  # type: ignore


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


def n_digits_pi(repetitions, digits):
    total_time = 0
    total_memory = 0

    start_total = time.time()

    for _ in range(repetitions):
        tracemalloc.start()

        start = time.time()
        gc.collect()
        pi_value = calculate_pi(digits)

        end = time.time()
        memory_usage = tracemalloc.get_traced_memory()[1] / (1024 * 1024)  # MB
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
    n_digits_pi(1_000, 1_000)


js.window.run_py_benchmark = run_py_benchmark
