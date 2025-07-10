function stackNearbyNotesAllDiffs() {
    let trackData = getReferences(chartJSON)[1];

    for(let i = 0; i < trackInfo.difficulties.length; i++) {
        if(trackInfo.difficulties[i]._active) {
            stackNearbyNotes(trackData[i].notes);
        }
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
            console.log(`adjusted a note at t=${noteData[i].time}`);
        }
        else {
            prevTime = noteData[i].time;
        }
    }
    if(numChanges > 0) {
        alert(`Changed the timings on ${numChanges} notes`);
    }
}