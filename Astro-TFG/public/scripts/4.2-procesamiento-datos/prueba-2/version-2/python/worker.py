import time
import numpy as np
from pyscript import sync
import json


def create_data_structure(size):
    return np.random.randint(0, 1000, size=size, dtype=np.int32)


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


def do_statistical_analysis(size):
    metrics = {
        "create": {"time": 0.0, "memory": 0.0},
        "sum": {"time": 0.0, "memory": 0.0},
        "mean": {"time": 0.0, "memory": 0.0},
        "std": {"time": 0.0, "memory": 0.0},
        "total": {"time": 0.0},
    }

    try:
        total_start = time.perf_counter()

        start = time.perf_counter()
        data = np.random.randint(0, 1000, size=size, dtype=np.int32)
        create_time = (time.perf_counter() - start) * 1000
        memory_usage = data.nbytes / (1024 ** 2)
        metrics['create'] = {'time': create_time, 'memory': memory_usage}

        start = time.perf_counter()
        calculate_sum(data)
        metrics['sum'] = {
            'time': (time.perf_counter() - start) * 1000, 'memory': memory_usage}

        start = time.perf_counter()
        calculate_mean(data)
        metrics['mean'] = {
            'time': (time.perf_counter() - start) * 1000, 'memory': memory_usage}

        start = time.perf_counter()
        calculate_std(data)
        metrics['std'] = {
            'time': (time.perf_counter() - start) * 1000, 'memory': memory_usage}

        metrics['total'] = {'time': (time.perf_counter() - total_start) * 1000}

    except Exception as e:
        metrics["error"] = str(e)

    return json.dumps(metrics)


sync.do_statistical_analysis = do_statistical_analysis
