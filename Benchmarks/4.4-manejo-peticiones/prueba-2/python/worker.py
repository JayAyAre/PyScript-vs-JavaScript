from pyscript import sync, display, document
import asyncio
import time
import json
import js  # type: ignore

PYTHON_WS_SERVER = "ws://localhost:5001"


async def do_analisis():
    try:
        num_requests = int(document.getElementById(
            "num-requests-pyscript").value)
        delay = int(document.getElementById("request-delay-pyscript").value)

        start_time = time.perf_counter()
        result_data = await websocket_benchmark(num_requests, delay, PYTHON_WS_SERVER)
        total_time = (time.perf_counter() - start_time) * 1000

        individual_times = result_data["individual_times"]
        responses = result_data["responses"]

        avg_time = sum(individual_times) / \
            len(individual_times) if individual_times else 0

        last_value = None
        for r in reversed(responses):
            if r and "data" in r and isinstance(r["data"], list):
                last_value = r["data"][-1]["value"]
                break

        result = {
            "average_time_ms": avg_time,
            "total_time_ms": total_time,
            "total_requests": num_requests,
            "last_value": last_value
        }

        return json.dumps(result)
    except Exception as e:
        display(f"Error: {e}", target="pyscript-output")


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

    for i in range(num_requests):
        pending[i] = time.perf_counter()
        socket.send(json.dumps({"delay": delay, "id": i}))

    while len(responses) < num_requests:
        await asyncio.sleep(0.01)

    socket.close()
    return {"responses": responses, "individual_times": individual_times}


sync.do_analisis = do_analisis
