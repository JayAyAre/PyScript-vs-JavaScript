export function display(data, elementId) {
    const result = data.data;
    console.log('Received data:', result);
    const outputDiv = document.getElementById(elementId);
    if (!outputDiv) return;

    Object.entries(result).forEach(([key, value]) => {
        const div = document.createElement('div');
        div.textContent = value;
        outputDiv.appendChild(div);
    });
}
