<template>

    <form
        ref="form"
        @submit.prevent="handleSubmit"
        @reset="handleReset"
    >

        <input
            v-model="id"
            type="hidden"
            name="info-token-id"
        >

        <p>
            <label :for="`info-token-text-${suffix}`">Text</label>
            <input
                v-model.trim="text"
                type="text"
                name="info-token-text"
                :id="`info-token-text-${suffix}`"
                required
            >
        </p>
        <p>
            <button
                ref="submit"
                type="submit"
                data-create="Create"
                data-update="Update"
            >{{ submitText }}</button>
            <button type="reset">Cancel</button>
        </p>

    </form>

</template>

<script setup lang="ts">
import type { IInfoToken } from '../scripts/types/data';
import { computed, useId, ref } from "vue";

// const props = withDefaults(defineProps<{
//     mode?: "create" | "update",
// }>(), {
//     mode: "create",
// });
// const props = defineProps<{
//     id?: IInfoToken["id"],
//     text?: IInfoToken["text"],
// }>();
const suffix = useId();
const form = ref<HTMLFormElement | null>();
const submit = ref<HTMLButtonElement | null>(null);
const id = defineModel<IInfoToken["id"]>("id");
const text = defineModel<IInfoToken["text"]>("text");
const mode = computed(() => (
    id.value
    ? "update"
    : "create"
));
const submitText = computed(() => {
    return submit.value?.dataset[mode.value] || "";
});

const emit = defineEmits<{
    (e: "reset"): void,
    (e: "create", text: IInfoToken["text"]): void,
    (e: "update", id: IInfoToken["id"], text: IInfoToken["text"]): void,
}>();

const handleSubmit = () => {

    if (mode.value === "create" && text.value) {
        emit("create", text.value);
    } else if (mode.value === "update" && id.value && text.value) {
        emit("update", id.value, text.value);
    }

    form.value?.reset();

};

const handleReset = () => {
    emit("reset");
};
</script>
