import asyncio
from pyscript import display, PyWorker, document
import js  # type: ignore

worker_ready = False
worker = None


async def initialize_worker():
    global worker, worker_ready
    worker = PyWorker(
        "./python/worker.py",
        type="pyodide",
        config="./json/pyscript-worker.json"
    )
    await worker.ready
    worker_ready = True
    display("Worker listo", target="pyscript-output")

asyncio.create_task(initialize_worker())


async def run_py_benchmark(event):
    await worker.ready

    try:
        js.clearCell("pyscript")
        result = await worker.sync.do_statistical_analysis(10_000_000)

        results = parse_result(result)
        update_ui(results)

    except Exception as e:
        display(f"Error: {str(e)}", target="pyscript-output")


def parse_result(result_str):
    """Convierte el string de resultados en un diccionario"""
    results = {}
    for line in result_str.split('\n'):
        if ' - Time:' in line and not line.startswith("TOTAL"):
            parts = line.split(' - Time: ')
            op = parts[0].lower()
            values = parts[1].split(' ms | RAM: ')
            results[op] = {
                'time': float(values[0]),
                'memory': float(values[1].replace(' MB', ''))
            }
        elif line.startswith('TOTAL - Time:'):
            line = line.replace("TOTAL - Time: ", "")
            parts = line.split(" ms | RAM Peak: ")
            results['total'] = {
                'time': float(parts[0]),
                'memory': float(parts[1].replace(' MB', ''))
            }
    return results


def update_ui(results):
    for op in ['create', 'sum', 'mean', 'std']:
        if op in results:
            display(
                f"{results[op]['time']:.2f} ms | {results[op]['memory']:.2f} MB",
                target=f"pyscript-{op}"
            )

    if 'total' in results:
        display(
            f"TOTAL: {results['total']['time']:.2f} ms | Peak: {results['total']['memory']: .2f} MB",
            target="pyscript-output"
        )


def js_run_py_benchmark(event):
    asyncio.ensure_future(run_py_benchmark(None))
