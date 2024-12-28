let chartJSON;

let chartTemplates = {};
let templateJSON;

let chartFilename;



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
    let input = prompt("Please enter a SpinShare link or ID:");
    let id = "";

    if (input !== null && input !== "") {
        if (!isNaN(parseInt(input))) { // expected format: 12345
            id = input;
        }
        else {
            let i = input.lastIndexOf("/") + 1;
            if (i === 0) { // expected format: spinshare_66f651eb93112
                id = input;
            }
            else if (!isNaN(parseInt(input))) { // expected format: https://spinsha.re/song/12345
                do {
                    id += input[i];
                    i++;
                }
                while (!isNaN(parseInt(input)) && input[i] !== undefined);
            }
            else { // expected format: https://spinsha.re/song/spinshare_66f651eb93112
                do {
                    id += input[i];
                    i++;
                }
                while (input[i] !== "?" && input[i] !== undefined);
            }
        }

        await fetch(`https://spinsha.re/api/song/${id}/download`)
            .then(response => response.blob())
            .then((blob) => {
                let file = new File([blob], `${id}.zip`);
                loadChartFile(file);
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
                        audioFilename = filename;
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

    getReferences();
    updateChartData();

    calculateDiagnostics();

    updateJSONEditor(JSON.stringify(chartJSON, null, 4));
}



const fileInput = document.getElementById("tb-file-input");
fileInput.onchange = () => {
    loadChartFile(fileInput.files[0]);
}