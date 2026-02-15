import type { DeepReadonly } from "vue";
import type {
    AnyObject,
    DeepWritable,
} from "../types/lib";

/**
 * Creates a copy of the given object so that it can be modified. The original
 * object remains unchanged. If the original object is frozen, it remains frozen
 * and the copy is not frozen.
 * 
 * This also helps get around TypeScript's concerns with Readonly - the returned
 * copy is not Readonly.
 * 
 * @param object Object to thaw.
 * @returns Writable copy of the object.
 */
export function deepThaw<TObject extends AnyObject = AnyObject>(
    object: TObject
): DeepWritable<TObject> {
    return window.structuredClone(object);
}

/**
 * Freezes the object such that neither it nor any of its children can be
 * mutated.
 * 
 * @param object Object to freeze.
 * @returns Original object, now frozen.
 */
export function deepFreeze<TObject = any>(object: TObject): DeepReadonly<TObject> {

    if (object === null || object === undefined) {
        return object as DeepReadonly<TObject>;
    }

    if (typeof object === "object") {
        Object.values(object).forEach((value) => deepFreeze(value));
    }

    return Object.freeze(object) as DeepReadonly<TObject>;

}

type IObjectMapCallback<TObject extends AnyObject, TResult = any> = (
    entry: [keyof TObject, TObject[keyof TObject]],
) => [keyof TObject, TResult];

/**
 * Converts the given object as defined by the map.
 * 
 * @param object Object to convert.
 * @param callback Function to modify the object.
 * @returns Modified object.
 */
export function mapObject<TObject extends AnyObject = AnyObject, TResult = any>(
    object: TObject,
    callback: IObjectMapCallback<TObject, TResult>,
) {
    return Object.fromEntries(Object.entries(object).map(callback));
}
