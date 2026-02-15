import type { FieldElement } from "../scripts/types/lib";
import { type Ref, onUnmounted, toValue } from "vue";
import useFieldsStore from "../scripts/store/fields";

export default function useFieldSaver(
    form: Ref<HTMLFormElement | null>,
    populateOnLoad = false
) {

    const formElement = toValue(form);
    const memory = formElement?.dataset.memory;

    if (!formElement) {
        return console.warn("Missing form element");
    }

    if (!memory) {
        return console.warn("Form %o missing data-memory attribute", formElement);
    }

    const store = useFieldsStore();

    const onInput = ({ target }: Event) => {

        if (!target) {
            return console.warn("heard input event on non-existing target");
        }

        if (!store.saveField(memory, target as FieldElement)) {
            console.warn("Unable to save input - file input or missing name", target);
        }

    };

    formElement.addEventListener("input", onInput);
    onUnmounted(() => formElement.removeEventListener("input", onInput));

    if (populateOnLoad) {
        store.populateFields(formElement, memory);
    }

}
