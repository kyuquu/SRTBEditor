let rememberedActions = {};

async function popup(title, content, options, allowRemember) {
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
    if(allowRemember)
        document.getElementById("popup-remember").classList.remove("hidden");
    else
        document.getElementById("popup-remember").classList.add("hidden");

    let elem = document.getElementById("popup-result");
    await (async () => {
        return new Promise((res) => {
            elem.onclick= () => res(true);
        });
    })();
    let result = elem.value;
    closePopup();
    return result;
}

function closePopup() {
    document.getElementById("popup-background").classList.remove("active");
}

async function popupConfirmLoad() {
    console.log(rememberedActions);
    if(rememberedActions.confirmLoad == 1)
        return true;

    let options = ["Load", "Cancel"];
    return popup("Load New Chart",
        "Are you sure you want to load a new chart? All unsaved progress will be lost.",
        options, true).then((result) => {
            if(result == 1) return false;
            
            //if allowRemember, store the remembered value in a global array
            let remElem = document.getElementById("popup-checkbox");
            if(remElem.checked)
                rememberedActions.confirmLoad = 1;
            return true;
        });
}

function resolvePopup (val) {
    let elem = document.getElementById("popup-result");
    elem.value = val;
    elem.click();
}