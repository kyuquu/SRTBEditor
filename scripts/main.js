const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

let isDevModeEnabled = true;



let activeTab = 0;
let activeDifficulty = 2;

function switchToTab(index) {
    if (activeTab !== index) {
        
        // prompt if unsaved changes in the JSON editor
        if (activeTab === 1
                && !(document.getElementById("json-editor").classList.contains("disabled"))
                && !(document.getElementById("jv-discard").classList.contains("disabled"))) {
            if(confirm("Leave and discard JSON Editor changes?")) {
                discardEditorChanges();
            } else {
                return;
            }
        }

        document.getElementById(`tab-button${activeTab}`).classList.remove("active");
        document.getElementById(`tab-button-small${activeTab}`).classList.remove("active");
        document.getElementById(`tab${activeTab}`).classList.remove("active");
        document.getElementById(`tab-button${index}`).classList.add("active");
        document.getElementById(`tab-button-small${index}`).classList.add("active");
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
    document.querySelector(".dropdown.disabled > button").removeAttribute("disabled");
    document.getElementById("tb-save").classList.remove("disabled");
    document.querySelector(".bv0").classList.remove("disabled");
    document.querySelector(".bv1").classList.remove("disabled");
    document.querySelector(".bv2").classList.remove("disabled");
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
    //scuffed hardcoded diff rating boxes
    for (var i = 0; i < 6; i++) {
        if(trackData.hasOwnProperty(i) && trackData[i].hasOwnProperty("difficultyRating")) {
            updateBVValue(`difficultyRating${i}`,trackData[i].difficultyRating);
            document.getElementById(`bv-difficultyRating${i}`).parentElement.classList.remove("disabled");
            //console.log(`Diff rating ${i}: ${trackData[i].difficultyRating}`);
        } else {
            updateBVValue(`difficultyRating-${i}`, "");
            document.getElementById(`bv-difficultyRating${i}`).parentElement.classList.add("disabled");
            //console.log(`Disabled diff ${i}`);
        }
        if(trackInfo.difficulties.length <= i  || !trackInfo.difficulties[i]._active) {
            document.getElementById(`bv-difficultyRating${i}`).parentElement.classList.add("disabled");
            //console.log(`Disabled diff ${i}`);
        }
    }
    //scuffed hardcoded diff enabled checkboxes
    for(let i = 0; i < 6; i++) {
        if(trackInfo.hasOwnProperty("difficulties")) {
            if(trackInfo.difficulties.length > i) {
                document.getElementById(`bv-difficulty-active${i}`).checked = trackInfo.difficulties[i]._active;
            } else {
                document.getElementById(`bv-difficulty-active${i}`).checked = false;
            }
        }
    }

    //scuffed fallback cases
    if(!trackInfo.hasOwnProperty("allowCustomLeaderboardCreation")) {
        console.log("track doesn't have modern allowLeaderboard field, defaulting to true");
        document.getElementById("bv-allowCustomLeaderboardCreation").checked = true;

        // unsure if "isReleaseable" is a fallback metric for this
    }
}



function updateTBValue(property, value) {
    if (document.getElementById(`tb-${property}`) !== null) {
        document.getElementById(`tb-${property}`).textContent = value;
    }

    if (property === "title" && value.length === 0) {
        document.getElementById("tb-title").innerHTML = "<i>Untitled</i>";
    }
}



function processBVInput(inputType, property, keyName, index) {
    var BVName = property;
    if(keyName == "TrackData") //special case for TrackData (make scaleable later)
        BVName += "-" + index;
    let BVElement = document.getElementById(`bv-${BVName}`);

    const getValue = () => {
        if (inputType === "text") {
            return BVElement.value;
        }
        else if(inputType === "number") {
            let ret = parseFloat(BVElement.value);
            if(isNaN(ret)) {
                console.error(`expected a number, got \"${BVElement.value}\"`);
                return 0;
            }
            if(ret > 2147483647 || ret < -2147483648) {
                console.error(`number is outside the integer limit, \"${BVElement.value}\"`);
                return 0;
            }
            return ret;
        }
        else if (inputType === "checkbox") {
            return BVElement.checked;
        }
        else {
            console.error(`attempted to process unknown type \"${inputType}\"`);
            return;
        }
    }

    let value = getValue();

    updateTBValue(property, value);

    let objIndex;
    //TODO: this can probably be done more cleanly with enums
    switch(keyName) {
        case "TrackInfo":
            objIndex = 0;
            break;
        case "TrackData":
            if(index === null) {
                index = 4;
                console.warn("no specified index for TrackData, defaulting to 4 (XD)");
            }
            objIndex = 1;
            break;
        case "ClipInfo":
            if(index === null) {
                index = 0;
                console.warn("no specified index for ClipData, defaulting to 0");
            }
            objIndex = 2;
            break;
        //TODO: add cases for chroma and dts
        default:
            console.error(`attempted to access unknown SRTB key \"${keyName}\"`);
            return;
    }

    let val = getReferences(chartJSON)[objIndex];
    if(objIndex > 0) {
        val = val[index];
    }
    updateJSONValue(val, property, value);
}

function toggleDifficultyActive(index) {
    let checked = document.getElementById(`bv-difficulty-active${index}`).checked;
    
    if(trackInfo.difficulties.length > index) {
        trackInfo.difficulties[index]._active = checked;
        // console.log("toggled diff the easy way")
    }
    else {
        for(let i = trackInfo.difficulties.length; i <= index; i++) {
            trackInfo.difficulties[i] = {
                "bundle": "CUSTOM",
                "assetName": `TrackData_${i}`,
                "m_guid": "",
                "_active": false
            };
        }
        trackInfo.difficulties[index]._active = checked;
        // console.log("added diff and toggled it");
        //TODO: check for and add other necessary pieces for this
        console.warn("enabled difficulty might not be supported in the srtb");
    }
    updateJSONValue(trackInfo.difficulties[index], "_active", checked);

    updateChartData();
    renderBasicDiagnostics();
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