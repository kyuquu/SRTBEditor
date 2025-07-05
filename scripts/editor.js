let JSONEditor = ace.edit("editor");
JSONEditor.setTheme("ace/theme/dracula");
JSONEditor.session.setMode("ace/mode/json");
JSONEditor.setOptions({
    fixedWidthGutter: true,
    showPrintMargin: false
});



const JSONEditorSave = document.getElementById("jv-save");
const JSONEditorDiscard = document.getElementById("jv-discard");

let editorTimeout;
let editorTimeoutLength = 500;

function updateJSONEditor(json) {
    let cursorPos = JSONEditor.selection.getCursor();
    JSONEditor.session.setValue(json);
    JSONEditor.selection.moveCursorTo(cursorPos.row, cursorPos.column);

    JSONEditorSave.classList.add("disabled");
    JSONEditorDiscard.classList.add("disabled");
}

function saveEditorChanges() {
    chartJSON = JSON.parse(JSONEditor.getValue());

    if (trackInfo["albumArtReference"]["assetName"] !== document.getElementById("bv-album-art-filename").textContent.split(".").slice(0, -1).join(".") && document.getElementById("bv-album-art-filename").textContent !== "No file selected") {
        window.alert("WARNING:\nChanging the album art reference may prevent the chart from loading the album art if you download as ZIP.");
    }
    else if (clipInfo[0]["clipAssetReference"]["assetName"] !== document.getElementById("bv-audio-clips-filename").textContent.split(".").slice(0, -1).join(".") && document.getElementById("bv-audio-clips-filename").textContent !== "No file selected") {
        window.alert("WARNING:\nChanging the audio asset reference may prevent the chart from loading the audio if you download as ZIP.");
    }

    loadChartData(chartJSON);

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