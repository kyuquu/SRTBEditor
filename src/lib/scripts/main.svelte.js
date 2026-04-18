import { writable } from "svelte/store";
import { getTrackInfo, getTrackInfoDiffs, getTrackData, getClipInfo } from "./helper.svelte";

export let view = writable(-1);

export let editorScrollPos = writable(0);
export let editorCursorPos = writable({row: 0, column: 0});

class ChartObj {
    json = $state(undefined);
    filename = $state(undefined);
    albumArt = $state(undefined);
    audioClips = $state(undefined);

    trackInfo = $derived.by(() => {
        return this.json ? getTrackInfo(this.json) : undefined;
    });

    trackData = $derived.by(() => {
        return this.json ? getTrackData(this.json) : undefined;
    });

    clipInfo = $derived.by(() => {
        return this.json ? getClipInfo(this.json) : undefined;
    });

    trackInfoDiffs = $derived.by(() => {
        return this.json ? getTrackInfoDiffs(this.json) : undefined;
    });
}

export const chart = new ChartObj();

export const difficulties = ["easy", "normal", "hard", "expert", "xd", "remixd"];