import time
import json
import numpy as np
from pyscript import sync
import js  # type: ignore


def do_analisis():
    start_time = time.perf_counter()
    num_series = int(js.document.getElementById("num-series-pyscript").value)
    num_points = int(js.document.getElementById("num-points-pyscript").value)

    x = np.linspace(0, 10, num_points)
    rng = np.random.default_rng()
    ys = [
        np.sin(x + phase) + rng.normal(0, 0.1, num_points)
        for phase in range(num_series)
    ]
    data_gen_time = (time.perf_counter() - start_time) * 1000

    mem_mb = (x.nbytes + sum(y.nbytes for y in ys)) / (1024 ** 2)

    traces = []
    for idx, y in enumerate(ys, start=1):
        traces.append({
            "x": x.tolist(),
            "y": y.tolist(),
            "mode": "lines",
            "name": f"Serie {idx}"
        })

    layout = {
        "title": "Series Temporales (PyScript)",
        "width": 700,
        "height": 500,
        "xaxis": {},
        "yaxis": {}
    }

    total_time = (time.perf_counter() - start_time) * 1000

    result = {
        "traces":         traces,
        "layout":         layout,
        "data_gen_time":  data_gen_time,
        "render_time":    total_time - data_gen_time,
        "total_time_ms":  total_time,
        "memory":         mem_mb
    }

    return json.dumps(result)


sync.do_analisis = do_analisis
