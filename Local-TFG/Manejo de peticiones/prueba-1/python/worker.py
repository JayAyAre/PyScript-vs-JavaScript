from pyscript import sync, display, document, fetch
import asyncio
import time
import json

PYTHON_SERVER = "http://127.0.0.1:5001"


async def do_analisis():
    try:
        num_requests = int(document.getElementById(
            "num-requests-pyscript").value)
        delay = int(document.getElementById("request-delay-pyscript").value)

        urls = [
            f"{PYTHON_SERVER}/mock-api/{delay}" for _ in range(num_requests)]

        start_time = time.perf_counter()
        individual_times = []

        async def fetch_url(url):
            t0 = time.perf_counter()
            resp = await fetch(url)
            elapsed = (time.perf_counter() - t0) * 1000

            individual_times.append(elapsed)

            if resp.status == 200:
                try:
                    python_dict = await resp.json()
                    return python_dict
                except Exception as e:
                    return {"error": f"JSON parse failed: {str(e)}"}
            return {"error": f"Request failed with status {resp.status}"}

        results = await asyncio.gather(*(fetch_url(url) for url in urls))

        total_time = (time.perf_counter() - start_time) * 1000
        avg_time = sum(individual_times) / \
            len(individual_times) if individual_times else 0

        result = {
            "average_time_ms": avg_time,
            "total_time_ms": total_time,
            "total_requests": num_requests,
            "last_value": results[-1]["data"][-1]["value"]
        }

        return json.dumps(result)
    except Exception as e:
        display(f"Error: {e}", target="pyscript-output")

sync.do_analisis = do_analisis
