import type {
    ICoordinates,
    IToken,
    ITokenReminder,
    ITokenRole,
    ITokenSeat,
} from "../types/data";
import { ETokenAlignment, ETokenType } from "../enums/data";
import {
    filterObject,
    isBoolean,
    isNumber,
    isObject,
    isPropertyString,
    isString,
} from "../utilities/objects";
import { randomId } from "../utilities/strings";

const PREFIX = "token-";

/**
 * Checks to see if the given object are valid co-ordinates.
 *
 * @param object Object to check.
 * @returns `true` if the object can be used for co-ordinates, `false`
 * otherwise.
 */
export function isValidCoordinates(object: unknown): object is ICoordinates {

    return (
        isObject(object)
        && (Object.hasOwn(object, "x") && isNumber(object.x))
        && (Object.hasOwn(object, "y") && isNumber(object.y))
        && (!Object.hasOwn(object, "z") || isNumber(object.z))
    );

}

/**
 * Checks to see if the given object is a valid token.
 *
 * @param object Object to check.
 * @returns `true` if the object is a valid token, `false` otherwise.
 */
export function isValidToken(object: unknown): object is IToken {

    if (!isValidCoordinates(object)) {
        return false;
    }

    const token = object as ICoordinates & Record<string, any>;

    return (
        (
            isPropertyString(token, "id")
            && token.id.startsWith(PREFIX)
        )
        && (
            Object.hasOwn(token, "type")
            && Object.values(ETokenType).includes(token.type as ETokenType)
        )
    );

}

/**
 * Checks to see if the given token represents a seat. Seats are where players
 * sit.
 *
 * @param token Token to check.
 * @returns `true` if the token represents a seat, `false` otherwise.
 */
export function isSeat(token: IToken): token is ITokenSeat {
    return token.type === ETokenType.SEAT
}

/**
 * Checks to see if the given token represents a reminder. Reminders describe
 * the tokens they're near.
 *
 * @param token Token to check.
 * @returns `true` if the token represents a reminder, `false` otherwise.
 */
export function isReminder(token: IToken): token is ITokenReminder {
    return token.type === ETokenType.REMINDER
}

/**
 * Checks to see if the given token represents a role. Most of the time, the
 * role will be set on the seat. A role without a seat would be something like a
 * Fabled or a Loric, maybe a role that's been added just so that the
 * Storyteller can show it.
 *
 * @param token Token to check.
 * @returns `true` if the token represents a token, `false` otherwise.
 */
export function isRole(token: IToken): token is ITokenRole {
    return token.type === ETokenType.ROLE
}

/**
 * Given a collection of co-ordinates, find the centre point of them all.
 *
 * @param items Co-ordinates whose centre point should be found.
 * @returns Centre point.
 */
export function getCentre(items: ICoordinates[]) {

    const centre: ICoordinates = { x: 0, y: 0 };

    if (!items.length) {
        return centre;
    }

    items.forEach(({ x, y }) => {
        centre.x += x;
        centre.y += y;
    });

    centre.x /= items.length;
    centre.y /= items.length;

    return centre;

}

/**
 * Gets the angle from the given centre point to the given item, in radians.
 *
 * @param item Item to reference.
 * @param centre Centre point to check from.
 * @returns Angle, in radians.
 */
export function getAngle(item: ICoordinates, centre: ICoordinates) {

    const x = item.x - centre.x;
    const y = item.y - centre.y;
    // atan2() would start at 3 o'clock, so we add PI/2 to start at 12.
    let angle = Math.atan2(y, x) + (Math.PI / 2);

    // Add a circle's worth of radians to keep all angles positive.
    if (angle <= 0) {
        angle += 2 * Math.PI;
    }

    return angle;

}

/**
 * Gets the distance between the given item and the given centre point.
 *
 * @param item Item to reference.
 * @param centre Centre point to check from.
 * @returns Distance between the item and the centre point.
 */
export function getDistance(item: ICoordinates, centre: ICoordinates) {
    return Math.hypot(item.x - centre.x, item.y - centre.y);
}

const updateDataWhitelist: Record<string, (object: unknown) => boolean> = {
    alignment: (object: unknown) => {
        return Object.values(ETokenAlignment).includes(object as ETokenAlignment);
    },
    dead: isBoolean,
    ghostVote: isBoolean,
    index: isNumber,
    name: isString,
    reminder: isString,
    role: isString,
    rotate: isBoolean,
};

/**
 * Filters the given data so that only whitelisted keys and expected value types
 * are included.
 *
 * @param object Object to filter.
 * @returns Filtered data.
 */
export function filterUpdateData<TToken extends Partial<IToken>>(object: TToken) {

    return filterObject(object, ([key, value]) => {
        return (
            Object.hasOwn(updateDataWhitelist, key)
            && updateDataWhitelist[key as string](value)
        );
    });

}

/**
 * Creates a token for a specific type.
 *
 * @param settings Settings for the token.
 * @param type Type of token.
 * @returns Created token.
 */
export function createToken(
    settings: Partial<IToken> = {},
    type: IToken["type"] = ETokenType.SEAT,
) {

    return Object.assign({
        type,
        id: randomId(PREFIX),
        x: 0,
        y: 0,
        z: 0,
    }, filterUpdateData(settings)) satisfies IToken;

};
