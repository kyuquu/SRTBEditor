function initializeNumberInput(name, values) {
    let element = document.getElementById(name);

    let text = values["text"];
    let func = values["function"];

    element.removeAttribute("id");
    element.innerHTML = `
        <label for="${name}">${text}</label>
        <input type="text" id="${name}" onblur="this.scrollLeft=0" onchange="${func}">
    `;
}