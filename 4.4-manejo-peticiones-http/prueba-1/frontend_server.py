from flask import Flask, send_from_directory, make_response
import os

app = Flask(__name__, static_folder='.')

# Ruta principal: sirve index.html


@app.route('/')
def index():
    response = make_response(send_from_directory('.', 'index.html'))
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    return response

# Ruta para archivos estáticos


@app.route('/<path:filename>')
def serve_static(filename):
    response = make_response(send_from_directory('.', filename))
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    return response


if __name__ == '__main__':
    app.run(port=8000)
