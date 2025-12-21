function stackNearbyNotesAllDiffs() {
    let trackData = getReferences(chartJSON)[1];
    let numChanges = 0;
    let numDiffs = 0;

    for(let i = 0; i < trackInfo.difficulties.length; i++) {
        if(trackInfo.difficulties[i]._active) {
            let val;
            switch(trackData[i].noteSerializationFormat) {
                case 0:
                    val = stackNearbyNotes(trackData[i].notes, 0);
                    break;
                case 2:
                    val = stackNearbyNotes(trackData[i].binaryNotes, 2);
                    break;
                default:
                    createToast("Stack", "Aborting stack: note encoding format is unsupported", "warning", 5000);
                    return;
            }
            if(val) numDiffs++;
            numChanges += val;
        }
    }
    if(numChanges) {
        createToast("Stack", `Moved ${numChanges} note${numChanges>1?"s":""} across ${numDiffs} difficult${numDiffs>1?"ies":"y"}`, "info", 5000);
    }
    else {
        createToast("Stack", "Didn't find any notes to stack", "info", 5000);
    }
    updateChartData();
    discardEditorChanges();
}

function stackNearbyNotes(noteData, encoding) {
    let prevTime = -1;
    let numChanges = 0;
    for(let i = 0; i < noteData.length; i++) {
        if(encoding == 0) {
            if(noteData[i].time < prevTime) {
                console.warn("Notes are out of order, aborting stack operation");
                createToast("Stack", "Aborting stack: notes are out of order. Please save in-game and try again.", "warning", 5000);
                return;
            }
            if(noteData[i].time - prevTime < 0.0005 && noteData[i].time !== prevTime) {
                noteData[i].time = prevTime;
                numChanges++;
            }
            else {
                prevTime = noteData[i].time;
            }
        } else if (encoding == 2) {
            if(noteData[i].tk < prevTime) {
                console.warn("Notes are out of order, aborting stack operation");
                createToast("Stack", "Aborting stack: notes are out of order. Please save in-game and try again.", "warning", 5000);
                return;
            }
            if(noteData[i].tk - prevTime < 50 && noteData[i].tk !== prevTime) {
                noteData[i].tk = prevTime;
                numChanges++;
            }
            else {
                prevTime = noteData[i].tk;
            }

        }
    }
    return numChanges;
}

function mirrorTwistyTrack(index) {
    let trackData = getReferences(chartJSON)[1];
    let trackTurns = trackData[index].references.RefIds[0].data.trackTurns;
    if(trackTurns && trackTurns.length) {
        for(let i = 0; i < trackTurns.length; i++) {
            trackTurns[i].turnAmount.y *= -1;
            trackTurns[i].turnAmount.z *= -1;
        }
        updateChartData();
        discardEditorChanges();
        createToast("Mirror", `Mirrored ${trackTurns.length} flight path${trackTurns.length>1?"s":""}`, "success", 5000);
    }
    else
        createToast("Mirror", "No flight paths found.", "info", 5000);
}

function copyToClipboard(index) {
    let ret = "";
    let elem = document.getElementById(`dv-diff${index}`);
    if(elem && elem.querySelector(".dv-max-score")) {
        ret += trackInfo.title + '\t';
        let line = elem.querySelector(".dv-max-score").textContent;
        ret += line.substring(line.lastIndexOf(':') + 1).trim() + '\t';
        line = elem.querySelector(".dv-max-combo").textContent
        ret += line.substring(line.lastIndexOf(':') + 1).trim() + '\t';
        navigator.clipboard.writeText(ret);
        createToast("Copy", "Score data copied to clipboard.", "success", 5000);
    }
    else 
        createToast("Copy", "No score data to copy.", "info", 5000);
}

function replaceChartLyrics(lyricJson) {
    if(!lyricJson) return;

    let lyrics = fetchLyricsFromJson(lyricJson);

    let clipInfo = getReferences(chartJSON)[2][0];
    clipInfo.lyrics = lyrics;
    updateChartData();
    discardEditorChanges();
    createToast("Lyrics", "Successfully imported lyrics.", "success", 5000);
}

function replaceChartDifficulty(newJson, args) {
    let diff = args[0];
    if(!diff || diff < 0 || diff > 5) {
        console.error(`attempted to replace an invalid difficulty ${diff}`);
        return;
    }
    let newTrackData = fetchTrackDataByDifficulty(newJson, diff);
    replaceTrackDataByDifficulty(newTrackData, diff);
    console.warn("using old method, pls fix");
}

function changeNoteEncodings(format) {
    let cont = confirm("This action is destructive to leaderboards. Continue?");
    if(!cont) return;
    let diffs = getReferences(chartJSON)[1];
    for(let i = 0; i < diffs.length; i++) {
        if(format != 2) {
            console.warn("Only changing to format 2 is supported at this time");
        }
        if(format == 2) {
            for(let j = 0; j < diffs[i].notes.length; j++) {
                let note = diffs[i].notes[j];
                diffs[i].binaryNotes.push({
                    "tk": Math.round(note.time * 100000),
                    "tp": note.type,
                    "c": note.colorIndex,
                    "p": note.column,
                    "s": note.m_size
                });
            }
            diffs[i].noteSerializationFormat = format;
            diffs[i].notes = [];
        }
    }
    updateChartData();
    discardEditorChanges();
    createToast("Format", "Note format successfully changed.", "success", 5000);
}

function mergeChart(newFile) {
    passJsonToCallback(newFile, mergeChartJson);
}

