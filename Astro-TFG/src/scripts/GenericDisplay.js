export function display(data, elementId) {
    const outputDiv = document.getElementById(elementId);
    if (!outputDiv) return;

    Object.entries(data).forEach(([key, value]) => {
        const div = document.createElement('div');
        div.textContent = `${value}`;
        outputDiv.appendChild(div);
    });
}
