from pyscript import display, document, PyWorker, fetch
import js  # type: ignore
import asyncio
import time

PYTHON_SERVER = "http://localhost:5001"
worker = None


async def js_run_py_benchmark(worker_time):
    try:
        js.clearCell("pyscript")

        num_requests = int(document.getElementById("num-requests-py").value)
        delay = int(document.getElementById("request-delay-py").value)

        urls = [
            f"{PYTHON_SERVER}/mock-api/{delay}" for _ in range(num_requests)]

        start_time = time.perf_counter()
        individual_times = []

        async def fetch_url(url):
            try:
                start = time.perf_counter()
                response = await fetch(url)
                end = time.perf_counter()

                individual_times.append((end - start) * 1000)

                if response.status == 200:
                    return await response.json()
                else:
                    return None
            except Exception as e:
                print(f"Error al hacer fetch a {url}: {e}")
                return None

        results = await asyncio.gather(*(fetch_url(url) for url in urls))

        total_time = (time.perf_counter() - start_time) * 1000
        avg_time = sum(individual_times) / \
            len(individual_times) if individual_times else 0

        update_results(total_time, avg_time, worker_time, results)
    except Exception as e:
        display(f"Error: {str(e)}", target="pyscript-output", raw=True)
        print(e)
    finally:
        js.stopPyTimer()


def update_results(total_time, avg_time, worker_time, results):
    display(f"Worker Time: {worker_time:.2f} ms", target="pyscript-output")
    display(f"Avg Request Time: {avg_time:.2f} ms", target="pyscript-output")
    display(f"Total Time: {total_time:.2f} ms", target="pyscript-output")
    display(
        f"Total Finished Requests: {len(results)}", target="pyscript-output")
    print(results)
    if results and results[-1] and "data" in results[-1] and results[-1]["data"]:
        last_value = results[-1]["data"][-1]["value"]
        display(f"Last Value: {last_value:.6f}", target="pyscript-output")
    else:
        display("No valid data in the last response.",
                target="pyscript-output")


async def launch_worker(event):
    js.startPyTimer()
    global worker
    start_worker_time = time.perf_counter()

    if worker is None:
        worker = PyWorker("./python/worker.py", type="pyodide",
                          config="./json/pyscript-worker.json")
        await worker.ready
        worker.sync.js_run_py_benchmark = js_run_py_benchmark

    worker_time = (time.perf_counter() - start_worker_time) * 1000
    await worker.sync.js_run_py_benchmark(worker_time)
