import js  # type: ignore
from pyscript import sync, fetch, display
import asyncio
import time
import json
import uuid


async def do_analisis(num_requests, delay, base_url):
    try:
        rest_url = f"{base_url}/api/4.2.1/socket?delay={delay}"
        resp = await fetch(rest_url)
        if not resp.ok:
            text = await resp.text()
            raise RuntimeError(
                f"GET {rest_url} devolvió {resp.status}:\n{text}")
        manifest = json.loads(await resp.text())
        ws_url = f"ws://localhost:5001{manifest['wsUrl']}"

        t0 = time.perf_counter()
        ws_result = await websocket_benchmark(num_requests, delay, ws_url)
        total_ms = (time.perf_counter() - t0) * 1000

        individual_times = ws_result["individual_times"]
        results = ws_result["results"]

        avg_ms = (
            sum(individual_times) / len(individual_times)
            if individual_times else 0
        )

        last_value = None
        for r in reversed(results):
            if r and "data" in r and isinstance(r["data"], list):
                last_value = r["data"][-1]["value"]
                break

        payload = {
            "average_time_ms": avg_ms,
            "total_time_ms":   total_ms,
            "total_requests":  num_requests,
            "last_value":      last_value
        }
        return json.dumps(payload)

    except Exception as e:
        display(f"Error on worker: {e}", target="pyscript-output")


async def websocket_benchmark(num_requests: int, delay: int, ws_url: str):
    socket = js.WebSocket.new(ws_url)
    while socket.readyState != js.WebSocket.OPEN:
        await asyncio.sleep(0.01)

    pending = {}
    individual_times = []
    results = []

    def on_message(event):
        try:
            data = json.loads(event.data)
            req_id = data.get("id")
            if req_id in pending:
                sent = pending[req_id]["sent"]
                elapsed = (time.perf_counter() - sent) * 1000
                individual_times.append(elapsed)
                pending[req_id]["future"].set_result(data)
                del pending[req_id]
        except Exception as err:
            print(f"WS message error: {err}")

    socket.onmessage = on_message

    futures = []
    for _ in range(num_requests):
        req_id = str(uuid.uuid4())
        fut = asyncio.get_event_loop().create_future()
        pending[req_id] = {"future": fut, "sent": time.perf_counter()}
        socket.send(json.dumps({"id": req_id, "delay": delay}))
        futures.append((req_id, fut))

    timeout = delay / 1000 + 2

    async def wait_fut(req_id, fut):
        try:
            return await asyncio.wait_for(fut, timeout=timeout)
        except asyncio.TimeoutError:
            return None

    results_data = await asyncio.gather(*(wait_fut(req_id, fut) for req_id, fut in futures))

    for data in results_data:
        if data is not None:
            results.append(data)

    if socket.readyState == js.WebSocket.OPEN:
        socket.close()

    return {
        "individual_times": individual_times,
        "results":          results
    }


sync.do_analisis = do_analisis
