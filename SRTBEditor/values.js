let chartData = undefined;

const chartTitle = document.getElementById("tb-chart-title");
const chartArtist = document.getElementById("tb-chart-artist");
const chartFilename = document.getElementById("tb-chart-filename");

const JSONEditor = document.getElementById("json-editor");

function loadChartData(file) {
    chartData = file;
    let values = file["largeStringValuesContainer"]["values"][0]["val"];

    chartTitle.textContent = values["title"];
    chartArtist.textContent = values["artistName"];

    JSONEditor.value = JSON.stringify(file, null, 4);
}