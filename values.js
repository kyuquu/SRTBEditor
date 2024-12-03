let chartJSON;

let trackInfo;
let trackData;
let clipData;

const TBChartTitle = document.getElementById("tb-chart-title");
const TBChartArtist = document.getElementById("tb-chart-artist");
const TBChartFilename = document.getElementById("tb-chart-filename");

const JSONEditor = document.getElementById("json-editor");

function getJSONValue(referenceArray) {
    let JSONValue = chartJSON;
    for (let i = 0; i < referenceArray.length; i++) {
       JSONValue = JSONValue[referenceArray[i]];
    }
    return JSONValue;
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
            trackInfo[trackInfoKeys[i]]["value"] = getJSONValue(trackInfo[trackInfoKeys[i]]["reference"]);
        }
    
        TBChartTitle.textContent = trackInfo["title"]["value"];
        TBChartArtist.textContent = trackInfo["artist"]["value"];
    
        JSONEditor.value = JSON.stringify(chartJSON, null, 4);
    });
}