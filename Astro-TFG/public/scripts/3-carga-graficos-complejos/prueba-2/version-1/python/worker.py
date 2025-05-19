import time
import json
import numpy as np
from plotly.graph_objects import Figure
from plotly.io import to_json
from pyscript import sync


def js_run_py_benchmark(num_series, num_points):
    try:
        start_time = time.perf_counter()

        x = np.linspace(0, 10, num_points)
        rng = np.random.default_rng()
        ys = [np.sin(x + i) + rng.normal(0, 0.1, num_points)
              for i in range(num_series)]

        data_gen_time = (time.perf_counter() - start_time) * 1000

        mem = (x.nbytes + sum(y.nbytes for y in ys)) / (1024**2)  # MB

        render_start = time.perf_counter()
        fig = Figure()
        for i, y in enumerate(ys):
            fig.add_scatter(
                x=x.tolist(),
                y=y.tolist(),
                mode="lines",
                name=f"Serie {i+1}",
                line=dict(width=1)
            )
        fig.update_layout(
            title="Series Temporales (PyScript)",
            width=700,
            height=500
        )

        graph_json = to_json(fig)
        render_time = (time.perf_counter() - render_start) * 1000

        total_time = (time.perf_counter() - start_time) * 1000

        return json.dumps({
            "graph_json": graph_json,
            "data_gen_time": data_gen_time,
            "render_time": render_time,
            "total_time": total_time,
            "memory": mem
        })

    except Exception as e:
        return json.dumps({"error": str(e)})


sync.js_run_py_benchmark = js_run_py_benchmark
