<script>
    import ToastContainer from './ToastContainer.svelte';

    let { children } = $props();
</script>

<ToastContainer />

{@render children()}