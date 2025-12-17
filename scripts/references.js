let chartReferences;

let trackInfo;
let trackData;
let clipInfo;

function getReferences(json) {
    let values = json["largeStringValuesContainer"]["values"];

    let TI;
    let TD = [];
    let CI = [];

    let weird = false;
    
    for (let i = 0; i < values.length; i++) {
        const key = values[i]["key"];
        const val = values[i]["val"];

        if((!key) || !val) {
            weird = true;
            continue;
        }
        
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
    
    if(weird || TD.length < 5 || CI.length < 1) {
        console.warn("Oddities found in this SRTB file, SRTBE might not work as intended. Saving and loading in-game may help.")
        //createToast("Notice", "Oddities found in this SRTB file, SRTBE might not work as intended. Saving and loading in-game may help.", "info", 10000);
    }

    return [TI, TD, CI];
}