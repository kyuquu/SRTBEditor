let chartJSON;

let chartTemplates = {};
let templateJSON;

let chartFilename;

function returnTemplate(filename) {
    let templateData = JSON.stringify(chartTemplates[filename]);
    return templateData;
}

async function passJsonToCallback(file, callback, args) {
    let fileExtension = file.name.split('.').pop().toLowerCase();
    let readJson;
    if (fileExtension === "srtb" || fileExtension === "json") {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                readJson = JSON.parse(e.target.result);;
                if (fileExtension === "srtb") {
                    readJson = convertToJSON(readJson);
                }
                callback(readJson, args);
            }
            catch (e) {
                createToast("Load failed", `Invalid .${fileExtension}`, "alert", 5000);
            }
        };
        reader.readAsText(file);
    }
    else if(fileExtension === "zip") {
        let zip = new JSZip();
        zip.loadAsync(file)
            .then(async (zip) => {
                let filenames = Object.keys(zip.files);
                for (let i = 0; i < filenames.length; i++) {
                    if (filenames[i].slice(-4) === "srtb") {
                        let srtb = zip.files[filenames[i]];
                        await srtb.async("string").then((content) => {
                            try {
                                readJson = convertToJSON(JSON.parse(content));
                                callback(readJson, args);
                            }
                            catch (e) {
                                createToast("Load failed", ".zip file contains invalid .srtb", "alert", 5000);
                            }
                        });
                        return;
                    }
                }
                createToast("Load failed", "Could not locate .srtb in .zip file", "alert", 5000);
            }, () => {
                createToast("Load failed", "Invalid .zip", "alert", 5000);
            }); 
    }
    else {
        createToast("Load failed", `Unrecognized file extension: .${fileExtension}`, "alert", 5000);
    }
}

function loadTemplate(filename) {
    let templateData = JSON.parse(JSON.stringify(chartTemplates))[filename];
    const fileExtension = filename.split(".").pop().toLowerCase();
    if (["srtb", "json"].includes(fileExtension)) {
        try {
            if (fileExtension === "srtb") {
                let json = convertToJSON(templateData);
                loadChartData(json);
            }
            else if (fileExtension === "json") {
                loadChartData(templateData);
            }

            chartFilename = filename;
            updateTBValue("filename", chartFilename);
            resetAlbumArt();
            resetAudioClips();
        }
        catch (e) {
            createToast("Load failed", "Template failed to load", "alert", 5000);
            console.error(e);
        }
    }
    else {
        createToast("Load failed", `Unrecognized file extension: .${fileExtension}`, "alert", 5000);
    }
}

async function loadFromLink() {
    let input = await popupLoadFromSpinshare();
    if(!input) return;
    input = input.toLowerCase();

    let id = "";
    if(input.indexOf("?") > 0) { // trim off search queries
        input = input.substring(0, input.indexOf("?"));
    }

    if (input !== null && input !== "") {
        if(input.includes("spinshare_")) { // temporarily rejecting these until laura implements them in the api
            createToast("Load failed", "SpinShare API doesn't support spinshare_ links (yet)", "alert", 5000);
            return;
        }
        if (!isNaN(parseInt(input)) && parseInt(input) == input // expected format: 12345
                || input.trim().substring(0, "spinshare_".length) === "spinshare_") { // expected format: spinshare_66f651eb93112
            id = input;
        }
        else {
            if(input[input.length-1] === '/') { // support for links ending in '/'
                input = input.substring(0, input.length - 1);
            }
            input = input.substring(input.lastIndexOf('/') + 1);
            let i = 0;
            if (!isNaN(parseInt(input)) && parseInt(input) == input // expected format: https://spinsha.re/song/12345
                    || input.includes("spinshare_")) { // expected format: https://spinsha.re/song/spinshare_66f651eb93112
                do {
                    id += input[i];
                    i++;
                }
                while (input[i] && input[i] !== "?");
            }
            else {
                createToast("Load failed", `Invalid SpinShare link`, "alert", 5000);
                return;
            }
        }

        let link = `https://spinsha.re/api/song/${id}/download`;

        loadingMessage.textContent = `LOADING CHART WITH ID "${id}"...`;
        loadingScreen.classList.add("active");

        await fetch(link)
            .then(response => response.blob())
            .then((blob) => {
                let file = new File([blob], `${id}.zip`);
                if(file.size < 50) {
                    createToast("Load failed", `Chart ID not found`, "alert", 5000);
                }
                else {
                    loadChartFile(file);
                }
                
                loadingScreen.classList.remove("active");
            });
    }
}

