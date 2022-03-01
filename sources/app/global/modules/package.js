"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageJSON = exports.Person = void 0;
const path_1 = require("path");
const semver_1 = require("semver");
const fs_1 = require("fs");
const spdxParse = require("spdx-expression-parse");
const personMagic = /^((?:.*?(?=\s*(?:<[^ ]*>|\([^ ]*\)))|.*?))(?: <([^ ]*)>)? *(?:\((.*)\))?$/;
class Person {
    constructor(value) {
        if (value instanceof Object) {
            this.name = value.name;
            this.email = value.email;
            this.url = value.url;
        }
        else {
            const match = value.match(personMagic);
            this.name = (match?.[1] ?? "[Anonymous]").trimEnd();
            this.email = match?.[2] ?? undefined;
            this.url = match?.[3] ?? undefined;
        }
    }
    toString() {
        return (this.name !== "[Anonymous]" ? this.name : "") +
            (this.email ? " <" + this.email + ">" : "") +
            (this.url ? " (" + this.url + ")" : "");
    }
}
exports.Person = Person;
class PackageJSON {
    constructor(keys, packageJsonFile) {
        const file = packageJsonFile ?? this.findProjectPackageJson();
        const packageJSON = JSON.parse((0, fs_1.readFileSync)(file).toString());
        if (!this.isPackageJsonComplete(packageJSON))
            throw new TypeError("While parsing `package.json`: " + this.checkPackageJsonComplete(packageJSON));
        const newObj = {};
        for (const key of Array.from(new Set(keys)))
            newObj[key] = packageJSON[key];
        this.data = newObj;
    }
    isEmail(email) {
        return /^[a-z0-9!#$%&'*+/=?^_`{|}~-][a-z0-9!#$%&'*+/=?^_`{|}~\-.]*@[a-z0-9!#$%&'*+/=?^_`{|}~-][a-z0-9!#$%&'*+/=?^_`{|}~\-.]*\.[a-z]+$/
            .test(email ?? "");
    }
    isPersonObject(variable) {
        if (variable instanceof Object) {
            if (typeof variable.name !== 'string')
                return false;
            if (variable.email !== undefined && typeof variable.email !== 'string')
                return false;
            else if (typeof variable.email === 'string' && !this.isEmail(variable.email))
                return false;
            if (variable.url !== undefined && typeof variable.url !== 'string')
                return false;
        }
        else {
            return false;
        }
        return true;
    }
    isPerson(variable) {
        if (this.isPersonObject(variable))
            return true;
        if (typeof variable === 'string') {
            const match = variable.match(personMagic);
            return ((match !== null && match[1] !== undefined)) && (match[2] !== undefined ? this.isEmail(match[2]) : true);
        }
        return false;
    }
    checkPackageJsonComplete(object) {
        if (!(object instanceof Object))
            return "'object' is actually not an object (but '" + typeof object + "')!";
        else
            for (const key in object)
                if (typeof key !== "string")
                    return "'object' keys are not of the type 'string'.";
        if (object.contributors instanceof Object)
            for (const key of object.contributors)
                if (!this.isPerson(key))
                    return "Contributors field is of invalid type.";
        if (object.author !== undefined)
            if (!this.isPerson(object.author))
                return "Author field is of invalid type.";
        for (const stringKey of ['name', 'license'])
            if (typeof (object[stringKey]) !== 'string')
                return "'" + stringKey + "' is not assignable to type 'string'.";
        if (typeof object.repository !== "string" && typeof object.repository !== "object")
            return "Repository field is neither of type 'string' nor 'object'.";
        for (const stringKey of ['type', 'url']) {
            const repository = object.repository;
            if (typeof (repository) === "object" && typeof (repository[stringKey]) !== "string")
                return "Repository object does not contain a '" + stringKey + "' property.";
        }
        if (object.name.match(/^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/) === null)
            return "'" + object.name + "' is not a valid Node.js package name.";
        if (typeof object.version === 'string') {
            if ((0, semver_1.parse)(object.version) === null)
                return "Version " + object.version + " can't be parsed to 'semver'.";
        }
        else {
            return "Version property is not assignable to type 'string'!";
        }
        for (const key of ["dependencies", "devDependencies"]) {
            const testValue = object[key];
            if (!/undefined|object/.test(typeof testValue))
                return "Property '" + key + "' is of invalid type!";
            else if (testValue instanceof Object) {
                for (const key in testValue)
                    if (typeof key !== "string") {
                        const key2string = key?.toString();
                        let keyString;
                        if (typeof key2string === "string")
                            keyString = key2string;
                        else
                            keyString = "[unknown]";
                        return "Package name '" + keyString + "' is not a valid 'string'.";
                    }
                    else if (typeof testValue[key] !== "string")
                        return "Version of the package '" + key + "' is not of type 'string'.";
            }
        }
        if (!/^UNLICEN[SC]ED|SEE LICEN[CS]E IN .+$/.test(object.license))
            try {
                spdxParse(object.license);
            }
            catch {
                return "License field is in wrong format.";
            }
        if (object.homepage !== undefined && typeof object.homepage !== "string")
            return "Homepage property is neither 'string' nor 'undefinied'.";
        return "";
    }
    findProjectPackageJson() {
        let cwd = __dirname;
        while (!(0, fs_1.existsSync)((0, path_1.resolve)(cwd, "package.json")) && cwd !== "/") {
            cwd = (0, path_1.resolve)(cwd, "../");
        }
        return (0, path_1.resolve)(cwd, "package.json");
    }
    isPackageJsonComplete(object) {
        return (this.checkPackageJsonComplete(object) === "");
    }
}
exports.PackageJSON = PackageJSON;
const packageJson = new PackageJSON(["homepage", "name", "repository", "author", "contributors"]);
exports.default = packageJson;
//# sourceMappingURL=package.js.map