"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifiers = exports.colors = void 0;
var modifiers_safe;
(function (modifiers_safe) {
    modifiers_safe[modifiers_safe["bold"] = 1] = "bold";
    modifiers_safe[modifiers_safe["underscore"] = 4] = "underscore";
    modifiers_safe[modifiers_safe["invert"] = 7] = "invert";
})(modifiers_safe || (modifiers_safe = {}));
var modifiers_other;
(function (modifiers_other) {
    modifiers_other[modifiers_other["grayedOut"] = 2] = "grayedOut";
    modifiers_other[modifiers_other["italic"] = 3] = "italic";
    modifiers_other[modifiers_other["blink"] = 5] = "blink";
    modifiers_other[modifiers_other["blink_2"] = 6] = "blink_2";
    modifiers_other[modifiers_other["strikethrough"] = 9] = "strikethrough";
})(modifiers_other || (modifiers_other = {}));
var colors_16bit;
(function (colors_16bit) {
    colors_16bit[colors_16bit["black"] = 30] = "black";
    colors_16bit[colors_16bit["red"] = 31] = "red";
    colors_16bit[colors_16bit["green"] = 32] = "green";
    colors_16bit[colors_16bit["yellow"] = 33] = "yellow";
    colors_16bit[colors_16bit["blue"] = 34] = "blue";
    colors_16bit[colors_16bit["purple"] = 35] = "purple";
    colors_16bit[colors_16bit["cyan"] = 36] = "cyan";
    colors_16bit[colors_16bit["white"] = 37] = "white";
    colors_16bit[colors_16bit["blackBg"] = 40] = "blackBg";
    colors_16bit[colors_16bit["redBg"] = 41] = "redBg";
    colors_16bit[colors_16bit["greenBg"] = 42] = "greenBg";
    colors_16bit[colors_16bit["yellowBg"] = 43] = "yellowBg";
    colors_16bit[colors_16bit["blueBg"] = 44] = "blueBg";
    colors_16bit[colors_16bit["magentaBg"] = 45] = "magentaBg";
    colors_16bit[colors_16bit["cyanBg"] = 46] = "cyanBg";
    colors_16bit[colors_16bit["whiteBg"] = 47] = "whiteBg";
    colors_16bit[colors_16bit["gray"] = 90] = "gray";
    colors_16bit[colors_16bit["brightRed"] = 91] = "brightRed";
    colors_16bit[colors_16bit["brightGreen"] = 92] = "brightGreen";
    colors_16bit[colors_16bit["brightYellow"] = 93] = "brightYellow";
    colors_16bit[colors_16bit["brightBlue"] = 94] = "brightBlue";
    colors_16bit[colors_16bit["brightMagenta"] = 95] = "brightMagenta";
    colors_16bit[colors_16bit["brightCyan"] = 96] = "brightCyan";
    colors_16bit[colors_16bit["brightWhite"] = 97] = "brightWhite";
    colors_16bit[colors_16bit["grayBg"] = 100] = "grayBg";
    colors_16bit[colors_16bit["brightRedBg"] = 101] = "brightRedBg";
    colors_16bit[colors_16bit["brightGreenBg"] = 102] = "brightGreenBg";
    colors_16bit[colors_16bit["brightYellowBg"] = 103] = "brightYellowBg";
    colors_16bit[colors_16bit["brightBlueBg"] = 104] = "brightBlueBg";
    colors_16bit[colors_16bit["brightMagentaBg"] = 105] = "brightMagentaBg";
    colors_16bit[colors_16bit["brightCyanBg"] = 106] = "brightCyanBg";
    colors_16bit[colors_16bit["brightWhiteBg"] = 107] = "brightWhiteBg";
})(colors_16bit || (colors_16bit = {}));
function shouldUseColors() {
    switch (process.argv.toString().match(/--color(?:,|=)(always|auto|never)/)?.[1] ?? "auto") {
        case "always":
            return true;
        case "never":
            return false;
        default:
            return (process.stdout.isTTY === true && process.stderr.isTTY === true);
    }
}
function enum2func(em) {
    const functions = {};
    // Generate colors functions:
    for (const key in em) {
        if (/^[0-9]+$/.test(key))
            continue;
        functions[key] = (value) => {
            if (shouldUseColors())
                return "\x1b[" + em[key].toString() + 'm' + value + "\x1b[0m";
            else
                return value;
        };
    }
    return functions;
}
/**
 * An object containing multiple functions used to colorize the text.
 *
 * @example
 * // Print error in the console.
 * console.error(colors.red("[Error]")+" Something's not right...")
 */
exports.colors = enum2func(colors_16bit);
exports.modifiers = {
    /**
     * Modifiers working fine across most popular platfroms/consoles.
     */
    safe: enum2func(modifiers_safe),
    /**
     * Other modifiers that may not work with all consoles (e.g. `cmd.exe`).
     */
    other: enum2func(modifiers_other)
};
const defaultExport = {
    ...exports.colors,
    ...exports.modifiers.safe,
    unsafe: exports.modifiers.other
};
exports.default = defaultExport;
//# sourceMappingURL=index.js.map