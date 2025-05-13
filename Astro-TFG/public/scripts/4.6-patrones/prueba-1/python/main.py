import time
import json
from pyscript import PyWorker, display, document
import js  # type: ignore

worker = None


async def launch_worker(event):
    global worker
    js.clearMetrics("pyscript")
    js.startPyTimer()

    # inicialización del worker
    start_w = time.perf_counter()
    if worker is None:
        worker = PyWorker(
            "./python/worker.py",
            type="pyodide",
            config="./json/pyscript-worker.json"
        )
        await worker.ready
    worker_time = (time.perf_counter() - start_w) * 1000
    display(f"{worker_time:.2f} ms", target="pyscript-worker")

    # llamada al worker que entrena/predice Iris
    result_json = await worker.sync.js_run_py_benchmark(worker_time)
    result = json.loads(result_json)

    display_result(result)
    js.stopPyTimer()


def display_result(r):
    display(f"{r['training_time_ms']:.2f} ms", target="pyscript-training")
    display(f"{r['inference_time_ms']:.2f} ms", target="pyscript-inference")
    display(f"{r['accuracy']:.2f} %",  target="pyscript-accuracy")
    display(f"{r['model_size_mb']:.2f} MB", target="pyscript-memory")
    display(f"{r['overall_time_ms']:.2f} ms", target="pyscript-total")
