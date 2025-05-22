import time
import json
from pyscript import display, PyWorker
import js  # type: ignore

worker = None


async def initialize_worker():
    global worker
    if worker is None:
        worker = PyWorker(
            "./python/worker.py",
            type="pyodide",
            config="./json/pyscript-worker.json"
        )
        await worker.ready


async def launch_worker(event):
    global worker, worker_time
    js.clearCell('pyscript-output')
    js.clearGraphContainer("graph-container-pyscript")
    js.startPyTimer()

    start_w = time.perf_counter()
    await initialize_worker()
    worker_time = (time.perf_counter() - start_w) * 1000

    result_json = await worker.sync.do_analisis()
    result = json.loads(result_json)

    display_result(result)


def display_result(result):
    global worker_time
    display(
        f"Worker init time: {worker_time:.2f} ms", target="pyscript-output")
    display(
        f"Avg Data generation: {result['data_gen_time']:.2f} ms", target="pyscript-output")
    display(
        f"Avg Rendering: {result['render_time']:.2f} ms", target="pyscript-output")
    display(
        f"Avg execution time: {result['average_time_ms']:.2f} ms", target="pyscript-output")
    display(f"Memory: {result['memory']:.2f} MB", target="pyscript-output")
    display(
        f"Total ET: {result['total_time_ms']:.2f} ms", target="pyscript-output")
    if result["image_base64"]:
        js.displayPlot(result["image_base64"], "graph-container-pyscript")
    js.stopPyTimer()
