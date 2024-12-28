function getClipInfo(index) {
    let vals = chartJSON["largeStringValuesContainer"]["values"];
    let count = index;
    for (v in vals) {
        if(v.key.contains("SO_ClipInfo")) {
            if(count == 0)
                return v.val;
            else
                count--;
        }
    }
}

function calculateDiagnostics() {
    calculateBalance();
    calculateMaxScoreAndCombo();
}

function calculateBalance() {
    let nRed = 0,
        nBlue = 0,
        nInvisRed = 0,
        nInvisBlue = 0;
    let nMatch = 0,
        nTap = 0,
        nSlider = 0,
        nSliderRelease = 0,
        nBeat = 0,
        nBeathold = 0,
        nBeatRelease = 0,
        nLeftSpin = 0,
        nRightSpin = 0,
        nScratch = 0;
    let notes = chartJSON["largeStringValuesContainer"]["values"][5]["val"]["notes"];
    let sortedNotes = notes.toSorted((a, b) => a["time"] - b["time"]);

    for(let i = 0; i < sortedNotes.length; i++) {
        switch(sortedNotes[i].type) {
            case 0:
            case 4:
            case 8:
                if(sortedNotes[i].colorIndex == 0) nBlue++;
                else if(sortedNotes[i].colorIndex == 1) nRed++;
                else if(sortedNotes[i].colorIndex % 2 == 0) nInvisBlue++;
                else nInvisRed++;
                break;
        }
        switch(sortedNotes[i].type) {
            case 0:
                nMatch++;
                break;
            case 1:
                nBeat++;
                break;
            case 2:
                nRightSpin++;
                break;
            case 3:
                nLeftSpin++;
                break;
            case 4:
                nSlider++;
                //further logic for releases
                break;
            case 8:
                nTap++;
                break;
            case 11:
                //logic for beathold
                //todo: account for error beatholds
                if(sortedNotes[i].m_size == 2)
                    nBeatRelease++;
                nBeathold++;
                break;
            case 12:
                nScratch++;
                break;
        }
    }
    let colorString = "Note Colors (blue:red): " + nBlue + ":" + nRed;
    if(nInvisRed + nInvisBlue > 0) {
        colorString += " (invis: " + nInvisBlue + ":" + nInvisRed + ")";
    }

    document.getElementById("dv-match-count").textContent = "Matches: " + nMatch;
    document.getElementById("dv-tap-count").textContent = "Taps: " + (nTap + nSlider);
    document.getElementById("dv-beat-count").textContent = "Beats: " + nBeat;
    document.getElementById("dv-hold-count").textContent = "Holds: " + (nSlider + nBeathold);
    document.getElementById("dv-release-count").textContent = "Releases: " + (nBeatRelease + nSliderRelease);
    document.getElementById("dv-spin-count").textContent = "Spins: " + (nLeftSpin + nRightSpin);
    document.getElementById("dv-scratch-count").textContent = "Scratches: " + nScratch;

    document.getElementById("dv-colors").textContent = colorString;
    document.getElementById("dv-movement").textContent = "Spin Directions (left:right): " + nLeftSpin + ":" + nRightSpin;
}

function calculateNoteCounts() {
}

function calculateMaxScoreAndCombo () {
    let notes = chartJSON["largeStringValuesContainer"]["values"][5]["val"]["notes"];
    let sortedNotes = notes.toSorted((a, b) => a["time"] - b["time"]);
    let maxScore = 0n;
    let tickDuration, addScore;
    let maxCombo = 0;

    for(let i = 0; i < sortedNotes.length; i++) {
        let bookmark, over, skip;
        switch(sortedNotes[i].type) {
            case 0: //match
                maxScore += 16n;
                maxCombo ++;
                break;
            case 1: //beat
            case 8: //tap
                maxScore += 64n;
                maxCombo ++;
                break;
            case 4: //slider
                let prevMSize;
                maxScore += 64n;
                maxCombo ++;
                bookmark = sortedNotes[i].time;
                over = false;
                for(let j = i + 1; j < sortedNotes.length; j++) {
                    switch(sortedNotes[j].type) {
                        case 5: //note end
                            bookmark = sortedNotes[j].time;
                            prevMSize = notes[j].m_size;
                            break;
                        case 2:
                        case 3:
                        case 4:
                        case 12:
                            over = true;
                            break;
                    }
                    if(over) break;
                }
                if (bookmark - sortedNotes[i].time == 0) {
                    console.log("erronous slider at " + sortedNotes[i].time)
                }
                tickDuration = BigInt(Math.floor(bookmark * 100000))
                        - BigInt(Math.floor(sortedNotes[i].time * 100000));
                addScore = tickDuration / 5000n;
                if(addScore < 1n) {
                    addScore = 1n;
                }
                maxScore += addScore * 4n;
                if(prevMSize == 2) {
                    maxScore += 48n;
                    maxCombo ++;
                }
                break;
            case 2: //right spin
            case 3: //left spin
            case 12: //scratch
                maxScore += 48n;
                maxCombo ++;
                bookmark = sortedNotes[i].time;
                over = false;
                for(let j = i + 1; j < sortedNotes.length; j++) {
                    switch(sortedNotes[j].type) {
                        case 0:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 8:
                        case 12:
                            bookmark = sortedNotes[j].time;
                            over = true;
                            break;
                    }
                    if(over) {
                        break;
                    }
                }
                if(!over) { //this spin/scratch goes the default length of 1 second
                    //todo: may break if the chart ends before this 1s has passed
                    maxScore += 80n;
                    break;
                }
                tickDuration = BigInt(Math.floor(bookmark * 100000))
                        - BigInt(Math.floor(sortedNotes[i].time * 100000));
                addScore = tickDuration / 5000n;
                if(addScore < 1n) {
                    addScore = 1n;
                }
                maxScore += addScore * 4n;
                break;
            case 5: //note endpoint
                break;
            case 11: //beathold
                bookmark = sortedNotes[i].time;
                over = false;
                for(let j = i - 1; j >= 0; j--) {
                    switch(sortedNotes[j].type) {
                        case 1:
                            bookmark = sortedNotes[j].time;
                            over = true;
                            break;
                        case 11:
                            skip = true;
                            over = true;
                            break;
                    }
                    if(over) break;
                }
                
                if(!over || skip) {
                    console.log("erronous beathold end at " + sortedNotes[i].time);
                    break;
                }

                tickDuration = BigInt(Math.floor(sortedNotes[i].time * 100000))
                        - BigInt(Math.floor(bookmark * 100000));
                addScore = tickDuration / 5000n;
                if(addScore < 1n) {
                    addScore = 1n;
                }
                maxScore += addScore * 4n;
                if(notes[i].m_size ==  1 || notes[i].m_size == 0) {
                    maxScore += 48n;
                    maxCombo ++;
                }
                break;
                
            default:
                console.log("found an unknown note type");
        }
    }
    document.getElementById("dv-summary").value = "" + chartJSON["largeStringValuesContainer"]["values"][0]["val"]["title"] + "," + maxScore + "," + maxCombo;
    document.getElementById("dv-max-score").textContent = "Max Score: " + maxScore;
    document.getElementById("dv-max-combo").textContent = "Max Combo: " + maxCombo;
}