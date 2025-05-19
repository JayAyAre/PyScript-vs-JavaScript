from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import time
import psutil
import tracemalloc
import gc


def calculate_pi(digits):
    pi = 0.0
    for k in range(digits):
        pi += (1 / (16**k)) * (
            (4 / (8 * k + 1)) -
            (2 / (8 * k + 4)) -
            (1 / (8 * k + 5)) -
            (1 / (8 * k + 6))
        )
    return pi


def get_memory_usage():
    return tracemalloc.get_traced_memory()[1] / (1024 * 1024)


def get_cpu_usage():
    return psutil.cpu_percent()


def n_digits_pi(repetitions, digits):
    total_time = 0
    total_memory = 0
    total_cpu = 0

    start_total = time.perf_counter()

    for _ in range(repetitions):
        tracemalloc.start()
        start = time.perf_counter()
        gc.collect()
        pi_value = calculate_pi(digits)
        cpu_after = get_cpu_usage()

        end = time.perf_counter()
        memory_usage = get_memory_usage()
        tracemalloc.stop()

        total_time += (end - start) * 1000
        total_memory += memory_usage
        total_cpu += cpu_after

    total_exec_time = round((time.perf_counter() - start_total) * 1000, 2)
    avg_time = round(total_time / repetitions, 2)
    avg_memory = round(total_memory / repetitions, 2)
    avg_cpu = round(total_cpu / repetitions, 2)

    return {
        'time': total_exec_time,
        'avg_time': avg_time,
        'avg_memory_usage': avg_memory,
        'avg_cpu_usage': avg_cpu
    }


class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/":
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Access-Control-Allow-Methods', 'GET')
            self.send_header("User-Agent", "Anything")
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            results = n_digits_pi(1_000, 1_000)
            response = json.dumps(results)
            self.wfile.write(response.encode())


def run_server():
    server_address = ('', 5_000)
    httpd = HTTPServer(server_address, RequestHandler)
    print("Server running at http://localhost:5000")
    httpd.serve_forever()


if __name__ == '__main__':
    run_server()
