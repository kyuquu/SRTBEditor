const cancelOption = {
    text: "Cancel",
    action: closePopup,
    type: 0
}

let rememberedActions = {};

async function popup(title, content, options, id) {
    if(rememberedActions.id) {
        rememberedActions.id.function();
    }
    else {
        document.getElementById("popup-background").classList.add("active");
        document.getElementById("popup-title").textContent = title;
        document.getElementById("popup-content").textContent = content;
        let cont = document.getElementById("popup-options");
        while(cont.hasChildNodes())
            cont.removeChild(cont.firstChild);

        for(let i = 0; i < options.length; i++) {
            let newButton = document.createElement("button");
            newButton.textContent = options[i].text;
            newButton.setAttribute("onclick", options[i].action);
            cont.appendChild(newButton);

        }
        // rememberedActions.id = id;
        // rememberedActions.id.function = 

    }
}

function closePopup() {
    document.getElementById("popup-background").classList.remove("active");
}