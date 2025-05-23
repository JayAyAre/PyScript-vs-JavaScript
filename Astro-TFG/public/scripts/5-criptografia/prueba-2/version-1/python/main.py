import time
import json
import asyncio
from pyscript import PyWorker, display
import js  # type: ignore

worker = None
worker_time = 0.0


async def initialize_worker():
    global worker
    if worker is None:
        base = js.window.location.origin + js.window.document.body.dataset.pyPath
        worker = PyWorker(
            f"{base}worker.py",
            type="pyodide",
            config=f"{base.replace('python', 'json')}pyscript-worker.json"
        )
        await worker.ready


async def launch_worker(event):
    try:
        global worker, worker_time
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
        json_str = await worker.sync.do_analisis()
        result = json.loads(json_str)

        display_result(result)
    except Exception as e:
        display(f"Error: {e}", target="pyscript-output")


def display_result(r):
    global worker_time
    display(f"Worker init time: {worker_time:.2f} ms",
            target="pyscript-output")
    display(
        f"Message size: {r['message_size_mb']:.2f} MB", target="pyscript-output")
    display(f"Repetitions: {r['repetitions']}", target="pyscript-output")
    display(
        f"Avg encrypt time: {r['encrypt_avg_ms']:.2f} ms", target="pyscript-output")
    display(
        f"Avg decrypt time: {r['decrypt_avg_ms']:.2f} ms", target="pyscript-output")
    display(
        f"Integrity check: {'OK' if r['integrity_ok'] else 'FAIL'}", target="pyscript-output")
    display(
        f"Integrity success: {r['success_count']} of {r['repetitions']} "
        f"({r['success_percentage']:.2f}%)", target="pyscript-output")
    display(
        f"Ciphertext size: {(r['ciphertext_bytes']/1024**2):.2f} MB", target="pyscript-output")

    display(
        f"Total crypto time: {r['crypto_total_ms']:.2f} ms", target="pyscript-output")
    display(
        f"Overall total time: {r['overall_time_ms']:.2f} ms", target="pyscript-output")
    js.window.hideExecutionLoader()


def js_run_py_benchmark(event):
    js.clearCell('pyscript-output')
    asyncio.ensure_future(launch_worker(None))


js.window.run_py_benchmark = js_run_py_benchmark
