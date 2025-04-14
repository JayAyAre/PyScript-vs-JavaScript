import asyncio
import time
import json
import numpy as np
from pyscript import display
import js  # type: ignore
from plotly.graph_objects import Figure
from plotly.io import to_json


async def js_run_py_benchmark(event):
    try:
        # Limpieza y preparación
        js.clearCell("pyscript")
        js.clearGraphContainer("graph-container-py")
        js.startPyTimer()

        # 1. Generación de datos
        start_time = time.perf_counter()
        num_series = 5
        num_points = 10_000
        x = np.linspace(0, 10, num_points)
        rng = np.random.default_rng()
        ys = [np.sin(x + i) + rng.normal(0, 0.1, num_points)
              for i in range(num_series)]
        data_gen_time = (time.perf_counter() - start_time) * 1000

        # 2. Renderizado
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

        # 3. Exportar la figura a JSON
        graph_json = to_json(fig)

        # 4. Mostrar resultados: Enviar el JSON al JS
        js.displayPlotPy(graph_json)
        update_ui({
            "data_gen_time": data_gen_time,
            "render_time": render_time,
            "total_time": (time.perf_counter() - start_time) * 1000
        })
        js.stopPyTimer()

    except Exception as e:
        display(f"Error: {e}", target="pyscript-output")


def update_ui(metrics):
    display(f"Generación datos: {metrics['data_gen_time']:.2f} ms",
            target="pyscript-output")
    display(f"Renderizado: {metrics['render_time']:.2f} ms",
            target="pyscript-output")
    display(f"TOTAL: {metrics['total_time']:.2f} ms",
            target="pyscript-exact")
