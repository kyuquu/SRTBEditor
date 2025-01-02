function initializeSelectInput(name, values) {
    let element = document.getElementById(name);

    let text = values["text"];
    let options = values["options"];
    let defaultIndex = values["default"];
    let func = values["function"];

    let optionElements = "";
    for (let i = 0; i < options.length; i++) {
        optionElements += `
            <button class="select-input-option" onclick="selectOption(${i}, '${options[i]}', this.parentElement.parentElement, '${func}')" onmouseover="hoverOption(${i}, this.parentElement.parentElement)">
                ${options[i]}
            </button>
        `;
    }

    element.removeAttribute("id");
    element.setAttribute("tabindex", "0");
    element.innerHTML = `
        <label for="${name}">${text}</label>
        <button class="select-input-button" id="${name}" onclick="toggleSelectInput('${name}')">
            <div>
                <div class="select-input-selected">${options[defaultIndex]}</div>
                <div class="select-input-preview disabled"></div>
                <input type="text" class="select-input-query disabled">
            </div>
            <div></div>
        </button>
        <div class="select-input-options">
            ${optionElements}
        </div>
    `;

    element.onkeydown = (e) => {
        element.querySelector(".select-input-selected").classList.add("disabled");
        element.querySelector(".select-input-preview").classList.remove("disabled");
        element.querySelector(".select-input-query").classList.add("disabled");

        let tabIndex;
        if (element.querySelector(".select-input-option.hovered")) {
            tabIndex = getHoveredIndex(element);
        }
        else {
            tabIndex = 0;
        }

        if (e.key === "ArrowUp" || (e.shiftKey && e.key === "Tab")) {
            e.preventDefault();
            tabIndex = tabIndex === 0 ? options.length - 1 : tabIndex - 1;
            element.querySelector(".select-input-query").value = "";
            element.querySelector(".select-input-preview").textContent = options[tabIndex];
            element.querySelector(".select-input-options").scrollTo(0, (rem * tabIndex));
            hoverOption(tabIndex, element);
        }
        else if (e.key === "ArrowDown" || e.key === "Tab") {
            e.preventDefault();
            tabIndex = (tabIndex + 1) % options.length;
            element.querySelector(".select-input-query").value = "";
            element.querySelector(".select-input-preview").textContent = options[tabIndex];
            element.querySelector(".select-input-options").scrollTo(0, (rem * tabIndex));
            hoverOption(tabIndex, element);
        }
        else if (e.key === "Enter") {
            e.preventDefault();
            selectOption(tabIndex, options[tabIndex], element, func);
            toggleSelectInput(element.querySelector(".select-input-button").id);
            // do stuff
        }
        else if (!e.shiftKey) {
            element.querySelector(".select-input-preview").classList.add("disabled");
            element.querySelector(".select-input-query").classList.remove("disabled");
            element.querySelector(".select-input-query").focus();
        }
    }

    element.querySelector(".select-input-query").oninput = () => {
        let tabIndex = queryOption(options, element.querySelector(".select-input-query").value);
        element.querySelector(".select-input-options").scrollTo(0, (rem * tabIndex));
        element.focus();
        hoverOption(tabIndex, element);
    }
}

function hoverOption(index, element) {
    if (element.querySelector(".select-input-option.hovered")) {
        element.querySelector(".select-input-option.hovered").classList.remove("hovered");
    }
    element.querySelector(".select-input-options").children[index].classList.add("hovered");
}

function getHoveredIndex(element) {
    return Array.from(element.querySelector(".select-input-options").children).indexOf(element.querySelector(".select-input-option.hovered"))
}

function queryOption(options, string) {
    for (let i = 0; i < options.length; i++) {
        if (options[i].toUpperCase().includes(string.toUpperCase())) {
            return i;
        }
    }

    return 0;
}

function selectOption(index, option, element, func) {
    let selectedOption = element.querySelector(".select-input-selected").textContent.trim();
    if (selectedOption === "" || selectedOption !== option) {
        element.querySelector(".select-input-selected").textContent = option;
        window[func](index);   
    }
}

function toggleSelectInput(id) {
    if (document.querySelector(".select-input.active") && !document.getElementById(id).parentElement.classList.contains("active")) {
        document.querySelector(".select-input.active").classList.remove("active");
    }
    else if (document.querySelector(".select-input.active")) {
        document.querySelector(".select-input.active").querySelector(".select-input-query").value = "";
        document.querySelector(".select-input.active").querySelector(".select-input-query").classList.add("disabled");
        document.querySelector(".select-input.active").querySelector(".select-input-preview").classList.add("disabled");
        document.querySelector(".select-input.active").querySelector(".select-input-selected").classList.remove("disabled");
    }

    document.getElementById(id).parentElement.classList.toggle("active");
    document.getElementById(id).nextElementSibling.scrollTop = 0;
    hoverOption(0, document.getElementById(id).parentElement);
    document.getElementById(id).querySelector(".select-input-preview").textContent =
        document.getElementById(id).parentElement.querySelector(".select-input-option.hovered").textContent.trim();
}

