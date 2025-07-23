import JSZip from "jszip";

import { chart } from "$lib/scripts/main.svelte.js";
import { convertToJSON, getViewHeader } from "$lib/scripts/helper.svelte.js";
import { createToast, deleteToast } from "../../routes/ToastContainer.svelte";

import { templates } from "$lib/templates";

export function loadChartFile(file) {
    let fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension === "srtb" || fileExtension === "json") {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (fileExtension === "srtb") {
                    let srtb = e.target.result;
                    let json = convertToJSON(JSON.parse(srtb));
                    chart.json = json;
                }
                else if (fileExtension === "json") {
                    let json = JSON.parse(e.target.result);
                    chart.json = json
                }

                chart.filename = file.name;
                chart.albumArt = undefined;
                chart.audioClips = undefined;

                createToast("success", "Chart loaded successfully!", `${getViewHeader()}`);
            }
            catch (e) {
                createToast("error", `Invalid .${fileExtension} file.`, "Check console for details.");
                console.error(`Invalid .${fileExtension} file.\n\n${e}`);
            }
        };
        reader.readAsText(file);
    }
    else if (fileExtension === "zip") {
        let zip = new JSZip();
        zip.loadAsync(file)
            .then(async (zip) => {
                try {
                    let srtbFilename;
                    let srtb;
                    let imageFilename;
                    let image;
                    let audioFilename;
                    let audio;

                    let filenames = Object.keys(zip.files);
                    let numOfAudio = 0;
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
                            numOfAudio++;
                            if(numOfAudio > 1) {
                                continue;
                            }
                            audio = zip.files[filename];
                            audioFilename = filename;
                        }
                    }

                    let isLoadSuccessful = await loadZipSRTB(srtb);
                    if (!isLoadSuccessful) {
                        return;
                    }

                    chart.albumArt = undefined;
                    chart.audioClips = undefined;

                    if (image !== undefined) {
                        await loadZipImage(image, imageFilename);
                    }
                    if (audio !== undefined) {
                        await loadZipAudio(audio, audioFilename);
                    }
                    
                    chart.filename = srtbFilename;

                    createToast("success", "Chart loaded successfully!", `${getViewHeader()}`);
                    if (numOfAudio > 1) {
                        createToast("warning", "Multiple audio clips detected.", "SRTBEditor doesn't support multiple audio clips. Please be careful when saving as a .zip file.");
                    }
                }
                catch (e) {
                    createToast("error", `Invalid .zip file.`, "Check console for details.");
                    console.error(`Invalid .${fileExtension} file.\n\n${e}`);
                }
            });
    }
    else {
        createToast("error", "Unrecognized file extension.", `${file.name}`);
    }
}

async function loadZipSRTB(srtb) {
    let isLoadSuccessful;
    await srtb.async("string").then((content) => {
        try {
            chart.json = convertToJSON(JSON.parse(content));
            isLoadSuccessful = true;
        }
        catch (e) {
            createToast("error", "Invalid .strb file.", "Check console for details.");
            console.error(`Invalid .strb file.\n\n${e}`);
            isLoadSuccessful = false;
        }
    });
    return isLoadSuccessful;
}

async function loadZipImage(image, filename) {
    filename = filename.slice(9);

    await image.async("arraybuffer").then((content) => {
        let buffer = new Uint8Array(content);
        let blob = new Blob([buffer.buffer]);
        let file = new File([blob], filename);

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        chart.albumArt = dataTransfer.files;
    });
}

async function loadZipAudio(audio, filename) {
    filename = filename.slice(11);

    await audio.async("arraybuffer").then((content) => {
        let buffer = new Uint8Array(content);
        let blob = new Blob([buffer.buffer]);
        let file = new File([blob], filename);

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        chart.audioClips = dataTransfer.files;
    });
}

export function loadTemplate(filename) {
    const template = JSON.parse(JSON.stringify(templates[filename]));
    const fileExtension = filename.split(".").pop().toLowerCase();
    if (["srtb", "json"].includes(fileExtension)) {
        try {
            if (fileExtension === "srtb") {
                chart.json = convertToJSON(template);
            }
            else if (fileExtension === "json") {
                chart.json = template;
            }

            chart.filename = filename;
            chart.albumArt = undefined;
            chart.audioClips = undefined;
        }
        catch (e) {
            createToast("error", "Template failed to load.", "Check console for details.");
            console.error(`Template failed to load.\n\n${e}`);
        }
    }
    else {
        createToast("error", "Unrecognized file extension.", `${filename}`);
    }
}

export function loadFromFile() {
    let input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", ".srtb, .json, .zip");
    input.click();

    input.onchange = () => {
        loadChartFile(input.files[0]);
        input.remove();
    }
}

export async function loadFromLink() {
    let input = prompt("Please enter a SpinShare link or ID:");
    let id = "";

    if (input !== null && input !== "") {
        input = input.toLowerCase();

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

        let toastID = createToast("info", "Fetching from SpinShare...", `Chart ID: ${id}`);

        await fetch(link)
            .then(response => response.blob())
            .then((blob) => {
                let file = new File([blob], `${id}.zip`);
                if(file.size < 50) {
                    createToast("error", `ID "${id}" not found.`);
                }
                else {
                    loadChartFile(file);
                }

                deleteToast(toastID);
            });
    }
}