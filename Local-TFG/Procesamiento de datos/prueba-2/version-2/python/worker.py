import gc
import time
import tracemalloc
import numpy as np
from pyscript import sync
import json

seed = int(time.perf_counter() * 1000) % 2**32
rng = np.random.default_rng(seed)


def create_data_structure(size):
    return rng.integers(0, 1000, size=size, dtype=np.int32)


def calculate_sum(data):
    return np.sum(data)


def calculate_mean(data):
    return np.mean(data)


def calculate_std(data):
    return np.std(data, ddof=0)


def timed(func, *args, **kwargs):
    start = time.perf_counter()
    result = func(*args, **kwargs)
    duration = (time.perf_counter() - start) * 1000
    return result, duration


def get_memory_usage():
    current, peak = tracemalloc.get_traced_memory()
    return current / (1024 * 1024)


def do_statistical_analysis(size):
    metrics = {
        "create": {"time": 0.0, "memory": 0.0},
        "sum": {"time": 0.0, "memory": 0.0},
        "mean": {"time": 0.0, "memory": 0.0},
        "std": {"time": 0.0, "memory": 0.0},
        "total": {"time": 0.0},
    }

    try:
        gc.collect()
        tracemalloc.start()
        total_start = time.perf_counter()

        mem_before = get_memory_usage()
        start = time.perf_counter()
        data = create_data_structure(size)
        create_time = (time.perf_counter() - start) * 1000
        mem_after = get_memory_usage()
        create_memory = max(mem_after - mem_before, 0)
        metrics['create'] = {'time': create_time, 'memory': create_memory}

        mem_before = get_memory_usage()
        start = time.perf_counter()
        calculate_sum(data)
        sum_time = (time.perf_counter() - start) * 1000
        mem_after = get_memory_usage()
        sum_memory = max(mem_after - mem_before, 0)
        metrics['sum'] = {'time': sum_time, 'memory': sum_memory}

        mem_before = get_memory_usage()
        start = time.perf_counter()
        calculate_mean(data)
        mean_time = (time.perf_counter() - start) * 1000
        mem_after = get_memory_usage()
        mean_memory = max(mem_after - mem_before, 0)
        metrics['mean'] = {'time': mean_time, 'memory': mean_memory}

        mem_before = get_memory_usage()
        start = time.perf_counter()
        calculate_std(data)
        std_time = (time.perf_counter() - start) * 1000
        mem_after = get_memory_usage()
        std_memory = max(mem_after - mem_before, 0)
        metrics['std'] = {'time': std_time, 'memory': std_memory}

        metrics['total'] = {'time': (time.perf_counter() - total_start) * 1000}

    except Exception as e:
        metrics["error"] = str(e)

    tracemalloc.stop()
    return json.dumps(metrics)


sync.do_statistical_analysis = do_statistical_analysis
