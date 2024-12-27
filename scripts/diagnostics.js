



function calculateMaxScoreAndCombo () {
    let notes = chartJSON["largeStringValuesContainer"]["values"][5]["val"]["notes"];
    let sortedNotes = notes.toSorted((a, b) => a["time"] - b["time"]);
    let maxScore = 0;
    let addScore;
    let maxCombo = 0;
    for(let i = 0; i < sortedNotes.length; i++) {
        let bookmark, over;
        switch(sortedNotes[i].type) {
            case 0: //match
                maxScore += 16;
                maxCombo ++;
                break;
            case 1: //beat
            case 8: //tap
                maxScore += 64;
                maxCombo ++;
                break;
            case 4: //slider
                let prevMSize;
                maxScore += 64;
                maxCombo ++;
                bookmark = sortedNotes[i].time;
                over = false;
                for(let j = i + 1; j < sortedNotes.length; j++) {
                    switch(sortedNotes[j].type){
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
                if (bookmark - sortedNotes[i].time == 0) 
                    console.log("erronous slider at " + sortedNotes[i].time)
                addScore = Math.floor((bookmark - sortedNotes[i].time) * 20) * 4;
                if(addScore < 4) {
                    addScore = 4;
                }
                maxScore += addScore;
                if(prevMSize == 2) {
                    maxScore += 48;
                    maxCombo ++;
                }
                break;
            case 2: //right spin
            case 3: //left spin
            case 12: //scratch
                maxScore += 48;
                maxCombo ++;
                bookmark = sortedNotes[i].time;
                over = false;
                for(let j = i + 1; j < sortedNotes.length; j++) {
                    switch(sortedNotes[j].type){
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
                        addScore = Math.floor((bookmark - sortedNotes[i].time) * 20) * 4;
                        if(addScore < 4) {
                            addScore = 4;
                        }
                        maxScore += addScore;
                        break;
                    }
                }
                if(!over) { //this spin/scratch goes the default length of 1 second
                    //todo: may break if the chart ends before this 1s has passed
                    maxScore += 80;
                }
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
                            console.log("erronous beathold end at " + sortedNotes[i].time);
                            over = true;
                            break;
                    }
                    if(over) break;
                }

                if(!over) {
                    console.log("erronous beathold end at " + sortedNotes[i].time);
                }

                addScore = Math.floor((sortedNotes[i].time - bookmark) * 20) * 4;
                if(addScore < 4) {
                    addScore = 4;
                }
                maxScore += addScore;
                if(notes[i].m_size ==  1 || notes[i].m_size == 0) {
                    maxScore += 48;
                    maxCombo ++;
                }
                break;
                
            default:
                console.log("found an unknown note type");
        }
    }
    document.getElementById("dv-max-score").textContent = "Max Score: " + maxScore;
    document.getElementById("dv-max-combo").textContent = "Max Combo: " + maxCombo;
}