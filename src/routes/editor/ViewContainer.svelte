<script>
    import { chart, view } from "$lib/scripts/main.svelte.js";

    let {children} = $props();
</script>

<div class="main" tabindex=-1>
    <div class={["top", ($view !== 0 || chart.json === undefined) && "reduced"]}>
        {#if chart.json === undefined}
            <div class="top1"><span>No chart loaded.</span></div>
        {:else if $view === 0}
            <div class="top1">
                <span class="title" title={chart.trackInfo.title}>{chart.trackInfo.title}</span>
                <span class="subtitle" title={chart.trackInfo.subtitle}>{chart.trackInfo.subtitle}</span>
            </div>
            <div class="top2">
                <span class="artist" title={chart.trackInfo.artistName}>{chart.trackInfo.artistName}</span>
                <span class="featured" title={chart.trackInfo.featArtists}>{chart.trackInfo.featArtists}</span>
            </div>
        {:else}
            <div class="top1" title={`${chart.trackInfo.title} - ${chart.trackInfo.artistName}`}>{chart.trackInfo.title} - {chart.trackInfo.artistName}</div>
        {/if}
    </div>

    <div class="middle">
        {#if chart.json !== undefined}
            {@render children()}
        {:else}
            <div class="start-message">
                <div>Click <b>LOAD</b> to get started!</div>
            </div>
        {/if}
    </div>

    <div class="bottom">
        {#if chart.json !== undefined}
            <div>
                <span class="label">CHARTER</span>
                <span class="value" title={chart.trackInfo.charter}>{chart.trackInfo.charter}</span>
            </div>
            <div>
                <span class="label">FILENAME</span>
                <span class="value" title={chart.filename}>{chart.filename}</span>
            </div>
        {/if}
    </div>
</div>

<style>
    .main {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        border-radius: 2rem;
        color: var(--color-bg);
        overflow-x: hidden;
        overflow-y: auto;
    }

    .top {
        display: flex;
        flex-direction: column;
        flex: 0 0 7rem;
        padding: 0 2.25rem;
        margin: auto 0;
        background: var(--color-main);
        overflow: hidden;
    }

    .top.reduced {
        flex: 0 0 4rem;
    }

    .top > div, .bottom > div {
        text-wrap: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .top1 {
        flex: 0 0 4rem;
        font-size: 3rem;
        font-weight: 800;
        line-height: 4rem;
    }

    .top2 {
        flex: 0 0 3rem;
        padding-left: 26rem;
        font-size: 2rem;
        font-weight: bold;
        line-height: 3rem;
    }

    .top span:empty:before {
        content: "\200b";
    }

    .subtitle {
        font-size: 2.5rem;
        opacity: 50%;
    }

    .featured {
        font-size: 1.5rem;
        opacity: 50%;
    }

    .middle {
        flex: 1 1 auto;
        border-left: 0.25rem solid var(--color-main);
        border-right: 0.25rem solid var(--color-main);
        color: var(--color-main);
        background: var(--color-bg);
    }

    .start-message {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        font-size: 1.5rem;
    }

    .start-message > div {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .start-message > div > b {
        padding: 0.375rem 0.75rem;
        border: 0.125rem solid var(--color-main);
        border-radius: 100rem;
        font-size: 1rem;
    }

    .bottom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 0 0 2rem;
        padding: 0 2.25rem;
        font-size: 1.375rem;
        background: var(--color-main);
        overflow: hidden;
    }

    .label {
        font-weight: bold;
        font-size: 0.875rem;
    }

    .value {
        font-weight: 800;
        font-size: 1.375rem;
    }
</style>