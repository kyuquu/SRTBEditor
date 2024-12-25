const loadingScreen = document.getElementById("loading-screen");
const loadingMessage = document.getElementById("loading-message");

async function init() {
    loadingMessage.textContent = "FETCHING .SRTB REFERENCES...";

    await fetch("./data/chart-data-template.json")
        .then(response => response.json())
        .then((data) => {
            trackInfo = data["track-info"];
            trackData = data["track-data"];
            clipData = data["clip-data"];
        });



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
        });



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