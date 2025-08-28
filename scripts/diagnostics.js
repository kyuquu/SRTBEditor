let diffTypeNames = [
    "",
    "",
    "Easy",
    "Normal",
    "Hard",
    "Expert",
    "XD",
    "RemiXD"
];

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

function renderBasicDiagnostics() {
    let diagnosticsRoot = document.getElementById(`dv-root`);

    while(diagnosticsRoot.hasChildNodes()){
        diagnosticsRoot.removeChild(diagnosticsRoot.firstChild);
    }

    for(let i = 0; i < trackInfo.difficulties.length; i++) {
        if(trackInfo.difficulties[i]._active == true) {
            if(!trackData[i].difficultyType)
                continue;
            let mainContainer = document.createElement("div");
            mainContainer.setAttribute("class", "dv-box");
            mainContainer.setAttribute("id", `dv-diff${i}`)

            let title = mainContainer.appendChild(document.createElement("div"));
            title.textContent = diffTypeNames[trackData[i].difficultyType];
            title.setAttribute("class", "dv-box-title");

            let notes = trackData[i].notes;
            //let notesEncoding = trackData[i].noteSerializationFormat;
            // TODO: account for other serialization formats
            
            calculateBalance(notes, mainContainer);

            calculateMaxScoreAndCombo(notes, mainContainer);

            let buttonElem = mainContainer.appendChild(document.createElement("button"));
            buttonElem.setAttribute("class", "button");
            buttonElem.setAttribute("onclick", `copyToClipboard(${i})`);
            buttonElem.textContent = "Copy";

            let mirrorTwistyButton = mainContainer.appendChild(document.createElement("button"));
            mirrorTwistyButton.setAttribute("class", "button");
            mirrorTwistyButton.setAttribute("onclick", `mirrorTwistyTrack(${i})`);
            mirrorTwistyButton.textContent = "Mirror Twisty Track";

            diagnosticsRoot.appendChild(mainContainer);
        }
    }
}

