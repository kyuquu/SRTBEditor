<script>
    let { id, label, size = 12, checked = $bindable() } = $props();
</script>

<div class="main">
    <input {id} type="checkbox" bind:checked style:--size={size}>
    <label for={id}>{label}</label>
</div>

<style>
    .main {
        display: flex;
        align-items: center;
        gap: 1ch;
        padding-top: 0.5rem;
    }

    .main > label {
        font-size: 1.25rem;
        font-weight: bold;
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