function initializeButton(name, values) {
    let element = document.getElementById(`button-${name}`);
    element.textContent = values["text"];
    element.setAttribute("onclick", values["function"]);
}