function loadChartFile(file) {
    let fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension === "srtb" || fileExtension === "json") {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (fileExtension === "srtb") {
                    let srtb = e.target.result;
                    let json = convertToJSON(JSON.parse(srtb));
                    loadChartData(json);
                }
                else if (fileExtension === "json") {
                    let json = JSON.parse(e.target.result);
                    loadChartData(json);
                }

                chartFilename = file.name;
                createToast("Load successful", chartFilename, "success", 5000);
                updateTBValue("filename", chartFilename);
                resetAlbumArt();
                resetAudioClips();
            }
            catch (e) {
                createToast("Load failed", `Invalid .${fileExtension}\n\n${e}`, "alert", 5000);
                console.error(e);
            }
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
                let audioFilename;
                let audio;

                let filenames = Object.keys(zip.files);
                let nAudio = 0;
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
                        if(nAudio < 1) {
                            audio = zip.files[filename];
                            audioFilename = filename;
                        }
                        nAudio++;
                    }
                }
                if(nAudio > 1) {
                    createToast("Unsupported Feature", "SRTBE doesn't support multiple audio clips. You will only get 1 audio if you download as a .zip file.", "warning", 10000);
                }

                if(!srtb) {
                    createToast("Load failed", `No .srtb found in the .zip`, "alert", 5000);
                    return;
                }
                await loadZipSRTB(srtb);
                if (image !== undefined) {
                    await loadZipImage(image, imageFilename);
                    updateAlbumArt();
                }
                if (audio !== undefined) {
                    await loadZipAudio(audio, audioFilename);
                    updateAudioClips();
                }
                
                chartFilename = srtbFilename;
                createToast("Load successful", srtbFilename, "success", 5000);
                updateTBValue("filename", srtbFilename);
            }, () => {
                createToast("Load failed", "Invalid .zip", "alert", 5000);
            }); 
    }
    else {
        createToast("Load failed", `Unrecognized file extension: .${fileExtension}`, "alert", 5000);
    }
}

async function loadZipSRTB(srtb) {
    try {
        await srtb.async("string").then((content) => {
                json = convertToJSON(JSON.parse(content));
                loadChartData(json);
        });
    }
    catch (e) {
        createToast("Load failed", `.zip file contains invalid .srtb\n\n${e}`, "alert", 5000);
    }
}

async function loadZipImage(image, filename) {
    filename = filename.slice(9);

    await image.async("arraybuffer").then((content) => {
        let buffer = new Uint8Array(content);
        let blob = new Blob([buffer.buffer]);
        let file = new File([blob], filename);

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        document.getElementById("bv-album-art").files = dataTransfer.files;
    });
}

async function loadZipAudio(audio, filename) {
    filename = filename.slice(11);

    await audio.async("blob").then((content) => {
        let file = new File([content], filename);

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        document.getElementById("bv-audio-clips").files = dataTransfer.files;
    });
}



function loadChartData(data) {
    if (chartJSON === undefined) {
        enableUserInput();
    }

    chartJSON = data;

    let references = getReferences(chartJSON);
    trackInfo = references[0];
    trackData = references[1];
    clipInfo = references[2];
    chartReferences = [trackInfo, trackData[activeDifficulty], clipInfo[0]];

    updateChartData();

    renderBasicDiagnostics();

    updateJSONEditor(JSON.stringify(chartJSON, null, 4));
}



const fileInput = document.getElementById("tb-file-input");
fileInput.onchange = () => {
    loadChartFile(fileInput.files[0]);
}

const lyricInput = document.getElementById("dv-lyric-input");
lyricInput.onchange = () => {
    passJsonToCallback(lyricInput.files[0], replaceChartLyrics);
}

const mergeInput = document.getElementById("dv-merge-input");
mergeInput.onchange = () => {
    passJsonToCallback(mergeInput.files[0], mergeChartJson);
}

const diffInput = document.getElementById("dv-difficulty-input");
diffInput.onchange = () => {
    let diff = diffInput.getAttribute("diffType");
    passJsonToCallback(diffInput.files[0], replaceChartDifficulty, [diff]);
}