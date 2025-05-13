export function display(base64Data, elementId) {
    const img = document.createElement("img");
    img.src = `data:image/png;base64,${base64Data}`;
    img.style.maxWidth = "100%";
    const outputDiv = document.getElementById(elementId);
    if (!outputDiv) return;
    outputDiv.appendChild(img);
}

export function displayPlotFromJSON(jsonStr, elementId) {
    try {
        const graphData = JSON.parse(jsonStr);
        const elementDiv = document.getElementById(elementId);
        if (!elementDiv) return;
        let container = document.createElement('div');
        container.id = `container-graph-${elementId}`;
        elementDiv.appendChild(container);
        Plotly.newPlot(
            container.id,
            graphData.data,
            graphData.layout || {}
        );
    } catch (e) {
        console.error('Error parsing or rendering Plotly graph:', e);
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = 'Error al mostrar el gráfico con Plotly';
        }
    }
}

export function startFPSMeasurement(duration, elementId) {
    const container = document.getElementById(elementId);
    if (!container) return;

    let startTime = performance.now();
    let frameCount = 0;

    function countFrame(now) {
        frameCount++;
        const elapsed = now - startTime;
        if (elapsed >= duration) {
            const fps = (frameCount * 1000) / elapsed;
            const msg = document.createElement('div');
            msg.textContent = `FPS (últimos ${Math.round(duration)} ms): ${fps.toFixed(2)}`;
            container.appendChild(msg);
        } else {
            requestAnimationFrame(countFrame);
        }
    }

    requestAnimationFrame(countFrame);
}