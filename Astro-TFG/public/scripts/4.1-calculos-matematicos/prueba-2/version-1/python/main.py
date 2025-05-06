import gc
import time
import js  # type: ignore
import tracemalloc
from pyscript import display  # type: ignore


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


def primes_to_n(n):
    primes = []

    start = time.time()
    gc.collect()
    if n > 2:
        primes.append(2)

    for i in range(3, n, 2):
        if is_prime(i):
            primes.append(i)

    end = time.time()

    # ET (Execution Time)

    execution_time = (end - start) * 1000
    display(f"ET: {round(execution_time, 2)} ms", target="pyscript-output")

    # PLT

    js.endTimerWebAssembly()

    # RAM

    memory_usage = tracemalloc.get_traced_memory()[1] / (1024 * 1024)
    display(f"RAM: {round(memory_usage, 2)} MB",
            target="pyscript-output")
    tracemalloc.stop()


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    tracemalloc.start()
    primes_to_n(1_000_000)
