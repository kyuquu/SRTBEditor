let albumArt;

function updateAlbumArt() {
    let fileInput = document.getElementById("bv-album-art");
    let file = fileInput.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById("bv-album-art-image").src = e.target.result;
        document.getElementById("bv-album-art-filename").textContent = file.name;
        document.getElementById("bv-album-art-size").textContent = getFileSize(file.size);
    };
    reader.readAsDataURL(file);

    albumArt = file;

    updateJSONValue(trackInfo["albumArtReference"], "assetName", file.name.split(".").slice(0, -1).join("."));
}

function resetAlbumArt() {
    let fileInput = document.getElementById("bv-album-art");
    if (fileInput.value !== "") {
        fileInput.value = "";
        document.getElementById("bv-album-art-image").src = "./assets/images/Default_-_Cover.png";
        document.getElementById("bv-album-art-filename").textContent = "No file selected";
        document.getElementById("bv-album-art-size").textContent = "";
    }
}