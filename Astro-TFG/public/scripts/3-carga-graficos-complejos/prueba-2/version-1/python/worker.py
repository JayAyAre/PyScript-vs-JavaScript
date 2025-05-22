import time
import json
import numpy as np
from pyscript import sync
import js  # type: ignore

seed = int(time.perf_counter() * 1000) % 2**32
rng = np.random.default_rng(seed)


def do_analisis():
    try:
        start_time = time.perf_counter()
        num_series = int(js.document.getElementById(
            "num-series-pyscript").value)
        num_points = int(js.document.getElementById(
            "num-points-pyscript").value)

        x = np.linspace(0, 10, num_points)
        noise = rng.normal(0, 0.1, size=(num_series, num_points))

        traces = [{
            "x": x.tolist(),
            "y": (np.sin(x + phase) + noise[i]).tolist(),
            "mode": "lines",
            "name": f"Serie {i+1}"
        } for i, phase in enumerate(range(num_series))]

        layout = {
            "title":  "Series Temporales (PyScript)",
            "width":   700,
            "height":  500,
            "xaxis":  {},
            "yaxis":  {}
        }

        data_gen_time = (time.perf_counter() - start_time) * 1000
        total_time = data_gen_time
        mem_mb = (
            x.nbytes + sum(np.array(t["y"]).nbytes for t in traces)) / (1024 ** 2)

        result = {
            "graph": {
                "data":   traces,
                "layout": layout
            },
            "metrics": {
                "data_gen_time": data_gen_time,
                "render_time":   total_time - data_gen_time,
                "total_time_ms": total_time,
                "memory":        mem_mb
            }
        }
        return json.dumps(result)

    except Exception as e:
        return json.dumps({"error": str(e)})


sync.do_analisis = do_analisis
