<script>
    let { id, label, size = 12, fontSize = "1.25rem", checked = $bindable() } = $props();
</script>

<div class="main">
    <input {id} type="checkbox" bind:checked style:--size={size}>
    <label for={id} style:--font-size={fontSize}>{label}</label>
</div>

<style>
    .main {
        display: flex;
        align-items: center;
        gap: 1ch;
    }

    .main > label {
        font-size: var(--font-size);
        font-weight: bold;
        text-wrap: nowrap;
    }

    .main > input {
        flex-shrink: 0;
        display: grid;
        place-content: center;
        appearance: none;
        cursor: pointer;
        width: calc(var(--size) * 0.125rem);
        height: calc(var(--size) * 0.125rem);
        border: 0.125rem solid var(--color-main);
        border-radius: 0.125rem;
        box-sizing: border-box;
        margin: 0;
    }

    .main > input::before {
        content: "";
        width: calc(var(--size) * 0.125rem - 0.5rem);
        height: calc(var(--size) * 0.125rem - 0.5rem);
        background: var(--color-main);
        transform: scale(0);
        transition: 100ms transform ease-in-out;
    }

    .main > input:checked::before {
        transform: scale(1);
    }
</style>