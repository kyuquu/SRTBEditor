<script module>
    let editor;

    export function saveChanges() {
        chart.json = JSON.parse(editor.session.getValue());
        editor.focus();
    }

    export function discardChanges() {
        let cursorPos = editor.selection.getCursor();
        editor.session.setValue(JSON.stringify(chart.json, null, 4));
        editor.selection.moveCursorTo(cursorPos.row, cursorPos.column);
        editor.focus();
    }
</script>

<script>
    import { onMount, onDestroy } from "svelte";
    import { chart, editorCursorPos, editorScrollPos } from "$lib/scripts/main.svelte.js";
    import { validateJSON } from "$lib/scripts/helper.svelte.js";

    let { buttons = $bindable() } = $props();

    let isEditorDisabled = $state(false);
    let editorTimeout;
    let editorTimeoutLength = 500;

    function updateEditorButtons(JSONIfValid) {
        if (JSONIfValid !== false) {
            buttons.save = false;

            if (JSON.stringify(JSONIfValid) === JSON.stringify(chart.json)) {
                buttons.save = true;
                buttons.discard = true;
            }
            else {
                buttons.discard = false;
            }
        }
        else {
            buttons.save = true;
            buttons.discard = false;
        }
    }

    onMount(() => {
        editor = ace.edit("editor");
        editor.setTheme("ace/theme/merbivore");
        editor.session.setMode("ace/mode/json");
        editor.setOptions({
            fixedWidthGutter: true,
            showPrintMargin: false,
            enableKeyboardAccessibility: true
        });

        editor.textInput.getElement().parentElement.querySelector(".ace_scrollbar.ace_scrollbar-v").setAttribute("tabindex", -1);
        editor.textInput.getElement().parentElement.querySelector(".ace_scrollbar.ace_scrollbar-h").setAttribute("tabindex", -1);

        editor.session.on("change", () => {
            if (editorTimeout) {
                clearTimeout(editorTimeout)
            }

            editorTimeout = setTimeout(() => {
                updateEditorButtons(validateJSON(editor.getValue()));
            }, editorTimeoutLength);

            buttons.save = true;
            buttons.discard = true;
        });

        editor.session.setValue(JSON.stringify(chart.json, null, 4));
        editor.session.setScrollTop($editorScrollPos);
        editor.selection.moveCursorTo($editorCursorPos.row, $editorCursorPos.column);
        editor.focus();
    });

    onDestroy(() => {
        editorScrollPos.set(editor.session.getScrollTop());
        editorCursorPos.set(editor.selection.getCursor());
    });
</script>

<div class="main">
    <div id="editor"></div>
</div>

<style>
    .main {
        position: relative;
        width: 100%;
        height: 100%;
    }

    #editor {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        font-size: 1rem;
    }
</style>