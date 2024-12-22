let JSONEditor = ace.edit("editor");
JSONEditor.setTheme("ace/theme/dracula");
JSONEditor.session.setMode("ace/mode/json");
JSONEditor.setOptions({
    fixedWidthGutter: true,
    showPrintMargin: false
});