"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bar = exports.tray = exports.context = void 0;
const electron_1 = require("electron");
const client_1 = require("./client");
const config_1 = require("./config");
const appConfig = new config_1.AppConfig();
const events_1 = require("events");
const bug_1 = require("./bug");
const l10n_1 = require("../../global/modules/l10n");
const settings_1 = require("../windows/settings");
const docs_1 = require("../windows/docs");
const about_1 = require("../windows/about");
const error_1 = require("./error");
const sideBar = new events_1.EventEmitter();
const devel = (0, client_1.getBuildInfo)().type === 'devel';
electron_1.ipcMain.once('cosmetic.sideBarClass', (_event, className) => {
    sideBar.on('hide', (contents) => {
        console.debug("[EVENT] Hiding menu bar...");
        contents.insertCSS("." + className + "{ width: 0px !important; }").then(cssKey => {
            sideBar.once('show', () => {
                console.debug("[EVENT] Showing menu bar...");
                contents.removeInsertedCSS(cssKey).catch(error_1.commonCatches.throw);
            });
        }).catch(error_1.commonCatches.print);
    });
});
let wantQuit = false;
function paste(contents) {
    const contentTypes = electron_1.clipboard.availableFormats().toString();
    if (contentTypes.includes('image/') && contentTypes.includes('text/html'))
        electron_1.clipboard.writeImage(electron_1.clipboard.readImage());
    contents.paste();
}
function context(parent) {
    const strings = (new l10n_1.default()).client;
    parent.webContents.on('context-menu', (_event, params) => {
        const cmenu = [
            { type: 'separator' },
            { label: strings.context.cut, role: 'cut', enabled: params.editFlags.canCut },
            { label: strings.context.copy, role: 'copy', enabled: params.editFlags.canCopy },
            {
                label: strings.context.paste,
                enabled: electron_1.clipboard.availableFormats().length !== 0 && params.editFlags.canPaste,
                click: () => paste(parent.webContents)
            },
            { type: 'separator' }
        ];
        let position = 0;
        for (const suggestion of params.dictionarySuggestions) {
            cmenu.splice(++position, 0, {
                label: suggestion,
                click: () => parent.webContents.replaceMisspelling(suggestion)
            });
        }
        if (params.misspelledWord) {
            cmenu.splice(++position, 0, { type: 'separator' });
            cmenu.splice(++position, 0, {
                label: strings.context.dictionaryAdd,
                click: () => parent.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
            });
            cmenu.splice(++position, 0, { type: 'separator' });
        }
        if (params.linkURL) {
            cmenu.push({
                label: strings.context.copyURL,
                click: () => electron_1.clipboard.writeText(params.linkURL)
            });
            if (params.linkText)
                cmenu.push({
                    label: strings.context.copyURLText,
                    click: () => electron_1.clipboard.writeText(params.linkText)
                });
            cmenu.push({ type: 'separator' });
        }
        if (devel || appConfig.get().devel) {
            cmenu.push({
                label: strings.context.inspectElement,
                click: () => parent.webContents.inspectElement(params.x, params.y)
            });
            cmenu.push({ type: 'separator' });
        }
        electron_1.Menu.buildFromTemplate(cmenu).popup({
            window: parent,
            x: params.x,
            y: params.y
        });
    });
}
exports.context = context;
function tray(parent) {
    const strings = (new l10n_1.default()).client;
    const tray = new electron_1.Tray(client_1.appInfo.trayIcon);
    function toogleVisibility() {
        if (parent.isVisible() && parent.isFocused()) {
            parent.hide();
        }
        else if (!parent.isVisible()) {
            parent.show();
        }
        else {
            parent.focus();
        }
    }
    const contextMenu = electron_1.Menu.buildFromTemplate([
        {
            label: strings.windows.about,
            role: 'about',
            click: () => (0, about_1.default)(parent)
        },
        {
            label: strings.windows.docs,
            click: () => (0, docs_1.default)(parent)
        },
        {
            label: strings.help.bugs,
            click: () => (0, bug_1.createGithubIssue)()
        },
        { type: 'separator' },
        {
            label: strings.tray.toggle,
            click: toogleVisibility
        },
        {
            label: strings.tray.quit,
            click: function () {
                wantQuit = true;
                electron_1.app.quit();
            }
        }
    ]);
    tray.setContextMenu(contextMenu);
    tray.setToolTip(electron_1.app.getName());
    tray.on("click", toogleVisibility);
    parent.on('close', (event) => {
        if (!wantQuit) {
            event.preventDefault();
            parent.hide();
        }
    });
    return tray;
}
exports.tray = tray;
function bar(repoLink, parent) {
    const strings = (new l10n_1.default()).client;
    const webLink = repoLink.substring(repoLink.indexOf("+") + 1);
    const menu = electron_1.Menu.buildFromTemplate([
        {
            label: strings.menubar.file.groupName, submenu: [
                {
                    label: strings.windows.settings,
                    click: () => (0, settings_1.default)(parent)
                },
                { type: 'separator' },
                {
                    label: strings.menubar.file.relaunch,
                    accelerator: 'CmdOrCtrl+Alt+R',
                    click: () => {
                        wantQuit = true;
                        const newArgs = [];
                        for (const arg of process.argv) {
                            let willBreak = false;
                            for (const sw of ['start-minimized', 'm'])
                                if (arg.includes('-') && arg.endsWith(sw)) {
                                    willBreak = true;
                                    break;
                                }
                            if (willBreak)
                                break;
                            newArgs.push(arg);
                        }
                        newArgs.shift();
                        electron_1.app.relaunch({
                            args: newArgs,
                        });
                        electron_1.app.quit();
                    }
                },
                {
                    label: strings.menubar.file.quit,
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        wantQuit = true;
                        electron_1.app.quit();
                    }
                }
            ]
        },
        { role: 'editMenu', label: strings.menubar.edit.groupName, submenu: [
                { label: strings.menubar.edit.undo, role: 'undo' },
                { label: strings.menubar.edit.redo, role: 'redo' },
                { type: 'separator' },
                { label: strings.context.cut, role: 'cut' },
                { label: strings.context.copy, role: 'copy' },
                {
                    label: strings.context.paste, accelerator: 'CmdOrCtrl+V',
                    registerAccelerator: false,
                    click: () => paste(parent.webContents)
                }
            ] },
        {
            label: strings.menubar.view.groupName, submenu: [
                { label: strings.menubar.view.reload, role: 'reload' },
                { label: strings.menubar.view.forceReload, role: 'forceReload' },
                { type: 'separator' },
                {
                    label: strings.menubar.view.devTools,
                    id: 'devTools',
                    role: 'toggleDevTools',
                    enabled: devel || appConfig.get().devel
                },
                { type: 'separator' },
                { label: strings.menubar.view.resetZoom, role: 'resetZoom' },
                { label: strings.menubar.view.zoomIn, role: 'zoomIn' },
                { label: strings.menubar.view.zoomOut, role: 'zoomOut' },
                { type: 'separator' },
                { label: strings.menubar.view.fullScreen, role: 'togglefullscreen' }
            ]
        },
        {
            label: strings.menubar.window.groupName, submenu: [
                {
                    label: strings.menubar.window.mobileMode,
                    type: 'checkbox',
                    accelerator: 'CmdOrCtrl+Alt+M',
                    checked: false,
                    click: () => {
                        if ((sideBar.listenerCount('show') + sideBar.listenerCount('hide')) > 1) {
                            sideBar.emit('show');
                        }
                        else {
                            sideBar.emit('hide', parent.webContents);
                        }
                    }
                }
            ]
        },
        {
            label: strings.help.groupName, role: 'help', submenu: [
                { label: strings.windows.about, role: 'about', click: () => (0, about_1.default)(parent) },
                { label: strings.help.repo, click: () => electron_1.shell.openExternal(webLink) },
                { label: strings.windows.docs, click: () => (0, docs_1.default)(parent) },
                { label: strings.help.bugs, click: () => (0, bug_1.createGithubIssue)() }
            ]
        }
    ]);
    electron_1.Menu.setApplicationMenu(menu);
    return menu;
}
exports.bar = bar;
//# sourceMappingURL=menu.js.map