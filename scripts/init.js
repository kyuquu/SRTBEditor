const loadingScreen = document.getElementById("loading-screen");
const loadingMessage = document.getElementById("loading-message");

let templateTrackInfo;
let templateTrackData;
let templateClipInfo;


async function init() {
    loadingMessage.textContent = "INITIALIZING TEMPLATES...";

    let requests = [];
    let templateFilenames = ["Custom.json", "Custom.srtb", "Inertia.srtb", "CUTIEMARKS (And the Things That Bind Us).srtb", "Diff Header.json", "Diff Index.json", "Diff Body.json"];
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
        if (e.ctrlKey && e.code === "KeyS" && activeTab === 1) {
            e.preventDefault();
            if(validateJSON(JSONEditor.getValue())) {
                saveEditorChanges();
            }
            else {
                console.warn("cannot save invalid JSON");
            }
        }
    });

    // handle dragging files in
    window.addEventListener("drop", (e) => { //process drag&drop behavior
        if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
            e.preventDefault();
            processFileDrop(e);
        }
    });
    document.addEventListener("dragover", (e) => { //UI to reflect drag&drop ability
        const fileItems = [...e.dataTransfer.items].filter(
            (item) => item.kind === "file",
        );
        if (fileItems.length > 0) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        }
    });

    popup("Sample popup", "this is a test popup. please close it",
        [{text: "Close", action: "closePopup()", type: 0}]);

}

init();

function processFileDrop(e) {
    let file = e.dataTransfer.files[0];
    let extension = file.name.split('.');
    extension = extension[extension.length-1];

    if (file.type.startsWith("image/")) {
        if(!trackData) createToast("Upload failed", "Please load or create a chart before uploading an image", "warning", 5000);
        else if(extension == "jpg" || extension == "jpeg" || extension == "png") {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            document.getElementById("bv-album-art").files = dataTransfer.files;
            updateAlbumArt();
        }
        else createToast("Upload failed", "Only .jpg and .png images are supported", "warning", 5000);
    }
    else if (file.type.startsWith("audio/") || extension == "ogg") {
        if(!trackData) createToast("Upload failed", "Please load or create a chart before uploading audio", "warning", 5000);
        else if(extension == "ogg" || extension == "mp3") {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            document.getElementById("bv-audio-clips").files = dataTransfer.files;
            updateAudioClips();
        }
        else createToast("Upload failed", "Only .ogg and .mp3 audio files are supported", "warning", 5000);
    }
    else if (extension == "srtb" || extension == "zip" || extension == "json") {
        if(!trackData || confirm("This will discard all changes and load a new chart. Are you sure?"))
            loadChartFile(file);
    }
    else {
        createToast("Upload failed", "Unrecognized file type: " + file.name, "warning", 5000);
    }
}