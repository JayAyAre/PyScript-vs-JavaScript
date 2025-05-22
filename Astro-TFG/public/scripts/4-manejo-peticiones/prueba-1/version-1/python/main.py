from pyscript import display, document, PyWorker
import js  # type: ignore
import asyncio
import time

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
    global worker, worker_time
    try:
        t0 = time.perf_counter()
        await initialize_worker()
        worker_time = (time.perf_counter() - t0) * 1000

        num_requests = int(document.getElementById(
            "num-requests-pyscript").value)
        delay = int(document.getElementById("request-delay-pyscript").value)
        base_url = js.location.origin

        res = await worker.sync.do_requests(num_requests, delay, base_url)

        display_result(res, num_requests)

    except Exception as e:
        display(f"Error: {str(e)}", target="pyscript-output")
        print(e)


def display_result(result, num_requests):
    global worker_time
    display(
        f"Worker init time: {worker_time:.2f} ms", target="pyscript-output")
    display(
        f"Avg request time: {result.avg_time:.2f} ms", target="pyscript-output")
    display(
        f"Total ET: {result.total_time:.2f} ms", target="pyscript-output")
    display(
        f"Requests: {num_requests}", target="pyscript-output")
    display(f"Last value {result.last_value:.2f}",
            target="pyscript-output")
    js.window.hideExecutionLoader()


def js_run_py_benchmark(event):
    js.clearCell('pyscript-output')
    asyncio.ensure_future(launch_worker(None))


js.window.run_py_benchmark = js_run_py_benchmark
