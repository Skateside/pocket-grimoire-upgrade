import type { AnyObject } from "../types/lib";
import { isString } from "../utilities/objects";

//*
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
        this.parsed = this.defaultValue;

        const stored = localStorage.getItem(key);

        if (Object.hasOwn(localStorage, key) && isString(stored)) {

            try {
                const parsed = JSON.parse(stored);
                this.parsed = Object.assign(Object.create(null), parsed);
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
        this.parsed = this.defaultValue;
        this.store();
    }

    kill() {
        localStorage.removeItem(this.key);
    }

}
/*/
export default class Storage implements IStorage {

    protected key: string;
    protected defaultValue: string;

    constructor(key: string, defaultValue: AnyObject = {}) {

        this.key = key;
        this.defaultValue = JSON.stringify(defaultValue);

    }

    protected getStored(): AnyObject {
        return JSON.parse(localStorage.getItem(this.key) || this.defaultValue);
    }

    protected store(stored: AnyObject) {
        localStorage.setItem(this.key, JSON.stringify(stored));
    }

    has(key: string) {
        return Object.hasOwn(this.getStored(), key);
    }

    get<T = any>(key: string, defaultValue?: T) {
        return (this.getStored()[key] ?? defaultValue) as T;
    }

    set(key: string, value: any) {

        const stored = this.getStored();

        stored[key] = value;
        this.store(stored);

        return true;

    }

    remove(key: string) {

        const stored = this.getStored();
        const had = Object.hasOwn(stored, key);

        delete stored[key];
        this.store(stored);

        return had;

    }

    reset() {
        this.store(JSON.parse(this.defaultValue));
    }

    kill() {
        localStorage.removeItem(this.key);
    }

}

export type IStorage = {
    has(key: string): boolean,
    get<T = any>(key: string, defaultValue?: T): T,
    set(key: string, value: any): boolean,
    remove(key: string): boolean,
    reset(): void,
    kill(): void,
};
//*/
