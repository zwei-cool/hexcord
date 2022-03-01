"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkVersion = void 0;
const electron_1 = require("electron");
const client_1 = require("./client");
const electron_fetch_1 = require("electron-fetch");
const l10n_1 = require("../../global/modules/l10n");
const semver = require("semver");
const kolor_1 = require("@spacingbat3/kolor");
const error_1 = require("./error");
async function checkVersion(updateInterval) {
    if (!electron_1.net.isOnline())
        return;
    if (!electron_1.app.isReady())
        await electron_1.app.whenReady();
    const strings = new l10n_1.default().client;
    const repoName = client_1.appInfo.repository.name;
    let updateMsg, showGui = false;
    const githubApi = await (await (0, electron_fetch_1.default)('https://api.github.com/repos/' + repoName + '/releases/latest')).json();
    switch (semver.compare(githubApi.tag_name, electron_1.app.getVersion())) {
        case 0:
            updateMsg = strings.dialog.ver.recent;
            break;
        case 1:
            showGui = true;
            updateMsg = strings.dialog.ver.update +
                ' (v' + electron_1.app.getVersion() + ' → v' + githubApi.tag_name.replace(/^v(.+)$/, '$1') + ')';
            break;
        case -1:
            if ((0, client_1.getBuildInfo)().type === 'devel')
                updateMsg = strings.dialog.ver.devel;
            else
                updateMsg = strings.dialog.ver.downgrade +
                    ' (v' + electron_1.app.getVersion() + ' → v' + githubApi.tag_name.replace(/^v(.+)$/, '$1') + ')';
            break;
        default:
            throw new Error("Couldn't compare versions while doing an update");
    }
    console.log(kolor_1.default.bold(kolor_1.default.blue(strings.dialog.ver.updateBadge)) + ' ' + updateMsg);
    const updatePopup = {
        title: electron_1.app.getName() + ": " + strings.dialog.ver.updateTitle,
        icon: client_1.appInfo.icon,
        body: updateMsg
    };
    if (showGui && ((0, client_1.getBuildInfo)()?.features?.updateNotifications ?? true)) {
        const notification = new electron_1.Notification(updatePopup);
        notification.on('click', () => {
            electron_1.shell.openExternal(githubApi.html_url).catch(error_1.commonCatches.throw);
        });
        notification.show();
    }
    if (updateInterval) {
        clearInterval(updateInterval);
    }
}
exports.checkVersion = checkVersion;
//# sourceMappingURL=update.js.map