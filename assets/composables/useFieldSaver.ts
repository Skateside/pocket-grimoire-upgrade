import type { FieldElement } from "../scripts/types/lib";
import { type Ref, onUnmounted, toValue } from "vue";
import useFieldsStore from "../scripts/store/fields";

export default function useFieldSaver(
    form: Ref<HTMLFormElement | null>,
    populateOnLoad = false
) {

    const formElement = toValue(form);

    if (!formElement) {
        return;
    }

    const identifier = formElement.dataset.identifier!;
    const store = useFieldsStore();

    const onInput = ({ target }: Event) => {

        if (!target) {
            return;
        }

        store.saveField(identifier, target as FieldElement);

    };

    formElement.addEventListener("input", onInput);
    onUnmounted(() => formElement.removeEventListener("input", onInput));

    if (populateOnLoad) {
        store.populateFields(formElement, identifier);
    }

}
