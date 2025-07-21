<script>
    let { text, size = 0.75, disabled = false, active = false, type = "button", onclick, href } = $props();
</script>

<svelte:element this={type}
    class={["main", {disabled}, {active}]}
    style:--size={size}
    role={type}
    data-sveltekit-keepfocus={type === "a"}
    tabindex={disabled ? -1 : 0}
    {onclick}
    {href}
>{text.toUpperCase()}</svelte:element>

<style>
    .main {
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
        text-decoration: none;
        color: var(--color-main);
        background: var(--color-bg);
        cursor: pointer;
        transition: all 100ms ease-in-out;
    }

    .main:hover, .main.active {
        color: var(--color-bg);
        background: var(--color-main);
    }

    .main.active {
        border-color: var(--color-bg);
    }

    .main::after {
        position: absolute;
        top: calc(var(--size) * -0.5rem);
        left: calc(var(--size) * -0.5rem);
        content: "";
        width: calc(100% + (var(--size) * 0.5rem));
        height: calc(100% + (var(--size) * 0.5rem));
        background: transparent;
        border: calc(var(--size) * 0.25rem) solid var(--color-main);
        border-radius: 100rem;
        opacity: 0%;
        transition: all 100ms ease-in-out;
        z-index: -1;
    }

    .main.active::after {
        opacity: 100%;
    }

    .main.disabled {
        opacity: 50%;
        pointer-events: none;
    }
</style>