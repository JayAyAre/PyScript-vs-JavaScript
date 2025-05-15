import time
import js  # type: ignore
import asyncio
from pyscript import PyWorker, display

worker = None


async def launch_worker(event):
    global worker
    # Inicia contador de tiempo de creación del worker
    start_worker_time = time.perf_counter()
    if worker is None:
        worker = PyWorker(
            "./python/worker.py",
            type="pyodide",
            config="./json/pyscript-worker.json"
        )
        await worker.ready
    worker_time = (time.perf_counter() - start_worker_time) * 1000

    # Leemos parámetros de la UI
    num_series = int(js.document.getElementById("num-series-pyscript").value)
    num_points = int(js.document.getElementById("num-points-pyscript").value)

    # Llamamos al worker; el resultado es un objeto JS
    result = await worker.sync.js_run_py_benchmark(num_series, num_points)

    # Limpiamos el contenedor
    js.clearGraphContainer("graph-container-pyscript")

    # Plotly con datos “planos” convertidos a JS puro
    js.window.Plotly.newPlot(
        "graph-container-pyscript",
        result.traces,
        result.layout
    )
    # Mostramos métricas
    display(f"Worker Time: {worker_time:.2f} ms", target="pyscript-output")
    display(f"Data gen: {result.data_gen_time:.2f} ms",
            target="pyscript-output")
    display(f"Render: {result.render_time:.2f} ms", target="pyscript-output")
    display(f"Memory: {result.memory:.2f} MB", target="pyscript-output")
    display(f"TOTAL: {result.total_time:.2f} ms", target="pyscript-exact")

    js.stopPyTimer()

# Este entry point se enlaza con el atributo py-click en el HTML


def js_run_py_benchmark(event):
    js.clearCell("pyscript-output")
    asyncio.ensure_future(launch_worker(None))
