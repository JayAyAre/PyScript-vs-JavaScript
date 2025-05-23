import numpy as np
from flask import Flask, jsonify
from flask_cors import CORS
import time
import threading

app = Flask(__name__)
CORS(app)
PORT = 5001

active_requests = 0
lock = threading.Lock()


@app.route('/mock-api/<int:delay>')
def mock_api(delay):
    global active_requests

    with lock:
        active_requests += 1
        current_active = active_requests

    # print(f"Concurrent requests now: {current_active}")

    try:
        if delay != 0:
            time.sleep(delay / 1000)

        data = [{"id": i, "value": float(np.random.rand())} for i in range(10)]

        response = {
            "status": "success",
            "delay": delay,
            "data": data,
        }

        return jsonify(response)

    finally:
        with lock:
            active_requests -= 1


if __name__ == '__main__':
    print(f"Python Server is running on http://localhost:{PORT}")
    app.run(port=PORT, threaded=True)
