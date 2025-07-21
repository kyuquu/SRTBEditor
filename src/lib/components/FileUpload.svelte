<script>
    import Button from "./Button.svelte";

    import { chart } from "$lib/scripts/main.svelte";
    import { getFileSize } from "$lib/scripts/helper.svelte.js";

    let { id, label, accept, size = 0.75, disabled = false, files = $bindable() } = $props();
    
    let fileUpload;
    let onclick = $state();

    $effect(() => {
        onclick = () => {
            fileUpload.click();
        }
    });
</script>

<div class="main">
    <label for={id}>{label}</label>
    <div>
        <Button text="UPLOAD" {size} {onclick} />
        <span class="filename" title={files ? files[0].name : ""}>{files ? files[0].name : "No file(s) selected."}</span>&nbsp;
        <span class="filesize">{files ? getFileSize(files[0].size) : ""}</span>
    </div>
    <input type="file" bind:files bind:this={fileUpload} {accept} {id}>
</div>

<style>
    .main > label {
        display: block;
        width: fit-content;
        padding-bottom: 0.25rem;
        font-size: 1.25rem;
        font-weight: bold;
    }

    .main > div {
        display: flex;
        align-items: center;
        font-size: 1.25rem;
        text-wrap: nowrap;
    }

    .main > div > span.filename {
        padding-left: 1rem;
        font-size: 1rem;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .main > div > span.filesize {
        opacity: 50%;
        font-size: 1rem;
    }
</style>