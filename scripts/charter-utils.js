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
    //let 
    popupMergeChart().then(() => {
        
    });
    //imports is an array, each checked box from the popup is an item in the array
}