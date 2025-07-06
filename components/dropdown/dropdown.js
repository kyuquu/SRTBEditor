function initializeDropdown(name, values) {
    let element = document.getElementById(name);

    let text = values["text"];

    let options = "";
    for (let i = 0; i < values["options"].length; i++) {
        options += `
            <button class="dropdown-option button" tabIndex="-1" onclick="${values["options"][i]["function"]}">
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

    //close other dropdowns
    if (document.querySelector(".dropdown.active") && !document.getElementById(dropdown).classList.contains("active")) {
        let otherDropdown = document.querySelector(".dropdown.active")
        otherDropdown.classList.remove("active");

        let otherOptions = otherDropdown.getElementsByClassName("dropdown-options")[0].children[0];
        for (let i = 0; i < otherOptions.children.length; i++) {
            otherOptions.children[i].setAttribute("tabindex", "-1");
        }
    }

    let dd = document.getElementById(dropdown);
    dd.classList.toggle("active");
    let options = dd.getElementsByClassName("dropdown-options")[0].children[0];

    if(dd.classList.contains("active")) {
        for (let i = 0; i < options.children.length; i++) {
            options.children[i].removeAttribute("tabindex");
        }
    } else {
        for (let i = 0; i < options.children.length; i++) {
            options.children[i].setAttribute("tabindex", "-1");
        }
    }
}