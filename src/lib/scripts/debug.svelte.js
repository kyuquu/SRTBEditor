import { createToast } from "$lib/components/ToastContainer.svelte";

const debugEnabled = true;

export function debug(e) {
    if (debugEnabled) {
        if (e.ctrlKey && e.shiftKey && e.code === "Digit1") {
            e.preventDefault();
            createToast("info", "Info toast!", "You have been informed.");
        }
        else if (e.ctrlKey && e.shiftKey && e.code === "Digit2") {
            e.preventDefault();
            createToast("success", "Success toast!", "Yippee!");
        }
        else if (e.ctrlKey && e.shiftKey && e.code === "Digit3") {
            e.preventDefault();
            createToast("warning", "Warning toast!", "Hmm...");
        }
        else if (e.ctrlKey && e.shiftKey && e.code === "Digit4") {
            e.preventDefault();
            createToast("error", "Error toast!", "Uh oh!");
        }
    }
}