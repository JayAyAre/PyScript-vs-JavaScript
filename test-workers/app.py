from flask import Flask, render_template, send_from_directory, Response

app = Flask(__name__, static_folder="static", template_folder="templates")


@app.after_request
def add_security_headers(response: Response):
    response.headers['Cross-Origin-Opener-Policy'] = 'same-origin'
    response.headers['Cross-Origin-Embedder-Policy'] = 'require-corp'
    return response


@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory("static", filename)


@app.route('/')
def home():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(ssl_context=('server-cert.pem', 'server-key.pem'),
            host='0.0.0.0', port=8000)
