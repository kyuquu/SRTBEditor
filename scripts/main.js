const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

let isDevModeEnabled = true;



let activeTab = 0;
let activeDifficulty = 2;

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

function switchToCategory(index) {
    document.querySelector(".category.active").classList.remove("active");
    document.getElementById("bv-categories").children[index].classList.add("active");

    if (index === 0 || index === 2) {
        document.getElementById("bv-difficulty").parentElement.classList.add("disabled");
    }
    else {
        document.getElementById("bv-difficulty").parentElement.classList.remove("disabled");
    }
}

function switchToDifficulty(index) {
    activeDifficulty = index;
    chartReferences[1] = trackData[index];

    let categories = [1, 3, 4];
    for (let i = 0; i < categories.length; i++) {
        let elements = document.getElementById("bv-categories").children[categories[i]].children;
        for (let j = 0; j < elements.length; j++) {
            let element = elements[j].querySelector("input");
            let property = element.id.slice(3);
            let value = trackData[activeDifficulty][property];
            updateBVValue(property, value);
        }
    }
}



function enableUserInput() {
    document.getElementById("tb-save").classList.remove("disabled");
    document.querySelector(".bv0").classList.remove("disabled");
    document.querySelector(".bv1").classList.remove("disabled");
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
    chartReferences.forEach((obj) => {
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

    const getValue = () => {
        if (type === "text") {
            return BVElement.value;
        }
        else if (type === "checkbox") {
            return BVElement.checked;
        }
    }
    else {
        console.error("attempted to process unknown type \"" + type + "\"");
        return;
    }

    let value = getValue();

    updateTBValue(property, value);

    let category;
    chartReferences.some((obj) => {
        if (Object.keys(obj).length > 0 && obj.hasOwnProperty(property)) {
            category = obj;
            return true;
        }
    })
    updateJSONValue(category, property, value);
}

function updateBVValue(property, value) {
    if (document.getElementById(`bv-${property}`) !== null) {
        let BVElement = document.getElementById(`bv-${property}`);
        if (typeof value === "string" || typeof value === "number") { // this is not good!!!
            BVElement.value = value;
        }
        else if (typeof value === "boolean") {
            BVElement.checked = value;
        }
        else {
            console.error("attempted to process unknown type \"" + type + "\"");
            return;
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



document.onclick = (e) => {
    if (document.querySelector(".dropdown.active") && !(e.target.parentElement.classList.contains("active") && e.target.parentElement.classList.contains("dropdown"))) {
        document.querySelector(".dropdown.active").classList.remove("active");
    }
    
    if (document.querySelector(".select-input.active") && !(e.target.parentElement.classList.contains("active") && e.target.parentElement.classList.contains("select-input"))) {
        toggleSelectInput(document.querySelector(".select-input.active > .select-input-button").id);
    }
}