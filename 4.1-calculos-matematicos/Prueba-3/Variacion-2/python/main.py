import time
import tracemalloc
import js  # type: ignore
from pyscript import display  # type: ignore
from decimal import Decimal, getcontext


def calculate_pi_gauss_legendre(digits):
    # Configurar precisión arbitraria
    getcontext().prec = digits + 5  # Margen extra para evitar errores

    # Inicialización de variables
    a = Decimal(1)
    b = Decimal(1) / Decimal(2).sqrt()  # √2 con Decimal
    t = Decimal(1) / Decimal(4)
    p = Decimal(1)

    # ≈ log10(digits) iteraciones
    num_iter = int(Decimal(digits).log10().to_integral_value())

    for _ in range(num_iter):
        a_next = (a + b) / 2
        b = (a * b).sqrt()
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
        pi_value = calculate_pi_gauss_legendre(digits)
        end = time.time()

        memory_usage = tracemalloc.get_traced_memory()[1] / (1024 * 1024)  # MB
        tracemalloc.stop()

        total_time += (end - start) * 1000
        total_memory += memory_usage

    end_total = time.time()
    total_exec_time = round((end_total - start_total) * 1000, 2)

    avg_time = round(total_time / repetitions, 2)
    avg_memory = round(total_memory / repetitions, 2)

    display(f"Total ET (10x): {total_exec_time} ms",
            target="pyscript-output")
    display(f"ET (avg, 10x): {avg_time} ms", target="pyscript-output")
    display(f"RAM (avg, 10x): {avg_memory} MB", target="pyscript-output")


def run_py_benchmark(event):
    js.clearCell('pyscript-output')
    n_digits_pi(10, 100_000)  # Se ejecuta con 100,000 dígitos
