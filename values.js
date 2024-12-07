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
    let JSONValue = chartJSON;
    referenceLoop: for (let i = 0; i < referenceArray.length; i++) {
        if (JSONValue[referenceArray[i]]) {
            JSONValue = JSONValue[referenceArray[i]];
        }
        else {
            JSONValue = defaultValue;
            break referenceLoop;
        }
    }
    return JSONValue;
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

function loadChartData(data) {
    chartJSON = data;

    fetch("chart-data-template.json")
    .then(response => response.json())
    .then((data) => {
        trackInfo = data["track-info"];
        trackData = data["track-data"];
        clipData = data["clip-data"];

        let trackInfoKeys = Object.keys(trackInfo);
        for (let i = 0; i < trackInfoKeys.length; i++) {
            trackInfo[trackInfoKeys[i]]["value"] = getJSONValue(trackInfo[trackInfoKeys[i]]["default"], trackInfo[trackInfoKeys[i]]["reference"]);
            updateBVValue(trackInfoKeys[i], trackInfo[trackInfoKeys[i]]["value"]);
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