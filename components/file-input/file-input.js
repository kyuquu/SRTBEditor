function initializeFileInput(name, values) {
    let element = document.getElementById(name);

    let text = values["text"];
    let accept = values["accept"];
    let func = values["function"];

    element.removeAttribute("id");
    element.innerHTML = `
        <label for="${name}">${text}</label>
        <div>
            <button class="button" onclick="document.getElementById('${name}').click()">UPLOAD</button>
            <span id="${name}-filename" class="filename">No file selected</span>
            <span id="${name}-size" class="size"></span>
        </div>
        <input type="file" accept="${accept}" id="${name}" onchange="${func}">
    `;
}