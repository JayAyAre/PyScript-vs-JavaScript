import numpy as np
from flask import Flask, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)
PORT = 5001


@app.route('/mock-api/<int:delay>')
def mock_api(delay):
    if delay != 0:
        time.sleep(delay / 1000)

    data = [{"id": i, "value": np.random.rand()} for i in range(10)]

    return jsonify({
        "status": "success",
        "delay": delay,
        "data": data
    })


if __name__ == '__main__':
    print(f"Python Server is running on http://localhost:{PORT}")
    app.run(port=PORT)
