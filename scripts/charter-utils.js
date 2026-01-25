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

function getPotentialPlayerPosition (notes, checkIndex) {

    // check if a slider occurs here (sliders always take priority)
    let prevSlider, nextSlider;
    let prevNote, nextNote;
    for(let i = checkIndex - 1; i >= 0; i--) {
        if([2, 3, 12].includes(notes[i].tp))
            break;

        if([4, 5].includes(notes[i].tp) && !prevNote)
            prevNote = notes[i];

        if(notes[i].tp == 4) {
            prevSlider = true;
            break;
        }
    }
    if(prevSlider) {
        for(let i = checkIndex + 1; i < notes.length; i++) {
            if([2, 3, 4, 12].includes(notes[i].tp)) {
                break;
            }
            if(notes[i].tp == 5) {
                nextSlider = true;
                nextNote = notes[i];
                break;
            }
        }
    }
    if(nextSlider) {
        console.warn(`slidering ${notes[checkIndex].tk/100000}`);

        //oh god mathing out slider shapes
        //if prev and next are close, we can be anywhere between them
        //in fact, i should probably branch out at least 300ms
        let cmod = (sliderColor(notes, checkIndex) % 2) * 4;
        if(nextNote.tk - prevNote.tk < 300) {
            return {
                lane: modulo((getAdjustedLane(nextNote) + getAdjustedLane(prevNote)) / 2 + cmod, 8),
                spread: Math.abs(nextNote.p - prevNote.p)
            };
        }
        //if prev and next aren't close, math out the slider shape :]
        let timeDiff = nextNote.tk - prevNote.tk;
        let progress = (notes[checkIndex].tk - prevNote.tk) / timeDiff;
        let gap = nextNote.p - prevNote.p;
        let pos, spread = timeDiff > 20000 ? 1 : 2;

        // featuring disgusting approximations of slider shapes!
        switch(prevNote.s) {
            case 0:
            case 1:
            default: //cosine
                pos = -1 * (Math.cos(progress * Math.PI / 2) - 1) * gap;
                break;
            case 2: //curve-late
                pos = Math.pow(progress, 4) * gap;
                break;
            case 3: //curve-early
                pos = Math.pow(progress, 1/4) * gap;
                break;
            case 4: //linear
                pos = progress * gap;
                break;
            case 5: //90
                if(nextNote.tk - notes[checkIndex].tk > 1200) {
                    pos = 0;
                    spread = 1
                }
                else {
                    pos = gap / 2;
                    spread = gap / 2 + 1
                }
        }
        return {
            lane: modulo(getAdjustedLane(prevNote) + cmod + pos, 8),
            spread: spread
        }
    }

    // not a slider, we'll use the prev and next notes instead
    else {
        prevNote = undefined;
        let prevCMod = 0;
        // find the prev note
        for(let i = checkIndex - 1; i >= 0; i--) {
            // abort if previous defining note was a spin or scratch
            if([2, 3, 12].includes(notes[i].tp))
                return {
                    lane: "aPoint"
                }

            // return immediately if there's a tap in this stack
            if([4, 8].includes(notes[i].tp) && notes[i].tk - notes[checkIndex].tk > -1000)
                return {
                    lane: getAdjustedLane(notes[i]),
                    spread: 1
                };
            
            
            // accept taps, slider midpoints, and visible matches (if they're not in this stack)
            if((notes[i].tp == 5 && isEndpointSlider(notes, i) //prev was a slider endpoint
                    || [4, 8].includes(notes[i].tp) //prev was a tap/slider
                    || (notes[i].tp == 0 && notes[i].c < 2 && notes[i].p < 5 && notes[i].p > -5)) //prev was a visible match
                    && notes[i].tk - notes[checkIndex].tk < -1000) { //not in this stack
                prevNote = notes[i];
                if(prevNote.tp == 5) prevCMod = modulo(sliderColor(notes, checkIndex), 2) * 4;
                break;
            }
        }

        // find the next note
        for(let i = checkIndex + 1; i < notes.length; i++) {
            // accept spins and scratches
            if([2, 3, 12].includes(notes[i].tp)) {
                nextNote = notes[i];
                break;
            }

            // return immediately if there's a stacked tap
            if([4, 8].includes(notes[i].tp) && notes[i].tk - notes[checkIndex].tk < 1000)
                return {
                    lane: getAdjustedLane(notes[i]),
                    spread: 1
                };

            // accept taps and visible matches (if they're not in this stack)
            if(([4, 8].includes(notes[i].tp)
                    || (notes[i].tp == 0 && notes[i].c < 2 && notes[i].p < 5 && notes[i].p > -5))
                    && notes[i].tk - notes[checkIndex].tk > 1000) { //not in this stack
                nextNote = notes[i];
                break;
            }
        }
        console.warn(`mathing ${notes[checkIndex].tk/100000}`);



        //if no previous note, we're at the chart start alignment point
        if(!prevNote) {
            console.warn(`no prev note ${notes[checkIndex].tk/100000}`);
            return {
                lane: fetchAlignmentPoint(notes, checkIndex),
                spread: 0
            };
        }

        //we had a previous position and we're holding still
        else if(!nextNote || [2, 3, 12].includes(nextNote.tp)) {
            console.warn(`upcoming spin/scratch ${notes[checkIndex].tk/100000}`);
            console.warn(nextNote);
            //if prev position came after a spin, we're still there
            //TODO: check for this
            //else, we could be 1 lane off in either direction
            return {
                lane: modulo(getAdjustedLane(prevNote) + prevCMod * 4, 8),
                spread: 1
            };
        }

        //no other conditions met, we just gotta math it out
        else {
            // no expected movement (color swap or not)
            if(modulo(getAdjustedLane(prevNote) + prevCMod, 8) == getAdjustedLane(nextNote)) {
                console.warn(`holding still ${notes[checkIndex].tk/100000}`);
                //if we haven't moved since the aPoint, spread 0: otherwise, spread 1
                let moved = false;
                let aPoint = fetchAlignmentPoint(notes, checkIndex);
                for(let k = checkIndex; k >= 0; k--) {
                    if(([4, 8].includes(notes[k].tp)
                            || (notes[k].tp == 0 && notes[k].c < 2))
                            && Math.abs(getAdjustedLane(notes[k].tp) - aPoint) >= 2) {
                        moved = true;
                        break;
                    }
                    if([2, 3].includes(notes[k].tp))
                        break;
                }
                return {
                    lane: modulo(getAdjustedLane(prevNote) + prevCMod, 8),
                    spread: moved ? 1 : 0
                }
            }

            // color swap
            if(prevNote.c % 2 != nextNote.c % 2) {
                console.warn(`yes color swap ${notes[checkIndex].tk/100000}`);
                return {
                    lane: 0,
                    spread: 4
                }
            }

            // no color swap
            console.warn(`no color swap ${notes[checkIndex].tk/100000}`);
            console.warn(prevNote);
            console.warn(nextNote);
            return {
                lane: (modulo(getAdjustedLane(prevNote) + prevCMod, 8) + getAdjustedLane(nextNote)) / 2,
                spread: (nextNote.p - prevNote.p) / 2 + 1
            }
        }
    }
}

