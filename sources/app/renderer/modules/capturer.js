"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
function isMediaStreamConstrains(object) {
    if (!(object instanceof Object))
        return false;
    for (const child of ["audio", "video"])
        if (!(child in object))
            return false;
        else {
            const testValue = object[child];
            switch (typeof testValue) {
                case "boolean":
                    break;
                case "object":
                    if ("mandatory" in testValue && "chromeMediaSource" in testValue.mandatory)
                        break;
                    return false;
                default:
                    return false;
            }
        }
    return true;
}
function desktopCapturerPicker() {
    return new Promise((resolve, reject) => {
        electron_1.ipcRenderer.invoke("desktopCapturerRequest").then((result) => {
            if (isMediaStreamConstrains(result)) {
                resolve(result);
            }
            else {
                reject(result);
            }
        }).catch((reason) => reject(reason));
    });
}
exports.default = desktopCapturerPicker;
//# sourceMappingURL=capturer.js.map