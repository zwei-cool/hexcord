"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const global_1 = require("../../global/global");
const electron_2 = require("../../global/modules/electron");
const path_1 = require("path");
const l10n_1 = require("../../global/modules/l10n");
const package_1 = require("../../global/modules/package");
const crypto_1 = require("crypto");
async function getUserAvatar(person, size = 96) {
    const sources = [], promises = [], controler = new AbortController();
    sources.push("https://github.com/" + encodeURIComponent(person.name) + ".png?size=" + size.toString());
    if (person.email)
        sources.push("https://gravatar.com/avatar/" + (0, crypto_1.createHash)("md5").update(person.email).digest('hex') + '?d=404&s=' + size.toString());
    for (const source of sources) {
        promises.push(fetch(source, { signal: controler.signal }).then(async (data) => {
            if (data.ok && data.headers.get("Content-Type")?.startsWith("image")) {
                const blobUrl = URL.createObjectURL(await data.blob());
                const image = document.createElement('img');
                image.src = blobUrl;
                image.addEventListener('load', () => URL.revokeObjectURL(blobUrl));
                return image;
            }
            else if (data.ok)
                throw new Error('[Avatar] Not an image!');
            else
                throw new Error('[Avatar] HTTP ' + data.status.toString() + data.statusText);
        }));
    }
    return await Promise.any(promises).finally(() => controler.abort());
}
function addContributor(person, role) {
    const container = document.createElement('div');
    const description = document.createElement('div');
    getUserAvatar(person)
        .then(avatar => container.appendChild(avatar))
        .finally(() => container.appendChild(description));
    container.classList.add("contributor");
    const nameElement = document.createElement('h2');
    const link = document.createElement('a');
    if (typeof person.url === 'string')
        link.href = person.url;
    else if (typeof person.email === 'string')
        link.href = 'mailto:' + person.email;
    if (link.href !== '') {
        link.innerText = person.name;
        link.rel = "noreferrer";
        link.target = "_blank";
        nameElement.appendChild(link);
    }
    else {
        link.remove();
        nameElement.innerText = person.name;
    }
    description.appendChild(nameElement);
    if (role) {
        const roleElement = document.createElement('p');
        roleElement.classList.add("description");
        roleElement.innerText = role;
        description.appendChild(roleElement);
    }
    document.getElementById("credits")?.appendChild(container);
}
const locks = {
    dialog: false
};
function showAppLicense() {
    if (!locks.dialog) {
        locks.dialog = true;
        void Promise.resolve().then(() => require('fs/promises')).then(fs => fs.readFile)
            .then(read => read((0, path_1.resolve)((0, electron_2.getAppPath)(), 'LICENSE')))
            .then(data => data.toString())
            .then(license => {
            const dialog = document.createElement('div');
            const content = document.createElement('div');
            dialog.classList.add('dialog');
            console.log(license.replace(/\n(!=[^\n])/g, ' '));
            content.innerText = license.replace(/(?<!\n)\n(?!\n)/g, ' ');
            dialog.appendChild(content);
            document.getElementById("licenses")?.appendChild(dialog);
            dialog.addEventListener('click', () => {
                dialog.remove();
                locks.dialog = false;
            });
        });
    }
}
function generateAppContent(l10n, details) {
    const nameElement = document.getElementById("appName");
    const versionElement = document.getElementById("appVersion");
    const repoElement = document.getElementById("appRepo");
    if (!nameElement || !versionElement || !repoElement)
        return;
    nameElement.innerText = details.appName + " (" + details.buildInfo.type + ")";
    versionElement.innerText = details.appVersion + (details.buildInfo.commit !== undefined ? "-" + details.buildInfo.commit.substring(0, 7) : "");
    document.getElementById("logo").src = (0, global_1.getAppIcon)([256, 192, 128, 96]);
    if (repoElement.tagName === 'A')
        repoElement.href = details.appRepo ?? '';
    for (const id of Object.keys(l10n.about)) {
        const element = document.getElementById(id);
        if (element)
            element.innerText = l10n.about[id];
    }
    for (const id of ['electron', 'chrome', 'node']) {
        const element = document.getElementById(id);
        if (element)
            element.innerText = process.versions[id] ?? "unknown";
    }
}
function generateLicenseContent(l10n, name) {
    const packageJson = new package_1.PackageJSON(["dependencies", "devDependencies"]);
    for (const id of Object.keys(l10n.licenses).filter((value) => value.match(/^(?:licensedUnder|packageAuthors)$/) === null)) {
        const element = document.getElementById(id);
        if (element)
            element.innerText = l10n.licenses[id]
                .replace("%s", name);
    }
    for (const packName in packageJson.data.dependencies) {
        if (packName.startsWith('@spacingbat3/'))
            continue;
        const { data } = new package_1.PackageJSON(["author", "license"], (0, path_1.resolve)((0, electron_2.getAppPath)(), "node_modules/" + packName + "/package.json"));
        const npmLink = document.createElement("a");
        const title = document.createElement("h3");
        const copy = document.createElement("p");
        npmLink.href = "https://www.npmjs.com/package/" + packName;
        npmLink.relList.add("noreferrer");
        npmLink.target = "_blank";
        title.innerText = packName;
        copy.innerText = "© " +
            new package_1.Person(data.author ?? '"' + l10n.licenses.packageAuthors.replace("%s", packName) + '"').name + " " + l10n.licenses.licensedUnder.replace("%s", data.license);
        npmLink.appendChild(title);
        document.getElementById("licenses")?.appendChild(npmLink);
        document.getElementById("licenses")?.appendChild(copy);
    }
}
if (window.location.protocol !== "file:") {
    console.error("If you're seeing this, you probably have just messed something within the application. Congratulations!");
    throw new URIError("Loaded website is not a local page!");
}
window.addEventListener("load", () => {
    electron_1.ipcRenderer.send("about.getDetails");
    const close = document.getElementById("closebutton");
    if (close)
        close.addEventListener("click", () => {
            electron_1.ipcRenderer.send("about.close");
        }, { once: true });
    else
        throw new Error("Couldn't find element with 'closebutton' id.");
});
electron_1.ipcRenderer.on("about.getDetails", (_event, details) => {
    const l10n = new l10n_1.default().web.aboutWindow;
    for (const div of document.querySelectorAll("nav > div")) {
        const content = div.querySelector("div.content");
        if (content)
            content.innerText = l10n.nav[div.id.replace("-nav", "")];
    }
    generateAppContent(l10n, details);
    {
        if (package_1.default.data.author)
            addContributor(new package_1.Person(package_1.default.data.author), l10n.credits.people.author);
        for (const person of package_1.default.data.contributors ?? []) {
            const safePerson = new package_1.Person(person);
            let translation = l10n.credits.people.contributors.default;
            if (safePerson.name in l10n.credits.people.contributors)
                translation = l10n.credits.people.contributors[safePerson.name];
            addContributor(safePerson, translation);
        }
    }
    generateLicenseContent(l10n, details.appName);
    document.getElementById("showLicense")?.addEventListener("click", () => {
        for (const animation of document.getElementById("showLicense")?.getAnimations() ?? []) {
            setTimeout(showAppLicense, 100);
            animation.currentTime = 0;
            animation.play();
            animation.addEventListener("finish", () => {
                animation.pause();
                animation.currentTime = 0;
            }, { once: true });
        }
    });
    document.body.style.display = "initial";
    electron_1.ipcRenderer.send("about.readyToShow");
});
//# sourceMappingURL=about.js.map