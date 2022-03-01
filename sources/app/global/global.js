"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppIcon = exports.isBuildInfo = exports.knownIstancesList = exports.trustedProtocolRegExp = exports.jsonOrJsonc = exports.objectsAreSameType = exports.discordFavicons = exports.isJsonSyntaxCorrect = exports.wLog = void 0;
const fs_1 = require("fs");
const electron_1 = require("./modules/electron");
const path_1 = require("path");
function wLog(msg) {
    console.log("%c[WebCord]", 'color: #69A9C1', msg);
}
exports.wLog = wLog;
function isJsonSyntaxCorrect(string) {
    try {
        JSON.parse(string);
    }
    catch {
        return false;
    }
    return true;
}
exports.isJsonSyntaxCorrect = isJsonSyntaxCorrect;
exports.discordFavicons = {
    default: '25522cef7e234ab001bbbc85c7a3f477b996e20b'
};
function objectsAreSameType(object1, object2) {
    if (!(object1 instanceof Object && object2 instanceof Object))
        return false;
    if (JSON.stringify(object1) === JSON.stringify(object2))
        return true;
    const obj1 = object1, obj2 = object2;
    const keyArray1 = [], keyArray2 = [];
    for (const key1 in obj1)
        keyArray1.push(key1);
    for (const key2 in obj2)
        keyArray2.push(key2);
    if (keyArray1.sort().toString() !== keyArray2.sort().toString())
        return false;
    for (const key of keyArray1) {
        if (Object.prototype.hasOwnProperty.call(obj1, key) && Object.prototype.hasOwnProperty.call(obj2, key))
            if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
                break;
            }
            else if (obj1[key] instanceof Object && obj2[key] instanceof Object) {
                const test = objectsAreSameType(obj1[key], obj2[key]);
                if (!test)
                    return false;
            }
            else if ((typeof (obj1[key]) !== typeof (obj2[key]))) {
                return false;
            }
    }
    return true;
}
exports.objectsAreSameType = objectsAreSameType;
function jsonOrJsonc(fileNoExtension) {
    if ((0, fs_1.existsSync)(fileNoExtension + '.jsonc'))
        return fileNoExtension + '.jsonc';
    else
        return fileNoExtension + '.json';
}
exports.jsonOrJsonc = jsonOrJsonc;
exports.trustedProtocolRegExp = /^(https:|mailto:|tel:|sms:)$/;
exports.knownIstancesList = {
    '0': ["Discord", new URL("https://discord.com/app")],
    '1': ["Fosscord", new URL("https://dev.fosscord.com/app")]
};
function isBuildInfo(object) {
    if (!(object instanceof Object))
        return false;
    if (!Object.prototype.hasOwnProperty.call(object, 'type'))
        return false;
    switch (object.type) {
        case 'release':
        case 'devel':
            break;
        default:
            return false;
    }
    if (Object.prototype.hasOwnProperty.call(object, 'commit'))
        if (!(typeof object.commit === 'string'))
            return false;
    const features = ['updateNotifications'];
    if (Object.prototype.hasOwnProperty.call(object, 'features'))
        if (!(object.features instanceof Object))
            return false;
        else
            for (const property of features)
                if (Object.prototype.hasOwnProperty.call(object.features, property))
                    if (typeof object.features[property] !== "boolean")
                        return false;
    return true;
}
exports.isBuildInfo = isBuildInfo;
function getAppIcon(sizes) {
    const defaultPath = (0, path_1.resolve)((0, electron_1.getAppPath)(), "sources/assets/icons/app.png");
    if ((0, fs_1.existsSync)(defaultPath))
        return defaultPath;
    for (const size of sizes)
        if ((0, fs_1.existsSync)("/usr/share/icons/hicolor/" + size.toString() + "x" + size.toString() + "/apps/webcord.png"))
            return "/usr/share/icons/hicolor/" + size.toString() + "x" + size.toString() + "/apps/webcord.png";
    return "";
}
exports.getAppIcon = getAppIcon;
//# sourceMappingURL=global.js.map