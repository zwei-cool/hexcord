declare enum modifiers_safe {
    bold = 1,
    underscore = 4,
    invert = 7
}
declare enum modifiers_other {
    grayedOut = 2,
    italic = 3,
    blink = 5,
    blink_2 = 6,
    strikethrough = 9
}
declare enum colors_16bit {
    black = 30,
    red = 31,
    green = 32,
    yellow = 33,
    blue = 34,
    purple = 35,
    cyan = 36,
    white = 37,
    blackBg = 40,
    redBg = 41,
    greenBg = 42,
    yellowBg = 43,
    blueBg = 44,
    magentaBg = 45,
    cyanBg = 46,
    whiteBg = 47,
    gray = 90,
    brightRed = 91,
    brightGreen = 92,
    brightYellow = 93,
    brightBlue = 94,
    brightMagenta = 95,
    brightCyan = 96,
    brightWhite = 97,
    grayBg = 100,
    brightRedBg = 101,
    brightGreenBg = 102,
    brightYellowBg = 103,
    brightBlueBg = 104,
    brightMagentaBg = 105,
    brightCyanBg = 106,
    brightWhiteBg = 107
}
declare type RecordLog<T extends Record<string, unknown>> = Record<keyof T, (value: string) => string>;
/**
 * An object containing multiple functions used to colorize the text.
 *
 * @example
 * // Print error in the console.
 * console.error(colors.red("[Error]")+" Something's not right...")
 */
export declare const colors: RecordLog<typeof colors_16bit>;
export declare const modifiers: {
    /**
     * Modifiers working fine across most popular platfroms/consoles.
     */
    safe: RecordLog<typeof modifiers_safe>;
    /**
     * Other modifiers that may not work with all consoles (e.g. `cmd.exe`).
     */
    other: RecordLog<typeof modifiers_other>;
};
declare const defaultExport: {
    unsafe: RecordLog<typeof modifiers_other>;
    bold: (value: string) => string;
    underscore: (value: string) => string;
    invert: (value: string) => string;
    black: (value: string) => string;
    red: (value: string) => string;
    green: (value: string) => string;
    yellow: (value: string) => string;
    blue: (value: string) => string;
    purple: (value: string) => string;
    cyan: (value: string) => string;
    white: (value: string) => string;
    blackBg: (value: string) => string;
    redBg: (value: string) => string;
    greenBg: (value: string) => string;
    yellowBg: (value: string) => string;
    blueBg: (value: string) => string;
    magentaBg: (value: string) => string;
    cyanBg: (value: string) => string;
    whiteBg: (value: string) => string;
    gray: (value: string) => string;
    brightRed: (value: string) => string;
    brightGreen: (value: string) => string;
    brightYellow: (value: string) => string;
    brightBlue: (value: string) => string;
    brightMagenta: (value: string) => string;
    brightCyan: (value: string) => string;
    brightWhite: (value: string) => string;
    grayBg: (value: string) => string;
    brightRedBg: (value: string) => string;
    brightGreenBg: (value: string) => string;
    brightYellowBg: (value: string) => string;
    brightBlueBg: (value: string) => string;
    brightMagentaBg: (value: string) => string;
    brightCyanBg: (value: string) => string;
    brightWhiteBg: (value: string) => string;
};
export default defaultExport;
//# sourceMappingURL=index.d.ts.map