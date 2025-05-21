import time
import json
import asyncio
from pyscript import PyWorker, display
import js  # type: ignore

worker = None


async def initialize_worker():
    global worker
    if worker is None:
        origin = js.window.location.origin
        py_path = js.window.document.body.dataset.pyPath
        worker = PyWorker(
            f"{origin}{py_path}worker.py",
            type="pyodide",
            config=f"{origin}{py_path.replace('python', 'json')}pyscript-worker.json")
        await worker.ready


async def launch_worker(event):
    global worker, worker_time

    start_w = time.perf_counter()
    await initialize_worker()
    worker_time = (time.perf_counter() - start_w) * 1000

    result_json = await worker.sync.do_analisis()
    result = json.loads(result_json)

    graph_json_str = json.dumps(result["graph"])

    js.displayPlotFromJSON(graph_json_str, "pyscript-output")
    js.window.startFPSMeasurement(3000, "pyscript-output")

    js.window.hideExecutionLoader()
    display_result(result=result["metrics"])


def display_result(result):
    display(f"Worker init time: {worker_time:.2f} ms",
            target="pyscript-output")
    display(
        f"Data generation: {result['data_gen_time']:.2f} ms", target="pyscript-output")
    display(
        f"Rendering: {result['render_time']:.2f} ms", target="pyscript-output")
    display(f"Memory: {result['memory']:.2f} MB", target="pyscript-output")
    display(
        f"Total ET: {result['total_time_ms']:.2f} ms", target="pyscript-output")


def js_run_py_benchmark(event):
    js.clearCell('pyscript-output')
    asyncio.ensure_future(launch_worker(None))


js.window.run_py_benchmark = js_run_py_benchmark
