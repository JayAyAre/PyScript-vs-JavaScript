import time
import json
import pickle
import sys
from pyscript import sync, document
import asyncio
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier


async def js_run_py_benchmark(worker_time):
    # breve espera para asegurarnos de que el UI esté listo
    await asyncio.sleep(0.1)
    start_overall = time.perf_counter()
    reps = int(document.getElementById("num-repetitions-py").value)

    # cargar Iris
    data = load_iris()
    X, y = data.data, data.target

    total_training = 0.0
    total_inference = 0.0
    total_accuracy = 0.0
    model = None

    for _ in range(reps):
        # Entrenamiento
        t0 = time.perf_counter()
        model = RandomForestClassifier()
        model.fit(X, y)
        total_training += (time.perf_counter() - t0) * 1000

        # Inferencia
        t1 = time.perf_counter()
        preds = model.predict(X)
        total_inference += (time.perf_counter() - t1) * 1000

        # Precisión
        accuracy = (preds == y).mean() * 100
        total_accuracy += accuracy

    avg_training = total_training / reps
    avg_inference = total_inference / reps
    avg_accuracy = total_accuracy / reps

    # estimar tamaño del modelo en MB
    model_bytes = pickle.dumps(model)
    model_size_mb = sys.getsizeof(model_bytes) / (1024**2)

    # tiempo total (incluye overhead interno si se quiere)
    overall_time_ms = (time.perf_counter() - start_overall) * 1000

    result = {
        "training_time_ms": avg_training,
        "inference_time_ms": avg_inference,
        "accuracy": avg_accuracy,
        "model_size_mb": model_size_mb,
        "overall_time_ms": overall_time_ms,
    }
    return json.dumps(result)

# exponemos la función al main.py
sync.js_run_py_benchmark = js_run_py_benchmark
