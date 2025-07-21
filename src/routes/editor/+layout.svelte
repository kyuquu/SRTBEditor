<script>
    import TopBar from "./TopBar.svelte";
    import ViewContainer from "./ViewContainer.svelte";
    import BottomBar from "./BottomBar.svelte";

    import { handleDropdowns } from "$lib/components/Dropdown.svelte";

    function onclick(e) {
        handleDropdowns(e.target);
    }

    let { children } = $props();
</script>

<svelte:window {onclick} />

<div class="main">
    <TopBar />

    <ViewContainer {children} />

    <BottomBar />
</div>

<style>
    .main {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        flex-grow: 1;
        max-width: 80rem;
        height: 100vh;
        padding: 2rem 2rem;
        margin: auto;
        box-sizing: border-box;
    }
</style>