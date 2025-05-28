import type {
    Plugin,
} from "vite";
import type {
    IInfoToken,
    IRole,
    IRoleReminder,
    IRoleReminderFlag,
    IRoleJinx,
    IRoleMeta,
} from "../assets/scripts/types/data";
import {
    promises as fs,
} from "fs";
import path from "path";

// Utility types.
type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>;
};
type AnyObject = Record<string, any>;
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
        universal: string,
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
type IRawScripts = Record<string, (IRoleMeta | IRole["id"])[]>;
type ILocaleJinxes = {
    target: IRoleJinx["id"],
    trick: IRoleJinx["id"],
    reason: IRoleJinx["reason"],
}[];
type ILocaleInfoTokens = Record<string, IInfoToken["text"]>;
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
            roles: "roles.json",
            scripts: "scripts.json",
            universal: "universal.json",
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
                path.join(rawDir, config.raw.universal),
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

            const output = [
                `PG.infoTokens=${JSON.stringify(infoTokens)};`,
                `PG.roles=${JSON.stringify(roles)};`,
                `PG.scripts=${JSON.stringify(scripts)};`,
                `PG.i18n=${JSON.stringify(i18n)};`,
            ].join("");
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
]) => new Promise<IInfoToken[]>((resolve, reject) => {

    Object.entries(localeInfo as ILocaleInfoTokens).forEach(([id, text]) => {

        const token = (rawInfo as IInfoToken[]).find((token) => token.id === id);

        if (!token) {
            return reject(new ReferenceError(`Cannot find token "${id}" in "${tokenFiles[1]}"`));
        }

        token.text = text;

    });

    resolve(rawInfo);

}));

const createRoles = (roleFiles: string[]) => processFiles(roleFiles).then(([
    rawRoles,
    images,
    universalRoles,
    localeRoles,
    localeExtraRoles,
    localeJinxes,
]) => new Promise<IRole[]>((resolve, _reject) => {

    const roles = rawRoles as IRole[];

    roles.push(
        ...(universalRoles as IRole[]),
        ...((localeExtraRoles || []) as IRole[]),
    );
    roles.forEach((role) => {

        Object.assign(
            role,
            (localeRoles as IRole[]).find(({ id }) => id === role.id) || {},
        );

        fixRoleJinxes(role, localeJinxes);
        fixRoleReminders(role);
        fixRoleImages(role, images);

    });

    resolve(roles.sort((a, b) => a.id.localeCompare(b.id)));

}));

const fixRoleJinxes = (role: IRole, localeJinxes: ILocaleJinxes) => {

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
const fixRoleReminders = (role: IRole) => {

    const { reminders, remindersGlobal } = role as {
        reminders?: IRoleReminder[] | string[],
        remindersGlobal?: string[],
    };

    if (
        (
            reminders?.length
            && reminders.some((reminder) => typeof reminder === "string")
        )
        || remindersGlobal?.length
    ) {

        role.reminders = [];

        // Regular reminders are just that.
        for (const [_index, name] of Object.entries(reminders || [])) {

            const reminder: IRoleReminder = (
                typeof name === "string"
                ? { name }
                : name
            );
            const found = role.reminders.find(({ name }) => reminder.name === name);

            if (found) {

                if (!found.count) {
                    found.count = 1;
                }

                found.count += 1;

            } else {
                role.reminders.push(reminder);
            }

        }

        // Global reminders need the global flag.
        // If the role has a reveal/replace-character special, the first global
        // reminder needs the "role" flag.
        for (const [index, name] of Object.entries(remindersGlobal || [])) {

            const flags: IRoleReminderFlag[] = ["global"];
            const replace = role.special?.find(({ type, name }) => {
                return type === "reveal" && name === "replace-character";
            });

            if (replace && Number(index) === 0) {
                flags.push("role");
            }

            const reminder: IRoleReminder = { name, flags };
            role.reminders.push(reminder);

        }

    }

    delete (role as any).remindersGlobal;

};

const fixRoleImages = (role: IRole, images: IRawRoleImages) => {

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
            && entry.id === "_meta"
        ));
        const metaEntry: IRoleMeta = (script[metaIndex] as IRoleMeta) || {};

        metaEntry.id = "_meta";
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
