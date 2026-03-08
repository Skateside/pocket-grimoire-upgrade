import type { Plugin } from "vite";
import type {
    IInfoTokenRaw,
    IJinx,
    IReminder,
    IRole,
    IRoleImport,
    IScriptMeta,
} from "../assets/scripts/types/data";
import type { AnyObject } from "../assets/scripts/types/lib";
import {
    EReminderFlag,
    ERoleId,
    ERoleSpecialName,
    ERoleSpecialType,
} from "../assets/scripts/enums/data";
import { promises as fs } from "fs";
import path from "path";

// Utility types.
type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
type AnyMap = Record<string, string>;

// Options for this plugin.
type ILocaleDataOptionsReal = {
    base: string,
    raw: {
        dirname: string,
        images: string,
        infoTokens: string,
        roles: string,
        scripts: string,
    },
    locales: {
        dirname: string,
        extra: string,
        i18n: string,
        infoTokens: string,
        jinxes: string,
        roles: string,
        scripts: string,
    },
    compiled: string,
};

// Types that describe the data that gets read from the files.
type IRawRoleImages = {
    id: IRole["id"],
    image: IRole["image"],
    reminders?: string[],
}[];
type IRawScripts = Record<string, (IScriptMeta | IRole["id"])[]>;
type ILocaleJinxes = Omit<IJinx, "state">[];
type ILocaleInfoTokens = Record<string, IInfoTokenRaw["markdown"]>;
type ILocaleScripts = {
    author: string,
    scripts: Record<string, string>,
};

export type ILocaleDataOptions = RecursivePartial<ILocaleDataOptionsReal>

export default (options: ILocaleDataOptions = {}): Plugin => {

    const defaults: ILocaleDataOptionsReal = {
        base: "assets/data",
        raw: {
            dirname: "raw",
            images: "images.json",
            infoTokens: "info-tokens.json",
            roles: "fetched-roles.json",
            scripts: "scripts.json",
        },
        locales: {
            dirname: "locales",
            extra: "extra.json",
            i18n: "i18n.json",
            infoTokens: "info-tokens.json",
            jinxes: "jinxes.json",
            roles: "roles.json",
            scripts: "scripts.json",
        },
        compiled: "compiled",
    };
    const config = deepAssign(defaults, options);

    return {
        name: "locale-data",
        async configResolved() {
            await buildFiles(config);
        },
    } as Plugin;

};

const buildFiles = async (config: ILocaleDataOptionsReal) => {

    const resolvedBase = path.resolve(config.base);
    const rawDir = path.join(resolvedBase, config.raw.dirname);
    const localesDir = path.join(resolvedBase, config.locales.dirname);
    const compiledDir = path.join(resolvedBase, config.compiled);

    await fs.mkdir(compiledDir, { recursive: true });

    const localeDirs = await fs.readdir(localesDir);

    for (const locale of localeDirs) {

        Promise.all([
            createInfoTokens([
                path.join(rawDir, config.raw.infoTokens),
                path.join(localesDir, locale, config.locales.infoTokens),
            ]),
            createRoles([
                path.join(rawDir, config.raw.roles),
                path.join(rawDir, config.raw.images),
                path.join(localesDir, locale, config.locales.roles),
                path.join(localesDir, locale, config.locales.extra),
                path.join(localesDir, locale, config.locales.jinxes),
            ]),
            createScripts([
                path.join(rawDir, config.raw.scripts),
                path.join(localesDir, locale, config.locales.scripts),
            ]),
            createI18n([
                path.join(localesDir, locale, config.locales.i18n),
            ]),
        ]).then(([
            infoTokens,
            roles,
            scripts,
            i18n,
        ]) => {

            const json = {
                infoTokens,
                roles,
                scripts,
                i18n,
            };
            const output = `window.PG=${JSON.stringify(json)};`;
            const fileName = `${locale}.js`;
            const filePath = path.join(compiledDir, fileName);
            
            fs.writeFile(filePath, output, "utf-8").then(() => {
                console.log(`Generated compiled ${fileName} file`);
            });

        });

    }

};

const processFiles = (fileNames: string[]) => Promise
    .all(fileNames.map((file) => (
        fs.access(file, fs.constants.R_OK).then(
            () => fs.readFile(file),
            () => "null",
        )
    )))
    .then((contents) => contents.map((string) => JSON.parse(String(string))));

const createInfoTokens = (tokenFiles: string[]) => processFiles(tokenFiles).then(([
    rawInfo,
    localeInfo,
]) => new Promise<IInfoTokenRaw[]>((resolve, reject) => {

    Object.entries(localeInfo as ILocaleInfoTokens).forEach(([id, markdown]) => {

        const token = (rawInfo as IInfoTokenRaw[]).find((token) => token.id === id);

        if (!token) {
            return reject(new ReferenceError(`Cannot find token "${id}" in "${tokenFiles[1]}"`));
        }

        token.markdown = markdown;

    });

    resolve(rawInfo);

}));

