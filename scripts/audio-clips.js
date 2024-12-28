let audioClips;

function updateAudioClips() {
    let fileInput = document.getElementById("bv-audio-clips");
    let file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById("bv-audio-clips-audio").src = e.target.result;
        document.getElementById("bv-audio-clips-filename").textContent = file.name;
        document.getElementById("bv-audio-clips-size").textContent = getFileSize(file.size);
    };
    reader.readAsDataURL(file);

    audioClips = file;

    updateJSONValue(clipInfo[0]["clipAssetReference"], "assetName", file.name.split(".").slice(0, -1).join("."));
}

function resetAudioClips() {
    let fileInput = document.getElementById("bv-audio-clips");
    if (fileInput.value !== "") {
        fileInput.value = "";
        document.getElementById("bv-audio-clips-audio").src = "./assets/audio/Get Good.ogg";
        document.getElementById("bv-audio-clips-filename").textContent = "No file selected";
        document.getElementById("bv-audio-clips-size").textContent = "";
    }
}