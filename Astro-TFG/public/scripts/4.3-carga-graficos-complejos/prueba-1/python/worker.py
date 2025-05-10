import time
import numpy as np
import json
import sys
import matplotlib.pyplot as plt
import io
import base64
from pyscript import sync


def do_graph_rendering(size):
    try:
        start_time = time.perf_counter()

        rng = np.random.default_rng()
        coords = rng.random((size, 2))
        x, y = coords[:, 0], coords[:, 1]

        memory_usage = (coords.nbytes + sys.getsizeof(x) +
                        sys.getsizeof(y)) / (1024 ** 2)

        data_gen_time = (time.perf_counter() - start_time) * 1000

        render_start = time.perf_counter()

        px = 1/plt.rcParams['figure.dpi']  # pixel in inches
        fig, ax = plt.subplots(figsize=(800*px, 600*px))

        fig.patch.set_facecolor("white")
        ax.set_facecolor("white")

        ax.scatter(x, y, s=1, alpha=0.5, color='blue')

        ax.set_xlim(0, 1)
        ax.set_ylim(0, 1)

        ticks = np.linspace(0, 1, 6)
        ax.set_xticks(ticks)
        ax.set_yticks(ticks)

        ax.tick_params(axis='both', labelsize=8)

        for spine in ax.spines.values():
            spine.set_visible(True)
            spine.set_linewidth(1)
            spine.set_color("black")

        ax.set_title(f"{size:,} Points Scatter Plot", fontsize=14)

        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=100, pad_inches=0.5)
        plt.close(fig)
        encoded_img = base64.b64encode(buf.getvalue()).decode("utf-8")
        render_time = (time.perf_counter() - render_start) * 1000

        total_time = (time.perf_counter() - start_time) * 1000

        return json.dumps({
            "image_base64": encoded_img,
            "data_gen_time": data_gen_time,
            "render_time": render_time,
            "memory": memory_usage,
            "total_time": total_time
        })

    except Exception as e:
        return json.dumps({"error": str(e)})


sync.do_graph_rendering = do_graph_rendering
