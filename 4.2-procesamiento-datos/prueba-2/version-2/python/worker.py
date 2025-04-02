import time
import numpy as np
from pyscript import sync


def create_data_structure(size):
    return np.random.randint(0, 1000, size=size, dtype=np.int32)


def calculate_sum(data):
    return np.sum(data)


def calculate_mean(data):
    return np.mean(data)


def calculate_std(data):
    return np.std(data, ddof=0)


def do_statistical_analysis(size):
    metrics = {}
    start_total = time.perf_counter()

    start_op = time.perf_counter()
    data = create_data_structure(size)
    metrics['create'] = {
        'time': (time.perf_counter() - start_op) * 1000,
        'memory': (data.nbytes) / (1024 ** 2)
    }

    operations = {
        'sum': calculate_sum,
        'mean': calculate_mean,
        'std': calculate_std
    }

    for op_name, op_func in operations.items():
        start_op = time.perf_counter()
        result = op_func(data)
        metrics[op_name] = {
            'time': (time.perf_counter() - start_op) * 1000,
            'memory': (data.nbytes) / (1024 ** 2)
        }

    metrics['output'] = {
        'total_time': (time.perf_counter() - start_total) * 1000,
        'memory_peak': metrics['create']['memory']
    }

    result_str = ""
    for op in ['create', 'sum', 'mean', 'std']:
        result_str += f"{op.upper()} - Time: {metrics[op]['time']:.2f} ms | RAM: {metrics[op]['memory']:.2f} MB\n"

    result_str += f"TOTAL - Time: {metrics['output']['total_time']:.2f} ms | RAM Peak: {metrics['output']['memory_peak']:.2f} MB"

    return result_str


sync.do_statistical_analysis = do_statistical_analysis
