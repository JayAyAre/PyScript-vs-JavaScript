function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

self.onmessage = function (event) {
    const { id, size, draw } = event.data;
    const start = performance.now();

    const coords = new Float64Array(size * 2);
    for (let i = 0; i < coords.length; i++) {
        coords[i] = Math.random();
    }
    const dataGenTime = performance.now() - start;
    const memoryUsage = coords.byteLength / 1024 ** 2;

    let renderTime = 0;
    let base64 = null;

    if (draw) {
        const renderStart = performance.now();
        const canvas = new OffscreenCanvas(800, 600);
        const ctx = canvas.getContext("2d");

        const padding = 50;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ejes
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();

        // Ticks y etiquetas X
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) {
            const value = i * 0.2;
            const xPos = padding + value * chartWidth;
            ctx.beginPath();
            ctx.moveTo(xPos, canvas.height - padding);
            ctx.lineTo(xPos, canvas.height - padding + 5);
            ctx.stroke();
            ctx.fillText(value.toFixed(1), xPos, canvas.height - padding + 18);
        }

        // Ticks y etiquetas Y
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (let i = 0; i <= 5; i++) {
            const value = i * 0.2;
            const yPos = canvas.height - padding - value * chartHeight;
            ctx.beginPath();
            ctx.moveTo(padding, yPos);
            ctx.lineTo(padding - 5, yPos);
            ctx.stroke();
            ctx.fillText(value.toFixed(1), padding - 10, yPos);
        }

        // Dibujar puntos
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "blue";
        for (let i = 0; i < size; i++) {
            const x = padding + coords[i * 2] * chartWidth;
            const y = canvas.height - padding - coords[i * 2 + 1] * chartHeight;
            ctx.fillRect(x, y, 1, 1);
        }

        // Título
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            `${size.toLocaleString()} Points Scatter Plot`,
            canvas.width / 2,
            30
        );

        canvas
            .convertToBlob({ type: "image/png" })
            .then(async (blob) => {
                const buf = await blob.arrayBuffer();
                base64 = arrayBufferToBase64(buf);
                renderTime = performance.now() - renderStart;
                const totalTime = performance.now() - start;
                self.postMessage({
                    id,
                    results: {
                        image_base64: base64,
                        data_gen_time: dataGenTime,
                        render_time: renderTime,
                        memory: memoryUsage,
                        total_time: totalTime,
                    },
                });
            })
            .catch((e) => {
                self.postMessage({ id, error: e.message, stack: e.stack });
            });
    } else {
        const totalTime = performance.now() - start;
        self.postMessage({
            id,
            results: {
                data_gen_time: dataGenTime,
                render_time: renderTime,
                memory: memoryUsage,
                total_time: totalTime,
            },
        });
    }
};
