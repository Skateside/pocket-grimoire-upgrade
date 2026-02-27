import { defineStore } from "pinia";
import { computed } from "vue";
import {
    filterObject,
    getFromGlobal,
    isObject,
    isString,
} from "../utilities/objects";
import { isValidLocalURL } from "../utilities/strings";

const usePathsStore = defineStore("paths", () => {

    const paths = computed(() => {

        const globalPaths = getFromGlobal(
            window.PATHS,
            isObject,
            Object.create(null),
        );
        const filteredPaths = filterObject(
            globalPaths,
            ([_key, value]) => isString(value) && isValidLocalURL(value),
        );

        return Object.freeze(filteredPaths)

    });

    const get = (key: string) => {

        if (Object.hasOwn(paths.value, key)) {
            return paths.value[key];
        }

        throw new ReferenceError(`Unrecognised or invalid path "${key}"`);

    };

    return {
        get,
    };

});

export default usePathsStore;
