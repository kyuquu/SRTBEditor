function fetchLyricsFromJson(json) {
    let vals = json.largeStringValuesContainer.values;
    for(let i = 0; i < vals.length; i++) {
        if(vals[i].key == "SO_ClipInfo_ClipInfo_0"){ 
            return vals[i].val.lyrics;
        }
    }
}

//old, error-prone functions

function fetchTrackDataByDifficulty(json, diff) {
    let vals = json.largeStringValuesContainer.values;
    for(let i = 0; i < vals.length; i++) {
        if(vals[i].key.indexOf("SO_TrackData") != -1) {
            let diffType = vals[i].val.difficultyType;
            if(diffType - 2 == diff) return vals[i].val;
        }
    }
    console.error(`unable to find diff ${diff} in JSON`);
}

function replaceTrackDataByDifficulty(newTrackData, diff) {
    let oldJson = chartJSON.largeStringValuesContainer.values;
    for(let i = 0; i < oldJson.length; i++) {
        if(oldJson[i].key.indexOf("SO_TrackData" != 0)) {
            if(oldJson[i].val.difficultyType - 2 == diff) {
                oldJson[i].val = newTrackData;
                loadChartData(chartJSON);
                return;
            }
        }
    }
}

//start of new, robust functions

// TRACK INFO
function getTrackInfo(json) {
    if(!json) json = chartJSON;
    let ind = getTrackInfoIndex(json, "SO_TrackInfo_TrackInfo");
    if(ind < 0) return;
    return json.largeStringValuesContainer.values[ind].val;
}

function getTrackInfoIndex(json) {
    if(!json) json = chartJSON;
    for(let i in json.largeStringValuesContainer.values)
        if(json.largeStringValuesContainer.values[i].key == "SO_TrackInfo_TrackInfo")
            return i;
    return -1;

}

function setTrackInfo(json, replace) {
    if(!json) json = chartJSON;
    for(let i in json.largeStringValuesContainer.values)
        if(json.largeStringValuesContainer.values[i].key == "SO_TrackInfo_TrackInfo") {
            json.largeStringValuesContainer.values[i].val = replace;
            return json;
        }
    console.warn("attempted to set TrackInfo that doesn't exist");
}

// ANY KEY
function getLargeStringByKey(json, key) {
    if(!json) json = chartJSON;
    let ind = getLargeStringIndexByKey(json, key);
    if(ind < 0) return;
    return json.largeStringValuesContainer.values[ind].val;
}

function getLargeStringIndexByKey(json, key) {
    if(!json) json = chartJSON;
    for(let i in json.largeStringValuesContainer.values) {
        if(json.largeStringValuesContainer.values[i].key == key)
            return i;
    }
    return -1;
}

function setLargeStringByKey(replace, key, json) {
    if(!json) json = chartJSON;
    for(let i in json.largeStringValuesContainer.values) {
        if(json.largeStringValuesContainer.values[i].key == key) {
            json.largeStringValuesContainer.values[i].val = replace;
            loadChartData(chartJSON);
            return json;
        }
    }
    console.warn("attempted to set a LargeString that doesn't exist");
}

// TRACK DATA
function getTrackDataIndexByDiff(json, diffType) {
    if(!json) json = chartJSON;
    let values = json.largeStringValuesContainer.values;
    for(let i in values) {
        if(values[i].key.includes("SO_TrackData_TrackData_")
                && values[i].val && values[i].val.difficultyType - 2 == diffType) {
            return i;
        }
    }
    return -1;
}
function getTrackDataIndexByKey(json, key) {
    if(!json) json = chartJSON;
    let values = json.largeStringValuesContainer.values;
    for(let i in values) {
        if(values[i].key == ("SO_TrackData_" + key)) {
            return i;
        }
    }
    return -1;
}

function getTrackDataByDiff(json, diffType) {
    if(!json) json = chartJSON;
    let ind = getTrackDataIndexByDiff(json, diffType);
    if(ind < 0) return;
    return json.largeStringValuesContainer.values[ind].val;
}

function getTrackDataByKey(json, key) {
    if(!json) json = chartJSON;
    let ind = getTrackDataIndexByKey(json, key);
    if(ind < 0) return;
    return json.largeStringValuesContainer.values[ind].val;
}

function setTrackDataByDiff(replace, diffType, json) {
    if(!json) json = chartJSON;
    let values = json.largeStringValuesContainer.values
    for(let i in values) {
        if(values[i].key.includes("SO_TrackData_TrackData_")
                && values[i].val && values[i].val.difficultyType - 2 == diffType) {
            json.largeStringValuesContainer.values[i].val = replace;
            return json;
        }
    }
    console.warn("attempted to set a TrackData that doesn't exist");
}

