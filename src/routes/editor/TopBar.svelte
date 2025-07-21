<script>
    import Button from "$lib/components/Button.svelte";
    import Dropdown from "$lib/components/Dropdown.svelte";

    import { chart, view } from "$lib/scripts/main.svelte.js";
    import { loadTemplate, loadFromFile, loadFromLink } from "$lib/scripts/chart-loading.svelte.js";
    import { saveAsSRTB, saveAsJSON, saveAsZIP } from "$lib/scripts/chart-saving.svelte.js";
</script>

<div class="main">
    <div>
        <Button text="BASIC" type={"a"} href="/editor/basic" active={$view === 0} />
        <Button text="ADVANCED" type={"a"} href="/editor/advanced" disabled={true} />
        <Button text="RAW JSON" type={"a"} href="/editor/raw" active={$view === 2} />
        <Button text="DIAGNOSTICS" type={"a"} href="/editor/diagnostics" disabled={true} />
    </div>

    <div>
        <Dropdown
            text="LOAD"
            options={[
                {
                    "text": "CREATE NEW",
                    "function": () => {loadTemplate("Custom.srtb")}
                },
                {
                    "text": "FROM FILE",
                    "function": () => {loadFromFile()}
                },
                {
                    "text": "FROM LINK",
                    "function": () => {loadFromLink()}
                }
            ]}
            size=1
        />
        <Dropdown
            text="SAVE"
            options={[
                {
                    "text": "SAVE AS .SRTB",
                    "function": () => {saveAsSRTB()}
                },
                {
                    "text": "SAVE AS .JSON",
                    "function": () => {saveAsJSON()}
                },
                {
                    "text": "SAVE AS .ZIP",
                    "function": () => {saveAsZIP()}
                }
            ]}
            size=1
            disabled={chart.json === undefined}
        />
    </div>
</div>

<style>
    .main {
        display: flex;
        justify-content: space-between;
    }

    .main > div {
        display: flex;
        gap: 1rem;
    }

    .main > div:first-child {
        position: relative;
        bottom: -1rem;
        align-items: end;
    }
</style>