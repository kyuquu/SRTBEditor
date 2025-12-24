let toastId = 0;

function createToast (title, text, type, timeout, action) {
    let id = toastId;
    toastId++;
    let toast = document.createElement("div");
    toast.classList.add("toast");
    toast.classList.add(type);
    toast.setAttribute("id", `toast-${id}`);
    toast.addEventListener("click", () => {
        removeToast(id);
        if(action)
            action();
    });

    let toastTitle = document.createElement("div");
    toastTitle.textContent = title;
    toastTitle.classList.add("toast-title");
    toast.appendChild(toastTitle);
    let toastContent = document.createElement("div");
    toastContent.textContent = text;
    toastContent.classList.add("toast-content");
    toast.appendChild(toastContent);

    document.getElementById("toast-container").appendChild(toast);

    if(!timeout && timeout != 0)
        setTimeout(fadeToast, 5000, id);
    else if(timeout > 0)
        setTimeout(fadeToast, timeout, id);
}

function fadeToast(id) {
    let elem = document.getElementById(`toast-${id}`);
    if(elem) {
        elem.classList.add("fadeout");
        setTimeout(removeToast, 250, id);
    }
}

function removeToast(id) {
    let elem = document.getElementById(`toast-${id}`);
    if(elem) elem.remove();
}

function toastRoll() {
    createToast("!roll", `${Math.floor(Math.random() * 100 + 1)}`, "info", "10000", () => {toastRoll();toastRoll()});
}