export function display(data, elementId) {
    const outputDiv = document.getElementById(elementId);
    if (!outputDiv) return;

    Object.entries(data.data).forEach(([key, result]) => {
        if (!result) return;

        let sizeDiv = document.createElement('div');
        sizeDiv.textContent = `Matriz ${result.size}`;
        sizeDiv.style.fontWeight = 'bold';
        outputDiv.appendChild(sizeDiv);

        let timeDiv = document.createElement('div');
        timeDiv.textContent = `ET: ${result.time} ms (${result.size})`;
        outputDiv.appendChild(timeDiv);

        let cpuDiv = document.createElement('div');
        cpuDiv.textContent = `CPU: ${result.cpu_usage} %`;
        outputDiv.appendChild(cpuDiv);

        let memoryDiv = document.createElement('div');
        memoryDiv.textContent = `RAM: ${result.memory_usage} MB`;
        outputDiv.appendChild(memoryDiv);
    });
}
