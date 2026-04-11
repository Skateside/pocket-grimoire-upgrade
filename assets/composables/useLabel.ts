import type {
    IBaseLabelAttributes,
    IBaseLabelProvide,
} from "~/types/base";
import { computed, inject, useAttrs } from "vue";

export default function useLabel(attrs: IBaseLabelAttributes = useAttrs()) {

    const label = inject<IBaseLabelProvide | null>("label", null);

    const id = computed(() => {

        if (Object.hasOwn(attrs, "id")) {
            return attrs.id;
        }

        if (label?.id) {
            return label.id.value;
        }

        return undefined;

    });

    return {
        id,
    };

}
