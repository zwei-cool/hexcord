"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const global_1 = require("../../global/global");
const dompurify_1 = require("dompurify");
function isChecklistForms(arg) {
    return arg.id !== undefined;
}
const sanitizeConfig = {
    ALLOWED_TAGS: ['b', 'i', 'u', 's', 'em', 'kbd', 'strong', 'code'],
    ALLOWED_ATTR: []
};
function fetchFromWebsite() {
    const dotArray = this.name.split('.');
    const value = (this.type === "checkbox" ? this.checked : parseInt(this.value));
    let config = {};
    config = { [dotArray[dotArray.length - 1]]: value };
    for (let n = dotArray.length - 2; n >= 0; n--)
        config = { [dotArray[n]]: config };
    console.log(config);
    electron_1.ipcRenderer.send('settings-config-modified', config);
}
function generateSettings(optionsGroups) {
    document.body.innerHTML = "";
    for (const group of optionsGroups) {
        const h1 = document.createElement('h1');
        h1.innerHTML = (0, dompurify_1.sanitize)(group.title, sanitizeConfig);
        document.body.appendChild(h1);
        for (const option of group.options) {
            const h2 = document.createElement('h2');
            const pDesc = document.createElement('p');
            const checklistContainer = document.createElement('form');
            h2.innerHTML = (0, dompurify_1.sanitize)(option.name, sanitizeConfig);
            pDesc.className = "description";
            pDesc.innerHTML = (0, dompurify_1.sanitize)(option.description, sanitizeConfig);
            checklistContainer.className = "settingsContainer";
            if (option.hidden === true) {
                h2.style.display = 'none';
                pDesc.style.display = 'none';
                checklistContainer.style.display = 'none';
            }
            for (const checklist of option.forms) {
                const inputForm = document.createElement('fieldset');
                const inputTag = document.createElement('input');
                const inputLabel = document.createElement('label');
                inputTag.type = option.type;
                if (isChecklistForms(checklist))
                    inputTag.name = inputTag.id = checklist.id;
                else {
                    inputTag.name = option.id;
                    inputTag.value = checklist.value.toString();
                }
                inputTag.checked = checklist.isChecked;
                if (checklist.description) {
                    inputTag.title = checklist.description;
                    inputLabel.title = checklist.description;
                }
                inputTag.addEventListener('change', fetchFromWebsite);
                inputLabel.innerHTML = (0, dompurify_1.sanitize)(checklist.label + (inputTag.title !== '' ? ' 🛈' : ''));
                if (isChecklistForms(checklist))
                    inputLabel.setAttribute('for', checklist.id);
                inputForm.appendChild(inputTag);
                inputForm.appendChild(inputLabel);
                checklistContainer.appendChild(inputForm);
            }
            document.body.appendChild(h2);
            document.body.appendChild(pDesc);
            document.body.appendChild(checklistContainer);
        }
    }
}
electron_1.ipcRenderer.on('settings-generate-html', (_event, args) => {
    generateSettings(args);
    (0, global_1.wLog)("Settings preloaded!");
});
window.addEventListener('load', () => {
    electron_1.ipcRenderer.send('settings-generate-html', 'ready-to-render');
});
//# sourceMappingURL=settings.js.map