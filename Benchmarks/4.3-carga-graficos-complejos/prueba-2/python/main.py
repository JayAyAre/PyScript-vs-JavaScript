import time
import js  # type: ignore
import asyncio
from pyscript import PyWorker, display

worker = None


async def launch_worker(event):
    global worker
    start_worker_time = time.perf_counter()
    if worker is None:
        worker = PyWorker(
            "./python/worker.py",
            type="pyodide",
            config="./json/pyscript-worker.json"
        )
        await worker.ready
    worker_time = (time.perf_counter() - start_worker_time) * 1000

    num_series = int(js.document.getElementById("num-series-pyscript").value)
    num_points = int(js.document.getElementById("num-points-pyscript").value)

    result = await worker.sync.js_run_py_benchmark(num_series, num_points)

    js.clearGraphContainer("graph-container-pyscript")

    js.window.Plotly.newPlot(
        "graph-container-pyscript",
        result.traces,
        result.layout
    )

    display(f"Worker Time: {worker_time:.2f} ms", target="pyscript-output")
    display(f"Data gen: {result.data_gen_time:.2f} ms",
            target="pyscript-output")
    display(f"Render: {result.render_time:.2f} ms", target="pyscript-output")
    display(f"Memory: {result.memory:.2f} MB", target="pyscript-output")
    display(f"TOTAL: {result.total_time:.2f} ms", target="pyscript-exact")

    js.stopPyTimer()


def js_run_py_benchmark(event):
    js.clearCell("pyscript")
    asyncio.ensure_future(launch_worker(None))
