let chartJSON;

let chartFilename;

let trackInfo;
let trackData;
let clipInfo;

let albumArt;
let audioClips;

const JSONEditorSave = document.getElementById("jv-save");
const JSONEditorDiscard = document.getElementById("jv-discard");



let editorTimeout;
let editorTimeoutLength = 500;

function getJSONValue(obj, property) {
    let defaultValue = obj[property]["default"];
    let referenceArray = obj[property]["reference"];
    return referenceArray.reduce((xs, x) => xs?.[x] ?? defaultValue, chartJSON);
}

function updateJSONValue(obj, property, value) {
    let referenceArray = obj[property]["reference"];
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

    if (getJSONValue(trackInfo, "album-art-reference") !== document.getElementById("bv-album-art-filename").textContent.split(".").slice(0, -1).join(".") && document.getElementById("bv-album-art-filename").textContent !== "No file selected") {
        window.alert("WARNING:\nChanging the album art reference may prevent the chart from loading the album art if you download as ZIP.");
    }
    else if (getJSONValue(clipInfo, "clip-asset-reference") !== document.getElementById("bv-audio-clips-filename").textContent.split(".").slice(0, -1).join(".") && document.getElementById("bv-audio-clips-filename").textContent !== "No file selected") {
        window.alert("WARNING:\nChanging the audio asset reference may prevent the chart from loading the audio if you download as ZIP.");
    }

    for (let property in trackInfo) {
        let value = getJSONValue(trackInfo, property);
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
    updateJSONValue({...trackInfo, ...trackData, ...clipInfo}, property, value);
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
    }
}



function updateAlbumArt() {
    let fileInput = document.getElementById("bv-album-art");
    let file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById("bv-album-art-image").src = e.target.result;
        document.getElementById("bv-album-art-filename").textContent = file.name;
        document.getElementById("bv-album-art-size").textContent = fileSize(file.size);
    };
    reader.readAsDataURL(file);

    albumArt = file;

    updateJSONValue(trackInfo, "album-art-reference", file.name.split(".").slice(0, -1).join("."));
}

function resetAlbumArt() {
    let fileInput = document.getElementById("bv-album-art");
    if (fileInput.value !== "") {
        fileInput.value = "";
        document.getElementById("bv-album-art-image").src = "./assets/images/Default_-_Cover.png";
        document.getElementById("bv-album-art-filename").textContent = "No file selected";
        document.getElementById("bv-album-art-size").textContent = "";
    }
}



function updateAudioClips() {
    let fileInput = document.getElementById("bv-audio-clips");
    let file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById("bv-audio-clips-audio").src = e.target.result;
        document.getElementById("bv-audio-clips-filename").textContent = file.name;
        document.getElementById("bv-audio-clips-size").textContent = fileSize(file.size);
    };
    reader.readAsDataURL(file);

    audioClips = file;

    updateJSONValue(clipInfo, "clip-asset-reference", file.name.split(".").slice(0, -1).join("."));
}

function resetAudioClips() {
    let fileInput = document.getElementById("bv-audio-clips");
    if (fileInput.value !== "") {
        fileInput.value = "";
        document.getElementById("bv-audio-clips-audio").src = "./assets/audio/Get Good.ogg";
        document.getElementById("bv-audio-clips-filename").textContent = "No file selected";
        document.getElementById("bv-audio-clips-size").textContent = "";
    }
}



function fileSize(size) {
    if (size > 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(2)} MB`;
    }
    else if (size > 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    }
    else {
        return `${size} B`;
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

    for (let property in trackInfo) {
        let value = getJSONValue(trackInfo, property);
        updateTBValue(property, value);
        updateBVValue(property, value);
    }

    updateJSONEditor(JSON.stringify(chartJSON, null, 4));
}