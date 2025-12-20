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
    for(i in json.largeStringValuesContainer.values)
        if(json.largeStringValuesContainer.values[i].key == "SO_TrackInfo_TrackInfo")
            return json.largeStringValuesContainer.values[i].val;
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
            loadChartData(chartJSON);
            return true;
        }
    }

}