# worker.py
import js  # type: ignore
from pyscript import sync, fetch
import asyncio
import uuid
import time
import json


async def do_ws_requests(num_requests, delay):
    ws = None
    pending = {}
    individual_times = []
    results = []
    start_time = time.perf_counter()

    try:
        api_url = js.location.origin + "/api/4.4.2/socket"
        resp = await fetch(api_url)
        if not resp.ok:
            text = await resp.text()
            raise RuntimeError(
                f"GET {api_url} devolvió {resp.status}:\n{text}")

        text = await resp.text()
        data = json.loads(text)
        ws_url = f"ws://localhost:5001{data['wsUrl']}"

        ws = js.WebSocket.new(ws_url)

        connection_timeout = 5
        start = time.perf_counter()
        while ws.readyState not in [1, 3]:
            if time.perf_counter() - start > connection_timeout:
                raise TimeoutError("Connection timeout")
            await asyncio.sleep(0.01)

        if ws.readyState != 1:
            raise ConnectionError("WebSocket connection failed")

        def on_message(event):
            try:
                data = json.loads(event.data)
                req_id = data.get('id')
                if req_id and req_id in pending:
                    pending[req_id]['future'].set_result(data)
                    del pending[req_id]
            except Exception as e:
                print(f"Error processing message: {e}")

        ws.onmessage = on_message

        send_tasks = []
        for _ in range(num_requests):
            req_id = str(uuid.uuid4())
            future = asyncio.Future()
            t0 = time.perf_counter()
            pending[req_id] = {
                'sent': time.perf_counter(),
                'future': future
            }

            payload = json.dumps({
                "delay": delay,
                "id": req_id
            })
            ws.send(payload)
            send_tasks.append(future)

        timeout = delay/1000 + 2
        for future in asyncio.as_completed(send_tasks, timeout=timeout * num_requests):
            try:
                result = await future
                elapsed = (time.perf_counter() - t0) * 1000
                individual_times.append(elapsed)
                results.append(result)
            except asyncio.TimeoutError:
                continue

        total_time = (time.perf_counter() - start_time) * 1000
        avg_time = sum(individual_times) / \
            len(individual_times) if individual_times else 0

        return {
            "individual_times": individual_times,
            "avg_time": avg_time,
            "total_time": total_time,
            "results": results,
        }

    finally:
        if ws and ws.readyState == 1:
            ws.close()

sync.do_ws_requests = do_ws_requests
