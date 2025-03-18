function initializeNumberInput(name, values) {
    let element = document.getElementById(name);

    let text = values["text"];
    let func = values["function"];

    element.removeAttribute("id");
    element.innerHTML = `
        <label for="${name}">${text}</label>
        <input type="number" min="1" step="1" onkeypress="return event.keyCode === 8 || event.charCode >= 48 && event.charCode <= 57"
                id="${name}" onblur="this.scrollLeft=0" onchange="${func}">
    `;
}