function generateTrackData(json, diffType) {
    if(!json) json = chartJSON;
    let values = json.largeStringValuesContainer.values;
    let taken = [];
    for(let i in values) {
        let key = values[i].key;
        if(key.includes("SO_TrackData_TrackData_"))
            taken.push(key[key.length-1]);
    }
    let ind = taken.length;
    for(let i in taken) {
        if(taken.indexOf(i) == -1) {
            ind = i;
            break;
        }
    }

    let newKey = `SO_TrackData_TrackData_${ind}`;
    
    //search for a TrackData_ind in the header
    //if not found, make one
    let headerVals = json.unityObjectValuesContainer.values;
    let found = false;
    for(let i in headerVals) {
        if(headerVals[i].key == newKey) {
            found = true;
            break;
        }
    }
    if(!found) {
        let newHeader = returnTemplate("Diff Header.json");
        newHeader = newHeader.replaceAll("$0", ind);
        headerVals[headerVals.length] = JSON.parse(newHeader);
    }

    //search for a TrackData_ind in the body
    //if not found, make one
    found = false;
    for(let i in values) {
        if(values[i].key == newKey) {
            found = true;
            break;
        }
    }
    if(!found) {
        let newBody = returnTemplate("Diff Body.json");
        newBody = newBody.replaceAll("$0", ind);
        newBody = JSON.parse(newBody);
        newBody.val.difficultyType = diffType + 2;
        values[values.length] = newBody;
    }

    //search for a TrackData_ind in the difficulties
    //if not found, make one
    found = false;
    let trackInfo = getTrackInfoIndex(json);
    trackInfo = json.largeStringValuesContainer.values[trackInfo].val;
    for(let i in trackInfo.difficulties) {
        if(trackInfo.difficulties[i].assetName == newKey) {
            found = true;
            break;
        }
    }
    if(!found) {
        let newIndex = returnTemplate("Diff Index.json");
        newIndex = newIndex.replaceAll("$0", ind);
        trackInfo.difficulties[trackInfo.difficulties.length] = JSON.parse(newIndex);
    }
    return json;
}

function getDiffExistsByDiff(json, diffType) {
    if(!json) json = chartJSON;
    let values = json.largeStringValuesContainer.values
    for(let i in values) {
        if(values[i].key.includes("SO_TrackData_TrackData_")
                && values[i].val && values[i].val.difficultyType - 2 == diffType) {
            return true;
        }
    }
    return false;
}

function getDiffActiveByKey(json, key) {
    if(!json) json = chartJSON;
    let newKey = key.substring("SO_TrackData_".length);
    let diffs = getTrackInfo(json).difficulties;
    for(let i in diffs) {
        if(diffs[i].assetName == newKey)
            return diffs[i]._active;
    }
}

function getDiffActiveByDiff(json, diffType) {
    if(!json) json = chartJSON;
    let ind = getTrackDataIndexByDiff(json, diffType);
    if(ind < 0) return false;
    let key = json.largeStringValuesContainer.values[ind].key;
    return getDiffActiveByKey(json, key);
}

function setDiffActiveByKey(json, key, active) {
    if(!json) json = chartJSON;
    key = key.substring("SO_TrackData_".length);
    let diffs = json.largeStringValuesContainer.values[getTrackInfoIndex(json)].val.difficulties;
    for(let i in diffs) {
        if(diffs[i].assetName == key) {
            //if active isn't given, toggle
            if(!active && active != false)
                diffs[i]._active = !diffs[i]._active;
            else
                diffs[i]._active = active;
            return json;
        }
    }
    console.warn("attempted to enable a difficulty that doesn't exist");
}

// CLIP INFO
function getClipInfo(json, index) {
    if(!index) index = 0;
    if(!json) json = chartJSON;
    let key = `SO_ClipInfo_ClipInfo_${index}`;
    return getLargeStringByKey(json, key);
}

function setClipInfo(replace, index, json) {
    if(!index) index = 0;
    if(!json) json = chartJSON;
    let key = `SO_ClipInfo_ClipInfo_${index}`;
    return setLargeStringByKey(replace, key, json);

}

// MODDED DATA
const diffNames = ["EASY", "NORMAL", "HARD", "EXPERT", "XD", "REMIXD"];
function getChroma(diff) {
    let key = "SpeenChroma_ChromaTriggers";
    if(diff || diff == 0) key += `_${diffNames[diff]}`;
    return getLargeStringByKey(key);
}

function setChroma(replace, diff, json) {
    if(!json) json = chartJSON;
    let key = "SpeenChroma_ChromaTriggers";
    if(diff || diff == 0) key += `_${diffNames[diff]}`;
    return setLargeStringByKey(replace, key, json);
}

function getDTS(diff) {
    let key = "SpeedHelperSpeedHelper_SpeedTriggers";
    if(diff || diff == 0) key += `_${diffNames[diff]}`;
    return getLargeStringByKey(key);
}

function setDTS(replace, diff, json) {
    if(!json) json = chartJSON;
    let key = "SpeedHelperSpeedHelper_SpeedTriggers";
    if(diff || diff == 0) key += `_${diffNames[diff]}`;
    return setLargeStringByKey(replace, key, json);
}