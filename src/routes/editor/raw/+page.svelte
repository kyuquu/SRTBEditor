<script>
    import Editor, { discardChanges, saveChanges } from "$lib/components/Editor.svelte";
    import Button from "$lib/components/Button.svelte";
    import { chart } from "$lib/scripts/main.svelte";

    let buttons = $state({save: true, discard: true});

    function resetButtons() {
        buttons.save = true;
        buttons.discard = true;
    }
</script>

<div class="main">
    <Editor bind:buttons />
    <div class="buttons">
        <Button text="SAVE CHANGES" size=0.625 disabled={buttons.save} onclick={() => {saveChanges(); resetButtons();}}/>
        <Button text="DISCARD CHANGES" size=0.625 disabled={buttons.discard} onclick={() => {discardChanges(); resetButtons();}}/>
    </div>
</div>

<style>
    .main {
        position: relative;
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }

    .buttons {
        display: flex;
        gap: 1rem;
        width: 100%;
        padding: 1rem;
        border-top: 0.125rem solid var(--color-main);
    }
</style>