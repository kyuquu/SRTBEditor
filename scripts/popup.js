const cancelOption = {
    text: "Cancel",
    action: closePopup,
    type: 0
}

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
        newButton.textContent = options[i];
        newButton.setAttribute("onclick", `resolvePopup(${i})`);
        cont.appendChild(newButton);
    }

    //if allowremember, show a checkbox

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

async function confirmLoad() {
    let options = ["Save First", "Don't Save", "Cancel"];
    return popup("Load New Chart",
        "Are you sure you want to load a new chart? All unsaved progress will be lost.",
        options).then((result) => {
            //if allowRemember, store the remembered value in a global array
            if(result == 0) return true;
            return false;
        });
}

function resolvePopup (val) {
    let elem = document.getElementById("popup-result");
    elem.value = val;
    elem.click();
}