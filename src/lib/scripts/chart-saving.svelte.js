import JSZip from "jszip";
import FileSaver from "file-saver";

import { chart } from "$lib/scripts/main.svelte.js";
import { convertToSRTB } from "$lib/scripts/helper.svelte.js";

function getChartSnapshot() {
    return $state.snapshot(chart);
}

export function saveAsSRTB() {
    const chart = getChartSnapshot();
    let filename = chart.filename.split(".").slice(0, -1).join(".") + ".srtb";
    let srtb = JSON.stringify(convertToSRTB(chart.json));
    downloadFile(filename, srtb);
}

export function saveAsJSON() {
    const chart = getChartSnapshot();
    let filename = chart.filename.split(".").slice(0, -1).join(".") + ".json";
    let json = JSON.stringify(chart.json);
    downloadFile(filename, json);
}

export function saveAsZIP() {
    const chart = getChartSnapshot();
    let filename = chart.filename.split(".").slice(0, -1).join(".");
    let srtb = JSON.stringify(convertToSRTB(chart.json));

    let zip = new JSZip();
    zip.file(`${filename}.srtb`, srtb);
    if (chart.albumArt) {
        zip.file(`AlbumArt/${chart.albumArt[0].name}`, chart.albumArt[0]);
    }
    if (chart.audioClips) {
        zip.file(`AudioClips/${chart.audioClips[0].name}`, chart.audioClips[0]);
    }
    zip.generateAsync({ type: "blob" }).then((content) => {
        FileSaver.saveAs(content, `BACKUP_${filename}.zip`);
    });
}

function downloadFile(filename, file) {
    let link = document.createElement("a"); 
    link.setAttribute("href", `data:text/plain; charset=utf-8, ${encodeURIComponent(file)}`);
    link.setAttribute("download", filename);
    link.click();
}