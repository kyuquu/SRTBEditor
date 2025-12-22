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
            if(i == 0) newButton.focus();
        }
    }

    if(allowRemember) {
        let rememberElem = document.createElement("span");
        rememberElem.id = "popup-remember";

        let labelElem = document.createElement("label");
        labelElem.innerText = "Remember this decision";

        let checkElem = document.createElement("input");
        checkElem.type = "checkbox";
        checkElem.checked = false;
        checkElem.id = "popup-checkbox";

        labelElem.addEventListener("click", (e) => {
            checkElem.click();
        });

        popupElem.appendChild(rememberElem);
        rememberElem.appendChild(labelElem);
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
    document.getElementById("popup-container").classList.remove("inactive");
    document.getElementById("popup-merge-container").classList.add("inactive");
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

    let checkElem = document.createElement("input");
    checkElem.classList.add("merge-check");
    checkElem.type = "checkbox";
    checkElem.title = obj.hint;
    checkElem.id = `merge-${i}${depth==2?`-${j}`:""}`;
    
    let hintElem = document.createElement("svg");
    hintElem.classList.add("hint");
    hintElem.title = obj.hint;
    hintElem.innerText = "---";

    labelElem.addEventListener("click", (e) => {
        checkElem.click();
    });

    spanElem.appendChild(labelElem);
    spanElem.appendChild(checkElem);
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
        if(typeof checks[i] == "object") {
            checks[i].checked = false;
            checks[i].removeAttribute("disabled");
        }
    }
}

function initializeMergeCheckboxes() {
    let container = document.getElementById("merge-checkbox-container");

    let contentElem = document.getElementById("merge-instruction");
    contentElem.textContent = `Check the box of each item you wish to import from`;

    for(let i = 0; i < importData.length; i++) {
        let iElem = createCheckboxSpan(importData[i], i);
        container.appendChild(iElem);
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
        }
    }

    let confirmButton = document.getElementById("merge-confirm");
    confirmButton.setAttribute("onclick", "resolvePopup(1)");

    let cancelButton = document.getElementById("merge-cancel");
    cancelButton.setAttribute("onclick", "resolvePopup(0)");

}

async function popupMergeChart(chartTitle, chartSubtitle, newJson) {
    document.getElementById("popup-merge-container").classList.remove("inactive");
    document.getElementById("popup-container").classList.add("inactive");

    let bgElem = document.getElementById("popup-background")
    bgElem.classList.add("active");

    let summaryTitle = document.getElementById("merge-title");
    summaryTitle.innerText = `${chartTitle?chartTitle:"no title"}`;

    let summarySubtitle = document.getElementById("merge-subtitle");
    summarySubtitle.innerText = ` ${chartSubtitle?chartSubtitle:""}`;

    for(let i = 0; i < importData.length; i++) {
        let iElem = document.getElementById(`merge-${i}`);
        let diff = iElem.parentElement.getAttribute("diff");
        iElem.parentElement.classList.remove("merge-disabled");
        iElem.parentElement.querySelector("input").classList.remove("merge-faded");

        if(diff || diff == 0) {
            if(!diffExistsByDiff(newJson, diff)) { //diff doesn't exist
                uncheckAll(iElem);
                iElem.parentElement.classList.add("merge-disabled");
            }
            else if(!isDiffActiveByDiff(newJson, diff)) { //diff is disabled
                iElem.parentElement.classList.add("merge-faded");
                iElem.parentElement.querySelector("input").classList.add("merge-faded");
            }
        }
    }

    document.getElementById("merge-0").focus();
    
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
    document.getElementById("popup-container").classList.remove("inactive");
    document.getElementById("popup-merge-container").classList.add("inactive");
    if(rememberedActions.dropAction == 0 || rememberedActions.dropAction == 1)
        return rememberedActions.dropAction;

    let options = ["Load", "Merge", "Cancel"];
    return popupButtons("Load New Chart",
        "What would you like to do with this new chart?",
        options, true).then((result) => {
            if(result == 2 || result < 0) return;
            
            //if allowRemember, store the remembered value in a global array
            let remElem = document.getElementById("popup-checkbox");
            if(remElem && remElem.checked)
                rememberedActions.dropAction = result;
            return result;
        });
}

async function popupConfirmLeaveTab() {
    document.getElementById("popup-container").classList.remove("inactive");
    document.getElementById("popup-merge-container").classList.add("inactive");
    if(rememberedActions.leaveEditor == 0 || rememberedActions.leaveEditor == 1)
        return rememberedActions.leaveEditor;

    let options = ["Save", "Don't Save", "Cancel"];
    return popupButtons("Unsaved Changes",
        "Are you sure you want to leave this tab? All unsaved changes will be lost.",
        options, true).then((result) => {
            if(result == 2 || result < 0) return result;
            
            //if allowRemember, store the remembered value in a global array
            let remElem = document.getElementById("popup-checkbox");
            if(remElem && remElem.checked)
                rememberedActions.leaveEditor = result;
            return result;
        });


}

async function popupConfirmModernizeFormat() {
    document.getElementById("popup-container").classList.remove("inactive");
    document.getElementById("popup-merge-container").classList.add("inactive");
    if(rememberedActions.modernize == true)
        return true;

    let options = ["Confirm", "Cancel"];
    return popupButtons("Modernize Note Format",
        "The modern note format is more accurate and less prone to float error. However, this change will wipe leaderboards. Continue?",
        options, true).then((result) => {
            if(result != 0) return false;
            
            //if allowRemember, store the remembered value in a global array
            let remElem = document.getElementById("popup-checkbox");
            if(remElem && remElem.checked)
                rememberedActions.modernize = true;
            return true;
        });
}

async function popupLoadFromSpinshare() {
    document.getElementById("popup-container").classList.remove("inactive");
    document.getElementById("popup-merge-container").classList.add("inactive");
    return popupInput("Load from SpinShare",
        "Enter a SpinShare link or ID:",
        "spinsha.re/song/#####").then((result) => {
            if(result != 0) return;
            return document.getElementById("popup-input").value;
        });
}

async function popupRoll() {
    document.getElementById("popup-container").classList.remove("inactive");
    document.getElementById("popup-merge-container").classList.add("inactive");
    let rando = Math.floor(Math.random() * 100 + 1);
    return popupButtons("",
        "@you, " + rando, ["ok"]).then();
}

function resolvePopup (val) {
    let elem = document.getElementById("popup-result");
    elem.value = val;
    elem.click();
}