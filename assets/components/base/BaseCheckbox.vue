<template>
    <input
        ref="input"
        v-bind="attrs"
        :checked="props.modelValue"
        @input="handleInput"
    />
</template>

<script setup lang="ts">
import { computed, useAttrs, useTemplateRef } from "vue";
import useLabel from "~/composables/useLabel";

defineOptions({
    inheritAttrs: false,
});
const props = defineProps<{
    modelValue: boolean,
}>();
const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void,
}>();
const input = useTemplateRef<HTMLInputElement>("input");

const { id } = useLabel();
const attrs = computed(() => {

    const attrs = { ...useAttrs() };

    attrs.type = "checkbox";

    if (!Object.hasOwn(attrs, "id") && id.value) {
        attrs.id = id.value;
    }

    return attrs;

});

const handleInput = () => {

    if (!input.value) {
        return console.warn("input wasn't found");
    }

    emit("update:modelValue", input.value.checked);

};
</script>
