"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const source_map_support_1 = require("source-map-support");
(0, source_map_support_1.install)();
const error_1 = require("../main/modules/error");
(0, error_1.default)();
console.debug = function (message, ...optionalParams) {
    Promise.all([Promise.resolve().then(() => require('electron')), Promise.resolve().then(() => require('@spacingbat3/kolor'))])
        .then(([Electron, colors]) => [Electron.app.commandLine, colors.default])
        .then(([cmd, colors]) => {
        if (cmd.hasSwitch('verbose') || cmd.hasSwitch('v'))
            if (typeof message === "string")
                console.log(colors.gray(message), ...optionalParams);
            else
                console.log(message, ...optionalParams);
    }).catch(error_1.commonCatches.print);
};
{
    const stdErr = console.error;
    const stdWarn = console.warn;
    console.error = function (message, ...optionalParams) {
        Promise.resolve().then(() => require('@spacingbat3/kolor')).then(colors => colors.default).then(colors => {
            if (typeof message === "string")
                stdErr(colors.red(message), ...optionalParams);
            else
                stdErr(message, ...optionalParams);
        }).catch(error_1.commonCatches.print);
    };
    console.warn = function (message, ...optionalParams) {
        Promise.resolve().then(() => require('@spacingbat3/kolor')).then(colors => colors.default).then(colors => {
            if (typeof message === "string")
                stdWarn(colors.yellow(message), ...optionalParams);
            else
                stdWarn(message, ...optionalParams);
        }).catch(error_1.commonCatches.print);
    };
}
const electron_1 = require("electron");
const fs_1 = require("fs");
const global_1 = require("./global");
const update_1 = require("../main/modules/update");
const l10n_1 = require("./modules/l10n");
const main_1 = require("../main/windows/main");
const config_1 = require("../main/modules/config");
const kolor_1 = require("@spacingbat3/kolor");
const path_1 = require("path");
const semver_1 = require("semver");
const agent_1 = require("./modules/agent");
electron_1.app.userAgentFallback = (0, agent_1.getUserAgent)(process.versions.chrome);
let startHidden = false;
let overwriteMain;
{
    const renderLine = (parameter, description, length) => {
        const spaceBetween = (length ?? 30) - parameter.length;
        return '  ' + kolor_1.default.green(parameter) + ' '.repeat(spaceBetween) + kolor_1.default.gray(description) + '\n';
    };
    const cmd = electron_1.app.commandLine;
    if (cmd.hasSwitch('help') || cmd.hasSwitch('h')) {
        console.log("\n " + kolor_1.default.bold(kolor_1.default.blue(electron_1.app.getName())) +
            " – Privacy focused Discord client made with " + kolor_1.default.bold(kolor_1.default.white(kolor_1.default.blueBg("TypeScript"))) + " and " + kolor_1.default.bold(kolor_1.default.blackBg(kolor_1.default.cyan("Electron"))) + '.\n\n' +
            " " + kolor_1.default.underscore("Usage:") + " " + kolor_1.default.red(process.argv0) + kolor_1.default.green(" [option]\n\n") +
            " " + kolor_1.default.underscore("Options:") + "\n" +
            renderLine('--version  -V', 'Show current application version.') +
            renderLine('--start-minimized  -m', 'Hide application at first run.') +
            renderLine('--export-l10n' + '=' + kolor_1.default.yellow('{dir}'), '          Export currently loaded translation files from') +
            " ".repeat(32) + kolor_1.default.gray("the application to the " + kolor_1.default.yellow('{dir}') + " directory.\n") +
            renderLine('--verbose  -v', "Show debug messages."));
        electron_1.app.exit();
    }
    if (cmd.hasSwitch('version') || cmd.hasSwitch('V')) {
        console.log(electron_1.app.getName() + ' v' + electron_1.app.getVersion());
        electron_1.app.exit();
    }
    if (cmd.hasSwitch('start-minimized') || cmd.hasSwitch('m'))
        startHidden = true;
    if (cmd.hasSwitch('export-l10n')) {
        overwriteMain = () => {
            const locale = new l10n_1.default;
            const directory = cmd.getSwitchValue('export-l10n');
            const filePromise = [];
            for (const file in locale)
                filePromise.push(fs_1.promises.writeFile((0, path_1.resolve)(directory, file + '.json'), JSON.stringify(locale[file], null, 2)));
            Promise.all(filePromise).then(() => {
                console.log("\n🎉️ Successfully exported localization files to \n" +
                    "   '" + directory + "'!\n");
                electron_1.app.quit();
            }).catch((err) => {
                console.error('\n⛔️ ' + kolor_1.default.red(kolor_1.default.bold(err.code ?? err.name)) + ' ' + (err.syscall ?? "") + ': ' +
                    (err.path ? kolor_1.default.blue(kolor_1.default.underscore((0, path_1.relative)(process.cwd(), err.path))) + ': ' : '') +
                    err.message.replace((err.code ?? '') + ': ', '')
                        .replace(', ' + (err.syscall ?? '') + " '" + (err.path ?? '') + "'", '') + '.\n');
                electron_1.app.exit((err.errno ?? 0) * (-1));
            });
        };
    }
}
const singleInstance = electron_1.app.requestSingleInstanceLock();
let mainWindow;
let l10nStrings, updateInterval;
function main() {
    if (overwriteMain) {
        overwriteMain();
    }
    else {
        l10nStrings = (new l10n_1.default()).client;
        (0, update_1.checkVersion)(updateInterval).catch(error_1.commonCatches.print);
        updateInterval = setInterval(function () { (0, update_1.checkVersion)(updateInterval).catch(error_1.commonCatches.print); }, 1800000);
        mainWindow = (0, main_1.default)(startHidden, l10nStrings);
    }
}
if (!singleInstance && !overwriteMain) {
    electron_1.app.on('ready', () => {
        console.log((new l10n_1.default()).client.misc.singleInstance);
        electron_1.app.quit();
    });
}
else {
    electron_1.app.on('second-instance', () => {
        if (mainWindow) {
            if (!mainWindow.isVisible())
                mainWindow.show();
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
        }
    });
    electron_1.app.on('ready', main);
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            main();
    });
}
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('web-contents-created', (_event, webContents) => {
    const isMainWindow = webContents.session === electron_1.session.defaultSession;
    if (!isMainWindow) {
        webContents.session.setPermissionCheckHandler(() => false);
        webContents.session.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
    }
    if ((0, semver_1.major)(process.versions.electron) >= 16 || /^(?:14|15)\.1\.\d+.*$/.test(process.versions.electron))
        webContents.session.setDevicePermissionHandler(() => false);
    webContents.on('will-navigate', (event, url) => {
        const originUrl = webContents.getURL();
        if (originUrl !== '' && (new URL(originUrl)).origin !== (new URL(url)).origin)
            event.preventDefault();
    });
    webContents.setWindowOpenHandler((details) => {
        const config = new config_1.AppConfig().get();
        if (!electron_1.app.isReady())
            return { action: 'deny' };
        const openUrl = new URL(details.url);
        const sameOrigin = new URL(webContents.getURL()).origin === openUrl.origin;
        let allowedProtocol = false;
        if (openUrl.protocol.match(global_1.trustedProtocolRegExp))
            allowedProtocol = true;
        if (allowedProtocol && !sameOrigin && config.redirectionWarning || !isMainWindow) {
            const window = electron_1.BrowserWindow.fromWebContents(webContents);
            const strings = (new l10n_1.default).client.dialog;
            const options = {
                type: 'warning',
                title: strings.common.warning + ': ' + strings.externalApp.title,
                message: strings.externalApp.message,
                buttons: [strings.common.no, strings.common.yes],
                defaultId: 0,
                cancelId: 0,
                detail: strings.common.source + ':\n' + details.url,
                textWidth: 320,
                normalizeAccessKeys: true
            };
            let result;
            if (window instanceof electron_1.BrowserWindow)
                result = electron_1.dialog.showMessageBoxSync(window, options);
            else
                result = electron_1.dialog.showMessageBoxSync(options);
            if (result === 0)
                return { action: 'deny' };
        }
        if (allowedProtocol) {
            const url = new URL(details.url);
            if (url.host === global_1.knownIstancesList[config.currentInstance][1].host && url.pathname === '/popout')
                return {
                    action: 'allow',
                    overrideBrowserWindowOptions: {
                        autoHideMenuBar: true,
                        parent: electron_1.BrowserWindow.fromWebContents(webContents) ?? undefined,
                        fullscreenable: false
                    }
                };
            else
                electron_1.shell.openExternal(details.url).catch(error_1.commonCatches.print);
        }
        return { action: 'deny' };
    });
    webContents.on("did-create-window", (window) => {
        window.removeMenu();
    });
});
//# sourceMappingURL=main.js.map