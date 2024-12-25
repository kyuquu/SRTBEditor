function initializeCheckbox(name, values) {
    let element = document.getElementById(name);

    let text = values["text"];
    let func = values["function"];

    element.removeAttribute("id");
    element.innerHTML = `
        <input type="checkbox" id="${name}" onchange="${func}">
        <label for="${name}">${text}</label>
    `;
}