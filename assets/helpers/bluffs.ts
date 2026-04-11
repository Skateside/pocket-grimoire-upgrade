import type { IDemonBluffGroup } from "~/types/data";
import { randomId } from "~/utilities/strings";
import { isObject, isString } from "~/utilities/objects";

const PREFIX = "bluffs-";

/**
 * Checks to see if the given object is a valid Demon Bluff group.
 *
 * @param group Group to check.
 * @returns `true` if the given group is a valid Demon Bluff group, `false`
 * otherwise.
 */
export function isValidBluffGroup(group: unknown): group is IDemonBluffGroup {

    return (
        isObject(group)
        && (
            Object.hasOwn(group, "id")
            && isString(group.id)
            && group.id.startsWith(PREFIX)
        )
        && (Object.hasOwn(group, "name") && isString(group.name) )
        && (
            Object.hasOwn(group, "roles")
            && Array.isArray(group.roles)
            && group.roles.length === 3
            && group.roles.every((role) => isString(role) || role === null)
        )
    );

}

/**
 * Creates a new (and empty) Demon Bluff group.
 *
 * @param name Name of the group.
 * @returns Newly created (and empty) Demon Bluff group.
 */
export function makeNewGroup(name = "") {

    return {
        name,
        id: randomId("bluffs-"),
        roles: [null, null, null],
    } satisfies IDemonBluffGroup;

}


