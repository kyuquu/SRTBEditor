function switchToTab(index) {
    if (document.getElementById(`tab-button${index}`).classList.contains("tab-button-inactive")) {
        document.getElementById(`tab-button${index}`).classList.remove("tab-button-inactive");
        document.getElementById(`tab-button${(index + 1) % 2}`).classList.add("tab-button-inactive");
        document.getElementById(`tab${index}`).classList.remove("tab-inactive");
        document.getElementById(`tab${(index + 1) % 2}`).classList.add("tab-inactive");
    }
    if (index === 1 && !document.getElementById("json-editor").classList.contains("disabled")) {
        JSONEditor.focus();
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

function saveAsZIP() { // this function needs to be edited once album art and audio is supported
    let filename = chartFilename.split(".").slice(0, -1).join(".");
    let srtb = JSON.stringify(convertToSRTB(JSON.parse(JSONEditor.getValue())));

    let zip = new JSZip();
    zip.file(`${filename}.srtb`, srtb);
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
    const fileExtension = filename.split(".").pop().toLowerCase();
    fetch("./templates/" + filename)
        .then(response => response.json())
        .then((data) => {
            if(["srtb", "json"].includes(fileExtension)) {
                try {
                    if (fileExtension === "json") {
                        loadChartData(data);
                    }
                    else if (fileExtension === "srtb") {
                        let json = convertToJSON(data);
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
        });
}



const fileInput = document.getElementById("tb-file-input");
fileInput.onchange = () => {
    let file = fileInput.files[0];
    let fileExtension = file.name.split('.').pop().toLowerCase();
    if (["srtb", "json"].includes(fileExtension)) { // to do: allow .zip files to be imported
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
    else {
        window.alert(`Unrecognized file extension: .${fileExtension}`);
    }
}