let toastId = 0;

function createToast (title, text, type, timeout, action) {
    let id = toastId;
    toastId++;
    let toast = document.createElement("div");
    toast.classList.add("toast");
    toast.classList.add(type);
    toast.setAttribute("id", `toast-${id}`);
    // if(action)
    //     toast.setAttribute("onclick", () => {
    //         action();
    //         removeToast(id);
    //     }); //todo: use listeners instead of onclick
    // else 
    toast.setAttribute("onclick", `removeToast(${id})`);

    let toastTitle = document.createElement("div");
    toastTitle.textContent = title;
    toastTitle.classList.add("toast-title");
    toast.appendChild(toastTitle);
    let toastContent = document.createElement("div");
    toastContent.textContent = text;
    toastContent.classList.add("toast-content");
    toast.appendChild(toastContent);

    document.getElementById("toast-container").appendChild(toast);

    if(timeout && timeout > 0)
        setTimeout(removeToast, timeout, id);
}

function removeToast(id) {
    document.getElementById(`toast-${id}`).remove();
}