"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getName = exports.getLocale = exports.showMessageBox = exports.getAppPath = void 0;
const electron_1 = require("electron");
const fs_1 = require("fs");
const path_1 = require("path");
function catchAndThrowErrors(error) {
    if (error instanceof Error)
        throw error;
}
function getAppPath() {
    if (process.type === 'browser')
        return electron_1.app.getAppPath();
    else {
        let path = __dirname;
        while (!(0, fs_1.existsSync)((0, path_1.resolve)(path, "./package.json")) && path !== "/") {
            path = (0, path_1.resolve)(path, '../');
        }
        return path;
    }
}
exports.getAppPath = getAppPath;
function showMessageBox(options) {
    if (process.type === 'browser') {
        Promise.resolve().then(() => require('electron')).then(api => {
            api.dialog.showMessageBox(options)
                .catch(catchAndThrowErrors);
        }).catch(catchAndThrowErrors);
    }
    else {
        const title = options.title ? options.title + '\n' : '';
        alert(title + options.message);
    }
}
exports.showMessageBox = showMessageBox;
function getLocale() {
    if (process.type === 'browser')
        return electron_1.app.getLocale();
    else
        return navigator.language;
}
exports.getLocale = getLocale;
function getName() {
    if (process.type === 'browser')
        return electron_1.app.getName();
    else
        return 'the application';
}
exports.getName = getName;
//# sourceMappingURL=electron.js.map