import { error } from '@sveltejs/kit';
import { view } from "$lib/scripts/main.svelte.js";

export const load = () => {
    view.set(3);
};