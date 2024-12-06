function toggleDropdown(name) {
    if (document.querySelector(".tb-button-active") && !document.getElementById(`tb-button-${name}`).classList.contains("tb-button-active")) {
        document.querySelector(".tb-button-dropdown-active").classList.remove("tb-button-dropdown-active");
        document.querySelector(".tb-button-active").classList.remove("tb-button-active");
    }
    document.getElementById(`tb-button-dropdown-${name}`).classList.toggle("tb-button-dropdown-active");
    document.getElementById(`tb-button-${name}`).classList.toggle("tb-button-active");
}



function switchToTab(index) {
    if (document.getElementById(`tab-button${index}`).classList.contains("tab-button-inactive")) {
        document.getElementById(`tab-button${index}`).classList.remove("tab-button-inactive");
        document.getElementById(`tab-button${(index + 1) % 2}`).classList.add("tab-button-inactive");
        document.getElementById(`tab${index}`).classList.remove("tab-inactive");
        document.getElementById(`tab${(index + 1) % 2}`).classList.add("tab-inactive");
    }
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
    if (filename.split(".").slice(0, -1).join(".").length > 0) {
        let link = document.createElement("a"); 
        link.setAttribute("href", "data:text/plain; charset=utf-8," + encodeURIComponent(file));
        link.setAttribute("download", filename);
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    else {
        console.log("filename is too short");
    }
}



function loadTemplate(filename) {
    const fileExtension = filename.split(".").pop().toLowerCase();
    fetch('./templates/' + filename)
        .then(response => response.json())
        .then((data) => {
            if(["srtb", "json"].includes(fileExtension)) {
                if (fileExtension === "json") {
                    loadChartData(data);
                }
                else if (fileExtension === "srtb") {
                    let json = convertToJSON(data);
                    loadChartData(json);
                }

                chartFilename = filename.split(".").slice(0, -1).join(".");
                if (document.querySelector(".tb-button-container.disabled")) {
                    document.querySelector(".tb-button-container.disabled").classList.remove("disabled");
                }
            }
            else {
                console.log("attempted to load template with unrecognized extension: " + fileExtension);
            }
        });

}



// closes dropdown menus when you click off of them
document.onclick = (e) => {
    if (document.querySelector(".tb-button-active") && !e.target.classList.contains("tb-button-active")) {
        document.querySelector(".tb-button-dropdown-active").classList.remove("tb-button-dropdown-active");
        document.querySelector(".tb-button-active").classList.remove("tb-button-active");
    }
}



// controls what happens when you click "upload file" under "new"
const fileInput = document.getElementById("tb-button-new-upload");
fileInput.onchange = () => {
    let file = fileInput.files[0];
    let fileExtension = file.name.split('.').pop().toLowerCase();
    if (["srtb", "json"].includes(fileExtension)) { // to do: allow .zip files to be imported
        const reader = new FileReader();
        reader.onload = (e) => {
            if (fileExtension === "srtb") {
                let srtb = e.target.result;
                let json = convertToJSON(JSON.parse(srtb));
                loadChartData(json);
            }
            else if (fileExtension === "json") {
                loadChartData(e.target.result);
            }

            chartFilename = file.name.split(".").slice(0, -1).join(".");
            if (document.querySelector(".tb-button-container.disabled")) {
                document.querySelector(".tb-button-container.disabled").classList.remove("disabled");
            }
        };
        reader.readAsText(file);
    }
    else {
        console.log("attempted to load template with unrecognized extension: " + fileExtension);
    }
}