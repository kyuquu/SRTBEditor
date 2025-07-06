const loadingScreen = document.getElementById("loading-screen");
const loadingMessage = document.getElementById("loading-message");

let templateTrackInfo;
let templateTrackData;
let templateClipInfo;

function enabledWriting() {
    JSONEditor.setReadOnly(false);
}


async function init() {
    loadingMessage.textContent = "INITIALIZING TEMPLATES...";

    let requests = [];
    let templateFilenames = ["Custom.json", "Custom.srtb", "Inertia.srtb", "CUTIEMARKS (And the Things That Bind Us).srtb"];
    for (let i = 0; i < templateFilenames.length; i++) {
        requests.push(
            fetch("./templates/" + templateFilenames[i]).then(response => response.json())
        );
    }

    await Promise.all(requests)
        .then((templates) => {
            for (let i = 0; i < templates.length; i++) {
                chartTemplates[templateFilenames[i]] = templates[i];
            }
            
        });
    

    templateJSON = chartTemplates["Custom.json"];

    let references = getReferences(templateJSON);
    templateTrackInfo = references[0];
    templateTrackData = references[1];
    templateClipInfo = references[2];



    loadingMessage.textContent = "INITIALIZING COMPONENTS...";

    await fetch("data/components.json")
        .then(response => response.json())
        .then((data) => {
            let dropdowns = data["dropdowns"];
            for (let dropdown in dropdowns) {
                initializeDropdown(dropdown, dropdowns[dropdown]);
            }

            let buttons = data["buttons"];
            for (let button in buttons) {
                initializeButton(button, buttons[button]);
            }

            let numberInputs = data["number-inputs"];
            for (let numberInput in numberInputs) {
                initializeNumberInput(numberInput, numberInputs[numberInput]);
            }

            let textInputs = data["text-inputs"];
            for (let textInput in textInputs) {
                initializeTextInput(textInput, textInputs[textInput]);
            }

            let checkboxes = data["checkboxes"];
            for (let checkbox in checkboxes) {
                initializeCheckbox(checkbox, checkboxes[checkbox]);
            }

            let fileInputs = data["file-inputs"];
            for (let fileInput in fileInputs) {
                initializeFileInput(fileInput, fileInputs[fileInput]);
            }

            let selectInputs = data["select-inputs"];
            for (let selectInput in selectInputs) {
                initializeSelectInput(selectInput, selectInputs[selectInput]);
            }
        });
    
    // startup modifications
    // disable the save dropdown until a chart is loaded
    document.querySelector(".dropdown.disabled > button").setAttribute("disabled", "true");

    // configure JSON editor to be readOnly when hitting escape, to allow tab navigation
    // restore writability when focusing back on it
    let editorElement = document.querySelector("#editor");
    editorElement.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            JSONEditor.setReadOnly(true);
        }
    }); 
    let textArea = document.querySelector(".ace_text-input");
    textArea.setAttribute("onfocus", "enabledWriting()");
    
    loadingScreen.classList.remove("active");
    
    document.addEventListener("keydown", (e) => {
        if (isDevModeEnabled) {
            if (e.ctrlKey && e.shiftKey && e.code === "Digit0") {
                e.preventDefault();
                loadTemplate("Custom.json");
            }
            else if (e.ctrlKey && e.shiftKey && e.code === "Digit1") {
                e.preventDefault();
                loadTemplate("Custom.srtb");
            }
            else if (e.ctrlKey && e.shiftKey && e.code === "Digit2") {
                e.preventDefault();
                loadTemplate("Inertia.srtb");
            }
            else if (e.ctrlKey && e.shiftKey && e.code === "Digit3") {
                e.preventDefault();
                loadTemplate("CUTIEMARKS (And the Things That Bind Us).srtb");
            }
        }
    });
}

init();