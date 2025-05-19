import time
import json
from pyscript import PyWorker, display
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
        f"Message size: {result['message_size_mb']:.2f} MB", target="pyscript-output")
    display(f"Repetitions: {result['repetitions']}", target="pyscript-output")
    display(
        f"Avg encrypt time: {result['encrypt_avg_ms']:.2f} ms", target="pyscript-output")
    display(
        f"Avg decrypt time: {result['decrypt_avg_ms']:.2f} ms", target="pyscript-output")
    display(
        f"Integrity check: {'OK' if result['integrity_ok'] else 'FAIL'}", target="pyscript-output")
    display(
        f"Integrity success: {result['success_count']} of {result['repetitions']} "
        f"({result['success_percentage']:.2f}%)", target="pyscript-output")
    display(
        f"Ciphertext size: {(result['ciphertext_bytes']/1024**2):.2f} MB", target="pyscript-output")

    display(
        f"Total crypto time: {result['crypto_total_ms']:.2f} ms", target="pyscript-output")
    display(
        f"Total ET: {result['overall_time_ms']:.2f} ms", target="pyscript-output")

    js.stopPyTimer()
