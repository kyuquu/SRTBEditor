<script module>
    let activeDropdown = $state(undefined);

    export function handleDropdowns(element) {
        if (element !== activeDropdown && activeDropdown !== undefined) {
            activeDropdown = undefined;
        }
    }
</script>

<script>
    let { text, options, size = 0.75, disabled = false} = $props();

    let dropdown;
    let active = $derived.by(() => {if (activeDropdown === undefined) return false});
    let tabindex = $derived(active ? 0 : -1);

    function onclick(e) {
        if (!active) {
            activeDropdown = e.target;
            active = true;
        }
        else {
            activeDropdown = undefined;
        }
    }
</script>

<div
    bind:this={dropdown}
    class={["main", {disabled}, {active}]}
    style:--size = {size}
>
    <button
        class="toggle"
        tabindex={disabled ? -1 : 0}
        {onclick}
    >
        <div>
            <span>{text}</span>
            <span class="icon"></span>
        </div>
    </button>
    <div class="options">
        <div>
            {#each options as option}
                <button class="option" onclick={option.function} {tabindex}>{option.text}</button>
            {/each}
        </div>
    </div>
</div>

<style>
    .main {
        position: relative;
    }

    .main.disabled {
        opacity: 50%;
        pointer-events: none;
    }

    .toggle {
        position: relative;
        display: flex;
        align-items: center;
        height: calc(var(--size) * 3.5rem);
        padding: 0 calc(var(--size) * 2rem);
        border: calc(var(--size) * 0.25rem) solid var(--color-main);
        border-radius: 100rem;
        box-sizing: border-box;
        font-size: calc(var(--size) * 1.5rem);
        font-weight: bold;
        text-align: center;
        text-wrap: nowrap;
        color: var(--color-main);
        background: var(--color-bg);
        cursor: pointer;
        transition: all 100ms ease-in-out;
        z-index: 3;
    }

    .toggle:hover, .main.active > .toggle {
        color: var(--color-bg);
        background: var(--color-main);
    }

    .main.active > .toggle {
        border-color: var(--color-bg);
    }

    .toggle > div {
        display: flex;
        align-items: center;
        gap: 1ch;
        pointer-events: none;
    }

    .icon {
        width: calc(var(--size) * 1.25rem);
        height: calc(var(--size) * 1.25rem);
        -webkit-mask-image: url(/icons/chevron-down.svg);
        mask-image: url(/icons/chevron-down.svg);
        -webkit-mask-size: calc(var(--size) * 1.25rem);
        mask-size: calc(var(--size) * 1.25rem);
        background: var(--color-main);
        transition: all 100ms ease-in-out;
    }

    .toggle:hover .icon, .main.active .icon {
        background: var(--color-bg);
    }

    .options {
        position: absolute;
        top: calc(var(--size) * -0.25rem);
        left: calc(var(--size) * -0.25rem);
        display: grid;
        grid-template-rows: 0fr;
        width: 100%;
        min-height: calc(var(--size) * 3.5rem);
        border: calc(var(--size) * 0.25rem) solid var(--color-main);
        border-radius: calc(var(--size) * 2rem);
        background: var(--color-bg);
        opacity: 0%;
        overflow: hidden;
        transition: all 100ms ease-in-out;
        z-index: 2;
    }

    .main.active .options {
        grid-template-rows: 1fr;
        border-radius:
            calc(var(--size) * 2rem)
            calc(var(--size) * 2rem)
            calc(var(--size) * 1.25rem)
            calc(var(--size) * 1.25rem);
        opacity: 100%;
    }

    .options > div {
        display: flex;
        flex-direction: column;
        gap: calc(var(--size) * 0.25rem);
        overflow: hidden;
    }

    .option {
        border: none;
        border-radius: 100rem;
        height: auto;
        margin: 0 calc(var(--size) * 0.25rem);
        font-weight: bold;
        font-size: calc(var(--size) * 1rem);
        color: var(--color-main);
        background: var(--color-bg);
        cursor: pointer;
        transition: all 100ms ease-in-out;
    }

    .option:first-child {
        margin-top: calc(var(--size) * 3.5rem);
    }

    .option:last-child {
        margin-bottom: calc(var(--size) * 0.25rem);
    }

    .option:hover {
        color: var(--color-bg);
        background: var(--color-main);
    }
</style>