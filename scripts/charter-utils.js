function stackNearbyNotesAllDiffs() {
    let trackData = getReferences(chartJSON)[1];
    let numChanges = 0;
    let numDiffs = 0;

    for(let i = 0; i < trackInfo.difficulties.length; i++) {
        if(trackInfo.difficulties[i]._active) {
            let val = stackNearbyNotes(trackData[i].notes);
            if(val) numDiffs++;
            numChanges += val;
        }
    }
    if(numChanges) {
        alert(`Moved ${numChanges} notes across ${numDiffs} difficulties`);
    }
    updateChartData();
    discardEditorChanges();
}

function stackNearbyNotes(noteData) {
    let prevTime = -1;
    let numChanges = 0;
    for(let i = 0; i < noteData.length; i++) {
        if(noteData[i].time < prevTime) {
            console.warn("Notes are out of order, aborting stack operation");
            alert("Encountered notes that are out of order. Please save in-game and try again");
            return;
        }
        if(noteData[i].time - prevTime < 0.0005 && noteData[i].time !== prevTime) {
            noteData[i].time = prevTime;
            numChanges++;
        }
        else {
            prevTime = noteData[i].time;
        }
    }
    return numChanges;
}

function mirrorTwistyTrack(index) {
    let trackData = getReferences(chartJSON)[1];
    let trackTurns = trackData[index].references.RefIds[0].data.trackTurns;
    for(let i = 0; i < trackTurns.length; i++) {
        trackTurns[i].turnAmount.x *= -1;
        trackTurns[i].turnAmount.z *= -1;
    }
    updateChartData();
    discardEditorChanges();
}

function copyToClipboard(index) {
    let ret = "";
    let elem = document.getElementById(`dv-diff${index}`);
    if(elem) {
        ret += trackInfo.title + '\t';
        let line = elem.querySelector(".dv-max-score").textContent;
        ret += line.substring(line.lastIndexOf(':') + 1).trim() + '\t';
        line = elem.querySelector(".dv-max-combo").textContent
        ret += line.substring(line.lastIndexOf(':') + 1).trim() + '\t';
    }
    navigator.clipboard.writeText(ret);
}