const GRAPH_SIZE = 100_000;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDING = 50;

function toBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

const mean = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length;

self.onmessage = async function (e) {
    const msg = e.data;
    if (msg.type !== "do_analisis") return;
    const benchmarkStart = performance.now();

    const { id, num_executions } = msg;

    try {
        const rawResults = [];

        for (let run = 0; run < num_executions; run++) {
            const runStart = performance.now();

            const t0 = performance.now();
            const coords = new Float64Array(GRAPH_SIZE * 2);
            for (let i = 0; i < coords.length; i++) {
                coords[i] = Math.random();
            }
            const dataGenTime = performance.now() - t0;
            const memoryMB = coords.byteLength / 1024 ** 2;

            const t1 = performance.now();
            const canvas = new OffscreenCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(PADDING, PADDING);
            ctx.lineTo(PADDING, CANVAS_HEIGHT - PADDING);
            ctx.moveTo(PADDING, CANVAS_HEIGHT - PADDING);
            ctx.lineTo(CANVAS_WIDTH - PADDING, CANVAS_HEIGHT - PADDING);
            ctx.stroke();

            ctx.font = "12px sans-serif";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            const chartW = CANVAS_WIDTH - 2 * PADDING;
            const chartH = CANVAS_HEIGHT - 2 * PADDING;
            for (let i = 0; i <= 5; i++) {
                const v = i * 0.2;
                const x = PADDING + v * chartW;
                ctx.beginPath();
                ctx.moveTo(x, CANVAS_HEIGHT - PADDING);
                ctx.lineTo(x, CANVAS_HEIGHT - PADDING + 5);
                ctx.stroke();
                ctx.fillText(v.toFixed(1), x, CANVAS_HEIGHT - PADDING + 18);
            }
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            for (let i = 0; i <= 5; i++) {
                const v = i * 0.2;
                const y = CANVAS_HEIGHT - PADDING - v * chartH;
                ctx.beginPath();
                ctx.moveTo(PADDING, y);
                ctx.lineTo(PADDING - 5, y);
                ctx.stroke();
                ctx.fillText(v.toFixed(1), PADDING - 10, y);
            }

            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "blue";
            for (let i = 0; i < GRAPH_SIZE; i++) {
                const x = PADDING + coords[i * 2] * chartW;
                const y = CANVAS_HEIGHT - PADDING - coords[i * 2 + 1] * chartH;
                ctx.fillRect(x, y, 1, 1);
            }
            ctx.globalAlpha = 1.0;

            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.fillText(
                `${GRAPH_SIZE.toLocaleString()} Points Scatter Plot`,
                CANVAS_WIDTH / 2,
                30
            );

            let imageBase64 = null;
            try {
                const blob = await canvas.convertToBlob({ type: "image/png" });
                const buffer = await blob.arrayBuffer();
                imageBase64 = toBase64(buffer);
            } catch { }

            const renderTime = performance.now() - t1;
            const totalTime = performance.now() - runStart;

            rawResults.push({
                data_gen_time: dataGenTime,
                render_time: renderTime,
                memory: memoryMB,
                total_time: totalTime,
                image_base64: imageBase64
            });
        }

        const avgDataGen = mean(rawResults.map(r => r.data_gen_time));
        const avgRender = mean(rawResults.map(r => r.render_time));
        const avgMemory = mean(rawResults.map(r => r.memory));
        const avgTotal = mean(rawResults.map(r => r.total_time));
        const totalBenchmarkTime = performance.now() - benchmarkStart;

        const result = {
            data_gen_time: avgDataGen,
            render_time: avgRender,
            memory: avgMemory,
            average_time_ms: avgTotal,
            total_time_ms: avgTotal,
            image_base64: rawResults[rawResults.length - 1].image_base64
        };

        self.postMessage({
            id,
            json: JSON.stringify(result)
        });

    } catch (err) {
        self.postMessage({
            id,
            error: `Worker error: ${err.message}`
        });
    }
};
