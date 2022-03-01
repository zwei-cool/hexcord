"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsonc_parser_1 = require("@spacingbat3/jsonc-parser");
const path = require("path");
const fs = require("fs");
const deepmerge_ts_1 = require("deepmerge-ts");
const electron_1 = require("electron");
const global_1 = require("../global");
const events_1 = require("events");
const electron_2 = require("./electron");
const langDialog = new events_1.EventEmitter();
langDialog.once('show-error', (localizedStrings) => {
    (0, electron_2.showMessageBox)({
        title: "Error loading translations for locale: '" + (0, electron_2.getLocale)().toLocaleUpperCase() + "'!",
        type: "error",
        message: "An error occured while loading 'strings' from file: '" +
            (0, global_1.jsonOrJsonc)(localizedStrings) + "'. " +
            "Please make sure that the file syntax is correct!\n\n" +
            "This will lead to " + (0, electron_2.getName)() + " use English strings instead."
    });
});
class l10n {
    constructor() {
        this.client = {
            tray: {
                toggle: "Toggle",
                quit: "Quit"
            },
            context: {
                copy: "Copy",
                paste: "Paste",
                cut: "Cut",
                dictionaryAdd: "Add to the local dictionary",
                copyURL: "Copy link address",
                copyURLText: "Copy link text",
                inspectElement: "Inspect"
            },
            menubar: {
                enabled: "Enabled",
                file: {
                    groupName: "File",
                    quit: "Quit",
                    relaunch: "Relaunch",
                    addon: {
                        groupName: "Extensions",
                        loadNode: "Load node extension",
                        loadChrome: "Load Chrome extension"
                    }
                },
                edit: {
                    groupName: "Edit",
                    undo: "Undo",
                    redo: "Redo"
                },
                view: {
                    groupName: "View",
                    reload: "Reload",
                    forceReload: "Force reload",
                    devTools: "Toggle Developer Tools",
                    resetZoom: "Actual size",
                    zoomIn: "Zoom in",
                    zoomOut: "Zoom out",
                    fullScreen: "Toggle fullscreen"
                },
                window: {
                    groupName: "Window",
                    mobileMode: "Hide side bar"
                }
            },
            windows: {
                settings: "Settings",
                about: "About",
                docs: "Documentation",
                invite: "Invite"
            },
            dialog: {
                common: {
                    error: "Error",
                    warning: "Warning",
                    continue: "&Continue",
                    yes: "&Yes",
                    no: "&No",
                    source: "Source"
                },
                ver: {
                    updateBadge: "[UPDATE]",
                    updateTitle: "Update available!",
                    update: "New application version is available!",
                    recent: "Application is up-to-date!",
                    devel: "You're using the non-production build.",
                    downgrade: "Your production build is to newer than stable!"
                },
                permission: {
                    request: {
                        denied: "%s: Permission request to %s denied."
                    },
                    check: {
                        denied: "%s: Permission check to %s denied."
                    }
                },
                mod: {
                    nodeExt: "WebCord Node.js Addon",
                    crx: "Chrome/Chromium Extension"
                },
                externalApp: {
                    title: "Opening link in external app.",
                    message: "A website tries to redirect link with the different origin to the external application. Continue anyway?",
                },
                hideMenuBar: "Because you've set the option to hide the menu bar, you'll gain no access to it after you restart the app, unless you press the [ALT] key to temporarily unhide menu bar."
            },
            help: {
                groupName: "Help",
                repo: "Repository",
                bugs: "Report a bug",
                contributors: "Authors and contributors:",
                credits: "Thanks to GyozaGuy for his Electron Discord app – it was a good source to learn about the Electron API and how make with it a Discord web app."
            },
            settings: {
                basic: {
                    name: "Basic",
                    group: {
                        menuBar: {
                            name: "Menu bar",
                            description: "Changes visibility settings of native menu bar.",
                            label: "Hide menu bar automatically (<kbd>ALT</kbd> key switches the visibility)."
                        },
                        tray: {
                            name: "Tray",
                            description: "Changes the visibility of the icon in the system tray.",
                            label: "Disable hiding window to the system tray functionality."
                        }
                    }
                },
                privacy: {
                    name: "Privacy",
                    group: {
                        blockApi: {
                            name: 'Discord API blocking',
                            description: 'Blocks Discord API requests for hardening the privacy.',
                            label: {
                                science: 'Block known telemetry endpoints (<code>/science</code> and <code>/tracing</code>).',
                                typingIndicator: 'Block typing indicator (<code>/typing</code>).'
                            }
                        },
                        permissions: {
                            name: 'Permissions',
                            description: 'Allows or denies the permission checks and request from the Discord website. Please note that other permissions not listed here are blocked automatically by WebCord.',
                            label: {
                                camera: 'Camera',
                                microphone: 'Microphone',
                                fullscreen: 'Fullscreen',
                                desktopCapture: 'Desktop capture',
                                notifications: 'Notifications'
                            }
                        }
                    }
                },
                advanced: {
                    name: "Advanced",
                    group: {
                        devel: {
                            name: "Developer mode",
                            description: "Enables the access to tools and unfinished options that are potentially considered as broken or dangerous. Disclaimer: application maintainers are not responsible for any bugs or issues after this option is enabled – please do not report them!",
                            label: "Enable developer mode"
                        },
                        csp: {
                            name: "Content Security Policy",
                            extends: {
                                thirdparty: {
                                    name: "Third party websites",
                                    description: "Sets a list of the third-party websites allowed to connect or display content.",
                                    list: {
                                        gifProviders: "GIF Providers"
                                    }
                                },
                                enable: {
                                    description: "Switches whenever application should ignore Discord's Content Security Policy headers and let client set its own CSP for privacy and security concerns.",
                                    label: "Use in-app Content Security Policy"
                                },
                            }
                        },
                        crossOrigin: {
                            name: "Cross-origin redirection behavior.",
                            description: "Controls the actions on cross-origin redirections. <b>This affects application security</b>.",
                            label: "Always warn user about cross-origin redirections to external applications."
                        },
                        instance: {
                            name: "Discord instance.",
                            description: "Selects the instance to which Webcord should connect. <b>Experimental<b> as Fosscord implementation is not fully finished yet.",
                        }
                    }
                }
            },
            misc: {
                singleInstance: "Switching to the existing window..."
            }
        };
        this.web = {
            offline: {
                title: "Cannot connect to the Discord service.",
                description: "Please make sure you're connected to the internet."
            },
            aboutWindow: {
                nav: {
                    about: "About",
                    credits: "Contributors",
                    licenses: "Licenses"
                },
                about: {
                    appDescription: "Discord and Fosscord web client with privacy-focused features.",
                    appRepo: "GitHub Repository"
                },
                credits: {
                    people: {
                        author: "Author, maintainer and main developer.",
                        contributors: {
                            default: "Code contributor."
                        }
                    }
                },
                licenses: {
                    appLicenseTitle: "Application license",
                    appLicenseBody: "%s is a free software: you can use, modify and redistribute it under terms of MIT license, which should be distributed with this software.",
                    showLicense: "Show license",
                    thirdPartyLicensesTitle: "Third party licenses",
                    thirdPartyLicensesBody: "%s depends on following third party software:",
                    licensedUnder: "under %s license",
                    packageAuthors: "%s authors"
                },
            }
        };
        this.client = this.loadFile('client');
        this.web = this.loadFile('web');
    }
    loadFile(type) {
        let finalStrings = this[type];
        let localStrings;
        let internalStringsFile = path.resolve((0, electron_2.getAppPath)(), "sources/assets/translations/" + (0, electron_2.getLocale)() + "/" + type.toString());
        const externalStringsFile = path.resolve(path.dirname((0, electron_2.getAppPath)()), 'translations/' + (0, electron_2.getLocale)() + "/" + type.toString());
        if (!fs.existsSync((0, global_1.jsonOrJsonc)(internalStringsFile)))
            internalStringsFile = externalStringsFile;
        if (process.type === 'browser' && !electron_1.app.isReady())
            console.warn("[WARN] Electron may fail loading localized strings,\n" +
                "       because the app hasn't still emitted the 'ready' event!\n" +
                "[WARN] In this case, English strings will be used as a fallback.\n");
        if (fs.existsSync((0, global_1.jsonOrJsonc)(internalStringsFile))) {
            localStrings = jsonc_parser_1.default.parse({ path: (0, global_1.jsonOrJsonc)(internalStringsFile) });
            finalStrings = (0, deepmerge_ts_1.deepmerge)(this[type], localStrings);
        }
        if ((0, global_1.objectsAreSameType)(finalStrings, this[type])) {
            return finalStrings;
        }
        else {
            langDialog.emit('show-error', internalStringsFile);
            return this[type];
        }
    }
}
exports.default = l10n;
//# sourceMappingURL=l10n.js.map