import {
    clone,
    isArrayLike,
    isJsonString,
    isObject,
} from "~/utilities/objects";

export type IStorageValidator<TStructure = any> = (
    object: unknown,
) => object is TStructure;

const copy = <TObject = any>(object: TObject): TObject => {
    return (
        (isObject(object) || isArrayLike(object))
        ? clone(object)
        : object
    );
};

export default function useStorage<TStructure = any>(
    key: string,
    defaultData: TStructure,
) {

    const storage = useGlobalStorage();
    const defaultClone = copy(defaultData);

    const set = (value: TStructure) => {
        storage.set(key, value);
    };

    const getIfValid = (validator: IStorageValidator<TStructure>) => {

        const storedValue = storage.get(key);
        const value = (
            (storage.has(key) && validator(storedValue))
            ? storedValue
            : defaultClone
        );

        return copy(value);

    };

    const reset = () => {
        storage.set(key, copy(defaultClone));
    };

    return {
        set,
        getIfValid,
        reset,
    };

}

const STORAGE_KEY = "pg";
const stored = localStorage.getItem(STORAGE_KEY);
const parsed = Object.assign(Object.create(null), (
    isJsonString(stored)
    ? JSON.parse(stored)
    : {}
));

export function useGlobalStorage() {

    const store = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    };

    const set = (key: string, value: any) => {
        parsed[key] = value;
        store();
    };

    const get = (key: string) => {
        return parsed[key];
    };

    const has = (key: string) => {
        return Object.hasOwn(parsed, key);
    };

    const clear = () => {

        localStorage.removeItem(STORAGE_KEY);

        Object.keys(parsed).forEach((key) => {
            delete parsed[key];
        });

    };

    return {
        set,
        get,
        has,
        clear,
    };

}
