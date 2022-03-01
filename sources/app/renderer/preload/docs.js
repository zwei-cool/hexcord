"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const marked_1 = require("marked");
const dompurify_1 = require("dompurify");
const electron_1 = require("electron");
const path_1 = require("path");
const fs_1 = require("fs");
const url_1 = require("url");
const global_1 = require("../../global/global");
const _hljsmodule = require("highlight.js");
const htmlFileUrl = document.URL;
const { highlight } = _hljsmodule;
marked_1.marked.setOptions({
    highlight: (code, lang) => {
        if (lang === '')
            return;
        const language = (() => {
            if (lang === 'jsonc')
                return 'json';
            return lang;
        })();
        return highlight(code, { language: language }).value;
    }
});
const menu = document.createElement('img');
menu.src = '../../icons/symbols/menu.svg';
menu.id = 'menu-hamburger';
const menuHeader = document.createElement('p');
function getId(url) {
    if (url.split('#').length > 1)
        return url.split('#')[1];
}
function loadMarkdown(mdBody, mdFile) {
    mdBody.innerHTML = (0, dompurify_1.sanitize)(marked_1.marked.parse((0, fs_1.readFileSync)(mdFile).toString()));
}
function setBody(mdBody, mdHeader, mdFile, mdArticle) {
    loadMarkdown(mdBody, mdFile);
    handleUrls(mdBody, mdArticle, mdHeader, mdFile);
    fixImages(mdBody);
}
function handleUrls(container, article, header, mdPrevious) {
    for (const link of container.getElementsByTagName('a')) {
        link.onclick = () => {
            window.history.replaceState("", "", (0, url_1.pathToFileURL)(mdPrevious));
            if (new URL(link.href).protocol.match(global_1.trustedProtocolRegExp)) {
                open(link.href);
            }
            else if (link.href.startsWith(document.URL.split('#')[0] + '#')) {
                const id = getId(link.href);
                if (id) {
                    const element = document.getElementById(id);
                    if (element)
                        element.scrollIntoView({ behavior: "smooth" });
                }
            }
            else if (link.href.match(/^file:\/\/.+(\.md|LICENSE)(#[a-z0-9-]+)?$/)) {
                const mdFile = (0, url_1.fileURLToPath)(link.href);
                const id = getId(link.href);
                const oldHeader = menuHeader.innerHTML;
                menuHeader.innerText = (0, path_1.basename)(mdFile);
                document.body.removeChild(article);
                if ((0, fs_1.existsSync)(mdFile)) {
                    loadMarkdown(container, mdFile);
                    mdPrevious = mdFile;
                }
                else {
                    const relFile = (0, path_1.relative)(document.URL, link.href);
                    const mdFile = (0, path_1.resolve)(mdPrevious, relFile);
                    if (!(0, fs_1.existsSync)(mdFile)) {
                        console.error("File '" + mdFile + "' does not exists!");
                        document.body.appendChild(article);
                        window.history.pushState("", "", htmlFileUrl);
                        menuHeader.innerHTML = oldHeader;
                        return false;
                    }
                    loadMarkdown(container, mdFile);
                    mdPrevious = mdFile;
                    console.log(relFile);
                }
                window.scroll(0, 0);
                handleUrls(container, article, header, mdPrevious);
                fixImages(container);
                document.body.appendChild(article);
                if (id) {
                    const element = document.getElementById(id);
                    if (element)
                        element.scrollIntoView();
                }
            }
            window.history.pushState("", "", htmlFileUrl);
            return false;
        };
    }
}
function fixImages(container) {
    const logo = container.querySelector('a[href="https://github.com/SpacingBat3/WebCord"] > picture > img');
    const logoPicture = logo?.parentNode ?? null;
    const logoAnchor = logoPicture?.parentElement ?? null;
    if (logo === null || logoPicture === null || logoAnchor === null)
        return;
    logoPicture.remove();
    if (logo.src.match('/sources/assets/web'))
        logo.src = logo.src.replace('/sources/assets/web', '');
    else
        logo.src = logo.src.replace('/sources/assets', '');
    const newLogo = logo.cloneNode();
    logoAnchor.appendChild(newLogo);
    for (const image of container.getElementsByTagName('img'))
        if (image.src.startsWith('https:') && image.parentElement && image.parentElement.parentElement && image.parentElement.parentElement.tagName === "P") {
            image.parentElement.parentElement.remove();
            break;
        }
}
electron_1.ipcRenderer.once('documentation-load', (_event, readmeFile) => {
    const mdHeader = document.createElement('header');
    const mdArticle = document.createElement('article');
    const mdBody = document.createElement('div');
    mdArticle.appendChild(mdBody);
    mdHeader.id = "markdown-header";
    mdBody.id = "markdown-body";
    menuHeader.innerText = (0, path_1.basename)(readmeFile);
    mdHeader.appendChild(menu);
    mdHeader.appendChild(menuHeader);
    setBody(mdBody, mdHeader, readmeFile, mdArticle);
    mdBody.getElementsByTagName('sub')[0].parentElement?.remove();
    document.body.appendChild(mdHeader);
    document.body.appendChild(mdArticle);
    menu.onclick = () => {
        let scrollOptions;
        if (!menuHeader.innerText.includes('Readme.md')) {
            window.scroll(0, 0);
            menuHeader.innerText = (0, path_1.basename)(readmeFile);
            setBody(mdBody, mdHeader, readmeFile, mdArticle);
            mdBody.getElementsByTagName('sub')[0].parentElement?.remove();
        }
        else {
            scrollOptions = { behavior: 'smooth' };
        }
        let docsId = 'documentation';
        if (navigator.language === 'pl')
            docsId = 'dokumentacja-w-większości-jeszcze-nie-przetłumaczona';
        const docsHeader = document.getElementById(docsId);
        if (docsHeader)
            docsHeader.scrollIntoView(scrollOptions);
    };
    electron_1.ipcRenderer.send('documentation-show');
});
document.addEventListener("readystatechange", () => {
    if (document.readyState === "interactive")
        electron_1.ipcRenderer.send('documentation-load');
});
//# sourceMappingURL=docs.js.map