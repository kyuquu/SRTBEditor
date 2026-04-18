<script>
    let { id, label, value = $bindable() } = $props();
</script>

<div class="main">
    {#if label !== undefined}
        <label for={id}>{label}</label>
    {/if}
    <input {id} type="number" onblur={(e) => e.target.scrollLeft = 0} bind:value>
</div>

<style>
    .main > label {
        display: block;
        width: fit-content;
        padding-bottom: 0.25rem;
        font-size: 1.25rem;
        font-weight: bold;
    }

    .main > input {
        width: 4rem;
        height: 1.75rem;
        padding: 0.25rem;
        border: none;
        border-radius: 0;
        box-sizing: border-box;
        font-size: 1rem;
        background: var(--color-main);
        transition: width 250ms ease-out;
    }
</style>