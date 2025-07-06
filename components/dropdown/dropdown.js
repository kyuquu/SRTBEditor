function initializeDropdown(name, values) {
    let element = document.getElementById(name);

    let text = values["text"];

    let options = "";
    for (let i = 0; i < values["options"].length; i++) {
        options += `
            <button class="dropdown-option button" disabled onclick="${values["options"][i]["function"]}">
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
    element.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAllDropdowns();
        }
    }); 
}

function toggleDropdown(dropdown) {

    // close other dropdowns
    if (document.querySelector(".dropdown.active") && !document.getElementById(dropdown).classList.contains("active")) {
        let otherDd = document.querySelector(".dropdown.active")
        otherDd.classList.remove("active");

        let otherOptions = otherDd.getElementsByClassName("dropdown-options")[0].children[0];
        for (let i = 0; i < otherOptions.children.length; i++) {
            otherOptions.children[i].setAttribute("disabled", "true");
        }
    }

    let dd = document.getElementById(dropdown);
    dd.classList.toggle("active");
    let options = dd.getElementsByClassName("dropdown-options")[0].children[0];

    // toggle accessibility to keyboard navigation
    if(dd.classList.contains("active")) {
        for (let i = 0; i < options.children.length; i++) {
            options.children[i].removeAttribute("disabled");
        }
    } else {
        for (let i = 0; i < options.children.length; i++) {
            options.children[i].setAttribute("disabled", "true");
        }
    }
}

function closeAllDropdowns() {
    while(document.querySelector(".dropdown.active")) {
        let dd = document.querySelector(".dropdown.active")
        dd.classList.remove("active");

        let options = dd.getElementsByClassName("dropdown-options")[0].children[0];
        for (let i = 0; i < options.children.length; i++) {
            options.children[i].setAttribute("disabled", "true");
        }
    }
}