function calculateBalance(notesIn, htmlParent) {
    if(!notesIn || notesIn.length < 1) return;
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

    for(let i = 0; i < notesIn.length; i++) {
        switch(notesIn[i].type) {
            case 0:
            case 4:
            case 8:
                if(notesIn[i].colorIndex == 0) nBlue++;
                else if(notesIn[i].colorIndex == 1) nRed++;
                else if(notesIn[i].colorIndex % 2 == 0) nInvisBlue++;
                else nInvisRed++;
                break;
        }
        let beatRecent = false;
        switch(notesIn[i].type) {
            case 0:
                nMatch++;
                break;
            case 1:
                nBeat++;
                beatRecent = true;
                break;
            case 2:
                nRightSpin++;
                break;
            case 3:
                nLeftSpin++;
                break;
            case 4:
                nSlider++;

                let prevMSize;
                over = false;
                for(let j = i + 1; j < notesIn.length; j++) {
                    switch(notesIn[j].type) {
                        case 5: //note end
                            prevMSize = notesIn[j].m_size;
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
                if(prevMSize == 2) {
                    nSliderRelease++;
                }


                break;
            case 8:
                nTap++;
                break;
            case 11:
                //logic for beathold
                if(beatRecent) {
                    nBeathold++;
                    if(notesIn[i].m_size != 2) nBeatRelease++;
                }
                else
                    ;//error beathold endpoint
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

    let subtitle = htmlParent.appendChild(document.createElement("div"));
    subtitle.textContent = "Note Counts";
    subtitle.setAttribute("class", "dv-box-subtitle");

    let matchElement = htmlParent.appendChild(document.createElement("div"));
    matchElement.textContent = `Matches: ${nMatch}`;
    matchElement.setAttribute("class", "dv-match-count");
    let tapElement = htmlParent.appendChild(document.createElement("div"));
    tapElement.textContent = `Taps: ${nTap}`;
    tapElement.setAttribute("class", "dv-tap-count");
    let beatElement = htmlParent.appendChild(document.createElement("div"));
    beatElement.textContent = `Beats: ${nBeat}`;
    beatElement.setAttribute("class", "dv-beat-count");
    let holdElement = htmlParent.appendChild(document.createElement("div"));
    holdElement.textContent = `Holds: ${nSlider + nBeathold}`;
    holdElement.setAttribute("class", "dv-hold-count");
    let releaseElement = htmlParent.appendChild(document.createElement("div"));
    releaseElement.textContent = `Releases: ${nBeatRelease + nSliderRelease}`;
    releaseElement.setAttribute("class", "dv-release-count");
    let spinElement = htmlParent.appendChild(document.createElement("div"));
    spinElement.textContent = `Spins: ${nLeftSpin + nRightSpin}`;
    spinElement.setAttribute("class", "dv-spin-count");
    let scratchElement = htmlParent.appendChild(document.createElement("div"));
    scratchElement.textContent = `Scratches: ${nScratch}`;
    scratchElement.setAttribute("class", "dv-scratch-count");
}

function calculateMaxScoreAndCombo (notesIn, htmlParent) {
    if(!notesIn || notesIn.length < 1) return;
    let maxScore = 0n;
    let tickDuration, addScore;
    let maxCombo = 0;
    for(let i = 0; i < notesIn.length; i++) {
        let bookmark, over, skip;
        switch(notesIn[i].type) {
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
                bookmark = notesIn[i].time;
                over = false;
                for(let j = i + 1; j < notesIn.length; j++) {
                    switch(notesIn[j].type) {
                        case 5: //note end
                            bookmark = notesIn[j].time;
                            prevMSize = notesIn[j].m_size;
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
                if (bookmark - notesIn[i].time == 0) {
                    console.log("erronous slider at " + notesIn[i].time)
                }
                tickDuration = BigInt(Math.floor(bookmark * 100000))
                        - BigInt(Math.floor(notesIn[i].time * 100000));
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
                bookmark = notesIn[i].time;
                over = false;
                for(let j = i + 1; j < notesIn.length; j++) {
                    switch(notesIn[j].type) {
                        case 0:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 8:
                        case 12:
                            bookmark = notesIn[j].time;
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
                        - BigInt(Math.floor(notesIn[i].time * 100000));
                addScore = tickDuration / 5000n;
                if(addScore < 1n) {
                    addScore = 1n;
                }
                maxScore += addScore * 4n;
                break;
            case 5: //note endpoint
                break;
            case 11: //beathold
                bookmark = notesIn[i].time;
                over = false;
                for(let j = i - 1; j >= 0; j--) {
                    switch(notesIn[j].type) {
                        case 1:
                            bookmark = notesIn[j].time;
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
                    console.log("erronous beathold end at " + notesIn[i].time);
                    break;
                }

                tickDuration = BigInt(Math.floor(notesIn[i].time * 100000))
                        - BigInt(Math.floor(bookmark * 100000));
                addScore = tickDuration / 5000n;
                if(addScore < 1n) {
                    addScore = 1n;
                }
                maxScore += addScore * 4n;
                if(notesIn[i].m_size ==  1 || notesIn[i].m_size == 0) {
                    maxScore += 48n;
                    maxCombo ++;
                }
                break;
                
            default:
                console.log("found an unknown note type");
        }
    }
    let subtitle = htmlParent.appendChild(document.createElement("div"));
    subtitle.textContent = `Misc.`;
    subtitle.setAttribute("class", "dv-box-subtitle");

    let scoreElement = htmlParent.appendChild(document.createElement("div"));
    scoreElement.textContent = `Max score: ${maxScore}`;
    scoreElement.setAttribute("class", "dv-max-score");
    let comboElement = htmlParent.appendChild(document.createElement("div"));
    comboElement.textContent = `Max combo: ${maxCombo}`;
    comboElement.setAttribute("class", "dv-max-combo");
}