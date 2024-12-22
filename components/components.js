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

        let textInputs = data["text-inputs"];
        for (let textInput in textInputs) {
            initializeTextInput(textInput, textInputs[textInput]);
        }

        let checkboxes = data["checkboxes"];
        for (let checkbox in checkboxes) {
            initializeCheckbox(checkbox, checkboxes[checkbox]);
        }
    });