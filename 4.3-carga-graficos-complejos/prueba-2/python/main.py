import time
import numpy as np
from pyscript import PyWorker, display, window, document
import js  # type: ignore
from plotly.graph_objects import Figure
from plotly.io import to_json
import asyncio


worker = None


async def js_run_py_benchmark(worker_time):
    try:
        await asyncio.sleep(0.1)

        js.clearCell("pyscript")
        js.clearGraphContainer("graph-container-py")

        js.measureMemory('before')

        num_series = int(js.document.getElementById("num-series-py").value)
        num_points = int(js.document.getElementById("num-points-py").value)
        mem = js.estimateMemoryUsedByData(num_series, num_points)

        start_time = time.perf_counter()
        x = np.linspace(0, 10, num_points)
        rng = np.random.default_rng()
        ys = [np.sin(x + i) + rng.normal(0, 0.1, num_points)
              for i in range(num_series)]
        data_gen_time = (time.perf_counter() - start_time) * 1000

        js.measureMemory('after_data_gen')

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

        plot = window.Plotly.newPlot(
            "graph-container-py", window.JSON.parse(graph_json))
        update_ui({
            "data_gen_time": data_gen_time,
            "render_time": render_time,
            "total_time": (time.perf_counter() - start_time) * 1000
        }, worker_time, mem)
        js.attachRelayoutListener("graph-container-py", "pyscript-output")
        js.measureMemory('final')
    except Exception as e:
        display(f"Error: {e}", target="pyscript-output")
    finally:
        js.stopPyTimer()


def update_ui(metrics, worker_time, mem):

    display(f"Worker Time: {worker_time:.2f} ms", target="pyscript-output")
    display(f"Generación datos: {metrics['data_gen_time']:.2f} ms",
            target="pyscript-output")
    display(f"Renderizado: {metrics['render_time']:.2f} ms",
            target="pyscript-output")
    display(f"Memory DS: {mem} MB", target="pyscript-output")
    display("Memory by library: 14.8*2MB + 1.4MB", target="pyscript-output")
    display(f"TOTAL: {metrics['total_time']:.2f} ms",
            target="pyscript-exact")


async def launch_worker(event):
    global worker
    start_worker_time = time.perf_counter()
    if worker is None:
        worker = PyWorker("./python/worker.py", type="pyodide",
                          config="./json/pyscript-worker.json")
        await worker.ready
        worker.sync.js_run_py_benchmark = js_run_py_benchmark
    worker_time = (time.perf_counter() - start_worker_time) * 1000
    await worker.sync.js_run_py_benchmark(worker_time)
