import { writable } from "svelte/store";

export let view = writable(-1);

export let editorScrollPos = writable(0);
export let editorCursorPos = writable({row: 0, column: 0});

export let chart = createChartObj();

function createChartObj() {
    let json = $state(undefined);
    let filename = $state(undefined);
    let albumArt = $state(undefined);
    let audioClips = $state(undefined);

    const trackInfo = $derived.by(() => {
        return json ? json.largeStringValuesContainer.values[0].val : undefined;
    });

    const clipInfo = $derived.by(() => {
        return json ? json.largeStringValuesContainer.values[6].val : undefined;
    });

    return {
        get json() { return json },
        set json(v) { json = v },

        get filename() { return filename },
        set filename(v) { filename = v },

        get albumArt() { return albumArt },
        set albumArt(v) { albumArt = v },

        get audioClips() { return audioClips },
        set audioClips(v) { audioClips = v },

        get trackInfo() { return trackInfo },
        get clipInfo() { return clipInfo },
    }
}