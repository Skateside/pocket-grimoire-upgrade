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
import type { IBaseInputTypes, IBaseLabelProvide } from "../../scripts/types/base";
import { computed, inject, onMounted, useAttrs, useTemplateRef } from "vue";

defineOptions({
    inheritAttrs: false,
});
const props = withDefaults(defineProps<{
    type?: IBaseInputTypes,
    modelValue?: boolean | number | string,
}>(), {
    type: "text",
    modelValue: "",
});
const emit = defineEmits<{
    (e: "update:modelValue", value: string): void,
}>();
const input = useTemplateRef<HTMLInputElement | HTMLTextAreaElement>("input");
const value = computed(() => {
    if (props.type === "file") {
        return undefined; // removes the value.
    }
    return props.modelValue;
});

const node = computed(() => (
    props.type === "textarea"
    ? "textarea"
    : "input"
));

const labelProvision = inject<IBaseLabelProvide>("label", {});
const attrs = computed(() => {

    const attrs = { ...useAttrs() };

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
