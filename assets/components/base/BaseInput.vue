<template>
    <component
        ref="input"
        :is="node"
        class="input"
        :value="props.modelValue"
        v-bind="attrs"
        @input="handleInput"
    ></component>
</template>

<script setup lang="ts">
import type { IBaseInputTypes, IBaseLabelProvide } from "../../scripts/types/base";
import { computed, inject, onMounted, useAttrs, useTemplateRef } from "vue";

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

const node = computed(() => (
    props.type === "textarea"
    ? "textarea"
    : "input"
));

const labelProvision = inject<IBaseLabelProvide>("label", {});
const rawAttrs = useAttrs();
const attrs = computed(() => {

    const attrs = { ...rawAttrs };

    if (props.type !== "textarea") {
        attrs.type = props.type;
    }

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
