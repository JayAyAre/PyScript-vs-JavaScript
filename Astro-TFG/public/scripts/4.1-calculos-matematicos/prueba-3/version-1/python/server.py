import json
import time
import psutil
import tracemalloc


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


def get_cpu_usage():
    return psutil.cpu_percent(interval=0.1)


def n_digits_pi(repetitions, digits):
    total_time = 0
    total_memory = 0
    total_cpu = 0

    start_total = time.time()

    for _ in range(repetitions):
        tracemalloc.start()
        start = time.time()

        cpu_before = get_cpu_usage()
        pi_value = calculate_pi(digits)
        cpu_after = get_cpu_usage()

        end = time.time()
        memory_usage = tracemalloc.get_traced_memory()[1] / (1024 * 1024)
        tracemalloc.stop()

        total_time += (end - start) * 1000
        total_memory += memory_usage
        total_cpu += cpu_after

    # ET (Execution Time)

    end_total = time.time()
    total_exec_time = round((end_total - start_total) * 1000, 2)
    avg_time = round(total_time / repetitions, 2)

    # RAM

    avg_memory = round(total_memory / repetitions, 2)

    # CPU

    avg_cpu = round(total_cpu / repetitions, 2)

    return {
        'total_time': f"Total ET (1000x): {total_exec_time} ms",
        'av_time': f"ET av (1000x): {avg_time} ms",
        'cpu_usage': f"CPU av (1000x): {avg_cpu} %",
        'memory_usage': f"RAM av (1000x): {avg_memory} MB"
    }


def main():
    results = n_digits_pi(1000, 1_000)
    response = {
        'type': None,
        'data': results
    }
    print(json.dumps(response))


if __name__ == '__main__':
    main()
