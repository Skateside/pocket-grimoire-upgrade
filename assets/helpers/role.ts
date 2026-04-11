/** @deprecated - use /assets/scripts/helpers/roles.ts */
/*
import type {
    IRole,
    IRoleMeta,
    // IRoleRaw,
    IRoleScript,
    IRoleScriptImport,
} from "../types/data";
import {
    ERoleIds,
    ERoleTeam,
} from "../enums/data";
import {
    isBoolean,
    isNumber,
    isObject,
    isPropertyString,
    isString,
} from "../utilities/objects";
import { isValidLocalURL, isValidURL } from "../utilities/strings";

export function isMeta(role: IRole | IRoleMeta): role is IRoleMeta {
    return role.id === ERoleIds.META;
}

export function isUniversal(role: IRole) {
    return role.id === ERoleIds.UNIVERSAL;
}

export function setRemindersRole<TRole extends IRoleScript[number]>(role: TRole) {

    if (!isMeta(role)) {

        role.reminders?.forEach((reminder, index) => {
            reminder.role = role;
            reminder.id = `${role.id}:${index}`;
        });

    }

    return role;

};

export function unsetRemindersRole<TRole extends IRoleScript[number]>(role: TRole) {

    const clone = { ...role } as IRole;

    if (!clone.reminders) {
        return clone;
    }

    clone.reminders = clone.reminders.map((reminder) => {
        const updated = { ...reminder };
        delete (updated as any).role;
        return updated;
    });

    return clone;

}

// export function isValidRawReminder(value: unknown) {
//     return false;
// }

export function isValidRoleImport(value: unknown): value is IRoleScriptImport[number] {

    return (
        isString(value)
        || (
            isObject(value)
            && isPropertyString(value, "id")
        )
    );

}

export function isValidRole(value: unknown): value is IRole {

    const isValid = (
        isObject(value)
        && isPropertyString(value, "id")
        && (
            isPropertyString(value, "team")
            && Object.values(ERoleTeam).includes(value.team as ERoleTeam)
        )
        && isPropertyString(value, "name")
        && isPropertyString(value, "ability")
        && (
            !Object.hasOwn(value, "flavor")
            || isPropertyString(value, "flavor")
        )
        && (
            !Object.hasOwn(value, "edition")
            || isPropertyString(value, "edition")
        )
        && (
            !Object.hasOwn(value, "setup")
            || !isBoolean(value.setup)
        )
    );

    if (!isValid) {
        return isValid;
    }

    if (Object.hasOwn(value, "image")) {

        const { length } = value.image as string[];

        if (
            !isPropertyString(value, "image")
            || !Array.isArray(value.image)
            || (length !== 1 && length !== 2 && length !== 3)
            || !value.image.every((image) => {
                return isValidURL(image) || isValidLocalURL(image);
            })
        ) {
            return false;
        }

    }

    if (Object.hasOwn(value, "firstNight")) {

        if (
            !isNumber(value.firstNight)
            || (
                value.firstNight > 0
                && isPropertyString(value, "firstNightReminder")
            )
        ) {
            return false;
        }

    }

    if (Object.hasOwn(value, "otherNight")) {

        if (
            !isNumber(value.otherNight)
            || (
                value.otherNight > 0
                && isPropertyString(value, "otherNightReminder")
            )
        ) {
            return false;
        }

    }

    // check reminders
    // check jinxes
    // check special

    return isValid;

}

// export function isValidRawRole(value: unknown): value is IRoleRaw {
//     return false;
// }
*/
