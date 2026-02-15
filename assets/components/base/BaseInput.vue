<template>
    <input
        ref="input"
        :type="props.type"
        class="input"
        :value="props.modelValue"
        v-bind="attrs"
        @input="handleInput"
    >
</template>

<script setup lang="ts">
import type { IBaseInputTypes, IBaseLabelProvide } from "../../scripts/types/base";
import { computed, inject, onMounted, useAttrs, useTemplateRef } from "vue";

const props = withDefaults(defineProps<{
    type?: IBaseInputTypes,
    modelValue: string,
}>(), {
    type: "text",
});
const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void,
}>();
const input = useTemplateRef("input");

const labelProvision = inject<IBaseLabelProvide>("label", {});
const rawAttrs = useAttrs();
const attrs = computed(() => {

    const attrs = { ...rawAttrs };

    if (!Object.hasOwn(attrs, "id") && labelProvision) {
        attrs.id = labelProvision.id;
    }

    return attrs;

});

const handleInput = () => {

    if (!input.value) {
        return console.warn("input wasn't found");
    }

    emit("update:modelValue", input.value.value);

};

onMounted(() => {

    switch (props.type) {

    case "button":
    case "reset":
        console.warn("Did you intend to use <BaseButton>?");
        break;

    }

});
</script>
