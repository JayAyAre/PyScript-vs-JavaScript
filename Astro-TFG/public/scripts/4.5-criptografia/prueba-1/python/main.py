import time
from pyscript import PyWorker, display
import js  # type: ignore
import json

worker = None


async def launch_worker(event):
    global worker
    js.clearCell("pyscript")
    js.startPyTimer()
    start_worker_time = time.perf_counter()

    if worker is None:
        worker = PyWorker("./python/worker.py", type="pyodide",
                          config="./json/pyscript-worker.json")
        await worker.ready

    worker_time = (time.perf_counter() - start_worker_time) * 1000
    json_str = await worker.sync.js_run_py_benchmark(worker_time)
    result = json.loads(json_str)

    display_result(result, worker_time)
    js.stopPyTimer()


def display_result(result, worker_time):
    display(
        f"Worker time: {worker_time:.2f} ms", target="pyscript-output")
    display(
        f"Simulated file: {result['file_size_mb']:.2f} MB", target="pyscript-output")
    display(
        f"Repetitions: {result['repetitions']}", target="pyscript-output")
    display(f"Avg hash time: {result['hash_avg_time_ms']:.2f} ms",
            target="pyscript-output")
    display(f"Avg verify time: {result['verify_avg_time_ms']:.2f} ms",
            target="pyscript-output")
    display(
        f"Last hash (shortened): {result['last_digest'][:20]}...", target="pyscript-output")

    display(f"Total op time: {result['total_time_ms']:.2f} ms",
            target="pyscript-exact")
    display(
        f"Total time: {result['total_time']:.2f} ms", target="pyscript-exact")
