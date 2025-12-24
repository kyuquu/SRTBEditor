const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

let isDevModeEnabled = true;



let activeTab = 0;
let activeDifficulty = 2;

//todo: lots of refactoring to be done here to use the new backend

function switchToTab(index) {
    if (activeTab !== index) {
        
        // prompt if unsaved changes in the JSON editor
        updateEditorButtons(validateJSON(JSONEditor.getValue()));
        if (activeTab === 1
                && !(document.getElementById("json-editor").classList.contains("disabled"))
                && !(document.getElementById("jv-discard").classList.contains("disabled"))) {
            popupConfirmLeaveTab().then((result) => {
                if(result < 0 || result == 2) return;
                if(result == 1) discardEditorChanges();
                if(result == 0) {
                    if(!saveEditorChanges())
                        return;
                }
                
                document.getElementById(`tab-button${activeTab}`).classList.remove("active");
                document.getElementById(`tab-button-small${activeTab}`).classList.remove("active");
                document.getElementById(`tab${activeTab}`).classList.remove("active");
                document.getElementById(`tab-button${index}`).classList.add("active");
                document.getElementById(`tab-button-small${index}`).classList.add("active");
                document.getElementById(`tab${index}`).classList.add("active");

                activeTab = index;

            });
        }
        else {
            document.getElementById(`tab-button${activeTab}`).classList.remove("active");
            document.getElementById(`tab-button-small${activeTab}`).classList.remove("active");
            document.getElementById(`tab${activeTab}`).classList.remove("active");
            document.getElementById(`tab-button${index}`).classList.add("active");
            document.getElementById(`tab-button-small${index}`).classList.add("active");
            document.getElementById(`tab${index}`).classList.add("active");

            activeTab = index;
            
            if (index === 1 && !document.getElementById("json-editor").classList.contains("disabled")) {
                document.getElementById("tab-button1").focus();
                JSONEditor.focus();
            }
        }
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
    if(!json) return -1;
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
            // console.log(`Diff rating ${i}: ${trackData[i].difficultyRating}`);
        } else {
            updateBVValue(`difficultyRating-${i}`, "");
            document.getElementById(`bv-difficultyRating${i}`).parentElement.classList.add("disabled");
            document.getElementById(`bv-difficultyRating${i}`).value = "";
            // console.log(`Disabled diff ${i}`);
        }
        if(trackInfo.difficulties.length <= i  || !trackInfo.difficulties[i]._active) {
            document.getElementById(`bv-difficultyRating${i}`).parentElement.classList.add("disabled");
            // console.log(`Disabled diff ${i}`);
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
    renderBasicDiagnostics();
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
        BVName += index;
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
        updateJSONValue(trackInfo.difficulties[index], "_active", checked);
    }
    else {
        let fullJSON = JSON.parse(JSONEditor.getValue());
        let trackInfoIndex = -1;

        let jsonHeader = fullJSON.unityObjectValuesContainer.values;
        let found = false;
        for(let i = 0; i < jsonHeader.length; i++) {
            if(jsonHeader[i].jsonKey.trim() == `SO_TrackData_TrackData_${index}`) {
                found = true;
                break;
            }
        }
        if(!found) {
            console.log(`failed to find trackData${index} in the header, making one`);
            let newHeader = returnTemplate("Diff Header.json");
            newHeader = newHeader.replaceAll("$0", index);
            jsonHeader[jsonHeader.length] = JSON.parse(newHeader);
        }

        let jsonBody = fullJSON.largeStringValuesContainer.values;
        found = false;
        for(let i = 0; i < jsonBody.length; i++) {
            if(jsonBody[i].key.trim() === `SO_TrackData_TrackData_${index}`) {
                found = true;
            }
            if(jsonBody[i].key.trim() === "SO_TrackInfo_TrackInfo") {
                trackInfoIndex = i;
            }
        }
        if(!found) {
            console.log(`failed to find trackData${index} in the body, making one`);
            let newBody = returnTemplate("Diff Body.json");
            newBody = newBody.replaceAll("$0", index);
            newBody = JSON.parse(newBody);
            newBody.val.difficultyType = index + 2;
            jsonBody[jsonBody.length] = newBody;
        }
        
        if(trackInfoIndex < 0) {
            console.error("failed to find trackInfo");
            return;
        }
        let diffs = jsonBody[trackInfoIndex].val.difficulties;
        found = false;
        for(let i = 0; i < diffs.length; i++) {
            if(diffs[i].assetName.trim() === `TrackData_${index}`) {
                found = true;
                break;
            }
        }
        if(!found) {
            console.log(`failed to find trackData${index} in trackData.difficulties, making one`);
            let newIndex = returnTemplate("Diff Index.json");
            newIndex = newIndex.replaceAll("$0", index);
            diffs[diffs.length] = JSON.parse(newIndex);
        }
        loadChartData(fullJSON);
    }
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