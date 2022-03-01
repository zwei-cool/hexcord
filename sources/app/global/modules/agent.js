"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAgent = void 0;
const os = require("os");
function getAgentArch() {
    switch (os.arch()) {
        case 'arm64': return "aarch64";
        case 'arm': return "armv7";
        case 'ia32': return "x86";
        case 'x64': return "x86_64";
        default: return os.arch();
    }
}
function getUserAgent(chromeVersion, platform) {
    const userAgentPlatfom = platform ?? process.platform;
    let fakeUserAgent;
    const OS = (typeof process.getSystemVersion === 'function' ?
        process.getSystemVersion() :
        (userAgentPlatfom === 'darwin' ? '12.0' : os.release())).split('.');
    let osVersion, WOW64;
    switch (userAgentPlatfom) {
        case 'darwin':
            osVersion = OS[0] + '_' + OS[1];
            if (OS[2] && OS[2] != "0")
                osVersion += '_' + OS[2];
            fakeUserAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
            break;
        case 'win32':
            osVersion = OS[0] + '.' + OS[1];
            OS[0] == "10" ? WOW64 = "Win64; x64" : WOW64 = "WOW64";
            fakeUserAgent = 'Mozilla/5.0 (Windows NT ' + osVersion + '; ' + WOW64 + ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + chromeVersion + ' Safari/537.36';
            break;
        case 'android':
            fakeUserAgent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + chromeVersion + ' Mobile Safari/537.36';
            break;
        default:
            fakeUserAgent = 'Mozilla/5.0 (X11; ' + os.type() + ' ' + getAgentArch() + ') AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + chromeVersion + ' Safari/537.36';
    }
    return fakeUserAgent;
}
exports.getUserAgent = getUserAgent;
//# sourceMappingURL=agent.js.map