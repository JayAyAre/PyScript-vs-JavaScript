from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import time
import psutil
import os
import numpy as np


def create_matrix(size):
    return np.random.rand(size, size)


def get_memory_usage():
    process = psutil.Process(os.getpid())
    return round(process.memory_info().rss / (1024 * 1024), 2)


def get_cpu_usage():
    return psutil.cpu_percent()


def multiply_matrices(size):
    start_memory = get_memory_usage()
    start_cpu = get_cpu_usage()

    A = create_matrix(size)
    B = create_matrix(size)

    start_time = time.time()

    C = np.dot(A, B)

    end_time = time.time()

    end_memory = get_memory_usage()
    end_cpu = get_cpu_usage()

    execution_time = round((end_time - start_time) * 1000, 2)
    memory_used = round(end_memory - start_memory, 2)
    cpu_usage = round(end_cpu - start_cpu, 2)

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
