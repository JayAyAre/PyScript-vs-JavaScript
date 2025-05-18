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
                print(f"Error{url}: {e}")
                return None

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
