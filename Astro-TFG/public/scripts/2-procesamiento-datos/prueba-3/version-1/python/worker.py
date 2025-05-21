import time
import numpy as np
import pandas as pd
from pyscript import sync
import json


seed = int(time.time() * 1000) % 2**32
rng = np.random.default_rng(seed)


def do_statistical_analysis(size):
    metrics = {
        "create": {"time": 0.0, "memory": 0.0},
        "sum":    {"time": 0.0, "memory": 0.0},
        "mean":   {"time": 0.0, "memory": 0.0},
        "std":    {"time": 0.0, "memory": 0.0},
        "total":  {"time": 0.0},
        "error":  None,
    }

    try:
        total_start = time.perf_counter()

        start = time.perf_counter()
        data = pd.DataFrame(
            rng.integers(0, 1000, size=(size, 1), dtype=np.int32),
            columns=["values"]
        )
        metrics["create"]["time"] = (time.perf_counter() - start) * 1000
        metrics["create"]["memory"] = data.memory_usage(
            deep=True).sum() / (1024 ** 2)

        for op in ("sum", "mean", "std"):
            metrics[op]["memory"] = metrics["create"]["memory"]

        start = time.perf_counter()
        _ = data["values"].sum()
        metrics["sum"]["time"] = (time.perf_counter() - start) * 1000

        start = time.perf_counter()
        _ = data["values"].mean()
        metrics["mean"]["time"] = (time.perf_counter() - start) * 1000

        start = time.perf_counter()
        _ = data["values"].std(ddof=0)
        metrics["std"]["time"] = (time.perf_counter() - start) * 1000

        metrics["total"]["time"] = (time.perf_counter() - total_start) * 1000

    except Exception as e:
        metrics["error"] = str(e)

    return json.dumps(metrics)


sync.do_statistical_analysis = do_statistical_analysis
