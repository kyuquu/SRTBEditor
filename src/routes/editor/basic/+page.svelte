<script>
    import Checkbox from "$lib/components/Checkbox.svelte";
    import TextInput from "$lib/components/TextInput.svelte";
    import FileUpload from "$lib/components/FileUpload.svelte";
    import AudioPlayer from "$lib/components/AudioPlayer.svelte";

    import { chart } from "$lib/scripts/main.svelte.js";
    import { getAlbumArt, getAudioClips } from "$lib/scripts/helper.svelte.js";
</script>

<div class="main">
    <div class="basic1">
        {#await getAlbumArt()}
            <img src="/images/Default_-_Cover.png" alt="Album art">
        {:then src}
            <img {src} alt="Album art">
        {/await}
        <div>
            {#await getAudioClips()}
                <AudioPlayer />
            {:then src}
                <AudioPlayer {src} />
            {/await}
            <FileUpload id="albumArt" label="Album Art" accept=".png, .jpg, .jpeg" size=0.5 bind:files={chart.albumArt} />
            <FileUpload id="audioClips" label="Audio Clips" accept=".mp3, .ogg" size=0.5 bind:files={chart.audioClips} />
        </div>
    </div>
    <div class="basic2">
        <TextInput id="title" label="Title" bind:value={chart.trackInfo.title} />
        <TextInput id="subtitle" label="Subitle" bind:value={chart.trackInfo.subtitle} />
        <TextInput id="artistName" label="Artist" bind:value={chart.trackInfo.artistName} />
        <TextInput id="featArtists" label="Featured Artist" bind:value={chart.trackInfo.featArtists} />
        <TextInput id="charter" label="Charter" bind:value={chart.trackInfo.charter} />
        <Checkbox id="allowCustomLeaderboardCreation" label="Allow Leaderboard Creation" bind:checked={chart.trackInfo.allowCustomLeaderboardCreation} />
    </div>
    <div class="basic3">

    </div>
</div>

<style>
    .main {
        display: flex;
        gap: 1rem;
        padding: 2rem;
    }

    .basic1 {
        max-width: 24rem;
        padding-right: 2rem;
    }

    img {
        display: block;
        position: relative;
        top: -5rem;
        left: -1rem;
        width: 24rem;
        height: 24rem;
        border: 1rem solid var(--color-bg);
        border-radius: 1rem;
        margin-bottom: -5rem;
        color: var(--color-bg);
        background: var(--color-main);
    }

    .basic1 > div {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .basic2 {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
</style>