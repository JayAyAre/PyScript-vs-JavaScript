import gc
import time
import tracemalloc
import js  # type: ignore
from pyscript import display  # type: ignore
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

    start_total = time.time()

    for _ in range(repetitions):
        tracemalloc.start()

        start = time.time()
        gc.collect()
        pi_value = calculate_pi_gauss_legendre(digits)
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

    display(f"Total ET (10x): {total_exec_time} ms",
            target="pyscript-output")
    display(f"ET (avg, 10x): {avg_time} ms", target="pyscript-output")
    display(f"RAM (avg, 10x): {avg_memory} MB", target="pyscript-output")
    js.endTimerWebAssembly()


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    n_digits_pi(10, 10_000)


js.window.run_py_benchmark = run_py_benchmark
