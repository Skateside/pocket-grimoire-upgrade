<template>
    <SidebarLayout gap="0">
        <button
            type="button"
            tabindex="-1"
            @click="changeValueAndFocus(-props.step)"
        >-</button>
        <SidebarLayout gap="0" side="end">
            <input
                ref="input"
                type="text"
                inputmode="numeric"
                pattern="\d+"
                v-bind="attrs"
                :step="props.step"
                :min="props.min"
                :max="props.max"
                :value="props.modelValue"
                @input="handleInput"
                @keydown="handleKeydown"
            >
            <button
                type="button"
                tabindex="-1"
                @click="changeValueAndFocus(props.step)"
            >+</button>
        </SidebarLayout>
    </SidebarLayout>
</template>

<script setup lang="ts">
import { useAttrs, useTemplateRef } from "vue";
import { clamp } from '../scripts/utilities/numbers';
import SidebarLayout from "./layouts/SidebarLayout.vue";

defineOptions({
    inheritAttrs: false,
});
const attrs = useAttrs();
const props = withDefaults(defineProps<{
    modelValue: number | string,
    step?: number,
    min?: number,
    max?: number,
}>(), {
    step: 1,
});
const emit = defineEmits<{
    (e: "update:modelValue", value: string): void,
}>();
const input = useTemplateRef("input");

const setValue = (value: number) => {

    const update = clamp(
        props.min ?? Number.NEGATIVE_INFINITY,
        value,
        props.max ?? Number.POSITIVE_INFINITY,
    );

    if (update !== Number(props.modelValue)) {
        emit("update:modelValue", String(update));
    }

};

const changeValue = (delta: number) => {
    setValue(Number(props.modelValue) + delta);
};

const changeValueAndFocus = (delta: number) => {

    changeValue(delta);

    if (input.value?.offsetParent) {
        input.value.focus();
    }

};

const handleInput = (event: Event) => {
    setValue(Number((event.target as HTMLInputElement).value));
};

const keyHandlers: Record<string, () => void> = {
    ArrowUp() {
        changeValue(props.step);
    },
    ArrowDown() {
        changeValue(-props.step);
    },
    Home() {
        if (typeof props.min === "number") {
            setValue(props.min);
        }
    },
    End() {
        if (typeof props.max === "number") {
            setValue(props.max);
        }
    },
};

const handleKeydown = (event: KeyboardEvent) => {

    const handler = keyHandlers[event.key];

    if (!handler) {
        return; // key isn't supposed to be captured.
    }

    handler();
    event.preventDefault();
    event.stopPropagation();

};
</script>
