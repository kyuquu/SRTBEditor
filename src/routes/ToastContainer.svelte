<script module>
    let toastContainer;
    let toastIndex = 0;
    const toasts = $state([]);

    export function createToast(type, title, subtitle = "", duration = 5000) {
        let currentIndex = toastIndex;

        toasts.push({
            id: currentIndex,
            type: type,
            title: title,
            subtitle: subtitle
        });

        toastIndex++;

        setTimeout(() => {
            deleteToast(currentIndex);
        }, duration);

        return currentIndex;
    }

    export function deleteToast(id) {
        let index = toasts.findIndex(toast => toast.id === id);
        if (index !== -1) {
            toasts.splice(index, 1);
        }
    }
</script>

<script>
    import { flip } from "svelte/animate";
    import Toast from "$lib/components/Toast.svelte";
</script>

<div class="main" bind:this={toastContainer}>
    {#each toasts as toast (toast.id)}
        <div animate:flip={{duration: 250}}>
            <Toast
                id={toast.id}
                type={toast.type}
                title={toast.title}
                subtitle={toast.subtitle}
                {deleteToast}
            />
        </div>
    {/each}
</div>

<style>
    .main {
        position: absolute;
        top: 0;
        left: 0;
        display: flex;
        flex-direction: column;
        justify-content: end;
        align-items: end;
        gap: 0.5rem;
        width: 100vw;
        height: 100vh;
        padding: 2rem;
        box-sizing: border-box;
        pointer-events: none;
        z-index: 10;
    }
</style>