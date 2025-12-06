// import type {
//     IDemonBluffId,
//     IDemonBluffGroup,
//     IDemonBluffs,
// } from "../types/data";
import type {
    IStorage,
} from "../classes/Storage";
import {
    defineStore,
} from "pinia";
import {
    // computed,
    inject,
    ref,
    watch,
} from "vue";
// import {
//     randomId,
// } from "../utilities/strings";
// import {
//     UnrecognisedBluffGroupError,
// } from "../../errors";

type IInputs = Record<string, Record<string, string | string[]>>;

const useInputStore = defineStore("input", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "inputs";
    const inputs = ref<IInputs>({
        ...storage.get<IInputs>(STORAGE_KEY, {}),
    });

    watch(inputs, (value) => {
        storage.set(STORAGE_KEY, value);
    }, { deep: true });

    const innerGetForm = (formId: string) => {

        let form = inputs.value[formId];

        if (!form) {
            form = Object.create(null);
            inputs.value[formId] = form;
        }

        return form;

    };

    const setField = (
        formId: string,
        inputName: string,
        value: string,
    ) => {
    };

    const addField = (
        formId: string,
        inputName: string,
        value: string,
    ) => {
    };

    const removeField = (
        formId: string,
        inputName: string,
        value: string,
    ) => {
    };

    const populate = (formId: string) => {

    };

    return {
        // State.
        // Getters.
        // Action.
    };

});

export default useInputStore;