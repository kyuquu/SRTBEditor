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
        createToast("Stack", `Moved ${numChanges} note${numChanges>1?"s":""} across ${numDiffs} difficult${numDiffs>1?"ies":"y"}`, "success", 5000);
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
    popupConfirmModernizeFormat().then((result) => {
        if(!result) return;
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
    });
}

function mergeChart(newFile) {
    passJsonToCallback(newFile, mergeChartJson);
}

function mergeChartJson(newJson) {
    let newTrackData = getTrackInfo(newJson);
    popupMergeChart(newTrackData.title, newTrackData.subtitle, newJson).then((ret) => {
        if(ret != 1) return;
        let elem;
        let rep = false;
        let numActions = 0;

        //primary metadata
        elem = document.getElementById("merge-0");
        if(elem && elem.checked) {
            numActions++;

            let oldInfo = getTrackInfo();
            let newInfo = getTrackInfo(newJson);

            if(!oldInfo || !newInfo)
                console.warn("failed to find TrackInfo");

            //snapshot diffs and art references, load new trackData, reload snapshots
            let diffs = oldInfo.difficulties;
            let art = oldInfo.albumArtReference;
            oldInfo = JSON.parse(JSON.stringify(newInfo));
            oldInfo.difficulties = diffs;
            oldInfo.albumArtReference = art;

            loadChartData(setTrackInfo("", oldInfo));
        }
        else {
            //backgrounds
            elem = document.getElementById("merge-0-0");
            if(elem && elem.checked) {
                numActions++;
                let oldInfo = getTrackInfo();
                let newInfo = getTrackInfo(newJson);

                //todo: check for old background formats too
                oldInfo.backgroundId = newInfo.backgroundId;
                oldInfo.backgroundColoring = newInfo.backgroundColoring;
                oldInfo.fallbackBackgroundId = newInfo.fallbackBackgroundId;
                oldInfo.fallbackColoringBackgroundId = newInfo.fallbackColoringBackgroundId;
                oldInfo.objectReplacements = newInfo.objectReplacements;
                
                loadChartData(setTrackInfo("", oldInfo));
            }
        }

        //for each diff
        for(let i = 1; i < 7; i++) {
            elem = document.getElementById(`merge-${i}`);
            if(elem) {
                let oldDiff = getTrackDataByDiff("", i-1);
                let newDiff = getTrackDataByDiff(newJson, i-1);

                //if new chart doesn't have this diff, skip it
                if(!newDiff) continue;

                if(elem.checked) {
                    numActions++;
                    //if old chart doesn't have this diff, create it
                    if(!oldDiff) {
                        loadChartData(generateTrackData("", i-1));
                        oldDiff = getTrackDataByDiff("", i-1);
                        console.warn("generating a diff first!");
                    }

                    //the entire diff
                    oldDiff = newDiff;
                    rep = true;

                    //enable/disable according to the imported diff
                    let oldInd = getTrackDataIndexByDiff("", i-1);
                    let newInd = getTrackDataIndexByDiff(newJson, i-1);
                    if(oldInd == -1 || newInd == -1) {
                        console.warn("failed to find diff entry in TrackInfo");
                    }
                    else {
                        let oldKey = chartJSON.largeStringValuesContainer.values[oldInd].key;
                        let newKey = newJson.largeStringValuesContainer.values[newInd].key;
                        let active = getDiffActiveByKey(newJson, newKey);

                        loadChartData(setDiffActiveByKey("", oldKey, active));
                    }
                }
                else {

                    elem = document.getElementById(`merge-${i}-0`);
                    if(elem && elem.checked) {
                        numActions++;
                        //if old chart doesn't have this diff, create it
                        if(!oldDiff) {
                            loadChartData(generateTrackData("", i-1));
                            oldDiff = getTrackDataByDiff("", i-1);
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
                        if(!oldDiff) {
                            loadChartData(generateTrackData("", i-1));
                            oldDiff = getTrackDataByDiff("", i-1);
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
                        //extra check: skip twisty track if it doesn't exist in new chart
                        if(newDiff.references && newDiff.splinePath) {
                            numActions++;
                            //if old chart doesn't have this diff, create it
                            if(!oldDiff) {
                                loadChartData(generateTrackData("", i-1));
                                oldDiff = getTrackDataByDiff("", i-1);
                                console.warn("generating a diff first! (why are you partially merging into a diff that didn't exist?)");
                            }
                            //track turns
                            if(!oldDiff.references) oldDiff.references = {};
                            oldDiff.splinePath = newDiff.splinePath;
                            oldDiff.splinePathData = newDiff.splinePathData;
                            oldDiff.references.RefIds = newDiff.references.RefIds;
                            console.log(newDiff.references.RefIds);
                            rep = true;
                        }
                        else {
                            console.warn("skipped track turn import: track turn fields don't exist");
                        }
                    }
                }
                if(rep) {
                    loadChartData(setTrackDataByDiff(oldDiff, i-1));
                    rep = false;
                }
            }
        }
        
        //clip info
        elem = document.getElementById("merge-7");
        if(elem) {

            let oldClip = getLargeStringByKey("", "SO_ClipInfo_ClipInfo_0");
            let newClip = getLargeStringByKey(newJson, "SO_ClipInfo_ClipInfo_0");

            if(!oldClip || !newClip)
                console.warn("failed to find ClipInfo");

            if(elem.checked) {
                numActions++;
                //the entire clip info
                if(oldClip.clipAssetReference.assetName != newClip.clipAssetReference.assetName) {
                    //todo: process merge zip audio if it exists
                    if(document.getElementById("bv-audio-clips").value)
                        createToast("Clip Info Merge",
                            "The audio asset reference changed in the merge. Double check your audio before uploading",
                            "warning", 10000);
                }

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
                setLargeStringByKey(oldClip, "SO_ClipInfo_ClipInfo_0");
                rep = false;
            }
        }
        if(numActions)
            createToast("Import successful", `Completed ${numActions} operation${numActions!=1?"s":""}`, "success", 5000);
        else
            createToast("Import skipped", "Found nothing to import", "info", 5000);
    });
}

function checkUnmissableNotes (notes) {
    let report = [];
    //if wrong encoding, change encoding

    //for each match
    //  if it's stacked with a slider end (and it's part of a slider, not a release), it's unmissable
    //  if it's stacked with other matches, appraise for missability
    //  if it's almost stacked with either of the above, appraise

    //check for matches that are *almost* stacked (within 1ms)
    //check for invisible matches that are alone
    //check for invisible matches that are stacked at misalignment points
    //(further check if the player could feasibly be at the alignment point)
    for(let i = 0; i < notes.length;) {
        let j = i + 1;
        let stack = [notes[i]];
        while(j < notes.length) {
            if(notes[j].tk - notes[i].tk < 100) {
                stack.push(notes[j]);
                j++;
            }
            else break;
        }

        // skip if no stack or invis
        if(stack.length < 2 && stack[0].c < 2) {
            i++;
            continue;
        }

        // remove all irrevelant note types (spins, scratches, beats, beatholds)
        for(let k = 0; k < stack.length; k++) {
            switch(stack[k].tp) {
                case 5: // slider endpoint
                    // TODO: check for actual slider
                    // TODO: check that it's not a slider release
                case 0: // match
                //case 4: // slider (not fully safe)
                //case 8: // tap (not fully safe)
                    break;
                default:
                    stack.splice(k, 1);
                    k--;
            }
        }

        // skip if no stack or invis (again)
        if(stack.length == 0 || stack.length < 2 && stack[0].c < 2) {
            i++;
            continue;
        }

        // skip if not at least 1 match and 1 match/tap/slider endpoint
        let hasMatch = false, hasOther = false;
        for(let k in stack) {
            if(stack[k].tp == 0) {
                if(hasMatch) hasOther = true;
                else hasMatch = true;
            }
            else if(stack[k].tp == 4
                    || stack[k].tp == 5
                    || stack[k].tp == 8) {
                hasOther = true;
            }
        }
        if(!(hasOther && hasMatch)) {
            i = j;
            continue;
        }

        // skip if all matches are visible and on-track
        let visible = true;
        for(let k in stack) {
            if(stack[k].tp == 0 && stack[k].c > 1
                    || stack[k].p > 4 || stack[k].p < -4 ) {
                visible = false;
                break;
            }
        }
        if(visible) {
            i = j;
            continue;
        }

        // check for time mismatch
        for(let k = 1; k < stack.length; k++) {
            if(stack[0].tk - stack[k].tk != 0) {
                // console.error(`t0 ${stack[0].tk}, t${k} ${stack[k].tk}`);
                //TODO: change severity depending on context and amount of offset
                report.push({
                    type: "offset-time",
                    severity: 1,
                    note: stack[0]
                });
                break;
            }
        }

        //check for missable via perfect misalignment
        let lanes = [0, 0, 0, 0, 0, 0, 0, 0]
        for(let k = 0; k < stack.length; k++) {
            let color = stack[k].c % 2;
            let lane = modulo(stack[k].p + color * 4, 8);
            lanes[lane]++;
        }
        let cur = 0, longest = 0;
        for(k in lanes) {
            if(lanes[k] == 0) cur++;
            else {
                if(cur > longest)
                    longest = cur;
                cur = 0;
            }
        }
        for(k in lanes) {
            if(lanes[k] == 0) cur++;
            else {
                if(cur > longest) longest = cur;
                break;
            }
        }   
        if(longest > 3) { // missable by misalignment
            // check if any of the notes in the stack telegraph
            // check if any external notes telegraph
            // prolly log with severity 0 no matter what though
        }
        else if(longest == 3) { // possibly missable by perfect misalignment
            let aPoint = fetchAlignmentPoint(notes, i);
            let zeroLane = getAdjustedLane(stack[0]);
            if(modulo(aPoint - zeroLane, 8) == 2
                    || modulo(aPoint - zeroLane, 8) == 6)
                // this 4-lane stack is vulnerable to perfect misalignment
                // TODO: further processing to see how severe this is
                    // if there's a visible telegraph, it's fine
                    // if the player is supposed to be elsewhere, low priority report
                    // if the player might be here, high priority report
                report.push ({
                    type: "perfect-misalignment",
                    severity: 2,
                    note: stack[0]
                });
        }
        else { // unmissable
        }

        i = j;
        //check for proximity to spins
    }

    console.log(report);
    return report;
}

function modulo (input, divisor) {
    return ((input % divisor) + divisor) % divisor;
}

function getAdjustedLane (note) {
    //convert note if necessary
    return modulo(note.p + 4 * (note.c % 2), 8);
}

function fetchAlignmentPoint (notes, startIndex) {
    //convert notes if necessary
    //this method assumes notes are in order

    //backtrack for a spin, then grab the first positional note after it
    for(let i = startIndex; i >= 0; i--) {
        switch(notes[i].tp) {
            case 2:
            case 3:
                // found a spin
                for(let j = i + 1; j < notes.length; j++) {
                    switch(notes[j].tp) {
                        case 0:
                        case 4:
                        case 8:
                            //found a positional note
                            //check for a stack
                            let lanes = [notes[j]];
                            let hasMatch = false;
                            for(let k = j + 1; k < notes.length; k++) {
                                if((notes[k].tk - notes[j].tk) < 1000) {
                                    switch(notes[k].tp) {
                                        case 0:
                                            hasMatch = true;
                                        case 4:
                                        case 8:
                                            lanes.push(notes[k]);
                                    }
                                }
                                else break;
                            }
                            
                            //if stack, average the position of all notes in the stack
                            if(lanes.length > 1) {
                                if(hasMatch)
                                    for(let k in lanes)
                                        if(lanes[k].tp != 0)
                                            lanes.splice(k, 1);
                                let sum = 0;
                                for(let k in lanes) {
                                    sum += getAdjustedLane(lanes[k]);
                                }
                                // in 4-lane stacks, this might return 4 lanes off
                                // in non-trivial stacks, who knows if i did this right?
                                return sum / lanes.length;
                            }

                            //if no stack, position based on this note
                            return getAdjustedLane(notes[j]);
                    }
                }
        }
    }
    //if no spin found before the note, take the first positional note's lane instead
    for (let i = 0; i < notes.length; i++) {
        switch(notes[i].tp) {
            case 0:
            case 4:
            case 8:
                return getAdjustedLane(notes[i]);
        }

    }
    //if no positional note is found, return 0
    return 0;
}