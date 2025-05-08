export function display(data, elementId) {
    let result = data.data;
    console.log('Received data:', result);
    let outputDiv = document.getElementById(elementId);
    if (!outputDiv) return;

    let timeDiv = document.createElement('div');
    timeDiv.textContent = `ET: ${result.time} ms`;
    outputDiv.appendChild(timeDiv);

    let cpuDiv = document.createElement('div');
    cpuDiv.textContent = `CPU: ${result.cpu_usage} %`;
    outputDiv.appendChild(cpuDiv);

    let memoryDiv = document.createElement('div');
    memoryDiv.textContent = `RAM: ${result.memory_usage} MB`;
    outputDiv.appendChild(memoryDiv);
}