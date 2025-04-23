import time
import json
import asyncio
from pyscript import PyWorker, display, document
import js  # type: ignore

worker = None


async def launch_worker(event):
    global worker
    js.clearCell("pyscript")
    js.startPyTimer()
    start_w = time.perf_counter()

    if worker is None:
        worker = PyWorker(
            "./python/worker.py",
            type="pyodide",
            config="./json/pyscript-worker.json"
        )
        await worker.ready

    worker_time = (time.perf_counter() - start_w) * 1000
    # Llamada al worker; devuelve JSON serializado
    result_json = await worker.sync.js_run_py_benchmark(worker_time)
    result = json.loads(result_json)

    display_result(result, worker_time)
    js.stopPyTimer()


def display_result(r, worker_time):
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
        f"Total crypto time: {r['crypto_total_ms']:.2f} ms", target="pyscript-exact")
    display(
        f"Overall total time: {r['overall_time_ms']:.2f} ms", target="pyscript-exact")
