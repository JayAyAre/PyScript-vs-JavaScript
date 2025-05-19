import time
import json
import pickle
import sys
from pyscript import sync, document
import asyncio
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier


async def do_analisis():
    await asyncio.sleep(0.1)
    start_overall = time.perf_counter()
    reps = int(document.getElementById("num-repetitions-pyscript").value)

    data = load_digits()
    X, y = data.data, data.target

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, shuffle=True
    )

    total_training = 0.0
    total_inference = 0.0
    total_accuracy = 0.0
    model = None

    for _ in range(reps):
        t0 = time.perf_counter()
        model = KNeighborsClassifier(n_neighbors=3)
        model.fit(X_train, y_train)
        total_training += (time.perf_counter() - t0) * 1000

        t1 = time.perf_counter()
        preds = model.predict(X_test)
        total_inference += (time.perf_counter() - t1) * 1000

        accuracy = (preds == y_test).mean() * 100
        total_accuracy += accuracy

    avg_training = total_training / reps
    avg_inference = total_inference / reps
    avg_accuracy = total_accuracy / reps

    model_bytes = pickle.dumps(model)
    model_size_mb = sys.getsizeof(model_bytes) / (1024**2)

    overall_time_ms = (time.perf_counter() - start_overall) * 1000

    result = {
        "training_time_ms": avg_training,
        "inference_time_ms": avg_inference,
        "accuracy": avg_accuracy,
        "model_size_mb": model_size_mb,
        "overall_time_ms": overall_time_ms,
    }
    return json.dumps(result)

sync.do_analisis = do_analisis
