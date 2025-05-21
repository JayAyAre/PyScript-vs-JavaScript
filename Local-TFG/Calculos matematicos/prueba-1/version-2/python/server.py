import gc
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import time
import psutil
import os
import numpy as np

seed = int(time.time() * 1000) % 2**32
rng = np.random.default_rng(seed)


def create_matrix(size):
    return rng.random((size, size))


def get_memory_usage():
    process = psutil.Process(os.getpid())
    return max(process.memory_info().rss / (1024 * 1024), 0)


def get_cpu_usage():
    return psutil.cpu_percent()


def multiply_matrices(size):
    gc.collect()
    start_memory = get_memory_usage()
    process = psutil.Process(os.getpid())
    process.cpu_percent(interval=None)

    A = create_matrix(size)
    B = create_matrix(size)

    start_time = time.perf_counter()

    C = np.dot(A, B)

    execution_time = round((time.perf_counter() - start_time) * 1000, 2)
    memory_used = abs(get_memory_usage() - start_memory)
    cpu_usage = abs(process.cpu_percent(interval=1))

    return {
        'size': f'{size}x{size}',
        'time': execution_time,
        'cpu_usage': cpu_usage,
        'memory_usage': memory_used
    }


class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Access-Control-Allow-Methods', 'GET')
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            results = {
                "matrices500": multiply_matrices(500),
                "matrices1000": multiply_matrices(1000),
                "matrices2000": multiply_matrices(2000)
            }

            response = json.dumps(results)
            self.wfile.write(response.encode())


def run_server():
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, RequestHandler)
    print("Server running at http://localhost:5000")
    httpd.serve_forever()


if __name__ == '__main__':
    run_server()
