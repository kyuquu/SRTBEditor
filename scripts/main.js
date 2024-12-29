let isDevModeEnabled = true;

let activeDifficulties = [2, 3, 4];



function switchToTab(button, tab) {
    if (document.querySelector(`.tab-button.active`) !== button) {
        document.querySelector(".tab-button.active").classList.remove("active");
        document.querySelector(".tab.active").classList.remove("active");
        button.classList.add("active");
        document.getElementById(`tab-${tab}`).classList.add("active");

        if (tab === "basic") {
            document.querySelectorAll(".category-button").forEach(btn => {
                if (!btn.id.includes("difficulty") || activeDifficulties.includes(parseInt(btn.id.slice(-1)))) {
                    btn.classList.remove("disabled");
                }
            });
        }
        else if (tab === "json") {
            document.querySelectorAll(".category-button").forEach(btn => {
                btn.classList.add("disabled");
            });
            
            if (document.querySelector(".jv.disabled") === null) {
                JSONEditor.focus();
            }
        }

        else if (tab === "diagnostics") {
            let disabled = ["track-info", "difficulties", "clip-info", "dts", "chroma"];
            let enabled = [];
            activeDifficulties.forEach(index => {
                enabled.push(`difficulty${index}`);
            })

            enabled.forEach(category => {
                document.getElementById(`category-button-${category}`).classList.remove("disabled");
            });
    
            disabled.forEach(category => {
                document.getElementById(`category-button-${category}`).classList.add("disabled");
            });
        }
    }
}

function switchToCategory(button, name) {
    if (document.querySelector(`.category-button.active`) !== button) {
        if (document.querySelector(`.category-button.active`) !== null) {
            document.querySelector(".category-button.active").classList.remove("active");
        }
        button.classList.add("active");
        if (document.querySelector(`#category-${name}.active`) === null) {
            if (document.querySelector(".category.active") !== null) {
                document.querySelector(".category.active").classList.remove("active");
            }
            document.getElementById(`category-${name}`).classList.add("active");
        }
    }
}



function enableUserInput() {
    document.getElementById("tb-save").classList.remove("disabled");
    document.querySelector(".bv-left").classList.remove("disabled");
    document.querySelector(".bv-right").classList.remove("disabled");
    document.querySelector(".jv").classList.remove("disabled");
    document.querySelector(".dv").classList.remove("disabled");
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



function validateJSON(json) {
    try {
        let obj = JSON.parse(json);
        if (obj && typeof obj === "object") {
            return obj;
        }
    } catch (e) {
        return false;
    }
}

function updateJSONValue(obj, property, value) {
    obj[property] = value;
    updateJSONEditor(JSON.stringify(chartJSON, null, 4));
}

function updateChartData() {
    chartReferences.forEach(obj => {
        for (let property in obj) {
            let value = obj[property];
            updateTBValue(property, value);
            updateBVValue(property, value);
        }
    });
}



function updateTBValue(property, value) {
    if (document.getElementById(`tb-${property}`) !== null) {
        document.getElementById(`tb-${property}`).textContent = value;
    }

    if (property === "title" && value.length === 0) {
        document.getElementById("tb-title").innerHTML = "<i>Untitled</i>";
    }
}



function processBVInput(type, property) {
    let BVElement = document.getElementById(`bv-${property}`);

    let value;
    if (type === "text") {
        value = BVElement.value;
    }
    else if (type === "checkbox") {
        value = BVElement.checked;
    }

    updateTBValue(property, value);
    updateJSONValue(chartReferences, property, value);
}

function updateBVValue(property, value) {
    if (document.getElementById(`bv-${property}`) !== null) {
        let BVElement = document.getElementById(`bv-${property}`);
        if (typeof value === "string") {
            BVElement.value = value;
        }
        else if (typeof value === "boolean") {
            BVElement.checked = value;
        }
    }
}



function getFileSize(size) {
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