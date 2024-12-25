let isDevModeEnabled = true;

let chartTemplates = {};

let activeTab = 0;

function switchToTab(index) {
    if (activeTab !== index) {
        document.getElementById(`tab-button${activeTab}`).classList.remove("active");
        document.getElementById(`tab${activeTab}`).classList.remove("active");
        document.getElementById(`tab-button${index}`).classList.add("active");
        document.getElementById(`tab${index}`).classList.add("active");

        if (index === 1 && !document.getElementById("json-editor").classList.contains("disabled")) {
            JSONEditor.focus();
        }

        activeTab = index;
    }
}



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

function saveAsZIP() { // this function needs to be edited once audio is supported
    let filename = chartFilename.split(".").slice(0, -1).join(".");
    let srtb = JSON.stringify(convertToSRTB(JSON.parse(JSONEditor.getValue())));

    let zip = new JSZip();
    zip.file(`${filename}.srtb`, srtb);
    zip.file(`AlbumArt/${albumArt.name}`, albumArt);
    zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, `BACKUP_${filename}.zip`);
    });
}



function convertToJSON(srtb) {
    let data = srtb["largeStringValuesContainer"]["values"];
    for (let i = 0; i < data.length; i++) {
        data[i]["val"] = JSON.parse(data[i]["val"]);
    }
    return srtb;
}

function convertToSRTB(json) {
    let data = json["largeStringValuesContainer"]["values"];
    for (let i = 0; i < data.length; i++) {
        data[i]["val"] = JSON.stringify(data[i]["val"]);
    }
    return json;
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

function loadTemplate(filename) {
    let templateData = JSON.parse(JSON.stringify(chartTemplates))[filename];
    const fileExtension = filename.split(".").pop().toLowerCase();
    if (["srtb", "json"].includes(fileExtension)) {
        try {
            if (fileExtension === "json") {
                loadChartData(templateData);
            }
            else if (fileExtension === "srtb") {
                let json = convertToJSON(templateData);
                loadChartData(json);
            }

            chartFilename = filename;
            updateTBValue("filename", chartFilename);
        }
        catch (e) {
            window.alert(`Template failed to load\n\n${e}`);
        }
    }
    else {
        window.alert(`Unrecognized file extension: .${fileExtension}`);
    }
}



async function loadZipSRTB(srtb) {
    await srtb.async("string").then((content) => {
        try {
            json = convertToJSON(JSON.parse(content));
            loadChartData(json);
        }
        catch (e) {
            window.alert(`.zip file contains invalid .srtb\n\n${e}`);
        }
    });
}

async function loadZipImage(image, filename) {
    await image.async("arraybuffer").then((content) => {
        filename = filename.slice(9);
        let buffer = new Uint8Array(content);
        let blob = new Blob([buffer.buffer]);
        let file = new File([blob], filename);

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        document.getElementById("bv-album-art").files = dataTransfer.files;
    });
}

const fileInput = document.getElementById("tb-file-input");
fileInput.onchange = () => {
    let file = fileInput.files[0];
    let fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension === "srtb" || fileExtension === "json") {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (fileExtension === "srtb") {
                try {
                    let srtb = e.target.result;
                    let json = convertToJSON(JSON.parse(srtb));
                    loadChartData(json);
                }
                catch (e) {
                    window.alert(`Invalid .srtb\n\n${e}`);
                }
            }
            else if (fileExtension === "json") {
                try {
                    let json = JSON.parse(e.target.result);
                    loadChartData(json);
                }
                catch (e) {
                    window.alert(`Invalid .json\n\n${e}`);
                }
            }

            chartFilename = file.name;
            updateTBValue("filename", chartFilename);
        };
        reader.readAsText(file);
    }
    else if (fileExtension === "zip") {
        let zip = new JSZip();
        zip.loadAsync(file)
            .then(async (zip) => {
                let srtbFilename;
                let srtb;
                let imageFilename;
                let image;
                let audio;

                let filenames = Object.keys(zip.files);
                for (let i = 0; i < filenames.length; i++) {
                    let filename = filenames[i];
                    if (filename.slice(-4) === "srtb") {
                        srtb = zip.files[filename];
                        srtbFilename = filename;
                    }
                    else if (filename.slice(0, 8) === "AlbumArt") {
                        image = zip.files[filename];
                        imageFilename = filename;
                    }
                    else if (filename.slice(0, 10) === "AudioClips") {
                        audio = zip.files[filename];
                    }
                }

                await loadZipSRTB(srtb);
                await loadZipImage(image, imageFilename);
                
                updateAlbumArt(document.getElementById("bv-album-art"));
                updateTBValue("filename", srtbFilename);
            }, () => {
                window.alert("Invalid .zip");
            }); 
    }
    else {
        window.alert(`Unrecognized file extension: .${fileExtension}`);
    }
}