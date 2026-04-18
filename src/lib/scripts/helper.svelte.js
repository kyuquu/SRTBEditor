import { chart, difficulties } from "./main.svelte";
import { templates } from "$lib/templates";

export function convertToJSON(srtb) {
    let data = srtb.largeStringValuesContainer.values;;
    for (let i = 0; i < data.length; i++) {
        data[i].val = JSON.parse(data[i].val);
    }
    return srtb;
}

export function convertToSRTB(json) {
    let data = json.largeStringValuesContainer.values;;
    for (let i = 0; i < data.length; i++) {
        data[i].val = JSON.stringify(data[i].val);
    }
    return json;
}

export function getFileSize(size) {
    if (size > 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(2)} MB`;
    }
    else if (size > 1024) {
        return `${(size / 1024).toFixed(2)} KB`;
    }
    else {
        return `${size} B`;
    }
}

export function validateJSON(json) {
    try {
        let obj = JSON.parse(json);
        if (obj && typeof obj === "object") {
            return obj;
        }
    } catch (e) {
        return false;
    }
}

export function getViewHeader() {
    return chart.trackInfo.title + " - " + chart.trackInfo.artistName;
}

async function readFileAsDataURL(file) {
    let dataURL = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });

    return dataURL;
}

export function getAlbumArt() {
    if (chart.albumArt) {
        chart.trackInfo.albumArtReference.assetName = chart.albumArt[0].name.split(".").slice(0, -1).join(".");
        return readFileAsDataURL(chart.albumArt[0]);
    }
    else {
        chart.trackInfo.albumArtReference.assetName = "";
        return "/images/Default_-_Cover.png";
    }
}

export function getAudioClips() {
    if (chart.audioClips) {
        chart.clipInfo[0].clipAssetReference.assetName = chart.audioClips[0].name.split(".").slice(0, -1).join(".");
        return readFileAsDataURL(chart.audioClips[0]);
    }
    else {
        chart.clipInfo[0].clipAssetReference.assetName = "";
        return "/audio/Get Good.ogg";
    }
}

function getNumberFromKey(key) {
    return parseInt(key.replace(/\D/g,''));
}

export function getTrackInfo(json) {
    const values = json.largeStringValuesContainer.values;
    return values.find(value => value.key === "SO_TrackInfo_TrackInfo").val;
}

export function getTrackData(json) {
    const trackData = {};
    const values = json.largeStringValuesContainer.values;
    const objs = values.filter(value => value.key.includes("SO_TrackData_TrackData_"));
    for (const obj of objs) {
        let diffName = difficulties[obj.val.difficultyType - 2];
        trackData[diffName] = obj.val;
    }
    return trackData;
}

export function getClipInfo(json) {
    const clipInfo = [];
    const values = json.largeStringValuesContainer.values;
    const objs = values.filter(value => value.key.includes("SO_ClipInfo_ClipInfo_"));
    for (const obj of objs) {
        let index = getNumberFromKey(obj.key);
        clipInfo[index] = obj.val;
    }
    return clipInfo;
}

export function getTrackInfoDiffs(json) {
    const trackInfoDiffs = {};
    const values = json.largeStringValuesContainer.values;
    const trackInfo = values.find(value => value.key === "SO_TrackInfo_TrackInfo").val;
    const objs = values.filter(value => value.key.includes("SO_TrackData_TrackData_"));
    for (const obj of objs) {
        let diffName = difficulties[obj.val.difficultyType - 2];
        trackInfoDiffs[diffName] = trackInfo.difficulties.find(diff => diff.assetName === `TrackData_${getNumberFromKey(obj.key)}`);
    }
    return trackInfoDiffs;
}

export function createTrackData(diffName) {
    let values = chart.json.largeStringValuesContainer.values;

    let newKey = 0;
    while (values.some(value => value.key === `SO_TrackData_TrackData_${newKey}`))
        newKey++;
    
    let headerVals = chart.json.unityObjectValuesContainer.values;
    if (!headerVals.some(headerVal => headerVal.key === `TrackData_${newKey}`)) {
        let newHeader = structuredClone(templates["Diff Header.json"]);
        newHeader.key = `TrackData_${newKey}`;
        newHeader.jsonKey = `SO_TrackData_TrackData_${newKey}`;
        headerVals.push(newHeader);
        headerVals.sort((a, b) => sortByKey(a.key, b.key));
    }

    let newBody = structuredClone(templates["Diff Body.json"]);
    newBody.key = `SO_TrackData_TrackData_${newKey}`;
    newBody.val.difficultyType = difficulties.indexOf(diffName) + 2;
    values.push(newBody);
    values.sort((a, b) => sortByKey(a.key, b.key));

    if (!chart.trackInfo.difficulties.some(difficulty => difficulty.assetName == `TrackData_${newKey}`)) {
        let newIndex = structuredClone(templates["Diff Index.json"]);
        newIndex.assetName = `TrackData_${newKey}`;
        chart.trackInfo.difficulties.push(newIndex);
        chart.trackInfo.difficulties.sort((a, b) => sortByKey(a.assetName, b.assetName));
    }
}

function sortByKey(a, b) {
    const keyTypes = ["TrackInfo", "TrackData", "ClipInfo"];
    const [aType, bType] = [a, b].map(key => {
        if (key.includes("SO_")) key = key.slice(3);
        if (key.includes("_")) key = key.slice(0, key.indexOf("_"));
        return key;
    });
    console.log(bType, aType);
    return keyTypes.indexOf(aType) - keyTypes.indexOf(bType) || getNumberFromKey(a) - getNumberFromKey(b);
}