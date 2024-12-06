let chartJSON;

let trackInfo;
let trackData;
let clipData;

const TBChartTitle = document.getElementById("tb-chart-title");
const TBChartArtist = document.getElementById("tb-chart-artist");
const TBChartFilename = document.getElementById("tb-chart-filename");

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

function updateValue(valueName, value) {
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
            updateValue(trackInfoKeys[i], trackInfo[trackInfoKeys[i]]["value"]);
        }
    
        TBChartTitle.textContent = trackInfo["title"]["value"];
        TBChartArtist.textContent = trackInfo["artist"]["value"];
    
        JSONEditor.value = JSON.stringify(chartJSON, null, 4);
    });
}