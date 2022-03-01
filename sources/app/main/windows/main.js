"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../modules/client");
const config_1 = require("../modules/config");
const electron_1 = require("electron");
const getMenu = require("../modules/menu");
const global_1 = require("../../global/global");
const package_1 = require("../../global/modules/package");
const csp_1 = require("../modules/csp");
const crypto_1 = require("crypto");
const path_1 = require("path");
const kolor_1 = require("@spacingbat3/kolor");
const extensions_1 = require("../modules/extensions");
const error_1 = require("../modules/error");
const configData = new config_1.AppConfig();
function createMainWindow(startHidden, l10nStrings) {
    let tray;
    const mainWindowState = new config_1.WinStateKeeper('mainWindow');
    const win = new electron_1.BrowserWindow({
        title: electron_1.app.getName(),
        minWidth: client_1.appInfo.minWinWidth,
        minHeight: client_1.appInfo.minWinHeight,
        height: mainWindowState.initState.height,
        width: mainWindowState.initState.width,
        backgroundColor: client_1.appInfo.backgroundColor,
        icon: client_1.appInfo.icon,
        show: false,
        webPreferences: {
            preload: electron_1.app.getAppPath() + "/sources/app/renderer/preload/main.js",
            nodeIntegration: false,
            devTools: true,
            defaultFontFamily: {
                standard: 'Arial'
            }
        }
    });
    win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
        if (errorCode <= -100 && errorCode >= -199)
            void win.loadFile((0, path_1.resolve)(electron_1.app.getAppPath(), 'sources/assets/web/html/404.html'));
        else if (errorCode === -30) {
            console.warn(kolor_1.default.bold('[WARN]') + ' A page "' + validatedURL + '" was blocked by CSP.');
            return;
        }
        console.error(kolor_1.default.bold('[ERROR]') + ' ' + errorDescription + ' (' + (errorCode * -1).toString() + ')');
        const retry = setInterval(() => {
            if (retry && electron_1.net.isOnline()) {
                clearInterval(retry);
                void win.loadURL(global_1.knownIstancesList[new config_1.AppConfig().get().currentInstance][1].href);
            }
        }, 1000);
    });
    win.webContents.once('did-finish-load', () => {
        console.debug("[PAGE] Starting to load the Discord page...");
        if (!startHidden)
            win.show();
        setTimeout(() => { void win.loadURL(global_1.knownIstancesList[new config_1.AppConfig().get().currentInstance][1].href); }, 1500);
    });
    if (mainWindowState.initState.isMaximized)
        win.maximize();
    win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        let headersOverwrite = undefined;
        if (configData.get().csp.enabled) {
            console.debug("[CSP] Overwritting Discord CSP.");
            headersOverwrite = {
                'Content-Security-Policy': [csp_1.discordContentSecurityPolicy]
            };
        }
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                ...headersOverwrite
            }
        });
    });
    win.webContents.session.webRequest.onBeforeRequest({
        urls: [
            'https://*/api/*/science',
            'https://*/api/*/channels/*/typing',
            'https://*/api/*/track'
        ]
    }, (details, callback) => {
        const configData = (new config_1.AppConfig()).get();
        const cancel = configData.blockApi.science || configData.blockApi.typingIndicator;
        const url = new URL(details.url);
        if (cancel)
            console.debug('[API] Blocking ' + url.pathname);
        if (url.pathname.endsWith('/science') || url.pathname.endsWith('/track'))
            callback({ cancel: configData.blockApi.science });
        else if (url.pathname.endsWith('/typing'))
            callback({ cancel: configData.blockApi.typingIndicator });
        else
            callback({ cancel: false });
    });
    {
        const trustedURLs = [
            global_1.knownIstancesList[new config_1.AppConfig().get().currentInstance][1].origin,
            'devtools://'
        ];
        const permissionHandler = function (webContentsUrl, permission, details) {
            for (const secureURL of trustedURLs) {
                if (new URL(webContentsUrl).origin !== new URL(secureURL).origin) {
                    return false;
                }
                switch (permission) {
                    case "media": {
                        let callbackValue = true;
                        if ("mediaTypes" in details) {
                            if (details.mediaTypes === undefined)
                                break;
                            for (const type of details.mediaTypes)
                                callbackValue = callbackValue && configData.get().permissions[type];
                        }
                        else if ("mediaType" in details) {
                            if (details.mediaType === undefined || details.mediaType === "unknown")
                                break;
                            callbackValue = callbackValue && configData.get().permissions[details.mediaType];
                        }
                        else {
                            callbackValue = false;
                        }
                        return callbackValue;
                    }
                    case "display-capture":
                    case "notifications":
                    case "fullscreen":
                        return configData.get().permissions[permission];
                    default:
                        return false;
                }
            }
            return null;
        };
        win.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
            const requestUrl = (webContents !== null && webContents.getURL() !== "" ? webContents.getURL() : requestingOrigin);
            const returnValue = permissionHandler(requestUrl, permission, details);
            if (returnValue === null) {
                console.warn(`[${l10nStrings.dialog.common.warning.toLocaleUpperCase()}] ${l10nStrings.dialog.permission.check.denied}`, new URL(requestUrl), permission);
                return false;
            }
            return returnValue;
        });
        win.webContents.session.setPermissionRequestHandler((webContents, permission, callback, details) => {
            const returnValue = permissionHandler(webContents.getURL(), permission, details);
            if (returnValue === null) {
                console.warn('[' + l10nStrings.dialog.common.warning.toLocaleUpperCase() + '] ' + l10nStrings.dialog.permission.request.denied, webContents.getURL(), permission);
                return callback(false);
            }
            return callback(returnValue);
        });
    }
    void win.loadFile((0, path_1.resolve)(electron_1.app.getAppPath(), 'sources/assets/web/html/load.html'));
    win.setAutoHideMenuBar(configData.get().hideMenuBar);
    win.setMenuBarVisibility(!configData.get().hideMenuBar);
    {
        let valid = true;
        const spellCheckerLanguages = [electron_1.app.getLocale(), 'en-US'];
        if (electron_1.app.getLocale() === 'en-US')
            valid = false;
        if (valid && process.platform !== 'darwin')
            for (const language of spellCheckerLanguages)
                if (!win.webContents.session.availableSpellCheckerLanguages.includes(language))
                    valid = false;
        if (valid)
            win.webContents.session.setSpellCheckerLanguages(spellCheckerLanguages);
    }
    mainWindowState.watchState(win);
    getMenu.context(win);
    if (!configData.get().disableTray)
        tray = getMenu.tray(win);
    getMenu.bar(package_1.default.data.repository.url, win);
    let setFavicon;
    win.webContents.on('page-favicon-updated', (_event, favicons) => {
        const t = tray;
        const faviconRaw = electron_1.nativeImage.createFromDataURL(favicons[0]).toBitmap();
        const faviconHash = (0, crypto_1.createHash)('sha1').update(faviconRaw).digest('hex');
        if (faviconHash === setFavicon)
            return;
        if (new URL(win.webContents.getURL()).origin !== global_1.knownIstancesList[0][1].origin) {
            setFavicon = faviconHash;
            t.setImage(client_1.appInfo.trayIcon);
            win.flashFrame(false);
            return;
        }
        if (!configData.get().disableTray) {
            if (faviconHash === global_1.discordFavicons.default) {
                t.setImage(client_1.appInfo.trayIcon);
                win.flashFrame(false);
            }
            else if (faviconHash.startsWith('4')) {
                t.setImage(client_1.appInfo.trayUnread);
                win.flashFrame(false);
            }
            else {
                console.debug("[Mention] Hash: " + faviconHash);
                t.setImage(client_1.appInfo.trayPing);
                win.flashFrame(true);
            }
            setFavicon = faviconHash;
        }
    });
    win.on('page-title-updated', (event, title) => {
        if (title.includes("Discord Test Client")) {
            event.preventDefault();
            win.setTitle(electron_1.app.getName() + " (Fosscord)");
        }
        else if (title.includes("Discord")) {
            event.preventDefault();
            win.setTitle(title.replace("Discord", electron_1.app.getName()));
        }
    });
    electron_1.ipcMain.on("cosmetic.load", (event) => {
        const callback = () => {
            if (!win.webContents.getURL().startsWith("https:"))
                return;
            console.debug("[IPC] Exposing a 'did-stop-loading' event...");
            event.reply("webContents.did-stop-loading");
        };
        win.webContents.once("did-stop-loading", callback);
        win.webContents.once("did-navigate", () => {
            win.webContents.removeListener("did-stop-loading", callback);
        });
    });
    electron_1.ipcMain.on("cosmetic.hideElementByClass", (event, cssRule) => {
        void win.webContents.insertCSS(cssRule + ':nth-last-child(2) > *, ' + cssRule + ':nth-last-child(3) > * { display:none; }');
        event.reply("cosmetic.hideElementByClass");
    });
    electron_1.ipcMain.on('cosmetic.sideBarClass', (_event, className) => {
        console.debug("[CSS] Injecting a CSS for sidebar animation...");
        void win.webContents.insertCSS("." + className + "{ transition: width .1s cubic-bezier(0.4, 0, 0.2, 1);}");
    });
    win.webContents.on('did-finish-load', () => {
        if (new URL(win.webContents.getURL()).protocol === "https:") {
            (0, extensions_1.loadStyles)(win.webContents)
                .catch(error_1.commonCatches.print);
        }
    });
    electron_1.ipcMain.on('api-exposed', (_event, api) => {
        console.debug("[IPC] Exposing a `getDisplayMedia` and spoffing it as native method.");
        const functionString = `
            navigator.mediaDevices.getDisplayMedia = Function.prototype.call.apply(Function.prototype.bind, [async() => navigator.mediaDevices.getUserMedia(await window['${api.replaceAll("'", "\\'")}']())]);
        `;
        win.webContents.executeJavaScript(functionString + ';0').catch(error_1.commonCatches.throw);
    });
    electron_1.ipcMain.on('settings-config-modified', (_event, object) => {
        const config = new config_1.AppConfig();
        if ("hideMenuBar" in object) {
            console.debug("[Settings] Updating menu bar state...");
            win.setAutoHideMenuBar(config.get().hideMenuBar);
            win.setMenuBarVisibility(!config.get().hideMenuBar);
        }
        if ("currentInstance" in object) {
            void win.loadURL(global_1.knownIstancesList[config.get().currentInstance][1].href);
        }
    });
    if ((0, client_1.getBuildInfo)().type === "devel")
        void (0, extensions_1.loadChromiumExtensions)(win.webContents.session);
    Promise.resolve().then(() => require('../modules/socket')).then((socket) => socket.default(win)).catch(e => { console.error(e); });
    {
        let lock = false;
        electron_1.ipcMain.handle("desktopCapturerRequest", () => {
            return new Promise((resolvePromise) => {
                if (lock || win.getBrowserViews().length !== 0)
                    return new Error("Main process is busy by another request.");
                if (!configData.get().permissions["display-capture"])
                    return new Error("Permission denied.");
                lock = true;
                const sources = electron_1.desktopCapturer.getSources({
                    types: ["screen", "window"],
                    fetchWindowIcons: true
                });
                const view = new electron_1.BrowserView({
                    webPreferences: {
                        preload: (0, path_1.resolve)(electron_1.app.getAppPath(), "sources/app/renderer/preload/capturer.js")
                    }
                });
                electron_1.ipcMain.handleOnce("getDesktopCapturerSources", (event) => {
                    if (event.sender === view.webContents)
                        return sources;
                    else
                        return null;
                });
                const autoResize = () => setImmediate(() => view.setBounds({
                    ...win.getBounds(),
                    x: 0,
                    y: 0,
                }));
                electron_1.ipcMain.once("closeCapturerView", (_event, data) => {
                    win.removeBrowserView(view);
                    view.webContents.delete();
                    win.removeListener("resize", autoResize);
                    resolvePromise(data);
                    lock = false;
                });
                win.setBrowserView(view);
                void view.webContents.loadFile((0, path_1.resolve)(electron_1.app.getAppPath(), "sources/assets/web/html/capturer.html"));
                view.webContents.once("did-finish-load", () => {
                    autoResize();
                    win.on("resize", autoResize);
                });
            });
        });
    }
    return win;
}
exports.default = createMainWindow;
//# sourceMappingURL=main.js.map