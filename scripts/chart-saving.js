function saveAsSRTB() {
    let filename = chartFilename.split(".").slice(0, -1).join(".") + ".srtb";
    let srtb = JSON.stringify(convertToSRTB(JSON.parse(JSONEditor.getValue())));
    downloadFile(filename, srtb);
}

function saveAsJSON() {
    let filename = chartFilename.split(".").slice(0, -1).join(".") + ".json";
    let json = JSONEditor.getValue();
    downloadFile(filename, json);
}

function saveAsZIP() {
    let filename = chartFilename.split(".").slice(0, -1).join(".");
    let srtb = JSON.stringify(convertToSRTB(JSON.parse(JSONEditor.getValue())));

    let zip = new JSZip();
    zip.file(`${filename}.srtb`, srtb);
    zip.file(`AlbumArt/${albumArt.name}`, albumArt);
    zip.file(`AudioClips/${audioClips.name}`, audioClips);
    zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `BACKUP_${filename}.zip`);
    });
}

function downloadFile(filename, file) {
    let link = document.createElement("a"); 
    link.setAttribute("href", `data:text/plain; charset=utf-8, ${encodeURIComponent(file)}`);
    link.setAttribute("download", filename);
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}