function checkMisalignmentChance (notes, checkIndex, aPoint) {

}

function isEndpointSlider (notes, startIndex) {
    // if(notes[startIndex].tp != 5) throw error("attempted to parse a non-endpoint as an endpoint");
    for(let i = startIndex - 1; i >=0; i--) {
        switch(notes[i].tp) {
            case 2:
            case 3:
            case 12:
                return false;
            case 4:
                return true;
        }
    }
    return false;
}

function sliderColor (notes, startIndex) {
    // if(notes[startIndex].tp != 5) throw error("attempted to parse a non-endpoint as an endpoint");
    for(let i = startIndex - 1; i >=0; i--) {
        switch(notes[i].tp) {
            case 2:
            case 3:
            case 12:
                console.warn(-1);
                return -1;
            case 4:
                return notes[i].c;
        }
    }
    console.warn(-1);
    return -1;
}

function isEndpointRelease (notes, startIndex) {
    // if(notes[startIndex].tp != 5) throw error("attempted to parse a non-endpoint as an endpoint");
    if(notes[startIndex].s != 1) return false;
    for(let i = startIndex + 1; i < notes.length; i++) {
        switch(notes[i].tp) {
            case 5:
                return false;
            case 2:
            case 3:
            case 4:
            case 12:
                return true;
        }
    }
    return true;

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
                    // reject endpoint if it's a release or not part of a slider
                    if(!isEndpointSlider(notes, i) || isEndpointRelease(notes, i)) {
                        stack.splice(k, 1);
                        k--;
                        break;
                    }
                case 0: // match
                //TODO: instead of rejecting taps, keep them and mark the stack as unsafe if applicable
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

        //check for missable via misalignment
        let aPoint = fetchAlignmentPoint(notes, i);
        let pos = getPotentialPlayerPosition(notes, i);
        if(!pos || pos.lane != pos.lane) {
            console.error("failed to calculate position");
            console.log(pos);
            console.log(notes[i]);
        }
        if(pos.lane == "aPoint") {
            pos.lane = aPoint;
            pos.spread = 0;
        }
        let reportedMisalign = false;
        let longest = getLargestGapInStack(stack);
        if(longest > 3) { // missable by misalignment
            // only check for misalignment if all notes are invisible/offtrack
            if(!getStackHasVis(stack)) {
                let severity, desc;
                let testSpread = 0;
                let pass = false;
                let nGood = 0, nBad = 0;
                //test all positions within the spread
                while (testSpread <= pos.spread) {
                    pass = false;
                    for(let k in stack) {
                        if(stack[k].tp == 0) {
                            if(Math.abs(getAdjustedLane(stack[k]) + testSpread - pos.lane) < 2) {
                                pass = true;
                                break;
                            }
                        }
                    }
                    if(pass) nGood++;
                    else {
                        nBad++;
                        // console.log(`missed. t=${stack[0].tk/100000}, pos=${pos.lane}`);
                    }
                    if(testSpread > 0) testSpread *= -1;
                    else testSpread = testSpread * -1 + 0.5;
                }

                console.log(`${stack[0].tk/100000}: ${nGood}::${nBad}, p=${pos.lane}, ${pos.spread}`);
                let rate = nGood / (nGood + nBad);
                if(rate < 0.1) {
                    severity = 3;
                    desc = "invisible stack is missable, and the player "
                        + "is very likely to be in a position to miss it";
                }
                else if(rate < 0.5) {
                    severity = 2;
                    desc = "invisible stack is missable, and the player "
                        + "is likely in a position to miss it";
                }
                else if(rate < 1) {
                    severity = 1;
                    desc = "invisible stack is missable, and the player "
                        + "could potentially to be in a position to miss it";
                }
                else {
                    severity = 0;
                    desc = "invisible stack is missable, but the player "
                        + "shouldn't be in a position to miss it";
                }
                report.push({
                    type: "invisible-missable",
                    desc: desc,
                    severity: severity,
                    note: stack[0]
                });
                reportedMisalign = true;
            }
        }
        else if(longest == 3) { // possibly missable by perfect misalignment
            let zeroLane = getAdjustedLane(stack[0]);
            if(modulo(aPoint - zeroLane, 8) == 2
                    || modulo(aPoint - zeroLane, 8) == 6) {
                // this 4-lane stack is vulnerable to perfect misalignment
                // TODO: further processing to see how severe this is
                    // if there's a visible telegraph, it's fine
                    // if the player is supposed to be elsewhere, low priority report
                    // if the player might be here, high priority report

                if(pos.lane == aPoint && pos.spread == 0) {
                    report.push ({
                        type: "perfect-misalignment",
                        desc: "stacked matches can be missed by misaligning perfectly, "
                            + "and the player is very likely to be in such a position",
                        severity: 3,
                        note: stack[0]
                    });
                }
                else {
                    let min = modulo(pos.lane - pos.spread, 8),
                        max = modulo(pos.lane + pos.spread, 8);

                    let hit = false;
                    if(min < max && aPoint >= min && aPoint <= max)
                        hit = true;
                    else if(min > max && (aPoint <= max || aPoint >= min))
                        hit = true;

                    if(hit && !getStackHasVis(stack)) {
                        report.push ({
                            type: "perfect-misalignment",
                            desc: "stacked matches can be missed by misaligning perfectly, "
                                + "and the player could potentially be in such a position",
                            severity: 2,
                            note: stack[0]
                        });
                    }
                    //TODO: Severity 1 is reserved for aligned but denied by drift
                    else if(!getStackHasVis(stack))
                        report.push ({
                            type: "perfect-misalignment",
                            desc: "stacked matches can be missed by misaligning perfectly, "
                                + "but the player shouldn't be in such a position",
                            severity: 0,
                            note: stack[0]
                        });
                }
                reportedMisalign = true;
            }
        }

        // check for time mismatch
        let substacks = [[stack[0]]];
        for(let k = 1; k < stack.length; k++) {
            let placed = false;
            for(let s in substacks) {
                if(substacks[s][0].tk == stack[k].tk) {
                    substacks[s].push(stack[k]);
                    placed = true;
                    break;
                }
            }
            if(!placed) substacks.push([stack[k]]);
        }
        if(substacks.length > 1) {
            // if any of the substacks contain unprotected off-track or invis matches
            let peakSeverity = 0;
            for(let k in substacks) {
                let longest = getLargestGapInStack(substacks[k]);
                if(getStackHasInvis(substacks[k])) {
                    if(longest > 3) {
                        //check for player position, see if it overlaps with the longest gap
                        //if it does, peakSeverity 2
                        //if not, severity 0
                        if(peakSeverity < 2) peakSeverity = 2;
                    }
                    else if(longest == 3) {
                        let zeroLane = getAdjustedLane(substacks[k][0]);
                        if(modulo(aPoint - zeroLane, 8) == 2
                                || modulo(aPoint - zeroLane, 8) == 6)
                            if(peakSeverity < 1) peakSeverity = 1;
                    }
                }
            }

            // console.error(`t0 ${stack[0].tk}, t${k} ${stack[k].tk}`);
            //TODO: change severity depending on context and amount of offset
            //TODO: treat each individual timing of this offset stack as its own stack, and see if it's still an issue
            if(peakSeverity == 2) {
                report.push({
                    type: "offset-time",
                    desc: "stack has timing discrepancies that make parts of it missable",
                    severity: 2,
                    note: stack[0]
                });
            }
            else if (peakSeverity == 1 && !reportedMisalign) {
                report.push({
                    type: "offset-time-perfect-misalignment-risk",
                    desc: "stack has timing discrepancies that create a vulnerability to perfect misalignment",
                    severity: 1,
                    note: stack[0]
                });
            }
        }
        
        //check for invisible notes near spins
        // TODO: check all notes prior to spin, if there's a visible before spin, dismiss
        let allInvisMatches = true;
        for(let k in stack) {
            if(stack[k].c < 2 && [0, 4, 8].includes(stack[k].tp)) {
                allInvisMatches = false;
                break;
            }
        }
        if(allInvisMatches) {
            for(let k = i + 1; k < notes.length; k++) {
                if(notes[k].tk - notes[i].tk > 10000) break; // break after 100ms
                if([0, 4, 8].includes(notes[k].tp) && notes[k].c < 2) break; // break if a visible note precedes spin
                if(notes[k].tp == 2 || notes[k].tp == 3) {
                    let sev = 0;
                    if(notes[k].tk - notes[i].tk < 2000) sev = 3 //20ms
                    else if(notes[k].tk - notes[i].tk < 3000) sev = 2; //30ms
                    else if(notes[k].tk - notes[i].tk < 5000) sev = 1; //50ms
                    else sev = 0
                    report.push({
                        type: "invis-matches-near-spin",
                        desc: "invisible matches can be missed when spinning early",
                        severity: sev,
                        note: stack[0]
                    });
                }
            }
        }

        i = j;
    }

    return report;
}

function getLargestGapInStack (stack) {
    let lanes = [0, 0, 0, 0, 0, 0, 0, 0]
    for(let k = 0; k < stack.length; k++) {
        if(stack[k].tp == 5) return 0; // stack auto-hits with slider endpoint
        else {
            let color = stack[k].c % 2;
            let lane = modulo(stack[k].p + color * 4, 8);
            lanes[lane]++;
        }
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
    return longest;
}

function getStackHasInvis (stack) {
    for(let i in stack) {
        if(stack[i].tp == 0 && stack[i].c > 1 ||
                stack[i].p > 5 || stack[i].p < -5)
            return true;
    }
    return false;
}

function getStackHasVis (stack) {
    for(let i in stack) {
        if([0, 4, 8].includes(stack[i].tp) && stack[i].c < 2 &&
                stack[i].p < 5 && stack[i].p > -5)
            return true;
    }
    return false;
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