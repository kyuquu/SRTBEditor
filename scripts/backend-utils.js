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