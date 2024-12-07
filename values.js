let chartJSON;

let trackInfo;
let trackData;
let clipData;
let chartFilename;

const TBTitle = document.getElementById("tb-title");
const TBArtist = document.getElementById("tb-artist");
const TBFilename = document.getElementById("tb-filename");

const JSONEditor = document.getElementById("json-editor");

function getJSONValue(defaultValue, referenceArray) {
    return referenceArray.reduce((xs, x) => xs?.[x] ?? defaultValue, chartJSON);
}

function setJSONValue(value, referenceArray) {
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
}

function updateBVValue(valueName, value) {
    if (document.getElementById(`bv-${valueName}`)) {
        let BVElement = document.getElementById(`bv-${valueName}`);
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

function updateJSONEditor() {
    if (chartJSON !== undefined) {
        let trackInfoKeys = Object.keys(trackInfo);
        for (let i = 0; i < trackInfoKeys.length; i++) {
            if (document.getElementById(`bv-${trackInfoKeys[i]}`)) {
                let BVElement = document.getElementById(`bv-${trackInfoKeys[i]}`);
                if (BVElement.type === "text") {
                    trackInfo[trackInfoKeys[i]]["value"] = BVElement.value;
                }
                else if (BVElement.type === "checkbox") {
                    trackInfo[trackInfoKeys[i]]["value"] = BVElement.checked;
                }
            }

            setJSONValue(trackInfo[trackInfoKeys[i]]["value"], trackInfo[trackInfoKeys[i]]["reference"]);
        }
        JSONEditor.value = JSON.stringify(chartJSON, null, 4);
    }
}

function loadChartData(data) {
    chartJSON = data;

    fetch("chart-data-template.json")
    .then(response => response.json())
    .then((data) => {
        trackInfo = data["track-info"];
        trackData = data["track-data"];
        clipData = data["clip-data"];

        for (let key in trackInfo) {
            trackInfo[key]["value"] = getJSONValue(trackInfo[key]["default"], trackInfo[key]["reference"]);
            updateBVValue(key, trackInfo[key]["value"]);
        }
    
        TBTitle.textContent = trackInfo["title"]["value"];
        TBArtist.textContent = trackInfo["artist"]["value"];
        TBFilename.textContent = chartFilename;
    
        JSONEditor.value = JSON.stringify(chartJSON, null, 4);
    });
}

let topBarValues = ["title", "artist"];
for (let i = 0; i < topBarValues.length; i++) {
    document.getElementById(`bv-${topBarValues[i]}`).onchange = (e) => {
        if (chartJSON !== undefined) {
            document.getElementById(`tb-${topBarValues[i]}`).textContent = e.target.value;
        }
    }
}