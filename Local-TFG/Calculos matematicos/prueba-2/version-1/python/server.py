from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import time
import psutil
import os


def is_prime(n):
    if n < 2:
        return False
    if n in (2, 3):
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False

    for k in range(5, int(n**0.5) + 1, 2):
        if n % k == 0:
            return False
    return True


def get_memory_usage():
    process = psutil.Process(os.getpid())
    return round(process.memory_info().rss / (1024 * 1024), 2)


def get_cpu_usage():
    return psutil.cpu_percent()


def primes_to_n(n):
    start_memory = get_memory_usage()
    start_cpu = get_cpu_usage()
    start_time = time.perf_counter()

    primes = []

    if n > 2:
        primes.append(2)

    for i in range(3, n, 2):
        if is_prime(i):
            primes.append(i)

    execution_time = round((time.perf_counter() - start_time) * 1000, 2)
    memory_used = round(get_memory_usage() - start_memory, 2)
    cpu_usage = round(get_cpu_usage() - start_cpu, 2)

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

            results = primes_to_n(1_000_000)
            response = json.dumps(results)
            self.wfile.write(response.encode())


def run_server():
    server_address = ('', 5000)
    httpd = HTTPServer(server_address, RequestHandler)
    print("Server running at http://localhost:5000")
    httpd.serve_forever()


if __name__ == '__main__':
    run_server()
