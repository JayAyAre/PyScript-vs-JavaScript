# python/worker.py
import time
import numpy as np
from pyscript import sync


def js_run_py_benchmark(num_series, num_points):
    start_time = time.perf_counter()

    x = np.linspace(0, 10, num_points)
    rng = np.random.default_rng()
    ys = [np.sin(x + i) + rng.normal(0, 0.1, num_points)
          for i in range(num_series)]
    data_gen_time = (time.perf_counter() - start_time) * 1000
    mem = (x.nbytes + sum(y.nbytes for y in ys)) / (1024**2)

    # Construimos datos planos
    traces = []
    for i, y in enumerate(ys):
        traces.append({
            "x": x.tolist(),
            "y": y.tolist(),
            "mode": "lines",
            "name": f"Serie {i+1}"
        })

    layout = {
        "title": "Series Temporales (PyScript)",
        "width": 700,
        "height": 500
    }

    total_time = (time.perf_counter() - start_time) * 1000

    return {
        "traces": traces,
        "layout": layout,
        "data_gen_time": data_gen_time,
        "render_time": total_time - data_gen_time,
        "total_time": total_time,
        "memory": mem
    }


sync.js_run_py_benchmark = js_run_py_benchmark
