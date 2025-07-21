import { chart } from "./main.svelte";

export function convertToJSON(srtb) {
    let data = srtb["largeStringValuesContainer"]["values"];
    for (let i = 0; i < data.length; i++) {
        data[i]["val"] = JSON.parse(data[i]["val"]);
    }
    return srtb;
}

export function convertToSRTB(json) {
    let data = json["largeStringValuesContainer"]["values"];
    for (let i = 0; i < data.length; i++) {
        data[i]["val"] = JSON.stringify(data[i]["val"]);
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
        chart.clipInfo.clipAssetReference.assetName = chart.audioClips[0].name.split(".").slice(0, -1).join(".");
        return readFileAsDataURL(chart.audioClips[0]);
    }
    else {
        chart.clipInfo.clipAssetReference.assetName = "";
        return "/audio/Get Good.ogg";
    }
}