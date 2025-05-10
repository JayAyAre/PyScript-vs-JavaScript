export function display(data, elementId) {
    const outputDiv = document.getElementById(elementId);
    if (!outputDiv) return;

    Object.entries(data.data).forEach(([testName, result]) => {
        if (!result) return;

        Object.entries(result).forEach(([key, value], index) => {
            const div = document.createElement('div');
            div.textContent = value;
            outputDiv.appendChild(div);

            if (index === 3) {
                outputDiv.appendChild(document.createElement('br'));
            }
        });
    });
}
