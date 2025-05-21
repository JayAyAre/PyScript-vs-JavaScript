import time
import json
import traceback
import numpy as np
import sys
import matplotlib.pyplot as plt
import io
import base64
import gc
from pyscript import sync, display
import js  # type: ignore

GRAPH_SIZE = 100_000
FIG_W_PIX = 800
FIG_H_PIX = 600
DPI = 100
TICKS = 6
seed = int(time.time() * 1000) % 2**32
rng = np.random.default_rng(seed)


def mean(arr):
    return sum(arr) / len(arr) if arr else 0


def png_to_base64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=DPI, pad_inches=0.5)
    buf.seek(0)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    try:
        plt.close(fig)
    except Exception as e:
        print(f"Error releasing figure memory: {e}")
    return b64


def graph_rendering_benchmark(size):
    try:
        t0 = time.perf_counter()
        coords = rng.random((size, 2))
        data_gen_time = (time.perf_counter() - t0) * 1000
        mem_mb = (
            coords.nbytes +
            sys.getsizeof(coords[:, 0]) + sys.getsizeof(coords[:, 1])
        ) / (1024**2)

        t1 = time.perf_counter()
        px = 1 / plt.rcParams['figure.dpi']
        fig, ax = plt.subplots(figsize=(FIG_W_PIX*px, FIG_H_PIX*px))
        ax.set_facecolor("white")
        ax.scatter(coords[:, 0], coords[:, 1], s=1, alpha=0.5)
        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)

        ticks = np.linspace(0, 1, TICKS)
        ax.set_xticks(ticks)
        ax.set_yticks(ticks)
        ax.tick_params(axis='both', labelsize=8)
        ax.set_title(f"{size:,} Points Scatter Plot", fontsize=14)

        img_b64 = png_to_base64(fig)
        render_time = (time.perf_counter() - t1) * 1000
        total_time = (time.perf_counter() - t0) * 1000

        return {
            "image_base64": img_b64,
            "data_gen_time": data_gen_time,
            "render_time": render_time,
            "memory": mem_mb,
            "total_time": total_time
        }
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}


def do_analisis():
    try:
        num_exec = int(js.document.getElementById(
            "num-executions-pyscript").value)
        all_start = time.perf_counter()
        runs = []

        for _ in range(num_exec):
            r = graph_rendering_benchmark(GRAPH_SIZE)
            if "error" in r:
                display(f"Worker Error: {r['error']}",
                        target="pyscript-output")
                return json.dumps({"error": r["error"]})
            runs.append(r)

        total_time = (time.perf_counter() - all_start) * 1000

        avg_data = mean([r["data_gen_time"] for r in runs])
        avg_rend = mean([r["render_time"] for r in runs])
        avg_mem = mean([r["memory"] for r in runs])
        avg_tot = mean([r["total_time"] for r in runs])

        last_img = runs[-1]["image_base64"] if runs else ""

        result = {
            "data_gen_time": avg_data,
            "render_time": avg_rend,
            "memory": avg_mem,
            "average_time_ms": avg_tot,
            "total_time_ms": total_time,
            "num_executions": num_exec,
            "image_base64": last_img
        }
        return json.dumps(result)

    except Exception as e:
        display(f"Error: {e}", target="pyscript-output")
        return json.dumps({"error": str(e)})


sync.do_analisis = do_analisis
