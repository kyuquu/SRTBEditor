let rememberedActions = {};

async function popupButtons(title, content, options, allowRemember) {
    document.getElementById("popup-background").classList.add("active");
    document.getElementById("popup-title").textContent = title;
    document.getElementById("popup-content").textContent = content;

    let cont = document.getElementById("popup-options");
    while(cont.hasChildNodes())
        cont.removeChild(cont.firstChild);
    for(i in options) {
        let newButton = document.createElement("button");
        newButton.classList.add("popup-input");
        newButton.textContent = options[i];
        newButton.setAttribute("onclick", `resolvePopup(${i})`);
        cont.appendChild(newButton);
    }

    //if allowremember, show a checkbox
    if(allowRemember) {
        document.getElementById("popup-remember").classList.remove("hidden");
        document.getElementById("popup-checkbox").checked = false;
    }
    else
        document.getElementById("popup-remember").classList.add("hidden");

    let elem = document.getElementById("popup-result");
    await (async () => {
        return new Promise((res) => {
            elem.onclick= () => res(true);
        });
    })();
    closePopup();
    return elem.value;
}

async function popupInput(title, content, placeholder) {
    //todo: rework popup to get built from scratch instead of reusing sub-elements

    document.getElementById("popup-background").classList.add("active");
    document.getElementById("popup-title").textContent = title;
    document.getElementById("popup-content").textContent = content;

    let cont = document.getElementById("popup-options");
    while(cont.hasChildNodes())
        cont.removeChild(cont.firstChild);

    let textInput = document.createElement("input");
    textInput.setAttribute("id", "popup-input");
    // textInput.classList.add("popup-input");
    // textInput.classList.add("small");
    if(placeholder) textInput.setAttribute("placeholder", placeholder);
    textInput.addEventListener("keyup", (e) => {
        if(e.key === "Enter")
            resolvePopup(0);
    });
    cont.appendChild(textInput);

    let submitInput = document.createElement("button");
    submitInput.setAttribute("onclick", "resolvePopup(0)");
    submitInput.innerText = "Submit";
    submitInput.setAttribute("style", "margin-left: 1rem");
    // submitInput.classList.add("popup-input");
    // submitInput.classList.add("small");
    cont.appendChild(submitInput);

    document.getElementById("popup-remember").classList.add("hidden");

    let elem = document.getElementById("popup-result");

    textInput.focus();
    
    await (async () => {
        return new Promise((res) => {
            elem.onclick= () => res(true);
        });
    })();
    closePopup();
    return elem.value;
}

function closePopup() {
    document.getElementById("popup-background").classList.remove("active");
}

async function popupConfirmLoad() {
    if(rememberedActions.confirmLoad == 1)
        return true;

    let options = ["Load", "Cancel"];
    return popupButtons("Load New Chart",
        "Are you sure you want to load a new chart? All unsaved progress will be lost.",
        options, true).then((result) => {
            if(result != 0) return false;
            
            //if allowRemember, store the remembered value in a global array
            let remElem = document.getElementById("popup-checkbox");
            if(remElem.checked)
                rememberedActions.confirmLoad = 1;
            return true;
        });
}

async function popupLoadFromSpinshare() {
    return popupInput("Load from SpinShare",
        "Enter a SpinShare link or ID:",
        "spinsha.re/song/#####").then((result) => {
            if(result != 0) return;
            return document.getElementById("popup-input").value;
        });
}

function resolvePopup (val) {
    let elem = document.getElementById("popup-result");
    elem.value = val;
    elem.click();
}