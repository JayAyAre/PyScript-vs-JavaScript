# main.py
from pyscript import display, document, PyWorker
import js  # type: ignore
import time
import asyncio

worker = None


def update_results(res, worker_time):
    display(f"Worker Init Time: {worker_time:.2f} ms",
            target="pyscript-output")
    display(
        f"Avg Request Time: {res.avg_time:.2f} ms", target="pyscript-output")
    display(f"Total Time: {res.total_time:.2f} ms",
            target="pyscript-output")
    display(
        f"Finished Requests: {len(res.individual_times)}", target="pyscript-output")
    last = res.results[-1]
    display(
        f"Last Result Value: {last.data[0].value}", target="pyscript-output")


async def launch_worker(event):
    global worker
    t0 = time.perf_counter()
    if worker is None:
        base = js.window.location.origin + js.window.document.body.dataset.pyPath
        worker = PyWorker(
            f"{base}worker.py",
            type="pyodide",
            config=f"{base.replace('python', 'json')}pyscript-worker.json"
        )
        await worker.ready
    worker_time = (time.perf_counter() - t0) * 1000  # en ms

    try:
        num_requests = int(document.getElementById(
            "num-requests-pyscript").value)
        delay = int(document.getElementById("request-delay-pyscript").value)

        res = await worker.sync.do_ws_requests(num_requests, delay)
        print(res.avg_time)
        update_results(res, worker_time)
        js.window.hideExecutionLoader()
    except Exception as e:
        display(f"Error: {e}", target="pyscript-output")


def js_run_py_benchmark(event):
    js.clearCell('pyscript-output')
    asyncio.ensure_future(launch_worker(None))


js.window.run_py_benchmark = js_run_py_benchmark
