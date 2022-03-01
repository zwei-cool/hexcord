"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonCatches = void 0;
const electron_1 = require("electron");
const kolor_1 = require("@spacingbat3/kolor");
exports.commonCatches = {
    print: (reason) => {
        if (reason instanceof Error)
            console.error(reason.message);
        else
            console.error(reason);
    },
    throw: (reason) => {
        if (reason instanceof Error)
            throw reason;
        else if (typeof reason === "string")
            throw new Error(reason);
    }
};
async function handleWithGUI(wasReady, name, message, stack, stackColor, error) {
    if (!electron_1.app.isReady())
        await electron_1.app.whenReady();
    if (wasReady)
        console.error('\n' + kolor_1.default.red(kolor_1.default.bold(name)) + kolor_1.default.blue(message) + stackColor);
    electron_1.dialog.showMessageBoxSync({
        title: name,
        message: error.message + stack,
        type: 'error'
    });
    let errCode;
    switch (error.name) {
        case "Error":
            if (error.errno || error.code || error.syscall || error.path)
                errCode = 99;
            else
                errCode = 101;
            break;
        case "TypeError":
            errCode = 102;
            break;
        case "SyntaxError":
            errCode = 103;
            break;
        case "RangeError":
            errCode = 104;
            break;
        case "EvalError":
            errCode = 105;
            break;
        case "RefferenceError":
            errCode = 106;
            break;
        case "URIError":
            errCode = 107;
            break;
        case "AggregateError":
            errCode = 108;
            break;
        default:
            errCode = 100;
    }
    console.error("\nApplication crashed (Error code: " + errCode.toString() + (error.errno ? ", ERRNO: " + error.errno.toString() : "") + ")\n");
    electron_1.app.exit(errCode);
}
function uncaughtExceptionHandler() {
    process.removeAllListeners('uncaughtException').on('uncaughtException', (error) => {
        let wasReady = false;
        if (electron_1.app.isReady())
            wasReady = true;
        let stack = "", message = "", stackColor = "";
        const name = "UncaughtException: " + electron_1.app.getName() + " threw '" + error.name + "'.";
        if (error.message !== "")
            message = "\n\n" + error.message;
        if (error.stack !== undefined) {
            stack = "\n" + error.stack
                .replace(error.name + ': ' + error.message, '');
            stackColor = stack;
            const stackLines = stack.split(/\r\n|\n|\r/);
            const stackProcessed = [], stackColorProcessed = [];
            for (const line of stackLines) {
                const regexAppPath = electron_1.app.getAppPath().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                if (line.match(RegExp("at.*\\(" + regexAppPath + ".*\\).*", 'g'))) {
                    let modifiedLine = line;
                    const tsRule = line.match(/\(\/.*\.ts.*\)/);
                    if (tsRule)
                        modifiedLine = line.replace(tsRule[0].replace(new RegExp("\\((" + regexAppPath + "\\/).*\\)"), "$1"), "");
                    stackProcessed.push(modifiedLine);
                    stackColorProcessed.push(modifiedLine);
                }
                else {
                    stackColorProcessed.push(kolor_1.default.gray(line));
                }
            }
            if (error.message !== "")
                stack = "\n\n" + stackProcessed.join('\n');
            else
                stack = stackProcessed.join('\n');
            stackColor = stackColorProcessed.join('\n');
        }
        handleWithGUI(wasReady, name, message, stack, stackColor, error).catch(() => electron_1.app.exit(200));
    });
}
exports.default = uncaughtExceptionHandler;
//# sourceMappingURL=error.js.map