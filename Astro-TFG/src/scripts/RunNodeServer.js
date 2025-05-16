export function runNodeBenchmark(jsPath) {
    clearCell('node-js-output');
    const cleanedPath = encodeURIComponent(jsPath.replace(/^\/+/, ''));

    fetch('/api/run-backend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            type: 'node',
            path: cleanedPath.toString(),
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            const type = data.type;
            if (type === 'matrix') {
                import('../scripts/MatrixDisplay.js')
                    .then((module) => {
                        module.display(data, 'node-js-output');
                    })
                    .catch((error) => {
                        console.error('Error loading module:', error);
                    });
            } else {
                import('../scripts/GenericDisplay.js')
                    .then((module) => {
                        module.display(data.data, 'node-js-output');
                    })
                    .catch((error) => {
                        console.error('Error loading module:', error);
                    });
            }
        })
        .catch((error) => console.error('Error:', error));
}