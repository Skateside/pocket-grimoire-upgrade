import type { IInfoToken, IInfoTokenRaw } from "../types/data";
import { toHTML, strip } from "../utilities/markdown";
import {
    filterObject,
    isBoolean,
    isObject,
    isPropertyString,
} from "../utilities/objects";
import { randomId, removeMarkup } from "../utilities/strings";

const PREFIX = "info-token-";

const COLOURS = Object.freeze([
    "blue",
    "dark-orange",
    "dark-purple",
    "green",
    "grey",
    "orange",
    "purple",
    "red",
]);

/**
 * Converts a raw info token into a fully valid info token.
 *
 * @param raw Raw info token to convert.
 * @returns Converted info token.
 */
export function convertFromRaw(raw: IInfoToken | IInfoTokenRaw) {

    const rawKeys: (keyof IInfoTokenRaw)[] = [
        "colour",
        "id",
        "isCustom",
        "markdown",
    ];
    const infoToken = Object.assign(
        Object.create(null),
        filterObject(raw, ([key]) => rawKeys.includes(key)),
    ) as IInfoToken;

    infoToken.text = strip(raw.markdown);
    infoToken.markup = toHTML(removeMarkup(raw.markdown));
    infoToken.isCustom = Boolean(raw.isCustom);
    infoToken.roleIds = (raw as IInfoToken).roleIds ?? [];

    return infoToken;

};

/**
 * Checks to see if the given raw info token is valid.
 *
 * @param raw Raw info token to check.
 * @returns `true` if it's valid, `false` otherwise.
 */
export function isValidRawInfoToken(raw: unknown): raw is IInfoTokenRaw {

    const isValid = (
        isObject(raw)
        && isPropertyString(raw, "id")
        && isPropertyString(raw, "markdown")
        && (
            isPropertyString(raw, "colour")
            && COLOURS.includes(raw.colour)
        )
    );

    if (
        isValid
        && Object.hasOwn(raw, "isCustom")
        && (!isBoolean(raw.isCustom) || !raw.id.startsWith(PREFIX))
    ) {
        return false;
    }

    return isValid;

}

/**
 * Creates a custom info token based on the given markdown.
 *
 * @param markdown Markdown to turn into a custom info token.
 * @returns Custom info token.
 */
export function makeRawInfoToken(markdown: string) {

    return convertFromRaw({
        markdown,
        id: randomId(PREFIX),
        colour: "grey",
        isCustom: true,
    });

}

/**
 * Reduces the given info token into a raw info token, making it easier to
 * store.
 *
 * @param infoToken Info token to reduce.
 * @returns Reduced raw into token.
 */
export function reduceToRaw(infoToken: IInfoToken) {

    return {
        id: infoToken.id,
        markdown: infoToken.markdown,
        colour: infoToken.colour,
    } satisfies IInfoTokenRaw

}

/**
 * Flags the given info token as custom by mutating it.
 *
 * @param infoToken Info token to flag.
 * @returns Flagged into token.
 */
export function setAsCustom(infoToken: IInfoToken) {

    infoToken.isCustom = true;

    return infoToken;

};
