export function display(base64Data, elementId) {
    const img = document.createElement("img");
    img.src = `data:image/png;base64,${base64Data}`;
    img.style.maxWidth = "100%";
    const outputDiv = document.getElementById(elementId);
    if (!outputDiv) return;
    outputDiv.appendChild(img);
}

// export function startFPSMeasurement(duration = 3000, id) {
//     let start = performance.now();
//     let frames = 0;
//     let fpsMeasurements = [];

//     function measure() {
//         frames++;
//         let now = performance.now();
//         fpsMeasurements.push(1000 / (now - start));
//         start = now;
//         if (now - < duration) {
//             requestAnimationFrame(measure);
//         } else {
//             const avgFPS = fpsMeasurements.reduce((a, b) => a + b, 0) / fpsMeasurements.length;
//             document.getElementById(id).innerHTML += `<div>Average FPS: ${avgFPS.toFixed(2)}</div>`;
//         }
//     }
//     requestAnimationFrame(measure);
// }

// export function attachRelayoutListener(id, id_output) {
//     const container = document.getElementById(id);
//     container.on('plotly_relayout', function () {
//         startFPSMeasurement(3000, id_output);
//     });
// }


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