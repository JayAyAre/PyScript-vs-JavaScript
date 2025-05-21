import gc
import time
import js  # type: ignore
import tracemalloc
from pyscript import display


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
    return tracemalloc.get_traced_memory()[1] / (1024 * 1024)


def primes_to_n(n):
    gc.collect()
    tracemalloc.start()

    primes = []

    start = time.perf_counter()

    if n > 2:
        primes.append(2)

    for i in range(3, n, 2):
        if is_prime(i):
            primes.append(i)

    execution_time = (time.perf_counter() - start) * 1000
    memory_usage = abs(get_memory_usage())
    tracemalloc.stop()

    results = {
        "execution_time": execution_time,
        "memory_usage": memory_usage
    }
    display_results(results)


def display_results(results):
    display(f"ET: {results['execution_time']:.2f} ms",
            target="pyscript-output")
    display(f"RAM: {results['memory_usage']:.2f} MB", target="pyscript-output")
    js.endTimerWebAssembly()


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    tracemalloc.start()
    primes_to_n(1_000_000)


js.window.run_py_benchmark = run_py_benchmark
