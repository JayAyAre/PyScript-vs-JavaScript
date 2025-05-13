# public/scripts/main.py
from pyscript import display, document, PyWorker
import js  # type: ignore
import asyncio
import time

worker = None


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

    try:

        worker_time = (time.perf_counter() - t0) * 1000

        num_requests = int(document.getElementById(
            "num-requests-pyscript").value)
        delay = int(document.getElementById("request-delay-pyscript").value)
        base_url = js.location.origin

        res = await worker.sync.do_requests(worker_time, num_requests, delay, base_url)
        display(f"Worker Time: {res.worker_time:.2f} ms",
                target="pyscript-output")
        display(
            f"Avg Request Time: {res.avg_time:.2f} ms", target="pyscript-output")
        display(f"Total Time: {res.total_time:.2f} ms",
                target="pyscript-output")
        display(
            f"Finished Requests: {len(res.results)}", target="pyscript-output")

        results = list(res.results)

        last_result = results[-1]
        display(
            f"Last Result: {last_result.data[0].value}", target="pyscript-output")
        js.window.hideExecutionLoader()
    except Exception as e:
        display(f"Error: {str(e)}", target="pyscript-output")
        print(e)


def js_run_py_benchmark(event):
    js.clearCell('pyscript-output')
    asyncio.ensure_future(launch_worker(None))


# Exponemos la función al onclick
js.window.run_py_benchmark = js_run_py_benchmark
