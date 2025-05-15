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
    return round(process.memory_info().rss / (1024 * 1024), 2)


def get_cpu_usage():
    return psutil.cpu_percent(interval=None)


def benchmark_primes_py(repetitions, n):
    total_time = 0
    total_memory = 0
    total_cpu = 0

    start_total = time.time()

    for _ in range(repetitions):
        start_memory = get_memory_usage()
        start = time.time()

        cpu_before = get_cpu_usage()
        primes = sieve_of_eratosthenes(n)
        cpu_after = get_cpu_usage()

        end = time.time()
        memory_usage = get_memory_usage() - start_memory

        total_time += (end - start) * 1000
        total_memory += memory_usage
        total_cpu += cpu_after

    end_total = time.time()
    total_exec_time = round((end_total - start_total) * 1000, 2)
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

            results = benchmark_primes_py(1000, 10_000)
            response = json.dumps(results)
            self.wfile.write(response.encode())


def run_server():
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, RequestHandler)
    print("Server running at http://localhost:5000")
    httpd.serve_forever()


if __name__ == '__main__':
    run_server()