function mergeChartJson(newJson) {
    let newTrackData = fetchTrackInfo(newJson);
    popupMergeChart(newTrackData.title, newTrackData.subtitle, newJson).then((ret) => {
        if(ret != 1) return;
        let elem;
        let rep = false;
        let numActions = 0;

        //primary metadata
        elem = document.getElementById("merge-0");
        if(elem && elem.checked) {
            numActions++;

            let oldInfo = fetchTrackInfo();
            let newInfo = fetchTrackInfo(newJson);

            //snapshot enabled diffs, load new trackData, reload old enabled diffs
            let diffs = oldInfo.difficulties;
            oldInfo = JSON.parse(JSON.stringify(newInfo));
            oldInfo.difficulties = diffs;
            
            loadChartData(replaceTrackInfo("", oldInfo));
        }

        //for each diff
        for(let i = 1; i < 7; i++) {
            elem = document.getElementById(`merge-${i}`);
            if(elem) {
                let oldDiff = fetchTrackDataByDiff("", i-1);
                let newDiff = fetchTrackDataByDiff(newJson, i-1);

                //if new chart doesn't have this diff, skip it
                if(newDiff == -1) continue;

                if(elem.checked) {
                    numActions++;
                    //if old chart doesn't have this diff, create it
                    if(oldDiff == -1) {
                        loadChartData(generateTrackData("", i-1));
                        oldDiff = fetchTrackDataByDiff("", i-1);
                        console.warn("generating a diff first!");
                    }

                    //the entire diff
                    oldDiff = newDiff;
                    rep = true;

                    //enable/disable according to the imported diff
                    let oldInd = fetchTrackDataIndexByDiff("", i-1);
                    let newInd = fetchTrackDataIndexByDiff(newJson, i-1);
                    let oldKey = chartJSON.largeStringValuesContainer.values[oldInd].key;
                    let newKey = newJson.largeStringValuesContainer.values[newInd].key;
                    let active = isDiffActiveByKey(newJson, newKey);

                    loadChartData(setDiffActiveByKey("", oldKey, active));
                }
                else {

                    elem = document.getElementById(`merge-${i}-0`);
                    if(elem && elem.checked) {
                        numActions++;
                        //if old chart doesn't have this diff, create it
                        if(oldDiff == -1) {
                            loadChartData(generateTrackData("", i-1));
                            oldDiff = fetchTrackDataByDiff("", i-1);
                            console.warn("generating a diff first! (why are you partially merging into a diff that didn't exist?)");
                        }
                        //clip data
                        oldDiff.clipInfoAssetReferences = newDiff.clipInfoAssetReferences;
                        oldDiff.clipData = newDiff.clipData;
                        rep = true;
                    }

                    elem = document.getElementById(`merge-${i}-1`);
                    if(elem && elem.checked) {
                        numActions++;
                        //if old chart doesn't have this diff, create it
                        if(oldDiff == -1) {
                            loadChartData(generateTrackData("", i-1));
                            oldDiff = fetchTrackDataByDiff("", i-1);
                            console.warn("generating a diff first! (why are you partially merging into a diff that didn't exist?)");
                        }
                        //notes
                        oldDiff.noteSerializationFormat = newDiff.noteSerializationFormat;
                        oldDiff.notes = newDiff.notes;
                        oldDiff.notesCompressed = newDiff.notesCompressed;
                        oldDiff.binaryNotes = newDiff.binaryNotes;
                        rep = true;
                    }
                    elem = document.getElementById(`merge-${i}-2`);
                    if(elem && elem.checked) {
                        numActions++;
                        //if old chart doesn't have this diff, create it
                        if(oldDiff == -1) {
                            loadChartData(generateTrackData("", i-1));
                            oldDiff = fetchTrackDataByDiff("", i-1);
                            console.warn("generating a diff first! (why are you partially merging into a diff that didn't exist?)");
                        }
                        //track turns
                        oldDiff.splinePathData = newDiff.splinePathData;
                        oldDiff.references.refIds = newDiff.references.refIds;
                        rep = true;
                    }
                }
                if(rep) {
                    loadChartData(replaceTrackDataByDiff(oldDiff, i-1));
                    rep = false;
                }
            }
        }
        
        //clip info
        elem = document.getElementById("merge-7");
        if(elem) {

            let oldClip = fetchLargeStringByKey("", "SO_ClipInfo_ClipInfo_0");
            let newClip = fetchLargeStringByKey(newJson, "SO_ClipInfo_ClipInfo_0");

            if(elem.checked) {
                numActions++;
                //the entire clip info
                oldClip = newClip;
                rep = true;
            }
            else {
                elem = document.getElementById("merge-7-0");
                if(elem && elem.checked) {
                    numActions++;
                    //tempomap
                    oldClip.timeSignatureMarkers = newClip.timeSignatureMarkers;
                    oldClip.bpmMarkers = newClip.bpmMarkers;
                    rep = true;
                }

                elem = document.getElementById("merge-7-1");
                if(elem && elem.checked) {
                    numActions++;
                    //cuepoints
                    oldClip.cuePoints = newClip.cuePoints;
                    rep = true;
                }
                elem = document.getElementById("merge-7-2");
                if(elem && elem.checked) {
                    numActions++;
                    //lyrics
                    oldClip.lyrics = newClip.lyrics;
                    rep = true;
                }
            }
            if(rep) {
                replaceLargeStringByKey(oldClip, "SO_ClipInfo_ClipInfo_0");
                rep = false;
            }
        }
        if(numActions)
            createToast("Import successful", `Completed ${numActions} operation${numActions!=1?"s":""}`, "success", 5000);
        else
            createToast("Import skipped", "Found nothing to import", "info", 5000);
    });
}