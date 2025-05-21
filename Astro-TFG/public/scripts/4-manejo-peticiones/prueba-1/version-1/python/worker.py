from pyscript import fetch, sync
import asyncio
import time


async def do_requests(worker_time, num_requests, delay, base_url):
    urls = [f"{base_url}/api/4.1.1/{delay}.ts" for _ in range(num_requests)]
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

    results = await asyncio.gather(*(fetch_url(u) for u in urls))
    total_time = (time.perf_counter() - start_time) * 1000
    avg_time = sum(individual_times) / \
        len(individual_times) if individual_times else 0

    return {
        "worker_time": worker_time,
        "total_time": total_time,
        "avg_time": avg_time,
        "last_value": results[-1]["data"][-1]["value"],
    }


sync.do_requests = do_requests
