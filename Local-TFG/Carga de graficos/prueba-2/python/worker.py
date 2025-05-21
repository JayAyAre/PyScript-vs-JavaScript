import time
import numpy as np
from pyscript import sync
import js  # type: ignore

seed = int(time.time() * 1000) % 2**32
_rng = np.random.default_rng(seed)


def normal_random(mean=0.0, stdev=1.0):

    u = 1.0 - _rng.random()
    v = _rng.random()
    z = np.sqrt(-2.0 * np.log(u)) * np.cos(2.0 * np.pi * v)
    return z * stdev + mean


def do_analisis():
    t0 = time.perf_counter()

    num_series = int(js.document.getElementById("num-series-pyscript").value)
    num_points = int(js.document.getElementById("num-points-pyscript").value)

    x = np.linspace(0, 10, num_points)

    ys = []
    for s in range(num_series):
        y = np.empty(num_points, dtype=float)
        for j in range(num_points):
            y[j] = np.sin(x[j] + s) + normal_random(0.0, 0.1)
        ys.append(y)

    data_gen_time = (time.perf_counter() - t0) * 1000  # ms
    bytes_used = x.nbytes + sum(y.nbytes for y in ys)
    mem_mb = bytes_used / (1024 * 1024)

    traces = []
    for idx, y in enumerate(ys, start=1):
        traces.append({
            "x": x.tolist(),
            "y": y.tolist(),
            "mode": "lines",
            "name": f"Serie {idx}",
            "line": {"width": 1}
        })

    layout = {
        "title": "Series Temporales (PyScript)",
        "width": 700,
        "height": 500,
        "xaxis": {},
        "yaxis": {}
    }

    total_time = (time.perf_counter() - t0) * 1000  # ms

    return {
        "traces":        traces,
        "layout":        layout,
        "data_gen_time": data_gen_time,
        "render_time":   total_time - data_gen_time,
        "total_time_ms": total_time,
        "memory":        mem_mb
    }


sync.do_analisis = do_analisis
