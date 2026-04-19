import type { DeepReadonly } from "vue";
import type { AnyObject, DeepWritable } from "../types/lib";

/**
 * Checks to see if the given object is array-like. This might mean an array but
 * it might also mean a NodeList or a string.
 *
 * @param object Object to check.
 * @returns `true` if the given object is array-like, `false` otherwise.
 */
export function isArrayLike(object: unknown): object is ArrayLike<any> {

    if (object === null || object === undefined) {
        return false;
    }

    if (
        Array.isArray(object)
        || typeof (object as any[])[Symbol.iterator] === "function"
    ) {
        return true;
    }

    const { length } = (object as ArrayLike<any>);

    return (
        isNumber(length)
        && Number.isInteger(length)
        && length >= 0
        && length < ((2 ** 32) - 1)
    );

}

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
 * Checks to see if the given object is a parsable JSON string.
 *
 * @param object Object to check.
 * @returns `true` if the given object can be parsed as JSON, `false` otherwise.
 */
export function isJsonString(object: unknown): object is string {
    
    if (!isString(object)) {
        return false;
    }

    try {
        JSON.parse(object);
        return true;
    } catch (ignore) {
        return false;
    }

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
        && Object.prototype.toString.call(object) === "[object Object]"
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
 * Checks to see if the given object has a non-empty string at the given key.
 *
 * @param object Object to check.
 * @param key Key to check.
 * @returns `true` if the given object is a non-empty string, `false` otherwise.
 */
export function isPropertyString<
    TObject extends AnyObject = AnyObject,
    TKey extends keyof TObject = keyof TObject,
>(object: TObject, key: TKey): object is TObject & Record<TKey, string> {
    return Object.hasOwn(object, key) && isString(object[key]);
}

/**
 * Checks to see if the given object either doesn't have the given key, or that
 * the related property is a string if it does exist.
 *
 * @param object Object to check.
 * @param key Key to check.
 * @returns `true` if either the key doesn't exist or it references a string,
 * `false` otherwise.
 */
export function isPropertyOptionalString<
    TObject extends AnyObject = AnyObject,
    TKey extends PropertyKey = keyof TObject
>(object: TObject, key: TKey): object is AnyObject & Partial<Record<TKey, string>> {
    return !Object.hasOwn(object, key) || isString(object[key]);
}

/**
 * Checks to see if the given object either doesn't have the given key, or that
 * the related property is an array that matches the given checker function.
 *
 * @param object Object to check.
 * @param key Key to check.
 * @param checker Validator for the property.
 * @returns `true` if either the key doesn't exist or it references an array
 * where every item matches the given checker, `false` otherwise.
 */
export function isPropertyOptionalArrayOf(
    object: AnyObject,
    key: string,
    checker: (value: unknown) => boolean,
) {
 
    return (
        !Object.hasOwn(object, key)
        || (
            Array.isArray(object[key])
            && object[key].every((item) => checker(item))
        )
    );

}

/**
 * Returns a copy of the given object such that modifying the clone will not
 * affect the original.
 *
 * @param object Object to clone.
 * @returns Clone of the object.
 */
export function clone<TObject extends AnyObject = AnyObject>(
    object: TObject,
): TObject {
    return window.structuredClone(object);
};

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
    return clone(object);
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
 * **WARNING** Keys are forgotten during this process since they can be changed.
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
 * **WARNING** This is not type-safe and will return `{ [k: string]: any }`
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
