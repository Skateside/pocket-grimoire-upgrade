export default class Storage implements IStorage {

    protected key: string;
    protected defaultValue: string;

    constructor(key: string, defaultValue = {}) {

        this.key = key;
        this.defaultValue = JSON.stringify(defaultValue);

    }

    protected getStored() {
        return JSON.parse(localStorage.getItem(this.key) || this.defaultValue);
    }

    get<T = any>(key: string, defaultValue?: T) {
        return (this.getStored()[key] ?? defaultValue) as T;
    }

    set(key: string, value: any) {

        const stored = this.getStored();

        stored[key] = value;
        localStorage.setItem(this.key, JSON.stringify(stored));

        return true;

    }

}

export type IStorage = {
    get<T = any>(key: string, defaultValue?: T): T,
    set(key: string, value: any): boolean,
};
