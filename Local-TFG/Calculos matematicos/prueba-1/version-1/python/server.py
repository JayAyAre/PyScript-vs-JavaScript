from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import random
import time
import psutil
import os
import gc


def create_matrix(size):
    return [[random.random() for _ in range(size)] for _ in range(size)]


def get_memory_usage():
    process = psutil.Process(os.getpid())
    return round(process.memory_info().rss / (1024 * 1024), 2)


def multiply_matrices(size):
    gc.collect()
    start_memory = get_memory_usage()
    process = psutil.Process(os.getpid())
    process.cpu_percent(interval=None)

    A = create_matrix(size)
    B = create_matrix(size)

    C = [[0] * size for _ in range(size)]

    start_time = time.perf_counter()

    for i in range(size):
        for j in range(size):
            _sum = 0
            for k in range(size):
                _sum += A[i][k] * B[k][j]
            C[i][j] = _sum

    end_time = time.perf_counter()

    execution_time = round((end_time - start_time) * 1000, 2)
    memory_used = abs(get_memory_usage() - start_memory)
    cpu_usage = abs(process.cpu_percent(interval=1))

    return {
        'time': execution_time,
        'cpu_usage': cpu_usage,
        'memory_usage': memory_used
    }


class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.send_response(code=200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Access-Control-Allow-Methods', 'GET')
            self.send_header("User-Agent", "Anything")
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            results = multiply_matrices(300)
            response = json.dumps(results)
            self.wfile.write(response.encode())


def run_server():
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, RequestHandler)
    print("Server running at http://localhost:5000")
    httpd.serve_forever()


if __name__ == '__main__':
    run_server()
