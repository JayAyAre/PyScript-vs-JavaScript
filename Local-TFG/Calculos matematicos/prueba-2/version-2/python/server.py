import gc
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import time
import psutil
import os
import sympy


def sieve_of_eratosthenes(n):
    return list(sympy.primerange(0, n + 1))


def get_memory_usage():
    process = psutil.Process(os.getpid())
    return max(process.memory_info().rss / (1024 * 1024), 0)


def get_cpu_usage(process):
    return process.cpu_percent(interval=None)


def benchmark_primes_py(repetitions, n):
    gc.collect()
    process = psutil.Process(os.getpid())
    process.cpu_percent(interval=None)

    total_time = 0
    total_memory = 0
    total_cpu = 0

    start_total = time.perf_counter()

    for _ in range(repetitions):
        gc.collect()
        start_memory = get_memory_usage()
        start = time.perf_counter()

        cpu_before = get_cpu_usage(process)
        primes = sieve_of_eratosthenes(n)
        cpu_after = get_cpu_usage(process)

        end = time.perf_counter()
        memory_usage = get_memory_usage() - start_memory
        cpu_usage = cpu_after - cpu_before

        total_time += (end - start) * 1000
        total_memory += memory_usage
        total_cpu += cpu_usage

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
            self.send_response(code=200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            results = benchmark_primes_py(1_000, 10_000)
            response = json.dumps(results)
            self.wfile.write(response.encode())


def run_server():
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, RequestHandler)
    print("Server running at http://localhost:5000")
    httpd.serve_forever()


if __name__ == '__main__':
    run_server()