const createRoles = (roleFiles: string[]) => processFiles(roleFiles).then(([
    rawRoles,
    images,
    // specialRoles,
    localeRoles,
    localeExtraRoles,
    localeJinxes,
]) => new Promise<IRoleImport[]>((resolve, _reject) => {

    const roles = rawRoles as IRoleImport[];

    roles.push(
        ...((localeExtraRoles || []) as IRoleImport[]),
    );
    roles.forEach((role) => {

        Object.assign(
            role,
            (localeRoles as IRoleImport[]).find(({ id }) => id === role.id) || {},
        );

        fixRoleJinxes(role, localeJinxes);
        fixRoleReminders(role);
        fixRoleImages(role, images);

    });

    resolve(roles.sort((a, b) => a.id.localeCompare(b.id)));

}));

const fixRoleJinxes = (role: IRoleImport, localeJinxes: ILocaleJinxes) => {

    if (!role.jinxes?.length) {
        return;
    }

    const jinxes = localeJinxes.filter(({ target }) => target === role.id);

    if (!jinxes) {
        return;
    }

    role.jinxes = role.jinxes.map(({ id, reason }) => ({
        id,
        reason: jinxes.find(({ trick }) => trick === id)?.reason || reason,
    }));

};

// This should be a temporary fix - eventually, the data itself should be
// corrected to use the new format.
const fixRoleReminders = (role: IRoleImport) => {

    const { reminders, remindersGlobal } = role as {
        reminders?: IReminder[] | string[],
        remindersGlobal?: string[],
    };
    const fixedReminders: IReminder[] = [];

    if (
        (
            reminders?.length
            && reminders.some((reminder) => typeof reminder === "string")
        )
        || remindersGlobal?.length
    ) {

        // const reminders: IReminder[] = [];

        // Regular reminders are just that.
        for (const [_index, name] of Object.entries(reminders || [])) {

            const reminder = (
                typeof name === "string"
                ? { name }
                : name
            ) as IReminder;
            const found = fixedReminders.find(({ name }) => reminder.name === name);

            if (found) {

                if (!found.count) {
                    found.count = 1;
                }

                found.count += 1;

            } else {
                fixedReminders.push(reminder);
            }

        }

        // Global reminders need the global flag.
        // If the role has a reveal/replace-character special, the first global
        // reminder needs the "role" flag.
        for (const [index, name] of Object.entries(remindersGlobal || [])) {

            const flags: EReminderFlag[] = [EReminderFlag.GLOBAL];
            const replace = role.special?.find(({ type, name }) => (
                type === ERoleSpecialType.REVEAL
                && name === ERoleSpecialName.REPLACE_CHARACTER
            ));

            if (replace && Number(index) === 0) {
                flags.push(EReminderFlag.ROLE);
            }

            const reminder = { name, flags } as IReminder;
            fixedReminders.push(reminder);

        }

    }

    (role as any).reminders = fixedReminders;
    delete (role as any).remindersGlobal;

};

const fixRoleImages = (role: IRoleImport, images: IRawRoleImages) => {

    const roleImages = (images as IRawRoleImages).find(({ id }) => id === role.id);

    if (!roleImages) {
        return;
    }

    role.image = roleImages.image;

    roleImages.reminders?.forEach((image, index) => {

        if ((role.reminders?.length || -1) < index || !image) {
            return;
        }

        (role.reminders![index] as any).image = image;

    });

};

const createScripts = (scriptFiles: string[]) => processFiles(scriptFiles).then(([
    rawScripts,
    localeScripts,
]) => new Promise<IRawScripts>((resolve, _reject) => {

    Object.entries(rawScripts as IRawScripts).forEach(([id, script]) => {

        const metaIndex = script.findIndex((entry) => (
            typeof entry === "object"
            && entry.id === ERoleId.META
        ));
        const metaEntry: IScriptMeta = (script[metaIndex] as IScriptMeta) || {};

        metaEntry.id = ERoleId.META;
        metaEntry.author = (localeScripts as ILocaleScripts).author;
        metaEntry.name = (localeScripts as ILocaleScripts).scripts[id] || "";

        if (metaIndex === -1) {
            script.unshift(metaEntry);
        }

    });

    resolve(rawScripts as IRawScripts);

}));

const createI18n = (i18nFiles: string[]) => processFiles(i18nFiles).then(([
    localeI18n,
]) => new Promise<AnyMap>((resolve, _reject) => {
    resolve(localeI18n);
}));

const deepAssign = <T extends AnyObject = AnyObject>(source: T, ...objects: AnyObject[]) => {

    objects.forEach((object) => {

        Object.entries(object).forEach(([key, value]) => {

            if (
                typeof value === "object"
                && typeof source[key] === "object"
            ) {
                (source as AnyObject)[key] = deepAssign(
                    (
                        Array.isArray(source[key])
                        ? []
                        : {}
                    ),
                    source[key],
                    value,
                );
            } else {
                (source as AnyObject)[key] = value;
            }

        });

    });

    return source;

};
