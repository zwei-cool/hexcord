"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appInfo = exports.getBuildInfo = void 0;
const electron_1 = require("electron");
const path_1 = require("path");
const global_1 = require("../../global/global");
const package_1 = require("../../global/modules/package");
const fs_1 = require("fs");
function getBuildInfo() {
    try {
        const data = (0, fs_1.readFileSync)((0, path_1.resolve)(electron_1.app.getAppPath(), 'buildInfo.json'));
        const buildInfo = JSON.parse(data.toString());
        if ((0, global_1.isBuildInfo)(buildInfo))
            return buildInfo;
        else
            return { type: 'devel' };
    }
    catch {
        return { type: 'devel' };
    }
}
exports.getBuildInfo = getBuildInfo;
exports.appInfo = {
    repository: {
        name: new package_1.Person(package_1.default.data.author ?? "").name + '/' + electron_1.app.getName(),
        provider: 'github.com'
    },
    icon: (0, path_1.resolve)(electron_1.app.getAppPath(), "sources/assets/icons/app.png"),
    trayIcon: (0, path_1.resolve)(electron_1.app.getAppPath(), "sources/assets/icons/tray.png"),
    trayUnread: (0, path_1.resolve)(electron_1.app.getAppPath(), "sources/assets/icons/tray-unread.png"),
    trayPing: (0, path_1.resolve)(electron_1.app.getAppPath(), "sources/assets/icons/tray-ping.png"),
    minWinHeight: 412,
    minWinWidth: 312,
    backgroundColor: "#36393F"
};
//# sourceMappingURL=client.js.map