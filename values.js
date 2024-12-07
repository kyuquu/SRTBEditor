let chartJSON;

let chartFilename;

let trackInfo;
let trackData;
let clipData;



const JSONEditor = document.getElementById("json-editor");

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
    JSONEditor.value = JSON.stringify(chartJSON, null, 4);
}



const TBValues = [];
const TBElements = document.getElementsByClassName("tb-value");
for (let i = 0; i < TBElements.length; i++) {
    let TBElement = TBElements[i];
    let property = TBElement.id.slice(3);
    TBValues.push(property);
}

function updateTBValue(property, value) {
    if (TBValues.includes(property)) {
        let TBElement = document.getElementById(`tb-${property}`);
        TBElement.textContent = value;
    };
}



const BVValues = [];
const BVElements = document.getElementsByClassName("bv-item-value");
for (let i = 0; i < BVElements.length; i++) {
    let BVElement = BVElements[i];
    let property = BVElement.id.slice(3);
    BVValues.push(property);

    BVElement.onchange = () => {
        if (chartJSON !== undefined) {
            let value;
            if (BVElement.type === "text") {
                value = BVElement.value;
            }
            else if (BVElement.type === "checkbox") {
                value = BVElement.checked;
            }
            updateTBValue(property, value);
            updateJSONValue(property, value);
        }
    }
}

function updateBVValue(property, value) {
    if (BVValues.includes(property)) {
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



function loadChartData(data) {
    chartJSON = data;

    fetch("chart-data-template.json")
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
    
        JSONEditor.value = JSON.stringify(chartJSON, null, 4);
    });
}