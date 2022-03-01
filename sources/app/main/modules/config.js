"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinStateKeeper = exports.AppConfig = void 0;
const fs = require("fs");
const electron_1 = require("electron");
const path_1 = require("path");
const client_1 = require("./client");
const global_1 = require("../../global/global");
const deepmerge_ts_1 = require("deepmerge-ts");
const defaultAppConfig = {
    hideMenuBar: false,
    disableTray: false,
    devel: false,
    redirectionWarning: true,
    csp: {
        enabled: true,
        thirdparty: {
            spotify: true,
            gif: true,
            hcaptcha: true,
            youtube: true,
            twitter: true,
            twitch: true,
            streamable: true,
            vimeo: true,
            soundcloud: true,
            paypal: true,
            audius: true,
            algolia: true,
            funimation: true,
            reddit: true
        }
    },
    blockApi: {
        typingIndicator: false,
        science: true,
    },
    permissions: {
        "video": false,
        "audio": false,
        "fullscreen": true,
        "notifications": false,
        "display-capture": true
    },
    currentInstance: 0,
};
class Config {
    constructor(path, spaces) {
        this.spaces = 4;
        if (path !== undefined)
            this.path = path;
        if (spaces !== undefined && spaces > 0)
            this.spaces = spaces;
    }
    write(object) {
        fs.writeFileSync(this.path, JSON.stringify(object, null, this.spaces));
    }
    set(object) {
        const oldObject = this.get();
        const newObject = (0, deepmerge_ts_1.deepmerge)(oldObject, object);
        if ((0, global_1.objectsAreSameType)(newObject, oldObject))
            this.write(newObject);
    }
    get() {
        const parsedConfig = JSON.parse(fs.readFileSync(this.path).toString());
        const mergedConfig = (0, deepmerge_ts_1.deepmerge)(this.defaultConfig, parsedConfig);
        if ((0, global_1.objectsAreSameType)(mergedConfig, this.defaultConfig))
            return mergedConfig;
        else
            return this.defaultConfig;
    }
}
class AppConfig extends Config {
    constructor(path, spaces) {
        super(path, spaces);
        this.defaultConfig = defaultAppConfig;
        this.path = (0, path_1.resolve)(electron_1.app.getPath('userData'), 'config.json');
        if (!fs.existsSync(this.path))
            this.write(this.defaultConfig);
        else {
            if (!(0, global_1.isJsonSyntaxCorrect)(fs.readFileSync(this.path).toString()))
                fs.rmSync(this.path);
            this.write({ ...this.defaultConfig, ...this.get() });
        }
    }
}
exports.AppConfig = AppConfig;
class WinStateKeeper extends Config {
    constructor(windowName, path, spaces) {
        super(path, spaces);
        this.path = (0, path_1.resolve)(electron_1.app.getPath('userData'), 'windowState.json');
        this.windowName = windowName;
        this.defaultConfig = {
            [this.windowName]: {
                width: client_1.appInfo.minWinWidth + (electron_1.screen.getPrimaryDisplay().workAreaSize.width / 3),
                height: client_1.appInfo.minWinHeight + (electron_1.screen.getPrimaryDisplay().workAreaSize.height / 3),
                isMaximized: false
            }
        };
        if (!fs.existsSync(this.path))
            this.write(this.defaultConfig);
        else {
            if (!(0, global_1.isJsonSyntaxCorrect)(fs.readFileSync(this.path).toString()))
                fs.rmSync(this.path);
            this.write({ ...this.defaultConfig, ...this.get() });
        }
        this.initState = {
            width: this.get()[this.windowName].width,
            height: this.get()[this.windowName].height,
            isMaximized: this.get()[this.windowName].isMaximized
        };
    }
    setState(window, eventType) {
        let event = eventType;
        if (eventType === "resize" && window.isMaximized())
            event = "maximize";
        else if (eventType === "resize" && this.get()[this.windowName].isMaximized)
            event = "unmaximize";
        switch (event) {
            case "maximize":
            case "unmaximize":
                this.set({
                    [this.windowName]: {
                        width: this.get()[this.windowName].width,
                        height: this.get()[this.windowName].height,
                        isMaximized: window.isMaximized()
                    }
                });
                break;
            default:
                this.set({
                    [this.windowName]: {
                        width: window.getNormalBounds().width,
                        height: window.getNormalBounds().height,
                        isMaximized: window.isMaximized()
                    }
                });
        }
        console.debug("[WIN] State changed to: " + JSON.stringify(this.get()[this.windowName]));
        console.debug("[WIN] Electron event: " + (eventType ?? "not definied"));
        if (event !== eventType)
            console.debug("[WIN] Actual event calculated by WebCord: " + (event ?? "unknown"));
    }
    watchState(window) {
        window.on('resize', () => setTimeout(() => this.setState(window, 'resize'), 100));
        window.on('unmaximize', () => this.setState(window, 'unmaximize'));
        window.on('maximize', () => this.setState(window, 'maximize'));
    }
}
exports.WinStateKeeper = WinStateKeeper;
//# sourceMappingURL=config.js.map