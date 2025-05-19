import time
import json
import asyncio
from pyscript import PyWorker, display
import js  # type: ignore

worker = None


async def launch_worker(event):
    global worker
    try:
        start_worker_time = time.perf_counter()

        if worker is None:
            origin = js.window.location.origin
            py_path = js.window.document.body.dataset.pyPath
            worker = PyWorker(
                f"{origin}{py_path}worker.py",
                type="pyodide",
                config=f"{origin}{py_path.replace('python', 'json')}pyscript-worker.json")
            await worker.ready

        worker_time = (time.perf_counter() - start_worker_time) * 1000

        num_series = int(js.document.getElementById(
            "num-series-pyscript").value)
        num_points = int(js.document.getElementById(
            "num-points-pyscript").value)

        result = await worker.sync.js_run_py_benchmark(num_series, num_points)
        data = json.loads(result)

        if "error" in data:
            display(
                f"Error en worker: {data['error']}", target="pyscript-output")
            return

        js.window.displayPlotFromJSON(data["graph_json"], "pyscript-output")
        update_ui({
            "data_gen_time": data["data_gen_time"],
            "render_time": data["render_time"],
            "total_time": data["total_time"]
        }, worker_time, data["memory"])
        js.window.startFPSMeasurement(3000, "pyscript-output")
        js.window.hideExecutionLoader()

    except Exception as e:
        display(f"Error: {str(e)}", target="pyscript-output")


def update_ui(metrics, worker_time, mem):
    display(f"Worker Time: {worker_time:.2f} ms", target="pyscript-output")
    display(f"Generación datos: {metrics['data_gen_time']:.2f} ms",
            target="pyscript-output")
    display(f"Renderizado: {metrics['render_time']:.2f} ms",
            target="pyscript-output")
    display(f"Memory DS: {mem:.2f} MB", target="pyscript-output")
    display(f"TOTAL: {metrics['total_time']:.2f} ms",
            target="pyscript-output")


def js_run_py_benchmark(event):
    js.clearCell('pyscript-output')
    asyncio.ensure_future(launch_worker(None))


js.window.run_py_benchmark = js_run_py_benchmark
