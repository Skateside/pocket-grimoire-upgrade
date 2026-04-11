import type { AnyObject } from "~/types/lib";
import { clone, isString } from "~/utilities/objects";

export type IStorage = {
    set(key: string, value: any): void,
    get<TData>(key: string, validate: (raw: unknown) => boolean, defaultValue: TData): TData,
    reset(): void,
    kill(): void,
}

export default class Storage<TDefault extends AnyObject = AnyObject> implements IStorage {

    protected key: string;
    protected readonly defaultValue: TDefault;
    protected parsed: AnyObject;

    constructor(key: string) {

        this.key = key;
        this.defaultValue = Object.create(null);
        this.parsed = clone(this.defaultValue);

        const stored = localStorage.getItem(key);

        if (Object.hasOwn(localStorage, key) && isString(stored)) {

            try {
                this.parsed = JSON.parse(stored)
            } catch (ignore) {
                // do nothing, `this.parsed` will remain its previous value.
            }

        }

    }

    protected store() {
        localStorage.setItem(this.key, JSON.stringify(this.parsed));
    }

    set(key: string, value: any) {

        this.parsed[key] = value;
        this.store();

    }

    get<TData extends AnyObject = AnyObject>(
        key: string,
        validate: (raw: unknown) => boolean,
        defaultValue: TData,
    ) {

        const { parsed } = this;

        if (Object.hasOwn(parsed, key) && validate(parsed[key])) {
            return parsed[key] as TData;
        }
        
        return defaultValue;

    }

    reset() {
        this.parsed = clone(this.defaultValue);
        this.store();
    }

    kill() {
        localStorage.removeItem(this.key);
    }

}
