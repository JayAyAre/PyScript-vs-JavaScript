from pyscript import sync, display, document, window, PyWorker
import asyncio
import os
import time
import json


async def js_run_py_benchmark(worker_time):
    try:
        await asyncio.sleep(0.1)
        num_repetitions = int(
            document.getElementById("num-repetitions-py").value)
        file_size_mb = float(document.getElementById("file-size-py").value)

        start_time = time.perf_counter()

        file_size_bytes = int(file_size_mb * 1024 * 1024)
        buffer = os.urandom(file_size_bytes)

        total_hash_time = 0
        total_verify_time = 0

        last_digest = None
        for _ in range(num_repetitions):
            start_hash = time.perf_counter()
            from Crypto.Hash import SHA256
            hasher = SHA256.new()
            hasher.update(buffer)
            digest = hasher.digest()
            last_digest = digest.hex()
            total_hash_time += (time.perf_counter() - start_hash) * 1000

            start_verify = time.perf_counter()
            verify_hasher = SHA256.new()
            verify_hasher.update(buffer)
            assert verify_hasher.digest() == digest
            total_verify_time += (time.perf_counter() - start_verify) * 1000

        total_time = (time.perf_counter() - start_time) * 1000

        result = {
            "repetitions": num_repetitions,
            "file_size_mb": file_size_mb,
            "hash_avg_time_ms": total_hash_time / num_repetitions,
            "verify_avg_time_ms": total_verify_time / num_repetitions,
            "total_time_ms": (total_hash_time + total_verify_time),
            "last_digest": last_digest,
            "total_time": total_time
        }

        return json.dumps(result)
    except Exception as e:
        display(f"Error: {e}", target="pyscript-output")

sync.js_run_py_benchmark = js_run_py_benchmark
