from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import random
import time
import psutil


def create_matrix(size):
    return [[random.random() for _ in range(size)] for _ in range(size)]


def get_memory_usage():
    memory_info = psutil.virtual_memory()
    return memory_info.total - memory_info.available


def multiply_matrices(size):
    start_memory = get_memory_usage()

    A = create_matrix(size)
    B = create_matrix(size)
    C = [[0] * size for _ in range(size)]

    start_time = time.time()

    for i in range(size):
        for j in range(size):
            _sum = 0
            for k in range(size):
                _sum += A[i][k] * B[k][j]
            C[i][j] = _sum

    end_time = time.time()

    end_memory = get_memory_usage()

    psutil.cpu_percent(interval=1)

    cpu_before = psutil.cpu_percent(interval=1)
    cpu_after = psutil.cpu_percent(interval=1)

    memory_used = round((end_memory - start_memory) /
                        (1024 * 1024), 3)

    execution_time = round((end_time - start_time) * 1000, 2)

    return {
        'time': execution_time,
        'cpu_usage': round(cpu_after - cpu_before, 2),
        'memory_usage': memory_used
    }

# Handler HTTP


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

            results = multiply_matrices(200)
            response = json.dumps(results)
            self.wfile.write(response.encode())


def run_server():
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, RequestHandler)
    print("Servidor corriendo en http://localhost:5000")
    httpd.serve_forever()


if __name__ == '__main__':
    run_server()
