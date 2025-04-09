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
    await initialize_worker()
    try:
        js.clearCell("pyscript")
        js.clearGraphContainer()

        result = await worker.sync.do_graph_rendering(100_000)
        data = json.loads(result)

        if "error" in data:
            display(f"Worker Error: {data['error']}", target="pyscript-output")
            return

        js.displayPlot(data["image_base64"])

        update_ui(data)
        js.stopPyTimer()

    except Exception as e:
        display(f"Error: {str(e)}", target="pyscript-output")


def update_ui(metrics):
    display(
        f"Data Generation: {metrics['data_gen_time']:.2f} ms", target="pyscript-output")
    display(
        f"Rendering: {metrics['render_time']:.2f} ms", target="pyscript-output")
    display(f"Memory: {metrics['memory']:.2f} MB", target="pyscript-output")
    display(
        f"TOTAL TIME: {metrics['total_time']:.2f} ms", target="pyscript-exact")


def js_run_py_benchmark(event):
    js.startPyTimer()
    asyncio.ensure_future(run_py_benchmark(None))
