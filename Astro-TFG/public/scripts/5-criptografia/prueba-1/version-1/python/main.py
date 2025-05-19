import time
from pyscript import PyWorker, display
import js  # type: ignore
import json
import asyncio

worker = None


async def launch_worker(event):
    try:
        global worker
        start_worker_time = time.perf_counter()

        if worker is None:
            base = js.window.location.origin + js.window.document.body.dataset.pyPath
            worker = PyWorker(
                f"{base}worker.py",
                type="pyodide",
                config=f"{base.replace('python', 'json')}pyscript-worker.json"
            )
            await worker.ready

        worker_time = (time.perf_counter() - start_worker_time) * 1000
        json_str = await worker.sync.do_hash(worker_time)
        result = json.loads(json_str)

        display_result(result, worker_time)
        js.window.hideExecutionLoader()
    except Exception as e:
        display(f"Error: {e}", target="pyscript-output")


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
            target="pyscript-output")
    display(
        f"Total time: {result['total_time']:.2f} ms", target="pyscript-output")


def js_run_py_benchmark(event):
    js.clearCell('pyscript-output')
    asyncio.ensure_future(launch_worker(None))


js.window.run_py_benchmark = js_run_py_benchmark
