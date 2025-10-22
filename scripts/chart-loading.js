let chartJSON;

let chartTemplates = {};
let templateJSON;

let chartFilename;

function returnTemplate(filename) {
    let templateData = JSON.stringify(chartTemplates[filename]);
    return templateData;
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
            window.alert(`Template failed to load\n\n${e}`);
        }
    }
    else {
        window.alert(`Unrecognized file extension: .${fileExtension}`);
    }
}



async function loadFromLink() {
    let input = prompt("Please enter a SpinShare link or ID:").toLowerCase();
    let id = "";

    if (input !== null && input !== "") {
        if(input.includes("spinshare_")) { // temporarily rejecting these until laura implements them in the api
            alert("SpinShare API doesn't support spinshare_ links (yet)");
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
                alert("Input is not a valid link");
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
                    alert("Chart ID not found");
                }
                else {
                    loadChartFile(file);
                }
                
                loadingScreen.classList.remove("active");
            });
    }
}


function fetchLyricsFromJson(json) {
    let vals = json.largeStringValuesContainer.values;
    let lyrics = "";
    for(let i = 0; i < vals.length; i++) {
        if(vals[i].key == "SO_ClipInfo_ClipInfo_0"){ 
            lyrics = vals[i].val.lyrics;
            break;
        }
    }
    return lyrics;
}


function loadChartLyrics(file) {
    //let file = document.getElementById("bv-import-lyrics").files[0];
    let fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension === "srtb" || fileExtension === "json") {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let lyricJson;
                if (fileExtension === "srtb") {
                    let lyricSrtb = e.target.result;
                    lyricJson = convertToJSON(JSON.parse(lyricSrtb));
                }
                else if (fileExtension === "json") {
                    lyricJson = JSON.parse(e.target.result);
                }

                let lyrics = fetchLyricsFromJson(lyricJson);
                console.log(lyrics);

                let clipInfo = getReferences(chartJSON)[2][0];
                clipInfo.lyrics = lyrics;
                console.log(clipInfo);
                updateChartData();
                discardEditorChanges();
                

            }
            catch (e) {
                window.alert(`Invalid .${fileExtension}\n\n${e}`);
            }
        };
        reader.readAsText(file);
    }
    else if(fileExtension === "zip") {

    }
    else {
        window.alert(`Unrecognized file extension: .${fileExtension}`);
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
                updateTBValue("filename", chartFilename);
                resetAlbumArt();
                resetAudioClips();
            }
            catch (e) {
                window.alert(`Invalid .${fileExtension}\n\n${e}`);
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
                        if(nAudio > 1) {
                            window.alert("SRTBEditor doesn't support multiple audio files. Please be careful when saving as a ZIP file.");
                            continue;
                        }
                        audio = zip.files[filename];
                        audioFilename = filename;
                        nAudio++;
                    }
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
                updateTBValue("filename", srtbFilename);
            }, () => {
                window.alert("Invalid .zip");
            }); 
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
    loadChartLyrics(lyricInput.files[0]);
}