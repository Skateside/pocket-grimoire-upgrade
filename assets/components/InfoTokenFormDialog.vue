<template>

    <DialogUI
        title="Custom info token"
        v-on="bubbleEvents(emit)"
    >
        <form
            ref="form"
            @submit.prevent="handleSubmit"
            @reset="handleReset"
        >
            <StackLayout>
                <p>What do you want your new info token to say? Use **double asterists** to emphasise text.</p>
                <div>
                    <input
                        v-model.trim="markdown"
                        type="text"
                        name="info-token-markdown"
                        aria-label="Custom info token text"
                        required
                    >
                </div>
                <ClusterLayout>
                    <div>
                        <button
                            ref="submit"
                            type="submit"
                            data-create="Create"
                            data-update="Update"
                        >{{ submitText }}</button>
                    </div>
                    <div>
                        <button type="reset">Cancel</button>
                    </div>
                </ClusterLayout>
            </StackLayout>
        </form>
    </DialogUI>

</template>

<script setup lang="ts">
import type { IInfoToken } from "../scripts/types/data";
import { computed, ref } from "vue";
import {
    type IDialogUIEvents,
    DialogUI,
    bubbleEvents,
} from "./ui/dialog";
import ClusterLayout from "./layouts/ClusterLayout.vue";
import StackLayout from "./layouts/StackLayout.vue";

const props = defineProps<{
    id?: IInfoToken["id"],
    markdown?: IInfoToken["markdown"],
}>();
const form = ref<HTMLFormElement | null>();
const submit = ref<HTMLButtonElement | null>(null);
const markdown = defineModel<IInfoToken["markdown"]>();
const mode = computed(() => (
    props.id
    ? "update"
    : "create"
));
const submitText = computed(() => {
    return submit.value?.dataset[mode.value] || "";
});

const emit = defineEmits<IDialogUIEvents & {
    (e: "reset"): void,
    (e: "create", markdown: IInfoToken["markdown"]): void,
    (e: "update", id: IInfoToken["id"], markdown: IInfoToken["markdown"]): void,
}>();

const handleSubmit = () => {

    if (mode.value === "create" && markdown.value) {
        emit("create", markdown.value);
    } else if (mode.value === "update" && props.id && markdown.value) {
        emit("update", props.id, markdown.value);
    }

    form.value?.reset();

};

const handleReset = () => {
    emit("reset");
};
</script>
