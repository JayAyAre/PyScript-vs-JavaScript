import time
import numpy as np
from pyscript import display
import js  # type: ignore
from plotly.graph_objects import Figure
from plotly.io import to_json
import asyncio


async def js_run_py_benchmark(event):
    try:
        await asyncio.sleep(0.1)

        js.clearCell("pyscript")
        js.clearGraphContainer("graph-container-py")

        js.measureMemory('before')

        # Obtener valores desde inputs HTML
        num_series = int(js.document.getElementById("num-series-py").value)
        num_points = int(js.document.getElementById("num-points-py").value)

        # 1. Generación de datos
        start_time = time.perf_counter()
        x = np.linspace(0, 10, num_points)
        rng = np.random.default_rng()
        ys = [np.sin(x + i) + rng.normal(0, 0.1, num_points)
              for i in range(num_series)]
        data_gen_time = (time.perf_counter() - start_time) * 1000

        js.measureMemory('after_data_gen')

        # 2. Renderizado del gráfico
        render_start = time.perf_counter()
        fig = Figure()
        for i, y in enumerate(ys):
            fig.add_scatter(
                x=x,
                y=y,
                mode="lines",
                name=f"Serie {i+1}",
                line=dict(width=1)
            )
        fig.update_layout(
            title="Series Temporales (PyScript)",
            width=700,
            height=500
        )
        render_time = (time.perf_counter() - render_start) * 1000

        js.measureMemory('after_render')

        graph_json = to_json(fig)

        js.displayPlotPy(graph_json)
        update_ui({
            "data_gen_time": data_gen_time,
            "render_time": render_time,
            "total_time": (time.perf_counter() - start_time) * 1000
        })

        js.measureMemory('final')
    except Exception as e:
        display(f"Error: {e}", target="pyscript-output")
    finally:
        js.stopPyTimer()


def update_ui(metrics):
    display(f"Generación datos: {metrics['data_gen_time']:.2f} ms",
            target="pyscript-output")
    display(f"Renderizado: {metrics['render_time']:.2f} ms",
            target="pyscript-output")
    display(f"TOTAL: {metrics['total_time']:.2f} ms",
            target="pyscript-exact")
