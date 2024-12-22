let chartJSON;

let chartFilename;

let trackInfo;
let trackData;
let clipData;

const JSONEditorSave = document.getElementById("jv-save");
const JSONEditorDiscard = document.getElementById("jv-discard");



let editorTimeout;
let editorTimeoutLength = 500;

function getJSONValue(property) {
    let defaultValue = trackInfo[property]["default"];
    let referenceArray = trackInfo[property]["reference"];
    return referenceArray.reduce((xs, x) => xs?.[x] ?? defaultValue, chartJSON);
}

function updateJSONValue(property, value) {
    let referenceArray = trackInfo[property]["reference"];
    let JSONValue = chartJSON;
    for (let i = 0; i < referenceArray.length - 1; i++) {
        if (JSONValue[referenceArray[i]] !== undefined) {
            JSONValue = JSONValue[referenceArray[i]];
        }
        else return;
    }
    if (JSONValue[referenceArray[referenceArray.length - 1]] !== undefined) {
        JSONValue[referenceArray[referenceArray.length - 1]] = value;
    }
    updateJSONEditor(JSON.stringify(chartJSON, null, 4));
}

function validateJSON(json) {
    try {
        let obj = JSON.parse(json);
        if (obj && typeof obj === "object") {
            return obj;
        }
    } catch (e) {
        return false;
    }
}

function updateJSONEditor(json) {
    let cursorPos = JSONEditor.selection.getCursor();
    JSONEditor.session.setValue(json);
    JSONEditor.selection.moveCursorTo(cursorPos.row, cursorPos.column);

    JSONEditorSave.classList.add("disabled");
    JSONEditorDiscard.classList.add("disabled");
}

function saveEditorChanges() {
    chartJSON = JSON.parse(JSONEditor.getValue());

    for (let property in trackInfo) {
        let value = getJSONValue(property);
        updateTBValue(property, value);
        updateBVValue(property, value);
    }

    JSONEditor.focus();

    JSONEditorSave.classList.add("disabled");
    JSONEditorDiscard.classList.add("disabled");
}

function discardEditorChanges() {
    updateJSONEditor(JSON.stringify(chartJSON, null, 4));

    JSONEditor.focus();

    JSONEditorSave.classList.add("disabled");
    JSONEditorDiscard.classList.add("disabled");
}

function updateEditorButtons(JSONIfValid) {
    if (JSONIfValid !== false) {
        JSONEditorSave.classList.remove("disabled");

        if (JSON.stringify(JSONIfValid) === JSON.stringify(chartJSON)) {
            JSONEditorSave.classList.add("disabled");
            JSONEditorDiscard.classList.add("disabled");
        }
        else {
            JSONEditorDiscard.classList.remove("disabled");
        }
    }
    else {
        JSONEditorSave.classList.add("disabled");
        JSONEditorDiscard.classList.remove("disabled");
    }
}

JSONEditor.session.on("change", () => {
    if (editorTimeout) {
        clearTimeout(editorTimeout)
    }

    editorTimeout = setTimeout(() => {
        updateEditorButtons(validateJSON(JSONEditor.getValue()));
    }, editorTimeoutLength);

    JSONEditorSave.classList.add("disabled");
    JSONEditorDiscard.classList.add("disabled");
});



function updateTBValue(property, value) {
    if (document.getElementById(`tb-${property}`) !== null) {
        document.getElementById(`tb-${property}`).textContent = value;
    }

    if (property === "title" && value.length === 0) {
        document.getElementById("tb-title").innerHTML = "<i>Untitled</i>";
    }
}



function processBVInput(type, property) {
    let BVElement = document.getElementById(`bv-${property}`);

    let value;
    if (type === "text") {
        value = BVElement.value;
    }
    else if (type === "checkbox") {
        value = BVElement.checked;
    }

    updateTBValue(property, value);
    updateJSONValue(property, value);
}

function updateBVValue(property, value) {
    if (document.getElementById(`bv-${property}`) !== null) {
        let BVElement = document.getElementById(`bv-${property}`);
        if (typeof value === "string") {
            BVElement.value = value;
        }
        else if (typeof value === "boolean") {
            BVElement.checked = value;
        }
        else {
           console.log("data type not yet supported");
        }
    }
}



function enableUserInput() {
    document.getElementById("tb-save").classList.remove("disabled");
    document.querySelector(".bv0").classList.remove("disabled");
    document.querySelector(".bv1").classList.remove("disabled");
    document.querySelector(".jv").classList.remove("disabled");
}

function loadChartData(data) {
    if (chartJSON === undefined) {
        enableUserInput();
    }

    chartJSON = data;

    fetch("./data/chart-data-template.json")
        .then(response => response.json())
        .then((data) => {
            trackInfo = data["track-info"];
            trackData = data["track-data"];
            clipData = data["clip-data"];

            for (let property in trackInfo) {
                let value = getJSONValue(property);
                updateTBValue(property, value);
                updateBVValue(property, value);
            }

            updateJSONEditor(JSON.stringify(chartJSON, null, 4));
        });
}