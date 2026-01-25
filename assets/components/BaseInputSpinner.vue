<template>
    <div>
        <button type="button" @click="decrease">-</button>
        <input
            readonly
            type="number"
            :aria-label="props.label"
            :step="props.step"
            :min="props.min"
            :max="props.max"
            :value="props.modelValue"
            @input="handleInput"
        >
        <button type="button" @click="increase">+</button>
    </div>
</template>

<script setup lang="ts">
import { clamp } from '../scripts/utilities/numbers';

const props = withDefaults(defineProps<{
    modelValue: number | string,
    label: string,
    step?: number,
    min?: number,
    max?: number,
}>(), {
    step: 1,
    min: 0,
});
const emit = defineEmits<{
    (e: "update:modelValue", value: string): void,
}>();

const changeValue = (multiplier = 1) => {

    const amount = props.step * multiplier;
    const value = Number(props.modelValue) + amount;
    const update = clamp(props.min, value, props.max ?? Number.POSITIVE_INFINITY);

    if (update !== Number(props.modelValue)) {
        emit("update:modelValue", String(update));
    }
    
};

const increase = () => changeValue(1);
const decrease = () => changeValue(-1);

const handleInput = (e: Event) => {
    emit("update:modelValue", (e.target as HTMLInputElement).value);
};
</script>
