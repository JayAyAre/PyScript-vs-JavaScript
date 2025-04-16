# import subprocess
# import os
# import time
# import http.server
# import ssl
# import threading
# import sys
# from pathlib import Path

# base_dir = Path(__file__).resolve().parent


# class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
#     def end_headers(self):
#         self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
#         self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
#         self.send_header('Access-Control-Allow-Origin', '*')
#         self.send_header('Access-Control-Allow-Methods', 'GET')
#         super().end_headers()


# def run_secure_server():
#     os.chdir(base_dir)  # Servir desde el directorio actual
#     server_address = ('', 8000)
#     httpd = http.server.HTTPServer(server_address, SecureHTTPRequestHandler)

#     context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
#     context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")
#     httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

#     print("🌐 HTTPS frontend disponible en https://localhost:8000")
#     httpd.serve_forever()


# def run_python_api():
#     print("🐍 Ejecutando Python API...")
#     subprocess.run([sys.executable, str(
#         base_dir / "python" / "app.py")], cwd=base_dir / "python")


# def run_js_api():
#     print("🟨 Ejecutando JavaScript API...")
#     subprocess.run(["node", str(base_dir / "javascript" /
#                    "app.js")], cwd=base_dir / "javascript")


# commands = [
#     ("Secure HTTP Server", run_secure_server),
#     ("Python API", run_python_api),
#     ("JavaScript API", run_js_api)
# ]

# threads = []

# try:
#     for name, target in commands:
#         print(f"🔄 Starting {name}...")
#         t = threading.Thread(target=target, daemon=True)
#         t.start()
#         threads.append((name, t))
#         time.sleep(1)

#     print("\n✅ Todos los servidores están corriendo.")
#     print("Presiona Ctrl+C para detenerlos.\n")

#     while True:
#         time.sleep(10)

# except KeyboardInterrupt:
#     print("\n🛑 Deteniendo servidores...")
#     for name, _ in threads:
#         print(f"🔴 Cerrando {name}...")
#     print("✅ Todos los servidores detenidos.")
import subprocess
import os
import time
import http.server
import ssl
import threading

base_dir = os.path.abspath(os.path.dirname(__file__))


class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        super().end_headers()


def run_secure_server():
    server_address = ('', 8000)
    httpd = http.server.HTTPServer(server_address, SecureHTTPRequestHandler)

    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

    print("Server HTTPS running on https://localhost:8000")
    httpd.serve_forever()


commands = [
    ("Secure HTTP Server", run_secure_server)
]

processes = []

try:
    for name, target in commands:
        print(f"Starting {name}...")
        process = threading.Thread(target=target, daemon=True)
        process.start()
        processes.append((name, process))
        time.sleep(1)

    print("✅ All servers started.")

    while True:
        time.sleep(10)

except KeyboardInterrupt:
    print("\n🛑 Stopping servers...")
    for name, process in processes:
        print(f"🔴 Closing {name}...")
    print("✅ All servers stopped.")
