"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWindow = void 0;
const electron_1 = require("electron");
const l10n_1 = require("../../global/modules/l10n");
const client_1 = require("./client");
const path_1 = require("path");
const popups = [
    "invite"
];
function initWindow(name, parent, properties) {
    const isPopup = popups.includes(name);
    if (!electron_1.app.isReady)
        throw new Error("Tried to initialize a new parent window when app is not ready!");
    const wSession = isPopup ? electron_1.session.defaultSession : electron_1.session.fromPartition("temp:" + name);
    for (const window of parent.getChildWindows())
        if (window.webContents.session === wSession)
            return;
    if (!parent.isVisible())
        parent.show();
    const win = new electron_1.BrowserWindow({
        title: electron_1.app.getName() + ' – ' + (new l10n_1.default()).client.windows[name],
        show: false,
        parent: parent,
        modal: true,
        backgroundColor: client_1.appInfo.backgroundColor,
        icon: client_1.appInfo.icon,
        webPreferences: {
            session: wSession,
            preload: !isPopup ? (0, path_1.resolve)(electron_1.app.getAppPath(), 'sources/app/renderer/preload/' + name + '.js') : undefined,
            defaultFontFamily: {
                standard: 'Arial'
            }
        },
        ...properties
    });
    if (win.webContents.session === parent.webContents.session && !isPopup)
        throw new Error("Child took session from parent!");
    win.setAutoHideMenuBar(true);
    win.setMenuBarVisibility(false);
    if ((0, client_1.getBuildInfo)().type === 'release')
        win.removeMenu();
    if (!isPopup)
        void win.loadFile((0, path_1.resolve)(electron_1.app.getAppPath(), "sources/assets/web/html/" + name + ".html"));
    setTimeout(() => { if (!win.isDestroyed() && !win.isVisible())
        win.show(); }, 10000);
    return win;
}
exports.initWindow = initWindow;
//# sourceMappingURL=parent.js.map