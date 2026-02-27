import type { DeepReadonly } from "vue";
import type {
    AnyObject,
    DeepWritable,
} from "../types/lib";

const { toString } = Object.prototype;

/**
 * Checks to see if the given object is a boolean.
 *
 * @param object Object to check.
 * @returns `true` if the given object is a boolean, `false` otherwise.
 */
export function isBoolean(object: unknown): object is boolean {
    return typeof object === "boolean";
}

/**
 * Checks to see if the given object is a number (finite and not NaN).
 *
 * @param object Object to check.
 * @returns `true` if the given object is a number, `false` otherwise.
 */
export function isNumber(object: unknown): object is number {

    return (
        typeof object === "number"
        && !Number.isNaN(object)
        && Number.isFinite(object)
    );

}

/**
 * Checks to see if the given object is a plain object.
 * i.e. `object` is not an array or something with a complicated constructor.
 *
 * @param object Object to check.
 * @returns `true` if the given object is a plain object, `false` otherwise.
 */
export function isObject(object: unknown): object is AnyObject {

    return (
        typeof object === "object"
        && object !== null
        && toString.call(object) === "[object Object]"
    );

}

/**
 * Checks to see if the given object is a string.
 *
 * @param object Object to check.
 * @returns `true` if the given object is a string, `false` otherwise.
 */
export function isString(object: unknown): object is string {
    return typeof object === "string";
}

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
 * Gets a global value and runs it through a validator before returning it. If
 * the validator fails, the default value is returned.
 *
 * @param globalValue Value to check.
 * @param validate Validator for the value.
 * @param defautlValue Default value.
 * @returns Either the global value or the default value.
 */
export function getFromGlobal<TValue = any>(
    globalValue: TValue,
    validate: (value: unknown) => boolean,
    defautlValue: TValue,
) {
    return (
        validate(globalValue)
        ? globalValue
        : defautlValue
    );
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

type IObjectFilterCallback<TObject extends AnyObject> = (
    entry: [keyof TObject, TObject[keyof TObject]],
) => boolean;

/**
 * Filters the given object as defined by the given filter.
 *
 * @param object Object to filter.
 * @param callback Function to filter the object.
 * @returns Filtered object.
 */
export function filterObject<TObject extends AnyObject = AnyObject>(
    object: TObject,
    callback: IObjectFilterCallback<TObject>,
) {
    return Object.fromEntries(Object.entries(object).filter(callback));
}
