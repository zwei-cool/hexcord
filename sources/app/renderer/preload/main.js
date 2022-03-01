"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const crypto_1 = require("crypto");
const global_1 = require("../../global/global");
const capturer_1 = require("../modules/capturer");
const cosmetic_1 = require("../modules/cosmetic");
const l10n_1 = require("../../global/modules/l10n");
function generateSafeKey() {
    const charset = 'abcdefghijklmnoprstuwxyzABCDEFGHIJKLMNOPRSTUWXYZ';
    let key = '';
    while (key === '' || key in window) {
        key = '';
        for (let i = 0; i <= (0, crypto_1.randomInt)(4, 32); i++)
            key += charset.charAt((0, crypto_1.randomInt)(charset.length - 1));
    }
    return key;
}
const contextBridgeApiKey = generateSafeKey();
(0, cosmetic_1.default)();
electron_1.contextBridge.exposeInMainWorld(contextBridgeApiKey, capturer_1.default);
if (window.location.protocol === 'file:') {
    window.addEventListener("load", () => {
        const element = document.getElementById("logo");
        if (element && element.tagName === "IMG")
            element.src = (0, global_1.getAppIcon)([512, 256, 192]);
    });
    electron_1.contextBridge.exposeInMainWorld('webcord', {
        l10n: (new l10n_1.default()).web
    });
}
electron_1.ipcRenderer.send('api-exposed', contextBridgeApiKey);
(0, global_1.wLog)("Everything has been preloaded successfully!");
//# sourceMappingURL=main.js.map