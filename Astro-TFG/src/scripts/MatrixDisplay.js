export function display(data, elementId) {
    const outputDiv = document.getElementById(elementId);
    if (!outputDiv) return;

    Object.entries(data.data).forEach(([testName, result]) => {
        if (!result) return;

        Object.entries(result).forEach(([key, value], index) => {
            const div = document.createElement('div');

            if (key === 'size') {
                div.textContent = `Matriz ${value}`;
                div.style.fontWeight = 'bold';
            } else {
                div.textContent = value;
            }

            outputDiv.appendChild(div);

            if (index === 3) {
                outputDiv.appendChild(document.createElement('br'));
                outputDiv.appendChild(document.createElement('hr'));
                outputDiv.appendChild(document.createElement('br'));
            }
        });
    });
}