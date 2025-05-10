export function runPyBackendBenchmark(pyPath) {
    clearCell('pythonBackend-output');
    const cleanedPath = encodeURIComponent(pyPath.replace(/^\/+/, ''));

    fetch('/api/run-backend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'python',
            path: cleanedPath.toString(),
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            const type = data.type;

            if (type === 'matrix') {
                import('../scripts/MatrixDisplay.js')
                    .then((module) => {
                        module.display(data, 'pythonBackend-output');
                    })
                    .catch((error) => {
                        console.error('Error loading module:', error);
                    });
            } else {
                import('../scripts/GenericDisplay.js')
                    .then((module) => {
                        module.display(data, 'pythonBackend-output');
                    })
                    .catch((error) => {
                        console.error('Error loading module:', error);
                    });
            }
        })
        .catch((error) => console.error('Error:', error));
}