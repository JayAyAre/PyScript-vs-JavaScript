import time
import os
import json
import asyncio
from pyscript import sync, document
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes


async def do_hash(worker_time):
    await asyncio.sleep(0.1)

    reps = int(document.getElementById("num-repetitions-pyscript").value)
    size_mb = float(document.getElementById("message-size-pyscript").value)
    size_b = int(size_mb * 1024 * 1024)

    plaintext = os.urandom(size_b)

    encrypt_total = 0.0
    decrypt_total = 0.0
    success_count = 0
    ciphertext = b""
    start_overall = time.perf_counter()

    for _ in range(reps):
        t0 = time.perf_counter()
        key = get_random_bytes(16)
        cipher = AES.new(key, AES.MODE_GCM)
        ct, tag = cipher.encrypt_and_digest(plaintext)
        encrypt_total += (time.perf_counter() - t0) * 1000

        t1 = time.perf_counter()
        dec = AES.new(key, AES.MODE_GCM, nonce=cipher.nonce)
        try:
            recovered = dec.decrypt_and_verify(ct, tag)
            if recovered == plaintext:
                success_count += 1
        except Exception:
            pass
        decrypt_total += (time.perf_counter() - t1) * 1000

        ciphertext = ct

    integrity_ok = success_count == reps
    overall = (time.perf_counter() - start_overall) * 1000

    result = {
        "repetitions": reps,
        "message_size_mb": size_mb,
        "encrypt_avg_ms": encrypt_total / reps,
        "decrypt_avg_ms": decrypt_total / reps,
        "crypto_total_ms": encrypt_total + decrypt_total,
        "overall_time_ms": overall,
        "integrity_ok": integrity_ok,
        "success_count": success_count,
        "success_percentage": (success_count / reps) * 100,
        "ciphertext_bytes": len(ciphertext)
    }
    return json.dumps(result)

sync.do_hash = do_hash
