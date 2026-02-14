import type {
    FieldElement,
} from "../types/lib";
import type {
    IFields,
} from "../types/data";
import {
    defineStore,
} from "pinia";
import {
    inject,
    ref,
    watch,
} from "vue";
import type {
    IStorage,
} from "../classes/Storage";

const useFieldsStore = defineStore("fields", () => {

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "inputs";
    const inputs = ref<IFields>({
        ...storage.get<IFields>(STORAGE_KEY, {}),
    });

    watch(inputs, (value) => {
        storage.set(STORAGE_KEY, value);
    }, { deep: true });

    const clear = () => {

        Object.keys(inputs.value).forEach((key) => {
            delete inputs.value[key];
        });

    };

    const innerHasForm = (memory: string) => (
        Object.hasOwn(inputs.value, memory)
    );

    const innerGetForm = (memory: string) => {

        if (!innerHasForm(memory)) {
            inputs.value[memory] = Object.create(null);
        }

        return inputs.value[memory];

    };

    const saveField = (memory: string, field: FieldElement) => {

        const { name, type } = field;

        if (!name || type === "file") {
            return false;
        }

        let selector = `${field.nodeName.toLowerCase()}[name="${name}"]`;

        if (type === "checkbox" || type === "radio") {
            selector += `[value="${field.value}"]`;
        }

        const value = (
            type === "checkbox"
            ? (field as HTMLInputElement).checked
            : field.value
        );

        innerGetForm(memory)[selector] = value;

        return true;

    };

    const populateFields = (
        form: HTMLFormElement,
        memory: string,
    ) => {

        if (!innerHasForm(memory)) {
            return false;
        }

        Object
            .entries(innerGetForm(memory))
            .forEach(([selector, value]) => {

                const input = form.querySelector<FieldElement>(selector);

                if (!input) {
                    return console.warn(`selector matches nothing: ${selector}`);
                }

                switch (input.type) {

                case "radio":
                    (input as HTMLInputElement).checked = true;
                    break;

                case "checkbox":
                    (input as HTMLInputElement).checked = Boolean(value);
                    break;

                default:
                    input.value = String(value);

                }

            });

    };

    return {
        // State.
        inputs,
        // Action.
        clear,
        saveField,
        populateFields,
    };

});

export default useFieldsStore;
