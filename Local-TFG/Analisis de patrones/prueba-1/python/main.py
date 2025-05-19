import time
import json
from pyscript import PyWorker, display
import js  # type: ignore

worker = None
worker_time = 0


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
    js.startPyTimer()

    start_w = time.perf_counter()
    await initialize_worker()
    worker_time = (time.perf_counter() - start_w) * 1000

    result_json = await worker.sync.do_analisis()
    result = json.loads(result_json)

    display_result(result)


def display_result(r):
    global worker_time
    display(f"Worker init time: {worker_time:.2f} ms",
            target="pyscript-output")
    display(
        f"Training time: {r['training_time_ms']:.2f} ms", target="pyscript-output")
    display(
        f"Inference time: {r['inference_time_ms']:.2f} ms", target="pyscript-output")
    display(f"Accuracy: {r['accuracy']:.2f} %", target="pyscript-output")
    display(f"Model size: {r['model_size_mb']:.2f} MB",
            target="pyscript-output")
    display(f"Total ET: {r['overall_time_ms']:.2f} ms",
            target="pyscript-output")
    js.stopPyTimer()
