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
import { computed, onMounted, useTemplateRef } from "vue";
import useInfoTokenStore from "../scripts/store/infoToken";
import {
    type IDialogUIEvents,
    DialogUI,
    bubbleEvents,
} from "./ui/dialog";
import ClusterLayout from "./layouts/ClusterLayout.vue";
import StackLayout from "./layouts/StackLayout.vue";

const store = useInfoTokenStore();
const form = useTemplateRef<HTMLFormElement>("form");
const submit = useTemplateRef<HTMLButtonElement>("submit");
const markdown = defineModel<IInfoToken["markdown"]>();
const isUpdate = computed(() => Boolean(store.active));
const submitText = computed(() => submit.value?.dataset[
    isUpdate.value
    ? "update"
    : "create"
] || "");

const emit = defineEmits<IDialogUIEvents & {
    (e: "reset"): void,
    (e: "create", markdown: IInfoToken["markdown"]): void,
    (e: "update", id: IInfoToken["id"], markdown: IInfoToken["markdown"]): void,
}>();

const handleSubmit = () => {

    const { value: isUpdateMode } = isUpdate;
    const { value: markDownValue } = markdown;

    if (isUpdateMode && markDownValue) {
        emit("update", store.active!.id, markDownValue);
    } else if (!isUpdateMode && markDownValue) {
        emit("create", markDownValue);
    }

    form.value?.reset();

};

const handleReset = () => {
    emit("reset");
};

onMounted(() => {
    if (store.active) {
        markdown.value = store.active.markdown;
    }
});
</script>
