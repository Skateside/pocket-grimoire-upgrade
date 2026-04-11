import type { IInfoToken, IInfoTokenRaw } from "~/types/data";
import {
    filterObject,
    isBoolean,
    isObject,
    isPropertyString,
    isString,
} from "~/utilities/objects";
import { randomId } from "~/utilities/strings";

const PREFIX = "info-token-";

/**
 * Converts a raw info token into a fully valid info token.
 *
 * @param raw Raw info token to convert.
 * @returns Converted info token.
 */
export function convertFromRaw(
    raw: IInfoToken | IInfoTokenRaw,
): IInfoToken | null {

    if (!isValidRawInfoToken(raw)) {
        return null;
    }

    const keys: (keyof IInfoToken)[] = [
        "id",
        "isCustom",
        "roleIds",
        "text",
    ];
    const infoToken = Object.assign(
        Object.create(null),
        filterObject(raw, ([key]) => keys.includes(key)),
    ) as IInfoToken;

    if (!Object.hasOwn(infoToken, "isCustom")) {
        infoToken.isCustom = infoToken.id.startsWith(PREFIX);
    }

    infoToken.roleIds = (infoToken.roleIds ?? []).filter(isString);

    return infoToken;

}

/**
 * Creates a custom info token based on the given text.
 *
 * @param markdown Text to turn into a custom info token.
 * @returns Custom info token.
 */
export function create(text: IInfoTokenRaw["text"]) {

    const raw = {
        text,
        id: randomId(PREFIX),
    } satisfies IInfoTokenRaw;

    return convertFromRaw(raw)!;

}

/**
 * Checks to see if the given info token is custom.
 *
 * @param object Info token to check.
 * @returns `true` if the given info token is custom, `false` otherwise.
 */
export function isCustom(
    object: unknown,
): object is IInfoToken & { isCustom: true } {
    return isValidInfoToken(object) && object.isCustom;
}

/**
 * Checks to see if the given info token is not custom.
 *
 * @param object Info token to check.
 * @returns `true` if the given info token is not custom, `false` otherwise.
 */
export function isNotCustom(
    object: unknown,
): object is IInfoToken & { isCustom: false } {
    return isValidInfoToken(object) && !object.isCustom;
}

export function isValidInfoToken(object: unknown): object is IInfoToken {

    if (!isValidRawInfoToken(object)) {
        return false;
    }

    const infoToken = object as IInfoToken;

    return (
        isBoolean(infoToken.isCustom)
        && Array.isArray(infoToken.roleIds)
        && infoToken.roleIds.every(isString)
    );

}

/**
 * Checks to see if the given raw info token is valid.
 *
 * @param raw Raw info token to check.
 * @returns `true` if it's valid, `false` otherwise.
 */
export function isValidRawInfoToken(object: unknown): object is IInfoTokenRaw {

    return (
        isObject(object)
        && isPropertyString(object, "id")
        && isPropertyString(object, "text")
    );

}

/**
 * Reduces the given info token into a raw info token, making it easier to
 * store.
 *
 * @param infoToken Info token to reduce.
 * @returns Reduced raw into token.
 */
export function reduceToRaw(infoToken: IInfoToken): IInfoTokenRaw {

    return {
        id: infoToken.id,
        text: infoToken.text,
    } satisfies IInfoTokenRaw;

}

/**
 * Flags the given info token as custom without mutating the given info token.
 *
 * @param infoToken Info token to flag.
 * @returns Flagged into token.
 */
export function setAsCustom(infoToken: IInfoToken): IInfoToken {
    return { ...infoToken, isCustom: true };
}
