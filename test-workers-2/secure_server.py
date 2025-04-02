import http.server
import ssl


class SecureHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()


server_address = ('', 8000)
httpd = http.server.HTTPServer(server_address, SecureHTTPRequestHandler)

# Crear contexto SSL
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")

# Envolver el socket con SSL usando el contexto
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print("Servidor HTTPS corriendo en https://localhost:8000")
httpd.serve_forever()
