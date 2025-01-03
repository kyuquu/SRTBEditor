function initializeDropdown(name, values) {
    let element = document.getElementById(name);

    let text = values["text"];

    let options = "";
    for (let i = 0; i < values["options"].length; i++) {
        options += `
            <button class="dropdown-option button" onclick="${values["options"][i]["function"]}">
                ${values["options"][i]["text"]}
            </button>
        `;
    }

    element.innerHTML = `
        <button class="dropdown-button button">
            <div>
                <span>${text}</span>
                <span></span>
            </div>
        </button>
        <div class="dropdown-options">
            <div>
                ${options}
            </div>
        </div>
    `;

    element.setAttribute("onclick", `toggleDropdown("${name}")`);
}

function toggleDropdown(dropdown) {
    if (document.querySelector(".dropdown.active") && !document.getElementById(dropdown).classList.contains("active")) {
        document.querySelector(".dropdown.active").classList.remove("active");
    }
    document.getElementById(dropdown).classList.toggle("active");
}