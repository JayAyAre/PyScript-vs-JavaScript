from pyscript import display, document, window, PyWorker
import js  # type: ignore
import time
import asyncio
import json

worker = None
PYTHON_WS_SERVER = "ws://localhost:5001"  # No usar wss://


async def websocket_benchmark(num_requests, delay, server_url):
    socket = js.WebSocket.new(server_url)
    while socket.readyState != js.WebSocket.OPEN:
        await asyncio.sleep(0.01)

    pending = {}
    responses = []
    individual_times = []

    def on_message(event):
        data = json.loads(event.data)
        req_id = data.get("id")
        if req_id in pending:
            start_time = pending.pop(req_id)
            elapsed = (time.perf_counter() - start_time) * 1000
            individual_times.append(elapsed)
            responses.append(data)

    socket.onmessage = on_message

    # Enviar todas las peticiones sin esperar
    for i in range(num_requests):
        pending[i] = time.perf_counter()
        socket.send(json.dumps({"delay": delay, "id": i}))

    # Esperar a que todas las respuestas lleguen
    while len(responses) < num_requests:
        await asyncio.sleep(0.01)

    socket.close()
    return {"responses": responses, "individual_times": individual_times}


async def js_run_py_benchmark(worker_time):
    try:
        js.clearCell("pyscript")

        num_requests = int(document.getElementById("num-requests-py").value)
        delay = int(document.getElementById("request-delay-py").value)

        start_time = time.perf_counter()

        results = await websocket_benchmark(num_requests, delay, PYTHON_WS_SERVER)

        total_time = (time.perf_counter() - start_time) * 1000
        avg_time = sum(results["individual_times"]) / len(
            results["individual_times"]) if results["individual_times"] else 0

        update_results(total_time, avg_time, worker_time, results["responses"])

    except Exception as e:
        display(f"Error: {str(e)}", target="pyscript-output")
        print(f"Error: {str(e)}")
    finally:
        js.stopPyTimer()


def update_results(total_time, avg_time, worker_time, results):
    display(f"Worker Time: {worker_time:.2f} ms", target="pyscript-output")
    display(f"Avg Request Time: {avg_time:.2f} ms", target="pyscript-output")
    display(f"Total Time: {total_time:.2f} ms", target="pyscript-output")
    display(
        f"Total Finished Requests: {len(results)}", target="pyscript-output")

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
