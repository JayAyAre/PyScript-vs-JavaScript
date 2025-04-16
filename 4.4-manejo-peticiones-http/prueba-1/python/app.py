from flask import Flask, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)


@app.route('/mock-api/<int:delay>')
def mock_api(delay):
    time.sleep(delay/1000)
    return jsonify({
        "status": "success",
        "delay": delay,
        "data": [{"id": i, "value": i*10} for i in range(1000)]
    })


if __name__ == '__main__':
    app.run(port=5001)
