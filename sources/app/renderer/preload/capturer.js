"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function renderCapturerContainer(sources) {
    const list = document.getElementById("capturer-list");
    if (list === null)
        throw new Error("Element of ID: 'capturer-list' does not exists!");
    for (const source of sources) {
        const item = document.createElement('li');
        item.className = "capturer-item";
        const button = document.createElement('button');
        button.className = "capturer-button";
        button.setAttribute('data-id', source.id);
        button.setAttribute('title', source.name);
        const thumbnail = document.createElement('img');
        thumbnail.className = "capturer-thumbnail";
        thumbnail.src = source.thumbnail.toDataURL();
        button.appendChild(thumbnail);
        const labelContainer = document.createElement('div');
        labelContainer.className = "capturer-label-container";
        if (source.appIcon) {
            const icon = document.createElement('img');
            icon.className = "capturer-label-icon";
            icon.src = source.appIcon.toDataURL();
            labelContainer.appendChild(icon);
        }
        const label = document.createElement('span');
        label.className = "capturer-label";
        label.innerText = source.name;
        labelContainer.appendChild(label);
        button.appendChild(labelContainer);
        item.appendChild(button);
        list.appendChild(item);
    }
}
window.addEventListener("load", () => {
    electron_1.ipcRenderer.invoke("getDesktopCapturerSources").then((result) => {
        if (result === null) {
            electron_1.ipcRenderer.send("closeCapturerView", new Error("Unknown sources list."));
        }
        else {
            try {
                renderCapturerContainer(result);
                for (const button of document.querySelectorAll('.capturer-button'))
                    button.addEventListener('click', () => {
                        const id = button.getAttribute('data-id');
                        const source = result.find(source => source.id === id);
                        if (!source) {
                            throw new Error('Source with id: "' + (id ?? '[null]') + '" does not exist!');
                        }
                        electron_1.ipcRenderer.send("closeCapturerView", {
                            audio: false,
                            video: {
                                mandatory: {
                                    chromeMediaSource: 'desktop',
                                    chromeMediaSourceId: source.id
                                }
                            }
                        });
                    });
                document.getElementById('capturer-close')
                    ?.addEventListener('click', () => electron_1.ipcRenderer.send("closeCapturerView", "Operation canceled by user"));
            }
            catch (reason) {
                electron_1.ipcRenderer.send("closeCapturerView", reason);
            }
        }
    }).catch(reason => electron_1.ipcRenderer.send("closeCapturerView", reason));
});
//# sourceMappingURL=capturer.js.map