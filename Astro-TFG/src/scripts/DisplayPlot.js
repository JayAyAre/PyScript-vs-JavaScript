export function display(base64Data, elementId) {
    const img = document.createElement("img");
    img.src = `data:image/png;base64,${base64Data}`;
    img.style.maxWidth = "100%";
    const outputDiv = document.getElementById(elementId);
    if (!outputDiv) return;
    outputDiv.appendChild(img);
}