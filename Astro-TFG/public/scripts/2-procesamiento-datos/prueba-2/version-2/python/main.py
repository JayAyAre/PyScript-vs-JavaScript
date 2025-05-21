import js  # type: ignore
from pyscript import display, PyWorker
import json
import time
import asyncio

workers = []
workers_ready = False


async def initialize_worker():
    global workers, workers_ready

    try:
        num_workers = max(int(js.document.querySelector(
            "#parallel-workers-pyscript").value) or 1, 1)

        if len(workers) > num_workers:
            workers = workers[:num_workers]

        elif len(workers) < num_workers:
            to_create = num_workers - len(workers)
            origin = js.window.location.origin
            py_path = js.window.document.body.dataset.pyPath

            for _ in range(to_create):
                worker = PyWorker(
                    f"{origin}{py_path}worker.py",
                    type="pyodide",
                    config=f"{origin}{py_path.replace('python', 'json')}pyscript-worker.json"
                )
                await worker.ready
                workers.append(worker)
        workers_ready = True
    except Exception as e:
        display(f"Error creating workers: {e}", target="pyscript-output")

asyncio.create_task(initialize_worker())


async def run_py_benchmark(event):
    global workers
    try:
        num_executions = int(js.document.querySelector(
            "#num-executions-pyscript").value)
        num_workers = int(js.document.querySelector(
            "#parallel-workers-pyscript").value)

        await initialize_worker()

        start_time = time.perf_counter()

        tasks = []
        for i in range(num_executions):
            worker = workers[i % num_workers]
            tasks.append(worker.sync.do_statistical_analysis(100_000))

        results_list = await asyncio.gather(*tasks)
        accumulated = {
            'create': {'time': 0.0, 'memory': 0.0},
            'sum': {'time': 0.0, 'memory': 0.0},
            'mean': {'time': 0.0, 'memory': 0.0},
            'std': {'time': 0.0, 'memory': 0.0},
            'total_per_execution': 0.0,
        }

        for result in results_list:
            data = json.loads(result)
            for op in ['create', 'sum', 'mean', 'std']:
                accumulated[op]['time'] += data[op]['time']
                accumulated[op]['memory'] += data[op]['memory']
            accumulated['total_per_execution'] += data['total']['time']

        results = {op: {
            'time': accumulated[op]['time'] / num_executions,
            'memory': accumulated[op]['memory'] / num_executions
        } for op in ['create', 'sum', 'mean', 'std']}

        results['total'] = {
            'average_per_execution': accumulated['total_per_execution'] / num_executions,
            'total_time': (time.perf_counter() - start_time) * 1000
        }

        display_result(results)

    except Exception as e:
        display(f"Error: {str(e)}", target="pyscript-output")


def display_result(results):
    for operation in ['create', 'sum', 'mean', 'std']:
        display(
            f"{operation.upper()} - Time: {results[operation]['time']:.2f} ms | RAM: {results[operation]['memory']: .2f} MB",
            target="pyscript-output"
        )

    display(
        f"Avg request time: {results['total']['average_per_execution']:.2f} ms",
        target="pyscript-output"
    )
    display(
        f"Total ET: {results['total']['total_time']:.2f} ms",
        target="pyscript-output"
    )
    js.hideExecutionLoader()


def js_run_py_benchmark(event):
    js.clearCell('pyscript-output')
    asyncio.ensure_future(run_py_benchmark(None))


js.window.run_py_benchmark = js_run_py_benchmark
