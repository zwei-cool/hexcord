"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../modules/error");
async function handleEvents(docsWindow) {
    const [{ existsSync }, { resolve }, { app, ipcMain }] = await Promise.all([
        Promise.resolve().then(() => require("fs")),
        Promise.resolve().then(() => require("path")),
        Promise.resolve().then(() => require("electron"))
    ]);
    let readmeFile = 'docs/Readme.md';
    if (existsSync(resolve(app.getAppPath(), 'docs', app.getLocale(), 'Readme.md')))
        readmeFile = 'docs/' + app.getLocale() + '/Readme.md';
    ipcMain.removeAllListeners('documentation-load');
    ipcMain.on('documentation-load', (event) => {
        ipcMain.once('documentation-show', () => {
            if (!docsWindow.isDestroyed()) {
                docsWindow.show();
            }
        });
        event.reply('documentation-load', resolve(app.getAppPath(), readmeFile));
    });
}
async function loadDocsWindow(parent) {
    const [{ initWindow }, { appInfo },] = await Promise.all([
        Promise.resolve().then(() => require("../modules/parent")),
        Promise.resolve().then(() => require("../modules/client"))
    ]);
    const docsWindow = initWindow("docs", parent, {
        minWidth: appInfo.minWinWidth,
        minHeight: appInfo.minWinHeight,
        width: 800,
        height: 720
    });
    if (docsWindow === undefined)
        return;
    handleEvents(docsWindow).catch(error_1.commonCatches.throw);
}
exports.default = loadDocsWindow;
//# sourceMappingURL=docs.js.map