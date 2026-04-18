// import type { AnyObject } from "~/types/lib";
import { clone, isArrayLike, isJsonString, isObject } from "~/utilities/objects";

const STORAGE_KEY = "pg";
const stored = localStorage.getItem(STORAGE_KEY);
const parsed = Object.create(null);

if (isJsonString(stored)) {
    Object.assign(parsed, JSON.parse(stored));
}

const store = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
};

const kill = () => {

    localStorage.removeItem(STORAGE_KEY);

    Object.keys(parsed).forEach((key) => {
        delete parsed[key];
    });

};

export type IStorageValidator<TStructure = any> = (
    object: unknown,
) => object is TStructure;

export default function useStorage<TStructure = any>(
    key: string,
    defaultData: TStructure,
) {

    const defaultClone = (
        (isObject(defaultData) || isArrayLike(defaultData))
        ? clone(defaultData)
        : defaultData
    );

    const set = (value: TStructure) => {

        parsed[key] = value;
        store();

    };

    const getIfValid = (validator: IStorageValidator<TStructure>) => {

        const value = (
            (Object.hasOwn(parsed, key) && validator(parsed[key]))
            ? parsed[key]
            : defaultClone
        );

        return (
            (isObject(value) || isArrayLike(value))
            ? clone(value)
            : value
        );

    };

    const reset = () => {

        parsed[key] = (
            (isObject(defaultClone) || isArrayLike(defaultClone))
            ? clone(defaultClone)
            : defaultClone
        );
        store();

    };

    return {
        set,
        getIfValid,
        reset,
        kill,
    };

}
