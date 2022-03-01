"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parent_1 = require("./parent");
const kolor_1 = require("@spacingbat3/kolor");
const global_1 = require("../../global/global");
function wsLog(message, ...args) {
    console.log(kolor_1.default.bold(kolor_1.default.brightMagenta("[WebSocket]")) + " " + message, ...args);
}
function range(start, end) {
    return Array.from({ length: end - start + 1 }, (_v, k) => start + k);
}
function isInviteResponse(data) {
    if (!(data instanceof Object))
        return false;
    if (typeof data.cmd !== 'string')
        return false;
    if (typeof data.args.code !== 'string')
        return false;
    if (typeof data.cmd !== 'string')
        return false;
    return true;
}
const messages = {
    handShake: {
        cmd: "DISPATCH",
        data: {
            v: 1,
            config: {
                cdn_host: "cdn.discordapp.com",
                api_endpoint: "//discord.com/api",
                environment: "production"
            }
        },
        evt: "READY",
        nonce: null
    }
};
async function getServer(port) {
    const { WebSocketServer } = await Promise.resolve().then(() => require("ws"));
    return new Promise((resolve) => {
        const wss = new WebSocketServer({ port });
        wss.once('listening', () => resolve(wss));
        wss.once('error', () => resolve(null));
    });
}
async function startServer(window) {
    let wss = null, wsPort = 6463;
    for (const port of range(6463, 6472)) {
        wss = await getServer(port);
        if (wss !== null) {
            wsLog("Listening at port: " + kolor_1.default.underscore(port.toString()));
            wsPort = port;
            break;
        }
    }
    if (wss === null)
        return;
    wss.on('connection', (wss) => {
        wss.send(JSON.stringify(messages.handShake));
        wss.on('message', (data, isBinary) => {
            let parsedData = data;
            if (!isBinary)
                parsedData = data.toString();
            if ((0, global_1.isJsonSyntaxCorrect)(parsedData))
                parsedData = JSON.parse(parsedData);
            if (isInviteResponse(parsedData)) {
                wss.send(JSON.stringify({
                    cmd: parsedData.cmd,
                    data: {
                        invite: null,
                        code: parsedData.args.code
                    },
                    evt: null,
                    nonce: parsedData.nonce
                }));
                wsLog("Invite code: " + parsedData.args.code);
                const child = (0, parent_1.initWindow)("invite", window);
                if (child === undefined)
                    return;
                void child.loadURL('https://discord.com/invite/' + parsedData.args.code);
                child.webContents.once("did-finish-load", () => {
                    child.show();
                });
                child.webContents.once("will-navigate", () => {
                    child.close();
                });
                child.webContents.session.webRequest.onBeforeRequest({
                    urls: ['ws://127.0.0.1:' + wsPort.toString() + '/*']
                }, (_details, callback) => callback({ cancel: true }));
            }
        });
    });
}
exports.default = startServer;
//# sourceMappingURL=socket.js.map