<template>
    <component
        ref="input"
        :is="node"
        class="input"
        :value="value"
        v-bind="attrs"
        @input="handleInput"
    ></component>
</template>

<script setup lang="ts">
import type { IBaseInputTypes } from "~/types/base";
import { computed, useAttrs, useTemplateRef } from "vue";
import useLabel from "~/composables/useLabel";

defineOptions({
    inheritAttrs: false,
});
const props = withDefaults(defineProps<{
    type?: IBaseInputTypes,
    modelValue: string,
}>(), {
    type: "text",
});
const emit = defineEmits<{
    (e: "update:modelValue", value: string): void,
}>();
const input = useTemplateRef<HTMLInputElement | HTMLTextAreaElement>("input");
const value = computed(() => {

    if (props.type === "file") {
        return undefined; // Removes property.
    }

    return props.modelValue;

});

const node = computed(() => (
    props.type === "textarea"
    ? "textarea"
    : "input"
));

const { id } = useLabel();
const attrs = computed(() => {

    const attrs = { ...useAttrs() };

    if (props.type !== "textarea") {
        attrs.type = props.type;
    }

    if (!Object.hasOwn(attrs, "id") && id.value) {
        attrs.id = id.value;
    }

    return attrs;

});

const handleInput = () => {

    if (!input.value) {
        return console.warn("input wasn't found");
    }

    emit("update:modelValue", input.value.value);

};
</script>
