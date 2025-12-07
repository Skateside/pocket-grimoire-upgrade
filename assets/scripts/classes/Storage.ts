import type { AnyObject } from "../types/lib";

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
