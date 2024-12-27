




function calculateMaxScore () {
    let notes = chartJSON["largeStringValuesContainer"]["values"][5]["val"]["notes"];
    let sortedNotes = notes.toSorted((a, b) => a["time"] - b["time"]);
    let maxScore = 0;
    for(let i = 0; i < sortedNotes.length; i++) {
        let marker, over;
        switch(sortedNotes[i].type) {
            case 0: //match
                maxScore += 16;
                break;
            case 1: //beat
            case 8: //tap
                maxScore += 64;
                break;
            case 4: //slider
                let prevMSize;
                maxScore += 64;
                marker = sortedNotes[i].time;
                over = false;
                for(let j = i + 1; j < sortedNotes.length; j++) {
                    switch(sortedNotes[j].type){
                        case 5: //note end
                            marker = sortedNotes[j].time;
                            prevMSize = notes[j].m_size;
                            console.log("marker: " + marker);
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
                if (marker - sortedNotes[i].time == 0) 
                    console.log("erronous slider at " + sortedNotes[i].time)
                maxScore += Math.floor((marker - sortedNotes[i].time) * 20) * 4;
                if(prevMSize == 2)
                    maxScore += 48;
                break;
            case 2: //right spin
            case 3: //left spin
            case 12: //scratch
                maxScore += 48;
                marker = sortedNotes[i].time;
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
                            marker = sortedNotes[j].time;
                            over = true;
                            break;
                    }
                    if(over) {
                        maxScore += Math.floor((marker - sortedNotes[i].time) * 20) * 4;
                        break;
                    }
                }
                if(!over) //this spin/scratch goes the default length of 1 second
                    maxScore += 80;
                break;
            case 5: //note endpoint
                break;
            case 11: //beathold
                marker = sortedNotes[i].time;
                over = false;
                for(let j = i - 1; j >= 0; j--) {
                    switch(sortedNotes[j].type) {
                        case 1:
                            marker = sortedNotes[j].time;
                            over = true;
                            break;
                        case 11:
                            console.log("erronous beathold end at " + sortedNotes[i].time);
                            over = true;
                            break;
                    }
                    if(over) {
                        break;
                    }
                }

                if(!over)
                    console.log("erronous beathold end at " + sortedNotes[i].time);
                maxScore += Math.floor((sortedNotes[i].time - marker) * 20) * 4;
                if(notes[i].m_size == 1) maxScore += 48;
                break;
                
            default:
                console.log("found an unknown note type");
        }
    }
    document.getElementById("dv-max-score").textContent = maxScore;
}