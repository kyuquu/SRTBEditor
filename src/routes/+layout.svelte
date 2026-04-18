<script>
    import { debug } from "$lib/scripts/debug.svelte";
    import ToastContainer from "$lib/components/ToastContainer.svelte";

    let { children } = $props();
</script>

<ToastContainer />

<svelte:document onkeydown={debug} />

{@render children()}