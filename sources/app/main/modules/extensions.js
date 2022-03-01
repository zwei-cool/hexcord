"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadChromiumExtensions = exports.loadStyles = void 0;
const error_1 = require("./error");
async function loadStyles(webContents) {
    const [{ app }, { readFile, readdir }, { watch, existsSync, mkdirSync }, { resolve }] = await Promise.all([
        Promise.resolve().then(() => require("electron")),
        Promise.resolve().then(() => require("fs/promises")),
        Promise.resolve().then(() => require("fs")),
        Promise.resolve().then(() => require("path"))
    ]);
    const stylesDir = resolve(app.getPath("userData"), "Themes");
    if (!existsSync(stylesDir))
        mkdirSync(stylesDir, { recursive: true });
    const callback = () => new Promise((callback, reject) => {
        readdir(stylesDir)
            .then(paths => {
            for (const directory of paths)
                readdir(resolve(stylesDir, directory))
                    .then(paths => {
                    const promises = [];
                    if (paths.includes("index.css")) {
                        const index = resolve(stylesDir, directory, "index.css");
                        promises.push(readFile(index));
                        if (process.platform !== "win32" && process.platform !== "darwin") {
                            const fsWatch = watch(index);
                            fsWatch.once("change", () => {
                                webContents.reload();
                            });
                            webContents.once("did-finish-load", () => fsWatch.close());
                        }
                    }
                    Promise.all(promises).then(dataArray => {
                        const themeIDs = [];
                        for (const data of dataArray)
                            themeIDs.push(webContents.insertCSS(data.toString(), { cssOrigin: 'user' }));
                        callback(themeIDs);
                    }).catch(reason => reject(reason));
                })
                    .catch(reason => reject(reason));
        })
            .catch(reason => reject(reason));
    });
    if (process.platform === "win32" || process.platform === "darwin")
        watch(stylesDir, { recursive: true }).once("change", () => {
            webContents.reload();
        });
    callback().catch(error_1.commonCatches.print);
}
exports.loadStyles = loadStyles;
async function loadChromiumExtensions(session) {
    const [{ app }, { readdir }, { existsSync, mkdirSync }, { resolve }] = await Promise.all([
        Promise.resolve().then(() => require("electron")),
        Promise.resolve().then(() => require("fs/promises")),
        Promise.resolve().then(() => require("fs")),
        Promise.resolve().then(() => require("path"))
    ]);
    const extDir = resolve(app.getPath("userData"), "Extensions", "Chrome");
    if (!existsSync(extDir)) {
        mkdirSync(extDir, { recursive: true });
        return;
    }
    readdir(extDir, { withFileTypes: true }).then(paths => {
        for (const path of paths)
            if (path.isDirectory() && session.isPersistent())
                session.loadExtension(resolve(extDir, path.name))
                    .catch(error_1.commonCatches.print);
    }).catch(error_1.commonCatches.print);
}
exports.loadChromiumExtensions = loadChromiumExtensions;
//# sourceMappingURL=extensions.js.map