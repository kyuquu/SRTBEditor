function fetchLyricsFromJson(json) {
    let vals = json.largeStringValuesContainer.values;
    for(let i = 0; i < vals.length; i++) {
        if(vals[i].key == "SO_ClipInfo_ClipInfo_0"){ 
            return vals[i].val.lyrics;
        }
    }
}

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

function replaceTrackInfo(replace, json) {
    if(!json) json = chartJSON;
    for(i in json.largeStringValuesContainer.values)
        if(json.largeStringValuesContainer.values[i].key == "SO_TrackInfo_TrackInfo") {
            json.largeStringValuesContainer.values[i].val = replace;
            loadChartData(json);
        }
}

function fetchTrackInfo(json) {
    if(!json) json = chartJSON;
    let ind = fetchTrackInfoIndex(json, "SO_TrackInfo_TrackInfo");
    return json.largeStringValuesContainer.values[ind].val;
}

function fetchTrackInfoIndex(json) {
    if(!json) json = chartJSON;
    for(i in json.largeStringValuesContainer.values)
        if(json.largeStringValuesContainer.values[i].key == "SO_TrackInfo_TrackInfo")
            return i

}

function fetchLargeStringByKey(json, key) {
    if(!json) json = chartJSON;
    let ind = fetchLargeStringIndexByKey(json, key);
    return json.largeStringValuesContainer.values[ind].val;
}

function fetchLargeStringIndexByKey(json, key) {
    if(!json) json = chartJSON;
    for(i in json.largeStringValuesContainer.values) {
        if(json.largeStringValuesContainer.values[i].key == key)
            return i;
    }
    return -1;
}

function replaceLargeStringByKey(replace, key, json) {
    if(!json) json = chartJSON;
    for(i in json.largeStringValuesContainer.values) {
        if(json.largeStringValuesContainer.values[i].key == key) {
            json.largeStringValuesContainer.values[i].val = replace;
            loadChartData(chartJSON);
            return true;
        }
    }
}

function fetchTrackDataIndexByDiff(json, diffType) {
    if(!json) json = chartJSON;
    let values = json.largeStringValuesContainer.values;
    for(i in values) {
        if(values[i].key.includes("SO_TrackData_TrackData_")
                && values[i].val && values[i].val.difficultyType - 2 == diffType) {
            return i;
        }
    }
    return -1;
}

function fetchTrackDataByDiff(json, diffType) {
    if(!json) json = chartJSON;
    let ind = fetchTrackDataIndexByDiff(json, diffType);
    if(ind < 0) return ind;
    return json.largeStringValuesContainer.values[ind].val;
}

function replaceTrackDataByDiff(replace, diffType, json) {
    if(!json) json = chartJSON;
    let values = json.largeStringValuesContainer.values
    for(i in values) {
        if(values[i].key.includes("SO_TrackData_TrackData_")
                && values[i].val && values[i].val.difficultyType - 2 == diffType) {
            json.largeStringValuesContainer.values[i].val = replace;
            return json;
        }
    }

}

function generateTrackData(json, diffType) {
    if(!json) json = chartJSON;
    let values = json.largeStringValuesContainer.values;
    let taken = [];
    for(i in values) {
        let key = values[i].key;
        if(key.includes("SO_TrackData_TrackData_"))
            taken.push(key[key.length-1]);
    }
    let ind = taken.length;
    for(i in taken) {
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
    for(i in headerVals) {
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
    for(i in values) {
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
    let trackInfo = fetchTrackInfoIndex(json);
    trackInfo = json.largeStringValuesContainer.values[trackInfo].val;
    for(i in trackInfo.difficulties) {
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

function isDiffActiveByKey(json, key) {
    if(!json) json = chartJSON;
    key = key.substring("SO_TrackData_".length);
    let diffs = fetchTrackInfo(json).difficulties;
    for(i in diffs) {
        if(diffs[i].assetName == key)
            return diffs[i]._active;
    }
    console.warn("key not found");
}

function setDiffActiveByKey(json, key, active) {
    if(!json) json = chartJSON;
    key = key.substring("SO_TrackData_".length);
    let diffs = json.largeStringValuesContainer.values[fetchTrackInfoIndex(json)].val.difficulties;
    for(i in diffs) {
        if(diffs[i].assetName == key) {
            //if active isn't given, toggle
            if(!active && active != false)
                diffs[i]._active = !diffs[i]._active;
            else
                diffs[i]._active = active;
        }
    }
    return json;

}