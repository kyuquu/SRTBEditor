function initializeNumberInput(name, values) {
    let element = document.getElementById(name);

    let text = values["text"];
    let func = values["function"];

    element.removeAttribute("id");
    element.innerHTML = `
        <label for="${name}">${text}</label>
        <input type="number" step="1" onkeypress="return event.key === '-' || event.key === '.' || event.key === ',' || event.key >= '0' && event.key <= '9'"
                id="${name}" onblur="this.scrollLeft=0" onchange="${func}">
    `;
}