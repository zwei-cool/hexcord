"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const package_1 = require("../global/modules/package");
const fs_1 = require("fs");
const path_1 = require("path");
const projectPath = (0, path_1.resolve)(__dirname, '../../..');
const iconFile = "sources/assets/icons/app";
const desktopGeneric = "Internet Messenger";
const desktopCategories = ["Network", "InstantMessaging"];
function getCommit() {
    const refsPath = (0, fs_1.readFileSync)((0, path_1.resolve)(projectPath, '.git/HEAD'))
        .toString()
        .split(': ')[1]
        ?.trim();
    if (refsPath)
        return (0, fs_1.readFileSync)((0, path_1.resolve)(projectPath, '.git', refsPath)).toString().trim();
}
function getBuildID() {
    switch (process.env.WEBCORD_BUILD?.toLocaleLowerCase()) {
        case "release":
        case "stable":
            return "release";
        default:
            return "devel";
    }
}
const config = {
    buildIdentifier: getBuildID,
    packagerConfig: {
        executableName: package_1.default.data.name,
        asar: process.env.WEBCORD_ASAR !== "false",
        icon: iconFile,
        extraResource: [
            "LICENSE"
        ],
        quiet: true,
        ignore: [
            /sources\/app\/.build/,
            /out\//,
            /\.eslintrc\.json$/,
            /tsconfig\.json$/,
            /sources\/app\/forge\/config\..*/,
            /sources\/code\/.*/,
            /sources\/assets\/icons\/app\.ic(?:o|ns)$/,
            /^\.[a-z]+$/,
            /.*\/\.[a-z]+$/
        ]
    },
    makers: [
        {
            name: "@electron-forge/maker-zip",
            platforms: ["win32"]
        },
        {
            name: "@electron-forge/maker-dmg",
            config: {
                icon: iconFile + ".icns",
                debug: getBuildID() === "devel"
            }
        },
        {
            name: "electron-forge-maker-appimage",
            config: {
                options: {
                    icon: iconFile + ".png",
                    genericName: desktopGeneric,
                    categories: desktopCategories,
                    compression: "gzip"
                }
            }
        },
        {
            name: "@electron-forge/maker-deb",
            config: {
                options: {
                    icon: iconFile + ".png",
                    section: "web",
                    genericName: desktopGeneric,
                    categories: desktopCategories
                }
            }
        },
        {
            name: "@electron-forge/maker-rpm",
            config: {
                options: {
                    icon: iconFile + ".png",
                    genericName: desktopGeneric,
                    categories: desktopCategories
                }
            }
        },
    ],
    publishers: [
        {
            name: "@electron-forge/publisher-github",
            config: {
                prerelease: getBuildID() === "devel",
                repository: {
                    owner: package_1.default.data.author ? new package_1.Person(package_1.default.data.author).name : "SpacingBat3",
                    name: "WebCord"
                },
                draft: false
            }
        }
    ],
    hooks: {
        packageAfterCopy: async (_ForgeConfig, path) => {
            const buildConfig = {
                type: getBuildID(),
                commit: getBuildID() === "devel" ? getCommit() : undefined,
                features: {
                    updateNotifications: process.env.WEBCORD_UPDATE_NOTIFICATIONS !== "false"
                }
            };
            (0, fs_1.writeFileSync)((0, path_1.resolve)(path, 'buildInfo.json'), JSON.stringify(buildConfig, null, 2));
            return Promise.resolve();
        }
    }
};
module.exports = config;
//# sourceMappingURL=forge.js.map