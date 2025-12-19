let rememberedActions = {};

/**
 * Generates a generic popup with buttons
 * @param {string} title
 * @param {string} content
 * @param {array[string]} options
 * @param {boolean} allowRemember
 * @returns {promise<int>}
 */
async function popupButtons(title, content, options, allowRemember) {
    //there's no shot this is the 'correct' way to do this.
    let bgElem = document.getElementById("popup-background")
    bgElem.classList.add("active");

    let popupElem = document.getElementById("popup-container");

    while(popupElem.hasChildNodes())
        popupElem.removeChild(popupElem.firstChild);

    let titleElem = document.createElement("span");
    titleElem.id = "popup-title";
    titleElem.textContent = title;
    popupElem.appendChild(titleElem);

    let contentElem = document.createElement("span");
    contentElem.id = "popup-content";
    contentElem.textContent = content;
    popupElem.appendChild(contentElem);

    let inputContElem = document.createElement("span");
    inputContElem.id = "popup-answer";
    popupElem.appendChild(inputContElem);

    for(i in options) {
        let newButton = document.createElement("button");
        newButton.classList.add("popup-button");
        newButton.textContent = options[i];
        newButton.setAttribute("onclick", `resolvePopup(${i})`);
        inputContElem.appendChild(newButton);
    }

    //if allowremember, show a checkbox
    if(allowRemember) {
        let rememberElem = document.createElement("span");
        rememberElem.id = "popup-remember";
        popupElem.appendChild(rememberElem);

        let labelElem = document.createElement("label");
        labelElem.innerText = "Remember this decision";
        rememberElem.appendChild(labelElem);

        let checkElem = document.createElement("input");
        checkElem.type = "checkbox";
        checkElem.checked = false;
        checkElem.id = "popup-checkbox";
        rememberElem.appendChild(checkElem);
    }

    let elem = document.getElementById("popup-result");
    await (async () => {
        return new Promise((res) => {
            elem.onclick= () => res(true);
        });
    })();
    closePopup();
    return elem.value;
}

/**
 * Generate a generic popup with a text input and submit button
 * @param {string} title 
 * @param {string} content 
 * @param {string} placeholder 
 * @returns {promise<string>}
 */
async function popupInput(title, content, placeholder) {
    //there's no shot this is the 'correct' way to do this.
    let bgElem = document.getElementById("popup-background")
    bgElem.classList.add("active");

    let popupElem = document.getElementById("popup-container");

    while(popupElem.hasChildNodes())
        popupElem.removeChild(popupElem.firstChild);

    let titleElem = document.createElement("span");
    titleElem.id = "popup-title";
    titleElem.textContent = title;
    popupElem.appendChild(titleElem);

    let contentElem = document.createElement("span");
    contentElem.id = "popup-content";
    contentElem.textContent = content;
    popupElem.appendChild(contentElem);

    let inputContElem = document.createElement("span");
    inputContElem.id = "popup-answer";
    popupElem.appendChild(inputContElem);

    let textInput = document.createElement("input");
    textInput.id = "popup-input";
    if(placeholder) textInput.placeholder = placeholder;
    textInput.addEventListener("keyup", (e) => {
        if(e.key === "Enter")
            resolvePopup(0);
    });
    inputContElem.appendChild(textInput);

    let submitInput = document.createElement("button");
    submitInput.addEventListener("click", (e) => {resolvePopup(0)});
    submitInput.innerText = "Submit";
    submitInput.style = "margin-left: 1rem";
    inputContElem.appendChild(submitInput);

    let resultElem = document.getElementById("popup-result");

    textInput.focus();
    
    await (async () => {
        return new Promise((res) => {
            resultElem.onclick= () => res(true);
        });
    })();
    closePopup();
    return resultElem.value;
}

function createCheckboxSpan (obj, depth) {
    let spanElem = document.createElement("div");
    spanElem.classList.add("popup-merge-span");
    spanElem.classList.add(`merge-${depth}`);

    let labelElem = document.createElement("label");
    labelElem.innerText = obj.name;
    labelElem.classList.add("merge-label");
    spanElem.appendChild(labelElem);

    let checkElem = document.createElement("input");
    checkElem.type = "checkbox";
    checkElem.title = obj.hint;
    spanElem.appendChild(checkElem);
    
    let hintElem = document.createElement("span");
    hintElem.classList.add("hint");
    hintElem.title = obj.hint;
    hintElem.innerText = "?";
    spanElem.appendChild(hintElem);

    return spanElem;
}

async function popupMergeChart() {
    let bgElem = document.getElementById("popup-background")
    bgElem.classList.add("active");

    let popupElem = document.getElementById("popup-container");

    while(popupElem.hasChildNodes())
        popupElem.removeChild(popupElem.firstChild);

    let titleElem = document.createElement("span");
    titleElem.id = "popup-title";
    titleElem.textContent = "Chart Merging";
    popupElem.appendChild(titleElem);

    let contentElem = document.createElement("span");
    contentElem.id = "popup-content";
    contentElem.textContent = "Check the box of each item you wish to import from the new chart:";
    popupElem.appendChild(contentElem);

    let mergeContElem = document.createElement("span");
    mergeContElem.classList.add("merge-container");
    popupElem.appendChild(mergeContElem);

    for(i in importData) {
        let iElem = createCheckboxSpan(importData[i], 1)
        mergeContElem.appendChild(iElem);
        if(importData[i].subfields) {
            let subElem = document.createElement("span");
            for(j in importData[i].subfields) {
                subElem.appendChild(createCheckboxSpan(importData[i].subfields[j], 2));
            }
            iElem.appendChild(subElem);
        }
    }

    let buttonSpan = document.createElement("span");
    buttonSpan.id = "popup-answer";
    popupElem.appendChild(buttonSpan);

    let confirmButton = document.createElement("button");
    confirmButton.innerText = "Confirm";
    confirmButton.onclick = "resolvePopup(1)";
    buttonSpan.appendChild(confirmButton);

    let cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.onclick = "resolvePopup(0)";
    buttonSpan.appendChild(cancelButton);
    
    let resultElem = document.getElementById("popup-result");

    await (async () => {
        return new Promise((res) => {
            resultElem.onclick= () => res(true);
        });
    })();
    closePopup();

    //what do you want to import from this chart?
    /*
    long checklist:
        main metadata
        difficulty
            clipdata
            notes
            twisty track
        clipdata
            tempomap
            lyrics
    */
}

function closePopup() {
    document.getElementById("popup-background").classList.remove("active");
}

async function popupConfirmLoad() {
    if(rememberedActions.dropAction)
        return rememberedActions.dropAction;

    let options = ["Load", "Merge", "Cancel"];
    return popupButtons("Load New Chart",
        "What would you like to do with this new chart?",
        options, true).then((result) => {
            if(result == 2) return;
            
            //if allowRemember, store the remembered value in a global array
            let remElem = document.getElementById("popup-checkbox");
            if(remElem && remElem.checked)
                rememberedActions.dropAction = result;
            return result;
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