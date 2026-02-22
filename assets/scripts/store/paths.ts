import {
    defineStore,
} from "pinia";
import { ref } from "vue";

const usePathsStore = defineStore("paths", () => {

    const paths = ref(Object.freeze({ ...window.PATHS }));

    const get = (key: string) => {

        if (Object.hasOwn(paths.value, key)) {
            return paths.value[key];
        }

        throw new ReferenceError(`Unrecognised path "${key}"`);

    };

    return {
        paths,
        get,
    };

});

export default usePathsStore;
