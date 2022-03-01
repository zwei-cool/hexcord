"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const package_1 = require("../../global/modules/package");
const client_1 = require("../modules/client");
const parent_1 = require("../modules/parent");
function showAboutPanel(parent) {
    const screenBounds = electron_1.screen.getPrimaryDisplay().size;
    const [width, height] = [
        (screenBounds.width < 600 ? screenBounds.width : 600),
        (screenBounds.height < 480 ? screenBounds.height : 480)
    ];
    const aboutPanel = (0, parent_1.initWindow)("about", parent, {
        width,
        height,
        resizable: false,
        fullscreenable: false,
        frame: false,
        modal: true
    });
    if (aboutPanel === undefined)
        return;
    electron_1.ipcMain.once("about.close", () => {
        if (!aboutPanel.isDestroyed())
            aboutPanel.close();
    });
    electron_1.ipcMain.once("about.readyToShow", () => {
        if (!aboutPanel.isDestroyed())
            aboutPanel.show();
    });
    electron_1.ipcMain.on("about.getDetails", (event) => {
        if (!aboutPanel.isDestroyed())
            event.reply("about.getDetails", {
                appName: electron_1.app.getName(),
                appVersion: electron_1.app.getVersion(),
                buildInfo: (0, client_1.getBuildInfo)(),
                appRepo: package_1.default.data.homepage
            });
    });
    aboutPanel.once("close", () => {
        electron_1.ipcMain.removeAllListeners("showAppLicense");
        electron_1.ipcMain.removeAllListeners("about.getDetails");
        electron_1.ipcMain.removeAllListeners("about.readyToShow");
        electron_1.ipcMain.removeAllListeners("about.close");
    });
    return aboutPanel;
}
exports.default = showAboutPanel;
//# sourceMappingURL=about.js.map