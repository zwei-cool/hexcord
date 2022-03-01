"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const config_1 = require("../modules/config");
const global_1 = require("../../global/global");
const client_1 = require("../modules/client");
const l10n_1 = require("../../global/modules/l10n");
const parent_1 = require("../modules/parent");
const appConfig = new config_1.AppConfig();
function instances2forms() {
    const instanceForms = [];
    for (const instance in global_1.knownIstancesList)
        instanceForms.push({
            label: global_1.knownIstancesList[instance][0],
            value: parseInt(instance),
            isChecked: appConfig.get().currentInstance === parseInt(instance)
        });
    return instanceForms;
}
function conf2html(config) {
    const lang = (new l10n_1.default()).client.settings;
    const websitesThirdParty = [
        ['algolia', 'Algolia'],
        ['spotify', 'Spotify'],
        ['hcaptcha', 'hCaptcha'],
        ['paypal', 'PayPal'],
        ['gif', lang.advanced.group.csp.extends.thirdparty.list.gifProviders],
        ['youtube', 'YouTube'],
        ['twitter', 'Twitter'],
        ['twitch', 'Twitch'],
        ['streamable', 'Streamable'],
        ['vimeo', 'Vimeo'],
        ['funimation', 'Funimation'],
        ['audius', 'Audius'],
        ['soundcloud', 'SoundCloud'],
        ['reddit', 'Reddit']
    ];
    const cspChecklist = [];
    for (const stringGroup of websitesThirdParty.sort()) {
        cspChecklist.push({
            label: stringGroup[1],
            id: "csp.thirdparty." + stringGroup[0],
            isChecked: appConfig.get().csp.thirdparty[stringGroup[0]]
        });
    }
    const csp = {
        name: lang.advanced.group.csp.name + ' – ' + lang.advanced.group.csp.extends.thirdparty.name,
        description: lang.advanced.group.csp.extends.thirdparty.description,
        type: 'checkbox',
        forms: cspChecklist
    };
    const general = {
        title: lang.basic.name,
        options: [
            {
                name: lang.basic.group.menuBar.name,
                description: lang.basic.group.menuBar.description,
                type: 'checkbox',
                forms: [
                    {
                        label: lang.basic.group.menuBar.label,
                        isChecked: config.get().hideMenuBar,
                        id: 'hideMenuBar'
                    }
                ]
            },
            {
                name: lang.basic.group.tray.name,
                description: lang.basic.group.tray.description,
                type: 'checkbox',
                forms: [
                    {
                        label: lang.basic.group.tray.label,
                        isChecked: config.get().disableTray,
                        id: 'disableTray'
                    }
                ]
            }
        ]
    };
    const privacy = {
        title: lang.privacy.name,
        options: [
            {
                name: lang.privacy.group.blockApi.name,
                description: lang.privacy.group.blockApi.description,
                type: 'checkbox',
                forms: [
                    {
                        label: lang.privacy.group.blockApi.label.science,
                        id: 'blockApi.science',
                        isChecked: config.get().blockApi.science
                    },
                    {
                        label: lang.privacy.group.blockApi.label.typingIndicator,
                        id: 'blockApi.typingIndicator',
                        isChecked: config.get().blockApi.typingIndicator
                    }
                ]
            },
            {
                name: lang.privacy.group.permissions.name,
                description: lang.privacy.group.permissions.description,
                type: 'checkbox',
                forms: [
                    {
                        label: lang.privacy.group.permissions.label.camera,
                        id: 'permissions.video',
                        isChecked: config.get().permissions.video
                    },
                    {
                        label: lang.privacy.group.permissions.label.microphone,
                        id: 'permissions.audio',
                        isChecked: config.get().permissions.audio
                    },
                    {
                        label: lang.privacy.group.permissions.label.fullscreen,
                        id: 'permissions.fullscreen',
                        isChecked: config.get().permissions.fullscreen
                    },
                    {
                        label: lang.privacy.group.permissions.label.desktopCapture,
                        id: 'permissions.display-capture',
                        isChecked: config.get().permissions["display-capture"]
                    },
                    {
                        label: lang.privacy.group.permissions.label.notifications,
                        id: 'permissions.notifications',
                        isChecked: config.get().permissions.notifications
                    }
                ]
            }
        ]
    };
    const advanced = {
        title: lang.advanced.name,
        options: [
            {
                ...lang.advanced.group.instance,
                type: 'radio',
                id: 'currentInstance',
                forms: instances2forms()
            },
            {
                name: lang.advanced.group.csp.name,
                description: lang.advanced.group.csp.extends.enable.description,
                type: 'checkbox',
                forms: [{
                        label: lang.advanced.group.csp.extends.enable.label,
                        id: 'csp.enabled',
                        isChecked: config.get().csp.enabled
                    }],
            },
            csp,
            {
                name: lang.advanced.group.crossOrigin.name,
                description: lang.advanced.group.crossOrigin.description,
                type: 'checkbox',
                forms: [{
                        label: lang.advanced.group.crossOrigin.label,
                        id: 'redirectionWarning',
                        isChecked: config.get().redirectionWarning
                    }]
            },
            {
                name: lang.advanced.group.devel.name,
                description: lang.advanced.group.devel.description,
                type: 'checkbox',
                hidden: (0, client_1.getBuildInfo)().type === "devel",
                forms: [{
                        label: lang.advanced.group.devel.label,
                        id: 'devel',
                        isChecked: config.get().devel
                    }],
            }
        ]
    };
    return [general, privacy, advanced];
}
function loadSettingsWindow(parent) {
    const configWithStrings = conf2html(appConfig);
    if (!parent.isVisible())
        parent.show();
    const settingsWindow = (0, parent_1.initWindow)("settings", parent, {
        minWidth: client_1.appInfo.minWinWidth,
        minHeight: client_1.appInfo.minWinHeight,
    });
    if (settingsWindow === undefined)
        return;
    electron_1.ipcMain.on('settings-generate-html', (event) => {
        if (!settingsWindow.isDestroyed())
            settingsWindow.show();
        event.reply('settings-generate-html', configWithStrings);
    });
    return settingsWindow;
}
exports.default = loadSettingsWindow;
electron_1.ipcMain.on('settings-config-modified', (_event, config) => {
    appConfig.set(config);
});
//# sourceMappingURL=settings.js.map