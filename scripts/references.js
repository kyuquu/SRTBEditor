let chartReferences;

let trackInfo;
let trackData = Array.from({length: 6}, () => ({}));
let clipInfo = [];

function getReferences() {
    let values = chartJSON["largeStringValuesContainer"]["values"];
    
    for (let i = 0; i < values.length; i++) {
        const key = values[i]["key"];
        const val = values[i]["val"];
        
        if (key === "SO_TrackInfo_TrackInfo") {
            trackInfo = val;
        }

        else if (key.includes("SO_TrackData_TrackData_")) {
            let index = val["difficultyType"] - 2;
            trackData[index] = val;
        }

        else if (key.includes("SO_ClipInfo_ClipInfo_")) {
            let index = parseInt(key.slice(-1));
            clipInfo[index] = val;
        }

        // someday...

        // else if (key === "SpeenChroma_ChromaTriggers") {

        // }

        // else if (key.includes("SpeenChroma_ChromaTriggers_")) {

        // }

        // else if (key === "SpeedHelper_SpeedTriggers") {

        // }

        // else if (key.includes("SpeedHelper_SpeedTriggers_")) {

        // }
    }

    chartReferences = [trackInfo, ...trackData, ...clipInfo];
}