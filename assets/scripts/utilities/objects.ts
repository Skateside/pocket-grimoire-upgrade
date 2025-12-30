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
export function deepThaw<
    TObject extends AnyObject = AnyObject
>(object: TObject): DeepWritable<TObject> {
    return window.structuredClone(object);
}
