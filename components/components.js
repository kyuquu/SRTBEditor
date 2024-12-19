fetch("data/components.json")
    .then(response => response.json())
    .then((data) => {
        let dropdowns = data["dropdowns"];
        for (let dropdown in dropdowns) {
            initializeDropdown(dropdown, dropdowns[dropdown]);
        }

        let buttons = data["buttons"];
        for (let button in buttons) {
            initializeButton(button, buttons[button]);
        }
    });