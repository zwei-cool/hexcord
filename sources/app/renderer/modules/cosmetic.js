"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const global_1 = require("../../global/global");
function findClass(searchString, tagName) {
    const searchResult = new Set();
    for (const container of document.getElementsByTagName(tagName))
        for (const classString of container.classList)
            if (classString.includes(searchString))
                searchResult.add(classString);
    return [...searchResult];
}
function preloadCosmetic() {
    let discordInstance = false;
    for (const instance in global_1.knownIstancesList)
        if (window.location.origin === global_1.knownIstancesList[instance][1].origin)
            discordInstance = true;
    if (!discordInstance)
        return;
    electron_1.ipcRenderer.once("webContents.did-stop-loading", () => window.localStorage.setItem('hideNag', 'true'));
    const removeUnneded = () => {
        if (document.URL.includes('login') || document.URL.includes('register')) {
            return;
        }
        const classList = [findClass('listItem-', 'div'), findClass('scroller-', 'div'), findClass('sidebar-', 'div')];
        if (classList[0].length === 1) {
            electron_1.ipcRenderer.send('cosmetic.hideElementByClass', 'div.' + classList[1][0] + ' > div.' + classList[0][0]);
            electron_1.ipcRenderer.once('cosmetic.hideElementByClass', () => (0, global_1.wLog)("Successfully removed unnecesarry elements on website."));
            electron_1.ipcRenderer.send('cosmetic.sideBarClass', classList[2][0]);
            electron_1.ipcRenderer.removeListener('webContents.did-stop-loading', removeUnneded);
        }
        else {
            (0, global_1.wLog)("COSMETIC: Couldn't find elements to remove, retrying on next event.");
            electron_1.ipcRenderer.send("cosmetic.load");
        }
    };
    electron_1.ipcRenderer.on("webContents.did-stop-loading", removeUnneded);
    window.addEventListener("load", () => electron_1.ipcRenderer.send("cosmetic.load"), { once: true });
}
exports.default = preloadCosmetic;
//# sourceMappingURL=cosmetic.js.map