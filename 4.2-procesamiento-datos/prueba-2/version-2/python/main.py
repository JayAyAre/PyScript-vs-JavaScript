import js  # type: ignore
from pyscript import display, PyWorker, document
import json
import time
import asyncio

workers = []
workers_ready = False


async def initialize_worker():
    global workers, workers_ready
    num_workers = int(js.document.querySelector(
        "#parallel-workers-pyscript").value)

    # Si ya hay trabajadores, eliminarlos antes de crear nuevos
    if len(workers) > num_workers:
        workers = workers[:num_workers]  # Mantener solo los necesarios
    elif len(workers) < num_workers:
        # Crear los trabajadores faltantes
        additional_workers = num_workers - len(workers)
        for _ in range(additional_workers):
            worker = PyWorker(
                "./python/worker.py",
                type="pyodide",
                config="./json/pyscript-worker.json"
            )
            await worker.ready
            workers.append(worker)

    workers_ready = True  # Confirmar que los trabajadores están listos

asyncio.create_task(initialize_worker())


async def run_py_benchmark(event):
    global workers
    await initialize_worker()
    try:
        num_executions = int(js.document.querySelector(
            "#num-executions-pyscript").value)
        num_workers = int(js.document.querySelector(
            "#parallel-workers-pyscript").value)

        # Asegurar que tenemos la cantidad correcta de trabajadores antes de ejecutar
        await initialize_worker()

        js.clearCell("pyscript")
        start_time = time.perf_counter()

        # Distribuir las tareas entre los trabajadores disponibles
        tasks = []
        for i in range(num_executions):
            # Evita acceder a un índice fuera de rango
            worker = workers[i % num_workers]
            tasks.append(worker.sync.do_statistical_analysis(10_000_000))

        # Ejecutar en paralelo
        results_list = await asyncio.gather(*tasks)
        print("📥 Resultados recibidos en run_py_benchmark:", results_list)

        accumulated = {
            'create': {'time': 0.0, 'memory': 0.0},
            'sum': {'time': 0.0, 'memory': 0.0},
            'mean': {'time': 0.0, 'memory': 0.0},
            'std': {'time': 0.0, 'memory': 0.0},
            'total_per_execution': 0.0,
        }

        # Procesar resultados
        for result in results_list:
            data = json.loads(result)
            for op in ['create', 'sum', 'mean', 'std']:
                accumulated[op]['time'] += data[op]['time']
                accumulated[op]['memory'] += data[op]['memory']
            accumulated['total_per_execution'] += data['total']['time']

        # Promediar resultados
        results = {op: {
            'time': accumulated[op]['time'] / num_executions,
            'memory': accumulated[op]['memory'] / num_executions
        } for op in ['create', 'sum', 'mean', 'std']}

        results['total'] = {
            'average_per_execution': accumulated['total_per_execution'] / num_executions,
            'total_time': (time.perf_counter() - start_time) * 1000
        }

        # Actualizar UI
        update_ui(results)

    except Exception as e:
        display(f"Error: {str(e)}", target="pyscript-output")


def update_ui(results):
    for operation in ['create', 'sum', 'mean', 'std']:
        display(
            f"{results[operation]['time']:.2f} | {results[operation]['memory']: .2f}",
            target=f"pyscript-{operation}"
        )

    display(
        f"{results['total']['average_per_execution']:.2f}",
        target="pyscript-output"
    )
    display(
        f"{results['total']['total_time']:.2f}",
        target="pyscript-exact"
    )


def js_run_py_benchmark(event):
    asyncio.ensure_future(run_py_benchmark(None))
