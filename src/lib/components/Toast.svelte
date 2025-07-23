<script>
    import { fly } from "svelte/transition";

    let { id, type, title, subtitle, deleteToast } = $props();
</script>

<button
    class="main"
    tabindex=0
    style:--color-type="var(--color-{type})"
    style:--icon-url="url(/icons/{
        type === "success" ? "checkmark" :
        type === "warning" ? "warning" :
        type === "error" ? "x" : "info"
    }.svg)"
    onclick={() => {deleteToast(id)}}
    onkeydown={(e) => {if (e.key === "Enter") {deleteToast(id)}}}
    transition:fly={{x: 100, duration: 250}}
>
    <div class="icon"></div>
    <div class="content">
        <div class="title" title={title}>{title}</div>
        <div class="subtitle">{subtitle}</div>
    </div>
</button>

<style>
    .main {
        display: flex;
        align-items: center;
        gap: 1rem;
        width: 24rem;
        padding: 1rem;
        border: 0.125rem solid var(--color-type);
        border-left-width: 0.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 0 16px var(--color-bg);
        background: var(--color-bg);
        font-size: 1rem;
        color: var(--color-main);
        pointer-events: all;
        cursor: pointer;
        overflow: hidden;
    }

    .icon {
        flex: 0 0 1.5rem;
        height: 1.5rem;
        -webkit-mask-image: var(--icon-url);
        mask-image: var(--icon-url);
        -webkit-mask-size: 1.5rem;
        mask-size: 1.5rem;
        background: var(--color-type);
    }

    .content {
        display: flex;
        flex-direction: column;
        text-align: left;
        overflow: hidden;
    }

    .title {
        font-weight: bold;
        text-wrap: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .subtitle {
        font-size: 0.75rem;
        text-overflow: ellipsis;
        overflow: hidden;
        opacity: 50%;
    }
</style>