<script>
    import Checkbox from "$lib/components/Checkbox.svelte";
    import NumberInput from "$lib/components/NumberInput.svelte";

    import { getStores } from "$app/stores";
    import { chart } from "$lib/scripts/main.svelte.js";
    import { createTrackData } from "$lib/scripts/helper.svelte";

    let { difficulty } = $props();

    function doesDifficultyExist () {
        return chart.trackData[difficulty] && chart.trackInfoDiffs[difficulty];
    };
</script>

{#if doesDifficultyExist()}
    <div class="main">
        <Checkbox
            id={difficulty}
            label={difficulty.toUpperCase()}
            fontSize={"1rem"}
            bind:checked={chart.trackInfoDiffs[difficulty]._active}
        />
        <NumberInput
            bind:value={chart.trackData[difficulty].difficultyRating}
        />
    </div>
{:else}
    <button class="main" onclick={() => createTrackData(difficulty)}>
        <span class="icon"></span>
        <span>ADD {difficulty.toUpperCase()}</span>
    </button>
{/if}

<style>
    .main {
        display: flex;
        align-items: center;
        height: 1.75rem;
        font-weight: bold;
        color: var(--color-main);
    }

    div.main {
        justify-content: space-between;
        gap: 4rem;
    }

    button.main {
        justify-content: center;
        gap: 1ch;
        padding: 0;
        border: 0.125rem solid var(--color-main);
        border-radius: 100rem;
        background: var(--color-bg);
        transition: all 100ms ease-in-out;
        cursor: pointer;
        overflow: hidden;
    }

    button.main:hover {
        color: var(--color-bg);
        background: var(--color-main);
    }

    button.main > .icon {
        width: 1rem;
        height: 1rem;
        -webkit-mask-image: url(/icons/plus.svg);
        mask-image: url(/icons/plus.svg);
        -webkit-mask-size: 1rem;
        mask-size: 1rem;
        background: var(--color-main);
        transition: all 100ms ease-in-out;
    }

    button.main:hover .icon {
        background: var(--color-bg);
    }
</style>