let chartReferences;

let trackInfo;
let trackData;
let clipInfo;

function getReferences(json) {
    let values = json["largeStringValuesContainer"]["values"];

    let TI;
    let TD = Array.from({length: 6}, () => ({}));
    let CI = [];
    
    for (let i = 0; i < values.length; i++) {
        const key = values[i]["key"];
        const val = values[i]["val"];
        
        if (key === "SO_TrackInfo_TrackInfo") {
            TI = val;
        }

        else if (key.includes("SO_TrackData_TrackData_")) {
            let index = val["difficultyType"] - 2;
            TD[index] = val;
        }

        else if (key.includes("SO_ClipInfo_ClipInfo_")) {
            let index = parseInt(key.slice(-1));
            CI[index] = val;
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

        else {
            console.error("Unrecognized key: " + key);
        }
    }

    return [TI, TD, CI];
}