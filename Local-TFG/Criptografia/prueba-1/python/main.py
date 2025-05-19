import time
from pyscript import PyWorker, display
import js  # type: ignore
import json

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
        f"Simulated file: {result['file_size_mb']:.2f} MB", target="pyscript-output")
    display(
        f"Repetitions: {result['repetitions']}", target="pyscript-output")
    display(f"Avg hash time: {result['hash_avg_time_ms']:.2f} ms",
            target="pyscript-output")
    display(f"Avg verify time: {result['verify_avg_time_ms']:.2f} ms",
            target="pyscript-output")
    display(
        f"Last hash (shortened): {result['last_digest'][:8]}...", target="pyscript-output")

    display(f"Total hash + verify time: {result['total_time_ms']:.2f} ms",
            target="pyscript-output")
    display(
        f"Total ET: {result['total_time']:.2f} ms", target="pyscript-output")

    js.stopPyTimer()
