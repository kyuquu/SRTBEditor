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

    if(title) {
        let titleElem = document.createElement("span");
        titleElem.id = "popup-title";
        titleElem.textContent = title;
        popupElem.appendChild(titleElem);
    }

    if(content) {
        let contentElem = document.createElement("span");
        contentElem.id = "popup-content";
        contentElem.textContent = content;
        popupElem.appendChild(contentElem);
    }

    if(options && options.length > 0) {
        let inputContElem = document.createElement("span");
        inputContElem.id = "popup-answer";
        popupElem.appendChild(inputContElem);

        for(let i in options) {
            let newButton = document.createElement("button");
            newButton.classList.add("popup-button");
            newButton.textContent = options[i];
            newButton.setAttribute("onclick", `resolvePopup(${i})`);
            inputContElem.appendChild(newButton);
        }
    }

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

    if(title) {
        let titleElem = document.createElement("span");
        titleElem.id = "popup-title";
        titleElem.textContent = title;
        popupElem.appendChild(titleElem);
    }

    if(content) {
        let contentElem = document.createElement("span");
        contentElem.id = "popup-content";
        contentElem.textContent = content;
        popupElem.appendChild(contentElem);
    }

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

function createCheckboxSpan (obj, i, j) {
    let depth = 1;
    if(j || j == 0) depth = 2;

    let spanElem = document.createElement("div");
    spanElem.classList.add(`merge-${depth}`);
    if(obj.difftype || obj.difftype == 0)
        spanElem.setAttribute("diff", obj.difftype);

    let labelElem = document.createElement("label");
    labelElem.innerText = obj.name;
    labelElem.classList.add("merge-label");
    spanElem.appendChild(labelElem);

    let checkElem = document.createElement("input");
    checkElem.classList.add("merge-check");
    checkElem.type = "checkbox";
    checkElem.title = obj.hint;
    checkElem.id = `merge-${i}${depth==2?`-${j}`:""}`;
    spanElem.appendChild(checkElem);
    
    let hintElem = document.createElement("span");
    hintElem.classList.add("hint");
    hintElem.title = obj.hint;
    hintElem.innerText = "?";
    spanElem.appendChild(hintElem);

    return spanElem;
}

function propogateCheck(elem) {
    let checked = elem.checked;
    let subChecks = elem.parentElement.querySelectorAll(".merge-check");
    for(let i in subChecks) {
        if(subChecks[i].id && subChecks[i].id != elem.id) {
            if(checked) {
                subChecks[i].setAttribute("prevState", subChecks[i].checked);
                subChecks[i].checked = true;
                subChecks[i].setAttribute("disabled", true);
            }
            else {
                let prevState = subChecks[i].getAttribute("prevState");
                subChecks[i].checked = (prevState === "true");
                subChecks[i].removeAttribute("disabled");
            }
        }
    }
}

function uncheckAll(elem) {
    let checks = elem.parentElement.querySelectorAll(".merge-check");
    for(let i in checks) {
        checks[i].checked = false;
    }
}

async function popupMergeChart(chartTitle, chartSubtitle, newJson) {
    let bgElem = document.getElementById("popup-background")
    bgElem.classList.add("active");

    let popupElem = document.getElementById("popup-container");

    while(popupElem.hasChildNodes())
        popupElem.removeChild(popupElem.firstChild);

    let contentElem = document.createElement("span");
    contentElem.id = "popup-content";
    contentElem.textContent = `Check the box of each item you wish to import from`;
    popupElem.appendChild(contentElem);

    let summaryElem = document.createElement("span");
    popupElem.appendChild(summaryElem);

    let summaryTitle = document.createElement("span");
    summaryTitle.innerText = `${chartTitle}`;
    summaryTitle.classList.add("merge-title");
    summaryElem.appendChild(summaryTitle);

    let summarySubtitle = document.createElement("span");
    summarySubtitle.innerText = ` ${chartSubtitle?chartSubtitle:""}`;
    summarySubtitle.classList.add("merge-subtitle");
    summaryElem.appendChild(summarySubtitle);

    let mergeContElem = document.createElement("span");
    mergeContElem.classList.add("merge-container");
    popupElem.appendChild(mergeContElem);

    for(let i = 0; i < importData.length; i++) {
        let iElem = createCheckboxSpan(importData[i], i);
        mergeContElem.appendChild(iElem);
        let diff = iElem.getAttribute("diff");
        if(diff || diff == 0) {
            if(!diffExistsByDiff(newJson, diff)) {//diff doesn't exist
                uncheckAll(iElem);
                iElem.classList.add("merge-disabled");
            }
            else if(!isDiffActiveByDiff(newJson, diff)) {
                iElem.classList.add("merge-faded");
                iElem.querySelector("input").classList.add("merge-faded");
            }
        }
        if(importData[i].subfields) {
            iElem.querySelector("input").addEventListener("change", (e) => {
                propogateCheck(e.target);
            });
            let subElem = document.createElement("span");
            for(let j in importData[i].subfields) {
                let jElem = createCheckboxSpan(importData[i].subfields[j], i, j);
                subElem.appendChild(jElem);
            }
            iElem.appendChild(subElem);
            //todo: remember checkboxes for repeat instances
            //BUG: inertia <- toaster vid (metadata + remixd) results in disabled remixd diff

        }
    }

    let buttonSpan = document.createElement("span");
    buttonSpan.id = "popup-answer";
    popupElem.appendChild(buttonSpan);

    let confirmButton = document.createElement("button");
    confirmButton.innerText = "Confirm";
    confirmButton.setAttribute("onclick", "resolvePopup(1)");
    confirmButton.classList.add("popup-button");
    buttonSpan.appendChild(confirmButton);

    let cancelButton = document.createElement("button");
    cancelButton.innerText = "Cancel";
    cancelButton.setAttribute("onclick", "resolvePopup(0)");
    cancelButton.classList.add("popup-button");
    buttonSpan.appendChild(cancelButton);
    
    let resultElem = document.getElementById("popup-result");

    await (async () => {
        return new Promise((res) => {
            resultElem.onclick= () => res(true);
        });
    })();
    closePopup();
    return resultElem.value;
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

async function popupRoll() {
    let rando = Math.floor(Math.random() * 100 + 1);
    return popupButtons("",
        "@you, " + rando, []).then();
}

function resolvePopup (val) {
    let elem = document.getElementById("popup-result");
    elem.value = val;
    elem.click();
}

