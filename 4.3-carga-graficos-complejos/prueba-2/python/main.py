import asyncio
import time
import json
from pyscript import display, PyWorker
import js  # type: ignore

worker = None


async def initialize_worker():
    global worker
    if worker is None:
        worker = PyWorker("./python/worker.py", type="pyodide",
                          config="./json/pyscript-worker.json")
        await worker.ready


async def run_py_benchmark(event):
    start_time = time.perf_counter()
    await initialize_worker()
    worker_time = (time.perf_counter() - start_time) * 1000
    try:
        js.clearCell("pyscript")
        js.clearGraphContainer("graph-container-py")
        num_executions = int(js.document.querySelector(
            "#num-executions-pyscript").value)

        results_list = []

        start_time = time.perf_counter()

        for _ in range(num_executions):
            result = await worker.sync.do_graph_rendering(100_000)
            data = json.loads(result)
            if "error" in data:
                display(
                    f"Worker Error: {data['error']}", target="pyscript-output")
                return
            results_list.append(data)

        total_elapsed = (time.perf_counter() - start_time) * 1000

        accumulated = {
            "data_gen_time": 0.0,
            "render_time": 0.0,
            "memory": 0.0,
            "total_time": 0.0
        }

        for result in results_list:
            accumulated["data_gen_time"] += result["data_gen_time"]
            accumulated["render_time"] += result["render_time"]
            accumulated["memory"] += result["memory"]
            accumulated["total_time"] += result["total_time"]

        averaged = {
            key: accumulated[key] / num_executions for key in accumulated
        }

        js.displayPlotPy(results_list[-1]["image_base64"])
        js.stopPyTimer()

        update_ui(averaged, total_elapsed, worker_time)

    except Exception as e:
        display(f"Error: {str(e)}", target="pyscript-output")


def update_ui(metrics, total_time, worker_time):
    display(
        f"Worker Time: {worker_time:.2f} ms", target="pyscript-output")
    display(
        f"Data Generation: {metrics['data_gen_time']:.2f} ms", target="pyscript-output")
    display(
        f"Rendering: {metrics['render_time']:.2f} ms", target="pyscript-output")
    display(f"Memory: {metrics['memory']:.2f} MB", target="pyscript-output")
    display(
        f"Average per Execution: {metrics['total_time']:.2f} ms", target="pyscript-output")
    display(f"TOTAL TIME: {total_time:.2f} ms", target="pyscript-exact")


def js_run_py_benchmark(event):
    js.startPyTimer()
    asyncio.ensure_future(run_py_benchmark(None))
